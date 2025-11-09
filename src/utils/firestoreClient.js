import { db } from '../firebase';
import {
  collection,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore';

export const menuRef = collection(db, 'menu');
export const userDocRef = (uid) => doc(db, 'users', uid);
export const cartItemRef = (uid, itemId) => doc(db, 'users', uid, 'cart', itemId);
export const cartRef = (uid) => collection(db, 'users', uid, 'cart');
export const ordersRef = collection(db, 'orders');

export async function addToCart(uid, item, quantity = 1) {
  const ref = cartItemRef(uid, item.id);
  await setDoc(ref, {
    menuItemId: item.id, // Store the menu item ID for reference
    name: item.name,
    price: item.price,
    image: item.image,
    description: item.description,
    quantity: increment(quantity),
    addedAt: serverTimestamp(),
  }, { merge: true });
}

export async function setCartItemQuantity(uid, itemId, quantity) {
  const ref = cartItemRef(uid, itemId);
  if (quantity <= 0) {
    await deleteDoc(ref);
  } else {
    await updateDoc(ref, { quantity });
  }
}

export async function removeCartItem(uid, itemId) {
  const ref = cartItemRef(uid, itemId);
  await deleteDoc(ref);
}

export function listenCart(uid, cb) {
  return onSnapshot(cartRef(uid), cb);
}

export function listenUserOrders(uid, cb) {
  const q = query(ordersRef, where('userId', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, cb);
}

export function listenAllOrders(cb) {
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, cb);
}

export async function updateOrderStatus(orderId, status) {
  const updateData = { status };
  if (status === 'Completed') {
    updateData.paymentStatus = 'Paid';
  }
  await updateDoc(doc(db, 'orders', orderId), updateData);
}

export async function toggleMenuAvailability(itemId, isAvailable) {
  await updateDoc(doc(db, 'menu', itemId), { isAvailable });
}