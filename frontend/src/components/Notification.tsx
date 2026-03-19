import React from 'react';
import { useNotification } from '../context/NotificationContext';
import './Notification.css';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <span className={`notification-icon notification-icon-${notification.type}`}>
              {getIcon(notification.type)}
            </span>
            <div className="notification-message">
              {Array.isArray(notification.message)
                ? notification.message.join(', ')
                : notification.message}
            </div>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

function getIcon(type: string): string {
  switch (type) {
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'success':
      return '✅';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
}
