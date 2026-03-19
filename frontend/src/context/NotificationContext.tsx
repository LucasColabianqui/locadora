import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorNotification } from '../types/error.types';

interface NotificationContextType {
  notifications: ErrorNotification[];
  addNotification: (notification: Omit<ErrorNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<ErrorNotification, 'id'>) => {
    const id = Date.now().toString();
    const duration = notification.duration || 5000;
    const newNotification: ErrorNotification = {
      ...notification,
      id,
      duration,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove após duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};
