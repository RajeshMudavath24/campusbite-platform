// Helper utility functions for CampusBite platform

// Format currency - Always displays Indian Rupee (₹)
export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) {
    return '₹0.00';
  }
  
  try {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    // Ensure rupee symbol is used (fallback if browser doesn't support INR properly)
    return formatted.replace(/Rs|INR|₹?/gi, '₹').replace(/₹\s*/, '₹');
  } catch (e) {
    // Fallback: manually format with rupee symbol
    return '₹' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

// Helper to convert Firestore Timestamp to Date
const toDate = (timestamp) => {
  if (!timestamp) return null;
  
  // If it's a Firestore Timestamp with toDate method
  if (typeof timestamp === 'object' && timestamp.toDate) {
    return timestamp.toDate();
  }
  
  // If it's already a Date
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a string or number
  return new Date(timestamp);
};

// Format date and time
export const formatDateTime = (timestamp) => {
  const date = toDate(timestamp);
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date only
export const formatDate = (timestamp) => {
  const date = toDate(timestamp);
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format time only
export const formatTime = (timestamp) => {
  const date = toDate(timestamp);
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get order urgency color
export const getOrderUrgencyColor = (requiredByTime) => {
  const now = new Date();
  const requiredTime = toDate(requiredByTime);
  
  if (!requiredTime || isNaN(requiredTime.getTime())) {
    return 'text-gray-600 bg-gray-100';
  }
  
  const timeDiff = requiredTime - now;
  const minutesLeft = Math.floor(timeDiff / (1000 * 60));
  
  if (minutesLeft < 0) return 'text-red-700 bg-red-100';
  if (minutesLeft < 15) return 'text-red-600 bg-red-100';
  if (minutesLeft < 30) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
};

// Get order status color
export const getOrderStatusColor = (status) => {
  const statusColors = {
    'Pending': 'text-yellow-600 bg-yellow-100',
    'Preparing': 'text-blue-600 bg-blue-100',
    'Ready': 'text-green-600 bg-green-100',
    'Ready for Pickup': 'text-green-600 bg-green-100',
    'Completed': 'text-green-700 bg-green-100',
    'Cancelled': 'text-red-600 bg-red-100'
  };
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

// Human-readable remaining time text
export const getRemainingTimeText = (requiredByTime) => {
  const requiredTime = toDate(requiredByTime);
  if (!requiredTime || isNaN(requiredTime.getTime())) return '-';
  const now = new Date();
  const diffMs = requiredTime - now;
  const absMs = Math.abs(diffMs);
  const minutes = Math.floor(absMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${remMinutes}m`);
  const text = parts.join(' ');
  return diffMs < 0 ? `Overdue by ${text}` : `${text} left`;
};

// Calculate total cart amount
export const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Generate order ID
export const generateOrderId = () => {
  return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate @hitam.org email
export const validateHitamEmail = (email) => {
  return email.endsWith('@hitam.org') && validateEmail(email);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

// Image placeholder
export const getImagePlaceholder = (width = 400, height = 300) => {
  return `https://via.placeholder.com/${width}x${height}/f3f4f6/6b7280?text=No+Image`;
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};
