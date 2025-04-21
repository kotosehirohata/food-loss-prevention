// components/ui/Notification.js

'use client';

import { useState, useEffect } from 'react';

/**
 * Notification component for displaying alerts and messages
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type of notification (success, error, warning, info)
 * @param {number} props.duration - Duration in milliseconds to show notification (0 for persistent)
 * @param {Function} props.onClose - Callback when notification is closed
 */
export default function Notification({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose = () => {}
}) {
  const [visible, setVisible] = useState(true);

  // Define styles based on notification type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-400',
          icon: 'text-green-400',
          text: 'text-green-700'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-400',
          icon: 'text-red-400',
          text: 'text-red-700'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-400',
          icon: 'text-yellow-400',
          text: 'text-yellow-700'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-400',
          icon: 'text-blue-400',
          text: 'text-blue-700'
        };
    }
  };

  // Close notification after duration
  useEffect(() => {
    if (duration === 0) return; // Persistent notification
    
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Don't render if not visible
  if (!visible) return null;

  const styles = getTypeStyles();
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`border-l-4 p-4 ${styles.container}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="ml-3">
          <p className={`text-sm ${styles.text}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => {
                setVisible(false);
                onClose();
              }}
              className={`inline-flex ${styles.icon} rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'info' ? 'blue' : type === 'success' ? 'green' : type === 'error' ? 'red' : 'yellow'}-500`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// components/context/NotificationContext.js
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import Notification from '@/components/ui/Notification';

// Create context
const NotificationContext = createContext(null);

// Context provider component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { id, message, type, duration }
    ]);
    return id;
  }, []);

  // Remove a notification by id
  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);

  // Shorthand methods for different notification types
  const success = useCallback((message, duration) => 
    addNotification(message, 'success', duration), [addNotification]);
  
  const error = useCallback((message, duration) => 
    addNotification(message, 'error', duration), [addNotification]);
  
  const warning = useCallback((message, duration) => 
    addNotification(message, 'warning', duration), [addNotification]);
  
  const info = useCallback((message, duration) => 
    addNotification(message, 'info', duration), [addNotification]);

  return (
    <NotificationContext.Provider value={{ 
      addNotification, 
      removeNotification,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(({ id, ...props }) => (
          <Notification 
            key={id} 
            {...props} 
            onClose={() => removeNotification(id)} 
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

// Hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};