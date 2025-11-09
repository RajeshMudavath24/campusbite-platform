import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.isSupported = false;
    this.init();
  }

  async init() {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('This browser does not support service workers');
      return;
    }

    try {
      // Initialize Firebase Messaging
      this.messaging = getMessaging();
      this.isSupported = true;
      
      // Request notification permission
      await this.requestPermission();
      
      // Get FCM token
      await this.getFCMToken();
      
      // Listen for foreground messages
      this.setupForegroundListener();
      
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else if (permission === 'denied') {
        console.log('Notification permission denied');
        return false;
      } else {
        console.log('Notification permission dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getFCMToken() {
    if (!this.messaging || !this.isSupported) {
      console.log('Messaging not supported or not initialized');
      return null;
    }

    try {
      const vapidKey = process.env.REACT_APP_FCM_VAPID_KEY;
      if (!vapidKey) {
        console.error('FCM VAPID key not found in environment variables');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: vapidKey,
      });

      if (token) {
        console.log('FCM token obtained:', token);
        
        // Register token with backend
        await this.registerToken(token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  async registerToken(token) {
    try {
      const registerFcmToken = httpsCallable(functions, 'registerFcmToken');
      await registerFcmToken({ token });
      console.log('FCM token registered successfully');
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }

  setupForegroundListener() {
    if (!this.messaging || !this.isSupported) {
      return;
    }

    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show notification in foreground
      this.showNotification(payload);

      // If order is ready, show an in-app alert banner/modal cue
      const status = payload?.data?.status || payload?.notification?.title || '';
      if (typeof window !== 'undefined' && String(status).toLowerCase().includes('ready')) {
        try {
          const evt = new CustomEvent('order-ready-popup', { detail: payload?.data || {} });
          window.dispatchEvent(evt);
        } catch (e) {
          // no-op
        }
      }
    });
  }

  showNotification(payload) {
    const notificationTitle = payload.notification?.title || 'CampusBite';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new notification',
      icon: payload.notification?.icon || '/logo192.png',
      badge: payload.notification?.badge || '/logo192.png',
      data: payload.data,
      requireInteraction: payload.notification?.requireInteraction || false,
      actions: [
        {
          action: 'view',
          title: 'View Order',
          icon: '/logo192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/logo192.png'
        }
      ]
    };

    // Show notification
    if (Notification.permission === 'granted') {
      const notification = new Notification(notificationTitle, notificationOptions);
      
      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate to orders page
        if (payload.data?.orderId) {
          window.location.href = '/student/orders';
        }
        
        notification.close();
      };
    }
  }

  // Method to check if notifications are supported and enabled
  isNotificationSupported() {
    return this.isSupported && Notification.permission === 'granted';
  }

  // Method to get current permission status
  getPermissionStatus() {
    return Notification.permission;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
