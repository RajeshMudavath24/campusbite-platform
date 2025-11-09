# Cashfree Payment Gateway Setup

## Overview
This guide will help you set up Cashfree payment gateway integration for your CampusBite application alongside the existing Razorpay integration.

## Prerequisites
- Cashfree merchant account (sign up at https://www.cashfree.com/)
- Firebase project with Functions enabled
- Existing Razorpay integration (optional, both can work together)

## Step 1: Create Cashfree Account
1. Go to https://www.cashfree.com/ and sign up
2. Complete the account verification process
3. Navigate to Developers → API Keys
4. Generate API Keys (Sandbox mode for development)

## Step 2: Configure Environment Variables

### Frontend (.env file)
Add these variables to your `.env` file:
```
REACT_APP_CASHFREE_APP_ID=your_cashfree_app_id_here
REACT_APP_CASHFREE_ENVIRONMENT=sandbox
```

### Backend (Firebase Functions)
Set Cashfree credentials in Firebase Functions:
```bash
firebase functions:config:set cashfree.app_id="your_app_id_here"
firebase functions:config:set cashfree.secret_key="your_secret_key_here"
firebase functions:config:set cashfree.environment="sandbox"
```

Or set environment variables:
```bash
export CASHFREE_APP_ID="your_app_id_here"
export CASHFREE_SECRET_KEY="your_secret_key_here"
export CASHFREE_ENVIRONMENT="sandbox"
```

## Step 3: Domain Whitelisting
1. Log in to your Cashfree dashboard
2. Navigate to Settings → Domain Whitelist
3. Add your domain (e.g., `localhost:3000` for development, `your-domain.com` for production)

## Step 4: Deploy Functions
```bash
npm --prefix functions run build
firebase deploy --only functions
```

## Step 5: Test Payment Flow
1. Start your application: `npm start`
2. Add items to cart
3. Go to checkout
4. Select "Online Payment" option
5. Choose "Cashfree" as payment gateway
6. Complete payment using Cashfree test cards

## Test Cards
Use these test card numbers for testing:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Production Setup
1. Switch to Production mode in Cashfree dashboard
2. Update API keys to live keys
3. Update environment variables
4. Redeploy functions
5. Update domain whitelist with production domain

## Features
- **Multiple Payment Methods**: Cards, UPI, Net Banking, Wallets
- **Secure Processing**: PCI DSS compliant
- **Real-time Notifications**: Webhook support for payment status updates
- **Mobile Optimized**: Responsive checkout experience

## Payment Gateway Selection
The application now supports both Razorpay and Cashfree:
- Users can choose their preferred payment gateway during checkout
- Both gateways support the same payment methods
- Orders are processed identically regardless of gateway choice

## Security Notes
- Never expose your secret key in frontend code
- Always verify payments on the backend
- Use HTTPS in production
- Implement proper error handling
- Keep API keys secure and rotate them regularly

## Troubleshooting
- Check browser console for errors
- Verify API keys are correct
- Ensure functions are deployed
- Check Firebase Functions logs
- Verify domain is whitelisted in Cashfree dashboard

## Support
- Cashfree Documentation: https://docs.cashfree.com/
- Firebase Functions: https://firebase.google.com/docs/functions
- Cashfree Support: support@cashfree.com

## Integration Benefits
- **Redundancy**: Multiple payment gateway options
- **Better Success Rates**: Different gateways may have different success rates
- **User Preference**: Users can choose their preferred payment method
- **Competitive Pricing**: Compare fees between different gateways
