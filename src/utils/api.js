// Frontend data management for CampusBite platform
// Direct data access without API simulation

import { menuItems, dummyOrders, analyticsData, notifications } from '../data/dummyData';

// Authentication management
export const authAPI = {
  login: (email, password, role) => {
    // Validate @hitam.org email
    if (!email.endsWith('@hitam.org')) {
      throw new Error('Only @hitam.org emails are allowed');
    }
    
    // Simple validation - accept any password for demo
    if (email && password && role) {
      const user = {
        id: role === 'admin' ? 'admin1' : 'student1',
        email,
        role,
        name: role === 'admin' ? 'Admin User' : 'Student User'
      };
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      return { success: true, user };
    }
    
    throw new Error('Invalid credentials');
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    return { success: true };
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
};

// Menu management
export const menuAPI = {
  getMenuItems: () => {
    return menuItems;
  },
  
  getMenuItemById: (id) => {
    const item = menuItems.find(item => item.id === parseInt(id));
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  },
  
  addMenuItem: (itemData) => {
    const newItem = {
      id: Date.now(), // Simple ID generation
      ...itemData,
      available: true
    };
    menuItems.push(newItem);
    return newItem;
  },
  
  updateMenuItem: (id, itemData) => {
    const index = menuItems.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
      throw new Error('Menu item not found');
    }
    menuItems[index] = { ...menuItems[index], ...itemData };
    return menuItems[index];
  },
  
  deleteMenuItem: (id) => {
    const index = menuItems.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
      throw new Error('Menu item not found');
    }
    menuItems.splice(index, 1);
    return { success: true };
  }
};

// Orders management
export const ordersAPI = {
  getOrders: () => {
    return dummyOrders;
  },
  
  getOrderById: (id) => {
    const order = dummyOrders.find(order => order.id === parseInt(id));
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  },
  
  createOrder: (orderData) => {
    const newOrder = {
      id: Date.now(),
      ...orderData,
      status: 'Pending',
      orderTime: new Date().toISOString(),
      paymentStatus: 'Pending'
    };
    dummyOrders.unshift(newOrder);
    return newOrder;
  },
  
  updateOrderStatus: (id, status) => {
    const order = dummyOrders.find(order => order.id === parseInt(id));
    if (!order) {
      throw new Error('Order not found');
    }
    order.status = status;
    return order;
  },
  
  getStudentOrders: (studentId) => {
    return dummyOrders.filter(order => order.studentId === studentId);
  }
};

// Analytics management
export const analyticsAPI = {
  getPopularItems: () => {
    return analyticsData.popularItems;
  },
  
  getPeakHours: () => {
    return analyticsData.peakHours;
  },
  
  getDailyRevenue: () => {
    return analyticsData.dailyRevenue;
  }
};

// Notifications management
export const notificationsAPI = {
  getNotifications: (userId) => {
    return notifications;
  },
  
  markAsRead: (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return { success: true };
  },
  
  markAllAsRead: (userId) => {
    notifications.forEach(n => n.read = true);
    return { success: true };
  }
};

// Payment simulation
export const paymentAPI = {
  processPayment: (orderId, amount) => {
    // Simulate payment success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      // Update order payment status
      const order = dummyOrders.find(o => o.id === orderId);
      if (order) {
        order.paymentStatus = 'Paid';
      }
      return { success: true, transactionId: `TXN_${Date.now()}` };
    } else {
      throw new Error('Payment failed. Please try again.');
    }
  }
};
