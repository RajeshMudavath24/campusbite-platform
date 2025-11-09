import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingCart, CircleDollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import PaymentGateway from '../components/PaymentGateway';
import { formatCurrency } from '../utils/helpers';

// Cash on Delivery Form Component
const CashOnDeliveryForm = ({ orderTotal, onOrderSuccess, onOrderError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [requiredByTime, setRequiredByTime] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!requiredByTime) {
      setError('Please select a pickup time');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Place order with cash on delivery
      const placeOrder = httpsCallable(functions, 'placeOrder');
      const { data } = await placeOrder({
        requiredByTime: new Date(requiredByTime).toISOString(),
        paymentMethod: 'Cash on Delivery'
      });

      if (data.ok) {
        onOrderSuccess(data);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (err) {
      const errorMessage = err.message || 'Order failed. Please try again.';
      setError(errorMessage);
      onOrderError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate time options for the next 2 hours
  const generateTimeOptions = () => {
    const options = [];
    const now = new Date();
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    for (let time = new Date(now); time <= endTime; time.setMinutes(time.getMinutes() + 15)) {
      const timeString = time.toISOString().slice(0, 16);
      const displayTime = time.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      options.push(
        <option key={timeString} value={timeString}>
          {displayTime}
        </option>
      );
    }
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CircleDollarSign className="w-5 h-5 mr-2" />
          Payment
        </h3>
        
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CircleDollarSign className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h4 className="font-medium text-blue-900">Cash on Pickup</h4>
                <p className="text-sm text-blue-700">
                  Pay when you pick up your order. No online payment required.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Pickup Time
          </label>
          <select
            value={requiredByTime}
            onChange={(e) => setRequiredByTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Select pickup time</option>
            {generateTimeOptions()}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Please select when you'd like to pick up your order
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Placing Order...
            </>
          ) : (
            <>
              <CircleDollarSign className="w-4 h-4 mr-2" />
              Place Order - Pay {formatCurrency(orderTotal)} on Pickup
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, requiredByTime } = useCart();
  const { user } = useAuth();
  const [orderSummary, setOrderSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', null
  const [usedPaymentMethod, setUsedPaymentMethod] = useState(null);
  // Use requiredByTime from CartContext; remove local duplicate state

  useEffect(() => {
    const calculateOrderSummary = () => {
      if (!cartItems || cartItems.length === 0) {
        navigate('/student/cart');
        return;
      }

      try {
        let totalPrice = 0;
        const itemsWithDetails = [];

        for (const item of cartItems) {
          const itemTotal = item.price * item.quantity;
          totalPrice += itemTotal;
          
          itemsWithDetails.push({
            ...item,
            total: itemTotal
          });
        }

        setOrderSummary({
          items: itemsWithDetails,
          totalPrice
        });
      } catch (error) {
        console.error('Error calculating order summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateOrderSummary();
  }, [cartItems, navigate]);

  const handleOrderSuccess = async (orderData) => {
    try {
      setPaymentStatus('success');
      
      // Clear the cart
      clearCart();
      
      // Show success message for 3 seconds before redirecting
      setTimeout(() => {
        navigate('/student/orders');
      }, 3000);
    } catch (error) {
      console.error('Error handling order success:', error);
      setPaymentStatus('error');
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setIsLoading(true);
      
      // Store payment method for display
      setUsedPaymentMethod(paymentData.paymentMethod || 'Online Payment');
      
      const placeOrder = httpsCallable(functions, 'placeOrder');
      const orderData = {
        requiredByTime: new Date(requiredByTime).toISOString(),
        paymentMethod: paymentData.paymentMethod || 'Online Payment',
        paymentStatus: paymentData.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed'
      };

      // Only add paymentId for online payments
      if (paymentData.paymentId) {
        orderData.paymentId = paymentData.paymentId;
      }

      // Only add orderId for online payments
      if (paymentData.orderId) {
        orderData.orderId = paymentData.orderId;
      }

      const { data } = await placeOrder(orderData);

      if (data && data.ok) {
        await handleOrderSuccess(data);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (err) {
      const errorMessage = err.message || 'Order failed. Please try again.';
      handleOrderError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderError = (error) => {
    setPaymentStatus('error');
    console.error('Order error:', error);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!orderSummary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Items in Cart</h2>
          <p className="text-gray-600 mb-4">Please add items to your cart before checkout.</p>
          <button
            onClick={() => navigate('/student/menu')}
            className="btn-primary"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully! 🎉</h2>
          <p className="text-gray-600 mb-4">Your order has been confirmed and is being prepared.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
            <p className="text-sm text-green-800">
              <strong>Order Total:</strong> {formatCurrency(orderSummary?.totalPrice || 0)}
            </p>
            <p className="text-sm text-green-800">
              <strong>Payment Method:</strong> {usedPaymentMethod === 'Cash on Delivery' ? 'Cash on Pickup' : (usedPaymentMethod || 'N/A')}
            </p>
            <p className="text-sm text-green-800">
              <strong>Status:</strong> {usedPaymentMethod === 'Cash on Delivery' ? 'Pending - Pay on pickup' : 'Completed - Being prepared'}
            </p>
          </div>
          <p className="text-sm text-gray-500">Redirecting to your orders page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2">Review your order and complete payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            {orderSummary.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(item.total)}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(orderSummary.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div>
          <PaymentGateway
            orderTotal={orderSummary.totalPrice}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handleOrderError}
            requiredByTime={requiredByTime}
          />

          {/* Pickup time selection is managed in Cart page; removed duplicate UI here */}

          {paymentStatus === 'error' && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-md p-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Order failed. Please try again.
            </div>
          )}
        </div>
      </div>

      {/* Back to Cart */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/student/cart')}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to Cart
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
