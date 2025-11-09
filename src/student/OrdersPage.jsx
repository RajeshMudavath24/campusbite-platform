import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listenUserOrders } from '../utils/firestoreClient';
import { formatCurrency, formatDateTime, getOrderStatusColor } from '../utils/helpers';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
// Ratings removed per request

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReadyPopup, setShowReadyPopup] = useState(false);
  const [readyOrderId, setReadyOrderId] = useState(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    const unsub = listenUserOrders(user.uid, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    const unsub = loadOrders();
    return () => unsub && unsub();
  }, [loadOrders]);

  // Listen for in-app popup events for "Ready" notifications
  useEffect(() => {
    const handler = (e) => {
      setReadyOrderId(e?.detail?.orderId || null);
      setShowReadyPopup(true);
      setTimeout(() => setShowReadyPopup(false), 6000);
    };
    window.addEventListener('order-ready-popup', handler);
    return () => window.removeEventListener('order-ready-popup', handler);
  }, []);


  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'Pending':
        return 'Your order is being processed';
      case 'Preparing':
        return 'Your order is being prepared';
      case 'Ready for Pickup':
        return 'Your order is ready for pickup';
      case 'Completed':
        return 'Order completed successfully';
      case 'Cancelled':
        return 'Order was cancelled';
      default:
        return 'Order status unknown';
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showReadyPopup && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          Your order {readyOrderId ? `#${readyOrderId}` : ''} is Ready for Pickup.
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/student/orders'} className="ml-2">
            View
          </Button>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
        <p className="text-gray-600">Track your orders and view order details</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">
            Start by placing your first order from our menu
          </p>
          <Button onClick={() => window.location.href = '/student/menu'}>
            Browse Menu
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(order.status)}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(order.orderTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Required by: {formatDateTime(order.requiredByTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewOrderDetails(order)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map(item => (
                    <span
                      key={item.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {item.name} x {item.quantity}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  {getStatusMessage(order.status)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={`Order #${selectedOrder?.id} Details`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Order Date</h4>
                <p className="text-sm text-gray-600">{formatDateTime(selectedOrder.orderTime)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Required By</h4>
                <p className="text-sm text-gray-600">{formatDateTime(selectedOrder.requiredByTime)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Status</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Payment Status</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedOrder.paymentStatus === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900">Total Amount</h4>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(selectedOrder.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default OrdersPage;
