import React, { useState, useEffect } from 'react';
import { Clock, Users, IndianRupee, AlertTriangle, CheckCircle } from 'lucide-react';
import { listenAllOrders, updateOrderStatus as updateOrderStatusFs } from '../utils/firestoreClient';
import { db } from '../firebase';
import { collection, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import { formatCurrency, formatDateTime, getOrderUrgencyColor, getOrderStatusColor, getRemainingTimeText } from '../utils/helpers';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [itemsOrder, setItemsOrder] = useState(null);

  useEffect(() => {
    const unsub = listenAllOrders(async (snap) => {
      const ordersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Enrich orders with user names from Firestore if studentName is missing or is "student"/"Unknown"
      const enrichedOrders = await Promise.all(ordersData.map(async (order) => {
        // If studentName is missing, "student", "Unknown", or just the email prefix, fetch from Firestore
        if (!order.studentName || 
            order.studentName === 'student' || 
            order.studentName === 'Unknown' ||
            order.studentName === order.userId ||
            (order.studentEmail && order.studentName === order.studentEmail.split('@')[0])) {
          try {
            if (order.userId) {
              const userDoc = await getDoc(doc(db, 'users', order.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.name && userData.name !== 'student') {
                  order.studentName = userData.name;
                }
              }
            }
          } catch (error) {
            console.warn(`Could not fetch user data for order ${order.id}:`, error);
            // Keep the existing studentName
          }
        }
        return order;
      }));
      
      setOrders(enrichedOrders);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const loadOrders = async () => {};

  const updateOrderStatus = async (orderId, newStatus, skipPaymentCheck = false) => {
    try {
      setUpdatingStatus(true);
      
      // Check if this is a Cash on Pickup order being marked as completed
      const order = orders.find(o => o.id === orderId);
      const isCashOnPickup = order?.paymentMethod === 'Cash on Delivery' || order?.paymentMethod === 'Cash on Pickup';
      const isCompleting = newStatus === 'Completed';
      
      if (isCashOnPickup && isCompleting && !skipPaymentCheck) {
        // Show payment collection confirmation
        setNewStatus(newStatus);
        setShowStatusModal(false);
        setShowPaymentConfirmModal(true);
        return;
      }
      
      await updateOrderStatusFs(orderId, newStatus);
      setShowStatusModal(false);
      setShowPaymentConfirmModal(false);
      setSelectedOrder(null);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const confirmPaymentCollected = async () => {
    if (selectedOrder) {
      await updateOrderStatus(selectedOrder.id, newStatus, true);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const openItemsModal = (order) => {
    setItemsOrder(order);
    setShowItemsModal(true);
  };

  const getOrderUrgency = (requiredByTime) => {
    const now = new Date();
    const req = requiredByTime?.toDate ? requiredByTime.toDate() : new Date(requiredByTime);
    if (!req || isNaN(req.getTime())) return 'normal';
    const timeDiff = req - now;
    const minutesLeft = Math.floor(timeDiff / (1000 * 60));
    if (minutesLeft < 0) return 'overdue';
    if (minutesLeft < 15) return 'urgent';
    if (minutesLeft < 30) return 'warning';
    return 'normal';
  };

  const sortOrdersByUrgency = (orders) => {
    // New requirement: newest orders at top (createdAt desc)
    return [...orders].sort((a, b) => {
      const aTs = a.createdAt || a.orderTime;
      const bTs = b.createdAt || b.orderTime;
      const aDate = aTs?.toDate ? aTs.toDate() : new Date(aTs || 0);
      const bDate = bTs?.toDate ? bTs.toDate() : new Date(bTs || 0);
      return (bDate?.getTime?.() || 0) - (aDate?.getTime?.() || 0);
    });
  };

  const getStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
    const readyOrders = orders.filter(o => o.status === 'Ready for Pickup').length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    // Only count revenue from completed orders
    const totalRevenue = orders
      .filter(o => o.status === 'Completed')
      .reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      totalRevenue
    };
  };

  const stats = getStats();
  const sortedOrders = sortOrdersByUrgency(orders);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage orders and monitor canteen operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <IndianRupee className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Button onClick={loadOrders} size="sm">
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required / Time Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOrders.map(order => {
                const urgency = getOrderUrgency(order.requiredByTime);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {urgency === 'overdue' && (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          )}
                          {urgency === 'urgent' && (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          )}
                          {urgency === 'warning' && (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          )}
                          {urgency === 'normal' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(order.orderTime)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.studentName || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{order.studentEmail || order.userId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-sm font-medium text-primary-700 hover:underline"
                        onClick={() => openItemsModal(order)}
                        title="View items"
                      >
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalPrice || order.totalAmount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.paymentMethod === 'Cash on Delivery' ? 'Cash on Pickup' : (order.paymentMethod || 'N/A')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.paymentStatus || 'N/A'}
                      </div>
                      {order.paymentId && (
                        <div className="text-xs text-gray-400">
                          ID: {order.paymentId.slice(-8)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status === 'Completed' ? (
                        <div className="text-sm text-green-700 bg-green-100 inline-flex px-2 py-1 rounded-full">Completed</div>
                      ) : (
                        <>
                          <div className={`text-sm ${getOrderUrgencyColor(order.requiredByTime)} inline-flex px-2 py-1 rounded-full`}>
                            {order.requiredByTime ? getRemainingTimeText(order.requiredByTime) : '-'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.requiredByTime ? formatDateTime(order.requiredByTime) : '-'}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusModal(order)}
                      >
                        Update Status
                      </Button>
                      {order.status !== 'Ready for Pickup' && order.status !== 'Completed' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark Ready
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Orders will appear here as students place them</p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Update Order #${selectedOrder?.id} Status`}
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Student:</strong> {selectedOrder.studentName}</p>
                <p><strong>Email:</strong> {selectedOrder.studentEmail}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedOrder.totalAmount || selectedOrder.totalPrice || 0)}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod === 'Cash on Delivery' ? 'Cash on Pickup' : (selectedOrder.paymentMethod || 'N/A')}</p>
                <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'N/A'}</p>
                {selectedOrder.paymentId && (
                  <p><strong>Payment ID:</strong> {selectedOrder.paymentId}</p>
                )}
                <p><strong>Required By:</strong> {formatDateTime(selectedOrder.requiredByTime)}</p>
                <p><strong>Current Status:</strong> 
                  <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </p>
                <div className="mt-3">
                  <p className="font-medium text-gray-900">Items</p>
                  <ul className="list-disc ml-5 text-gray-700">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((it, idx) => (
                      <li key={idx}>
                        {it.name} × {it.quantity} ({formatCurrency((it.price || 0) * (it.quantity || 0))})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select className="input-field" defaultValue={selectedOrder.status}>
                <option value="Pending">Pending</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const select = document.querySelector('select');
                  updateOrderStatus(selectedOrder.id, select.value);
                }}
                loading={updatingStatus}
                className="flex-1"
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Items Modal */}
      <Modal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        title={`Order #${itemsOrder?.id} Items`}
        size="md"
      >
        {itemsOrder && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-700 space-y-2">
                {Array.isArray(itemsOrder.items) && itemsOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.name} × {it.quantity}</span>
                    <span className="font-medium">{formatCurrency((it.price || 0) * (it.quantity || 0))}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between text-sm font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(itemsOrder.totalPrice || itemsOrder.totalAmount || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Collection Confirmation Modal */}
      <Modal
        isOpen={showPaymentConfirmModal}
        onClose={() => {
          setShowPaymentConfirmModal(false);
          setShowStatusModal(true);
        }}
        title="Collect Payment Before Completing Order"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Cash on Pickup Order</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please collect payment from the student before marking this order as completed.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
                <p><strong>Student:</strong> {selectedOrder.studentName}</p>
                <p><strong>Amount to Collect:</strong> {formatCurrency(selectedOrder.totalAmount || selectedOrder.totalPrice || 0)}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentConfirmModal(false);
                  setShowStatusModal(true);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPaymentCollected}
                loading={updatingStatus}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {updatingStatus ? 'Updating...' : 'Payment Collected - Complete Order'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
