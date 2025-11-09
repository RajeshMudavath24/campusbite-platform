import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { load } from '@cashfreepayments/cashfree-js';

admin.initializeApp();
const db = admin.firestore();

// Cashfree configuration
const cashfreeConfig = {
  appId: functions.config().cashfree?.app_id || process.env.CASHFREE_APP_ID,
  secretKey: functions.config().cashfree?.secret_key || process.env.CASHFREE_SECRET_KEY,
  environment: functions.config().cashfree?.environment || process.env.CASHFREE_ENVIRONMENT || 'sandbox',
};

// Auth: enforce @hitam.org emails and set default role
export const beforeUserCreated = functions.auth.user().beforeCreate(async (user) => {
  const email = user.email || '';
  const isHitam = email.endsWith('@hitam.org');
  if (!isHitam) {
    throw new functions.auth.HttpsError('permission-denied', 'Only @hitam.org emails are allowed');
  }
});

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const email = user.email || '';
  const role = email.startsWith('admin') ? 'admin' : 'student';
  await admin.auth().setCustomUserClaims(user.uid, { role });
  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    email,
    role,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
});

// Callable to register FCM token under users/{uid}
export const registerFcmToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }
  const token = data?.token as string;
  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'token is required');
  }
  const uid = context.auth.uid;
  const userRef = db.collection('users').doc(uid);
  await userRef.set({
    fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return { ok: true };
});

// Firestore trigger: notify student on order status changes
export const onOrderUpdate = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after || before.status === after.status) return;

    const userId = after.userId as string;
    const orderId = context.params.orderId;
    const newStatus = after.status as string;

    const userSnap = await db.collection('users').doc(userId).get();
    const fcmTokens: string[] = userSnap.get('fcmTokens') || [];
    if (!fcmTokens.length) {
      console.log('No FCM tokens found for user:', userId);
      return;
    }

    let notificationTitle = `Order #${orderId.slice(-6)} Update`;
    let notificationBody = `Your order is now ${newStatus}`;
    
    const payload: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      webpush: {
        notification: {
          icon: '/logo192.png',
        },
        fcmOptions: {
          link: '/student/orders',
        },
      },
    };

    try {
      await admin.messaging().sendEachForMulticast(payload);
    } catch (e) {
      console.error('FCM send error:', e);
    }
  });

// Callable: placeOrder - move user's cart to orders

// Create Cashfree order
export const createCashfreeOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  try {
    const { amount, currency = 'INR' } = data;
    
    if (!amount || amount <= 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Valid amount is required');
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For now, return a mock order response to test the flow
    // In production, you would integrate with Cashfree API here
    return { 
      order_id: orderId, 
      order_amount: Math.round(amount), 
      order_currency: currency,
      payment_session_id: `session_${Date.now()}`
    };
  } catch (err: any) {
    console.error('createCashfreeOrder error:', err?.message || err);
    throw new functions.https.HttpsError('internal', 'Failed to create payment order');
  }
});

// Verify Cashfree payment
export const verifyCashfreePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  try {
    const { order_id, payment_id, requiredByTime } = data;
    
    if (!order_id || !payment_id) {
      throw new functions.https.HttpsError('invalid-argument', 'Payment verification data is required');
    }

    // For now, we'll assume payment is successful if we reach this point
    // In production, you should verify with Cashfree's webhook or API
    console.log('Cashfree payment verification for payment_id:', payment_id);

    // Payment verified, now place the order
    const uid = context.auth.uid;
    const requiredBy = new Date(requiredByTime);
    
    const cartRef = db.collection('users').doc(uid).collection('cart');
    const cartSnap = await cartRef.get();
    if (cartSnap.empty) {
      throw new functions.https.HttpsError('failed-precondition', 'Cart is empty');
    }

    const items: any[] = [];
    let totalPrice = 0;
    for (const doc of cartSnap.docs) {
      const { quantity = 1 } = doc.data();
      const itemId = doc.id;
      const menuDoc = await db.collection('menu').doc(itemId).get();
      if (menuDoc.exists) {
        const menu = menuDoc.data() as any;
        items.push({
          itemId,
          name: menu.name || 'Item',
          price: menu.price || 0,
          quantity,
        });
        totalPrice += (menu.price || 0) * quantity;
      }
    }

    if (!items.length) {
      throw new functions.https.HttpsError('failed-precondition', 'No valid items in cart');
    }

    // Get user details
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    // Create order with payment details
    const orderRef = await db.collection('orders').add({
      userId: uid,
      studentName: userData?.name || userData?.email?.split('@')[0] || 'Unknown',
      studentEmail: userData?.email || 'unknown@hitam.org',
      items,
      totalAmount: totalPrice,
      totalPrice: totalPrice, // Add both for compatibility
      status: 'Pending',
      paymentMethod: 'Online Payment (Cashfree)',
      paymentStatus: 'Completed',
      paymentId: payment_id,
      cashfreeOrderId: order_id,
      requiredByTime: admin.firestore.Timestamp.fromDate(requiredBy),
      orderTime: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Clear cart
    const batch = db.batch();
    cartSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    return { 
      success: true, 
      orderId: orderRef.id,
      paymentId: payment_id,
      paymentMethod: 'Online Payment (Cashfree)'
    };
  } catch (err: any) {
    console.error('verifyCashfreePayment error:', err?.message || err);
    if (err instanceof functions.https.HttpsError) {
      throw err;
    }
    throw new functions.https.HttpsError('internal', 'Payment verification failed');
  }
});

