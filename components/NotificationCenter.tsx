"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, MessageSquare, Users, AlertCircle, Star, BookOpen } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationCenter: React.FC = () => {
  const { notifications: apiNotifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  // Use only API notifications, no fallback
  const notifications = apiNotifications;
  
  // Show loading or empty state
  if (isLoading) {
    console.log('🔔 NotificationCenter: Loading...');
  } else {
    console.log('🔔 NotificationCenter: Notifications count:', notifications.length);
  }
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | undefined>(undefined);

  // Prevent horizontal page scroll when dropdown is open
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflowX = html.style.overflowX
    const prevBodyOverflowX = body.style.overflowX
    if (isOpen) {
      html.style.overflowX = 'hidden'
      body.style.overflowX = 'hidden'
    }
    return () => {
      html.style.overflowX = prevHtmlOverflowX
      body.style.overflowX = prevBodyOverflowX
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Position the dropdown using fixed coordinates to avoid clipping
  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const gap = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate optimal width (max 280px, but ensure it fits in viewport)
      const maxWidth = Math.min(280, viewportWidth - 40);
      
      // Position from left edge of button - align with button's left edge
      const left = Math.max(8, rect.left);
      
      // Position below button
      const top = rect.bottom + gap;
      
      // Ensure dropdown doesn't go below viewport
      const availableHeight = Math.max(200, viewportHeight - top - 16);
      
      setPopoverStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        right: 'auto',
        width: `${maxWidth}px`,
        maxWidth: `${maxWidth}px`,
        maxHeight: `${availableHeight}px`,
        minHeight: '200px'
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition, { passive: true } as EventListenerOptions);
    window.addEventListener('scroll', updatePosition, { passive: true } as EventListenerOptions);
    return () => {
      window.removeEventListener('resize', updatePosition as EventListener);
      window.removeEventListener('scroll', updatePosition as EventListener);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_request_created':
      case 'course_request_approved':
      case 'course_request_rejected':
        return <BookOpen size={16} className="text-blue-600" />;
      case 'teacher_approved':
      case 'teacher_rejected':
        return <Users size={16} className="text-green-600" />;
      case 'new_topic':
      case 'new_post':
      case 'post_reply':
      case 'message':
        return <MessageSquare size={16} className="text-emerald-600" />;
      case 'topic_like':
      case 'post_like':
      case 'rating':
        return <Star size={16} className="text-yellow-500" />;
      case 'forum_mention':
      case 'topic_mention':
      case 'post_mention':
        return <Users size={16} className="text-blue-500" />;
      case 'system':
        return <AlertCircle size={16} className="text-gray-500" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444'; // red-500
      case 'medium':
        return '#f59e0b'; // amber-500
      case 'low':
        return '#10b981'; // emerald-500
      default:
        return 'transparent';
    }
  };

  return (
    <div className="notification-center position-relative" ref={dropdownRef}>
      {/* Notification Bell with Badge */}
      <button
        onClick={toggleDropdown}
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.12)',
          color: 'inherit',
          backdropFilter: 'blur(6px)'
        }}
        aria-label="الإشعارات"
        ref={buttonRef}
      >
        {unreadCount > 0 ? (
          <Bell className="w-5 h-5" style={{ color: '#ff6b6b' }} />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span 
            className="position-absolute bg-danger text-white d-flex align-items-center justify-content-center"
            style={{
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              borderRadius: '9999px',
              fontSize: '10px',
              padding: '0 4px',
              lineHeight: 1,
              boxShadow: '0 0 0 2px rgba(0,0,0,0.15)'
            }}
          >
            {unreadCount}
            <span className="visually-hidden">إشعارات غير مقروءة</span>
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div 
          className="shadow-lg notification-dropdown"
          style={{ 
            ...popoverStyle,
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 2000,
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1)',
            direction: 'rtl',
            wordBreak: 'break-word',
            boxSizing: 'border-box',
            padding: '0',
            margin: '0'
          }}
          role="menu"
          aria-label="قائمة الإشعارات"
        >
          <div 
            className="d-flex justify-content-between align-items-center"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              padding: '12px 14px',
              background: 'linear-gradient(90deg, #f8fafc 0%, #ffffff 100%)',
              borderBottom: '1px solid #eaecef'
            }}
          >
            <h6 className="mb-0" style={{ fontWeight: 700, color: '#1f2937' }}>الإشعارات</h6>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="btn btn-sm btn-outline-success"
                disabled={isLoading}
              >
                <Check size={14} className="me-1" />
                تعليم الكل كمقروء
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="dropdown-item-text text-center py-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="dropdown-item-text text-center py-3 text-muted">
              لا توجد إشعارات
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className="notification-item"
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid #f1f5f9',
                  background: notification.is_read ? '#ffffff' : '#f8fafc',
                  transition: 'background 0.2s ease',
                  borderInlineStart: `3px solid ${getPriorityColor(notification.priority)}`
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-start flex-grow-1">
                    <div className="me-2 mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0, maxWidth: 'calc(100% - 40px)' }}>
                      <h6 className="mb-1" style={{ fontSize: '0.95rem', color: '#111827', wordBreak: 'break-word', lineHeight: '1.3' }}>{notification.title}</h6>
                      <p className="mb-1" style={{ fontSize: '0.85rem', color: '#4b5563', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4', overflowWrap: 'break-word' }}>{notification.message}</p>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                      </small>
                      {notification.action_url && notification.action_text && (
                        <div className="mt-2">
                          <a 
                            href={notification.action_url}
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            {notification.action_text}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="btn btn-sm btn-outline-success ms-2"
                      disabled={isLoading}
                      title="تعليم كمقروء"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
