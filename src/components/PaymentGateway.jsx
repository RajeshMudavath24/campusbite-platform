import React, { useState } from 'react';
import { CreditCard, Shield, AlertCircle, Loader } from 'lucide-react';

const PaymentGateway = ({ orderTotal, onPaymentSuccess, onPaymentError, requiredByTime }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');

  const createOrder = async () => {
    try {
      // For now, return a mock order response to avoid hanging
      // In production, you would call the actual createCashfreeOrder function
      const mockOrderData = {
        order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order_amount: Math.round(orderTotal * 100), // Convert to paise
        order_currency: 'INR',
        payment_session_id: `session_${Date.now()}`
      };
      
      return mockOrderData;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!requiredByTime) {
      setError('Please select a pickup time');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Add overall timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Payment processing timeout')), 15000)
      );

      if (paymentMethod === 'online') {
        await Promise.race([handleCashfreePayment(), timeoutPromise]);
      } else {
        // Cash on pickup - trigger success immediately
        // Don't set processing to false here - let the parent handle that
        onPaymentSuccess({ paymentMethod: 'Cash on Delivery' });
      }
    } catch (err) {
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      onPaymentError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleCashfreePayment = async () => {
    try {
      // Create order
      const orderData = await createOrder();

      // For now, simulate a successful payment
      // In production, you would integrate with Cashfree checkout here
      const mockPaymentResult = {
        orderId: orderData.order_id,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Reset processing state before calling success
      setIsProcessing(false);
      
      // Payment successful - return payment data for order placement
      onPaymentSuccess({
        paymentMethod: 'Online Payment',
        paymentId: mockPaymentResult.paymentId,
        orderId: mockPaymentResult.orderId
      });
    } catch (error) {
      console.error('Cashfree payment error:', error);
      setIsProcessing(false);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Method
        </h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="online"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <label htmlFor="online" className="flex items-center text-sm font-medium text-gray-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Online Payment (Cashfree)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="cod"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <label htmlFor="cod" className="flex items-center text-sm font-medium text-gray-700">
              <Shield className="w-4 h-4 mr-2" />
              Cash on Pickup
            </label>
          </div>
        </div>

        {paymentMethod === 'online' && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Online Payment</h4>
                <p className="text-sm text-blue-700">
                  Pay securely with Cashfree. Supports cards, UPI, net banking, and wallets.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <h4 className="font-medium text-green-900">Cash on Pickup</h4>
                <p className="text-sm text-green-700">
                  Pay when you pick up your order. No online payment required.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : paymentMethod === 'online' ? (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ₹{orderTotal.toFixed(2)} with Cashfree
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Place Order - Pay ₹{orderTotal.toFixed(2)} on Pickup
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentGateway;
