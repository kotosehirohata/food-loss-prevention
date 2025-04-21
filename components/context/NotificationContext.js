// components/context/NotificationContext.js

'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Notification component
const Notification = ({ id, message, type, onClose }) => {
  // Get styles based on type
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-l-4 border-green-400',
          icon: 'text-green-400',
          text: 'text-green-700',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-l-4 border-red-400',
          icon: 'text-red-400',
          text: 'text-red-700',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-l-4 border-yellow-400',
          icon: 'text-yellow-400',
          text: 'text-yellow-700',
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-l-4 border-blue-400',
          icon: 'text-blue-400',
          text: 'text-blue-700',
        };
    }
  };

  // Get icon based on type
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

  const styles = getStyles();

  return (
    <div className={`${styles.container} p-4 rounded-md shadow-md mb-2`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className={`ml-3 ${styles.text}`}>
          <p className="text-sm">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => onClose(id)}
            className={`inline-flex ${styles.icon} p-1 rounded-full hover:bg-gray-200 focus:outline-none`}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Create notification context
const NotificationContext = createContext(null);

// Notification provider component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Add notification
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto-dismiss notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback(id => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Helper functions for different notification types
  const success = useCallback((message, duration) => 
    addNotification(message, 'success', duration), [addNotification]);

  const error = useCallback((message, duration) => 
    addNotification(message, 'error', duration), [addNotification]);

  const warning = useCallback((message, duration) => 
    addNotification(message, 'warning', duration), [addNotification]);

  const info = useCallback((message, duration) => 
    addNotification(message, 'info', duration), [addNotification]);

  // Portal container for notifications
  const NotificationContainer = () => {
    if (typeof window === 'undefined') return null;

    return createPortal(
      <div className="fixed top-4 right-4 z-50 w-80">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={removeNotification}
          />
        ))}
      </div>,
      document.body
    );
  };

  return (
    <NotificationContext.Provider
      value={{ addNotification, removeNotification, success, error, warning, info }}
    >
      {children}
      {typeof window !== 'undefined' && <NotificationContainer />}
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