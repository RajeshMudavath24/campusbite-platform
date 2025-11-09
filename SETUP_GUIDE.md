# CampusBite Platform - Payment & Notification Setup Guide

This guide will help you set up the complete payment checkout flow with Stripe and the production-ready notification system with FCM.

## 🚀 Features Implemented

### 1. Payment Gateway & Checkout Flow
- ✅ **CheckoutPage Component**: Complete checkout page with order summary
- ✅ **Stripe Integration**: Secure payment processing with Stripe Elements
- ✅ **Payment Intent Cloud Function**: Server-side payment intent creation
- ✅ **Payment Webhook**: Automatic order creation and cart clearing on successful payment

### 2. Push Notification System (FCM)
- ✅ **Enhanced onOrderUpdate Function**: Real-time notifications on order status changes
- ✅ **Firebase Messaging Service Worker**: Background notification handling
- ✅ **Frontend Notification Service**: Foreground notification handling
- ✅ **Token Management**: Automatic FCM token registration and cleanup

## 🔧 Required API Keys & Configuration

### Frontend Environment Variables (.env.local)

Create a `.env.local` file in the project root with the following variables:

```bash
# Firebase Configuration (from Firebase Console)
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# FCM Configuration
REACT_APP_FCM_VAPID_KEY=your_fcm_vapid_key_here
```

### Backend Function Secrets

Set these as Firebase Function secrets:

```bash
# Stripe Secret Key
firebase functions:secrets:set STRIPE_SECRET_KEY

# Stripe Webhook Secret
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

## 📋 Step-by-Step Setup

### 1. Stripe Setup

1. **Create Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**:
   - Go to Stripe Dashboard → Developers → API Keys
   - Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. **Set up Webhook**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-project-id.cloudfunctions.net/paymentWebhook`
   - Select events: `payment_intent.succeeded`
   - Copy the webhook signing secret

### 2. Firebase FCM Setup

1. **Enable FCM**:
   - Go to Firebase Console → Project Settings → Cloud Messaging
   - Generate a new key pair for Web Push certificates
   - Copy the **Key Pair** (VAPID key)

2. **Update Service Worker**:
   - Update `public/firebase-messaging-sw.js` with your Firebase config
   - Replace the placeholder config with your actual Firebase configuration

### 3. Environment Configuration

1. **Frontend**:
   ```bash
   # Copy the example file
   cp env.example .env.local
   
   # Edit .env.local with your actual values
   nano .env.local
   ```

2. **Backend**:
   ```bash
   # Set Stripe secrets
   firebase functions:secrets:set STRIPE_SECRET_KEY
   # Enter your Stripe secret key when prompted
   
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   # Enter your Stripe webhook secret when prompted
   ```

### 4. Deploy Functions

```bash
# Install dependencies
cd functions
npm install

# Deploy functions
firebase deploy --only functions
```

### 5. Update Firebase Config in Service Worker

Update `public/firebase-messaging-sw.js` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 🔄 User Flow

### Payment Flow
1. User adds items to cart
2. User clicks "Proceed to Checkout" from cart page
3. User is redirected to `/student/checkout`
4. User reviews order summary and enters payment details
5. Payment is processed securely through Stripe
6. On successful payment:
   - Order is created in Firestore with "Paid" status
   - User's cart is cleared
   - User is redirected to orders page

### Notification Flow
1. Admin updates order status (e.g., "Preparing", "Ready for Pickup")
2. `onOrderUpdate` Cloud Function triggers
3. Function fetches user's FCM tokens
4. Push notification is sent to user's device
5. User receives notification with order status update

## 🛠️ Testing

### Test Payment Flow
1. Add items to cart
2. Go to checkout page
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry date and any 3-digit CVC
5. Complete payment

### Test Notifications
1. Place an order
2. As admin, update order status in Firebase Console
3. Check if notification appears on user's device

## 📁 File Structure

```
src/
├── student/
│   └── CheckoutPage.jsx          # New checkout page with Stripe
├── utils/
│   └── notificationService.js    # FCM notification handling
public/
└── firebase-messaging-sw.js      # Service worker for notifications
functions/src/
└── index.ts                      # Updated with payment & notification functions
```

## 🔒 Security Notes

- Stripe secret keys are stored as Firebase Function secrets
- Payment processing happens server-side
- Webhook signature verification ensures webhook authenticity
- FCM tokens are automatically cleaned up when invalid

## 🚨 Troubleshooting

### Common Issues

1. **Stripe not loading**: Check if `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set correctly
2. **Payment fails**: Check Firebase Function logs for errors
3. **Notifications not working**: 
   - Verify FCM VAPID key is correct
   - Check if user granted notification permission
   - Verify service worker is registered

### Debug Commands

```bash
# Check function logs
firebase functions:log

# Test functions locally
firebase emulators:start

# Check environment variables
firebase functions:config:get
```

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Firebase Function logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

---

**Note**: This implementation uses Firebase Storage for any additional data storage needs and follows Firebase best practices for security and scalability.
