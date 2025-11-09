import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CircleDollarSign, Download } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { db } from '../firebase';
import { collection, getCountFromServer, onSnapshot } from 'firebase/firestore';

const AnalyticsPage = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ users: 0, orders: 0, menu: 0 });
  const [paymentStats, setPaymentStats] = useState({ razorpay: 0, cashfree: 0, cod: 0 });

  useEffect(() => {
    loadAnalytics();

    // Real-time updates for orders to reflect status/completion changes immediately
    const ordersUnsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const paymentMethods = { razorpay: 0, cashfree: 0, cod: 0 };

      // Aggregations from completed orders
      const popularItemNameToQuantity = new Map();
      const hourToCount = new Map(); // 0-23 -> count
      const dayToRevenue = new Map(); // YYYY-MM-DD -> revenue

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfToday);
        d.setDate(startOfToday.getDate() - (6 - i));
        return d;
      });

      snapshot.docs.forEach((doc) => {
        const order = doc.data();
        const paymentMethod = (order.paymentMethod || '').toLowerCase();
        if (paymentMethod.includes('razorpay')) {
          paymentMethods.razorpay++;
        } else if (paymentMethod.includes('cashfree')) {
          paymentMethods.cashfree++;
        } else if (paymentMethod.includes('cash') || paymentMethod.includes('cod')) {
          paymentMethods.cod++;
        }

        // Use only completed orders for analytics below
        if (order.status !== 'Completed') return;

        const ts = order.createdAt || order.orderTime;
        const date = ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
        if (!date) return;

        // Popular items: sum quantities by item name
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((it) => {
          const name = it?.name || 'Unknown Item';
          const qty = Number(it?.quantity || 0);
          popularItemNameToQuantity.set(name, (popularItemNameToQuantity.get(name) || 0) + qty);
        });

        // Peak hours: count orders per hour of day
        const hour = date.getHours();
        hourToCount.set(hour, (hourToCount.get(hour) || 0) + 1);

        // Daily revenue: sum totalPrice per YYYY-MM-DD for last 7 days
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        const price = Number(order.totalPrice || order.totalAmount || 0);
        dayToRevenue.set(key, (dayToRevenue.get(key) || 0) + price);
      });

      // Build popular items list (top 5)
      const popular = Array.from(popularItemNameToQuantity.entries())
        .map(([name, quantity]) => ({ name, orders: quantity }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      // Build peak hours (0-23 -> human label), show hours that have counts, sorted by count desc (top 6)
      const toHourLabel = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        return `${hour12} ${ampm}`;
      };
      const peak = Array.from(hourToCount.entries())
        .map(([hour, count]) => ({ hour: toHourLabel(hour), orders: count }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 6);

      // Build last 7 days revenue in chronological order
      const daily = last7Days.map((d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        return { day: key, revenue: dayToRevenue.get(key) || 0 };
      });

      setPaymentStats(paymentMethods);
      setCounts((prev) => ({ ...prev, orders: snapshot.size }));
      setPopularItems(popular);
      setPeakHours(peak);
      setDailyRevenue(daily);
      setLoading(false);
    });

    return () => ordersUnsub && ordersUnsub();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const users = await getCountFromServer(collection(db, 'users'));
      const orders = await getCountFromServer(collection(db, 'orders'));
      const menu = await getCountFromServer(collection(db, 'menu'));
      setCounts({ users: users.data().count, orders: orders.data().count, menu: menu.data().count });
      
      // Payment statistics now handled by real-time listener
      
      // Keep placeholders for charts
      setPopularItems([]);
      setPeakHours([]);
      setDailyRevenue([]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    // Placeholder for PDF generation
    alert('PDF generation feature will be implemented with backend integration');
  };

  const getMaxOrders = (data) => {
    return Math.max(...data.map(item => item.orders));
  };

  const getMaxRevenue = (data) => {
    return Math.max(...data.map(item => item.revenue));
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights into canteen performance and trends</p>
        </div>
        <Button onClick={generatePDF} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Generate PDF Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{counts.users}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{counts.orders}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900">{counts.menu}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CircleDollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Weekly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dailyRevenue.reduce((sum, day) => sum + day.revenue, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Razorpay</span>
                <span className="text-sm font-bold text-gray-900">{paymentStats.razorpay} orders</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${paymentStats.razorpay > 0 ? (paymentStats.razorpay / (paymentStats.razorpay + paymentStats.cashfree + paymentStats.cod)) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Cashfree</span>
                <span className="text-sm font-bold text-gray-900">{paymentStats.cashfree} orders</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${paymentStats.cashfree > 0 ? (paymentStats.cashfree / (paymentStats.razorpay + paymentStats.cashfree + paymentStats.cod)) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Cash on Delivery</span>
                <span className="text-sm font-bold text-gray-900">{paymentStats.cod} orders</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${paymentStats.cod > 0 ? (paymentStats.cod / (paymentStats.razorpay + paymentStats.cashfree + paymentStats.cod)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Popular Items Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Most Popular Items</h3>
          <div className="space-y-4">
            {popularItems.map((item, index) => {
              const maxOrders = getMaxOrders(popularItems);
              const percentage = (item.orders / maxOrders) * 100;
              
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm font-bold text-gray-900">{item.orders} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Peak Order Hours</h3>
          <div className="space-y-4">
            {peakHours.map((hour, index) => {
              const maxOrders = getMaxOrders(peakHours);
              const percentage = (hour.orders / maxOrders) * 100;
              
              return (
                <div key={hour.hour} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{hour.hour}</span>
                    <span className="text-sm font-bold text-gray-900">{hour.orders} orders</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Revenue Trend</h3>
        <div className="space-y-4">
          {dailyRevenue.map((day, index) => {
            const maxRevenue = getMaxRevenue(dailyRevenue);
            const percentage = (day.revenue / maxRevenue) * 100;
            
            return (
              <div key={day.day} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{day.day}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(day.revenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Analytics Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Customer Satisfaction */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">4.8/5</p>
            <p className="text-gray-600">Average Rating</p>
          </div>
        </div>

        {/* Order Completion Rate */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Completion Rate</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-2">94%</p>
            <p className="text-gray-600">On-Time Delivery</p>
          </div>
        </div>
      </div>

      {/* Report Generation Placeholder */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Receipts & Reports</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Generate PDF Reports</h4>
          <p className="text-gray-600 mb-4">
            Create detailed reports for daily, weekly, or monthly analytics
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={generatePDF}>
              Daily Report
            </Button>
            <Button variant="outline" onClick={generatePDF}>
              Weekly Report
            </Button>
            <Button variant="outline" onClick={generatePDF}>
              Monthly Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
