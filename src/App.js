import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';
import notificationService from './utils/notificationService';

// Pages
import Login from './pages/Login';

// Student Pages
import MenuPage from './student/MenuPage';
import CartPage from './student/CartPage';
import CheckoutPage from './student/CheckoutPage';
import OrdersPage from './student/OrdersPage';
import NotificationsPage from './student/NotificationsPage';

// Admin Pages
import DashboardPage from './admin/DashboardPage';
import MenuManagementPage from './admin/MenuManagementPage';
import AnalyticsPage from './admin/AnalyticsPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  const { user, error } = useAuth();
  const { getCartCount } = useCart();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} cartCount={getCartCount()} />
      <main className="min-h-screen">
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'student') {
      return <Navigate to="/student/menu" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to CampusBite
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your one-stop solution for campus dining. Order delicious meals from our canteen 
            with ease and convenience. Fast, reliable, and student-friendly.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/login"
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="btn-secondary text-lg px-8 py-3"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Ordering</h3>
            <p className="text-gray-600">
              Browse our menu and place orders in just a few clicks. 
              Set your preferred pickup time and we'll have it ready.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
            <p className="text-gray-600">
              Track your order status in real-time. Get notifications 
              when your food is ready for pickup.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cash on Delivery</h3>
            <p className="text-gray-600">
              Pay with cash when you pick up your order. 
              No online payment required - simple and convenient.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Order?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of students who trust CampusBite for their daily meals.
          </p>
          <a
            href="/login"
            className="btn-primary text-lg px-8 py-3"
          >
            Start Ordering Now
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize notification service when app loads
    if (notificationService.isNotificationSupported()) {
      console.log('Notification service initialized');
    } else {
      console.log('Notification service not supported or permission not granted');
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />

                {/* Student Routes */}
                <Route
                  path="/student/menu"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Layout>
                        <MenuPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/cart"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Layout>
                        <CartPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Layout>
                        <CheckoutPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/orders"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Layout>
                        <OrdersPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Layout>
                        <NotificationsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/menu"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Layout>
                        <MenuManagementPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Layout>
                        <AnalyticsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;