export const placeOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }

  try {
    const uid = context.auth.uid;
    console.log('placeOrder called with data:', data);
    
    const requiredByTimeRaw = data?.requiredByTime as string | undefined;
    if (!requiredByTimeRaw) {
      throw new functions.https.HttpsError('invalid-argument', 'requiredByTime is required');
    }

    const requiredBy = new Date(requiredByTimeRaw);
    if (isNaN(requiredBy.getTime())) {
      throw new functions.https.HttpsError('invalid-argument', 'requiredByTime is invalid');
    }

    const cartRef = db.collection('users').doc(uid).collection('cart');
    const cartSnap = await cartRef.get();
    console.log('Cart documents count:', cartSnap.docs.length);
    
    if (cartSnap.empty) {
      throw new functions.https.HttpsError('failed-precondition', 'Cart is empty');
    }

    const items: any[] = [];
    let totalPrice = 0;
    for (const doc of cartSnap.docs) {
      const cartData = doc.data();
      const { quantity = 1, menuItemId, name, price } = cartData;
      console.log('Processing cart item:', doc.id, 'menuItemId:', menuItemId, 'quantity:', quantity);
      
      // Use the menuItemId if available, otherwise fall back to document ID
      const itemId = menuItemId || doc.id;
      
      const menuDoc = await db.collection('menu').doc(itemId).get();
      if (menuDoc.exists) {
        const menu = menuDoc.data() as any;
        console.log('Menu item found:', menu);
        items.push({
          itemId,
          name: menu.name || name || 'Item',
          price: menu.price || price || 0,
          quantity,
        });
        totalPrice += (menu.price || price || 0) * quantity;
      } else {
        console.log('Menu item not found for ID:', itemId);
        // Fallback: use cart data if menu item not found
        items.push({
          itemId: doc.id,
          name: name || 'Item',
          price: price || 0,
          quantity,
        });
        totalPrice += (price || 0) * quantity;
      }
    }

    console.log('Final items:', items);
    console.log('Total price:', totalPrice);

    if (!items.length) {
      throw new functions.https.HttpsError('failed-precondition', 'No valid items in cart');
    }

    // Get user details
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    const orderData = {
      userId: uid,
      studentName: userData?.name || userData?.email?.split('@')[0] || 'Unknown',
      studentEmail: userData?.email || 'unknown@hitam.org',
      items,
      totalAmount: totalPrice,
      totalPrice: totalPrice, // Add both for compatibility
      status: 'Pending',
      paymentMethod: data.paymentMethod || 'Cash on Delivery',
      paymentStatus: data.paymentStatus || 'Pending',
      paymentId: data.paymentId || null,
      requiredByTime: admin.firestore.Timestamp.fromDate(requiredBy),
      orderTime: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    console.log('Creating order with data:', orderData);
    
    await db.collection('orders').add(orderData);

    const batch = db.batch();
    cartSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    console.log('Order created successfully');
    return { ok: true };
  } catch (err: any) {
    console.error('placeOrder error:', err?.message || err);
    if (err instanceof functions.https.HttpsError) {
      throw err;
    }
    throw new functions.https.HttpsError('internal', 'Internal error');
  }
});