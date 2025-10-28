import React, { useState, useEffect } from 'react';
import { fetchUserNotifications, markAllNotificationsAsRead } from '../services/api';

const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Get user email from localStorage
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem('mm_user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        if (user?.email) {
          setUserEmail(user.email);
        }
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }, []);

  // Fetch notifications from server
  useEffect(() => {
    if (!userEmail) return;

    const fetchNotifications = async () => {
      try {
        // Fetch notifications from server using API service
        const response = await fetchUserNotifications(userEmail);
        
        if (response.success && response.notifications.length > 0) {
          setNotifications(response.notifications);
          setVisible(true);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Fetch immediately on mount
    fetchNotifications();
    
    // Fetch every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [userEmail]);

  const clearNotifications = async () => {
    try {
      // Mark all notifications as read using API service
      await markAllNotificationsAsRead(userEmail);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
    
    setNotifications([]);
    setVisible(false);
  };

  if (!visible || notifications.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      minWidth: '300px',
      maxWidth: '400px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f5f5f5',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <h4 style={{ margin: 0, fontSize: '1em', color: '#333' }}>
            Order Updates ({notifications.length})
          </h4>
          <button 
            onClick={clearNotifications}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '1.2em',
              padding: '0'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {notifications.map((notification) => (
            <div 
              key={notification._id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                background: notification.read ? '#fafafa' : '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                {!notification.read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#2196f3',
                    marginTop: '6px',
                    marginRight: '12px'
                  }}></div>
                )}
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9em', color: '#333' }}>
                    {notification.message}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8em', color: '#999' }}>
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          padding: '8px 16px',
          background: '#f9f9f9',
          textAlign: 'center'
        }}>
          <button 
            onClick={clearNotifications}
            style={{
              background: 'none',
              border: 'none',
              color: '#2196f3',
              cursor: 'pointer',
              fontSize: '0.9em',
              padding: '4px 8px'
            }}
          >
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;