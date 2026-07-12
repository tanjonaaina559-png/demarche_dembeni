import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, BellDot, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationPanel.module.css';

const NotificationPanel = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onDelete, btnRef }) => {
  const navigate = useNavigate();
  const panelRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(e.target) && 
        btnRef.current && 
        !btnRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, btnRef]);

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      onMarkAsRead(notif._id);
    }
    if (notif.relatedId) {
      // Navigate to the relevant admin page based on notification type
      if (notif.type === 'request_update' || notif.type === 'validation' || notif.type === 'rejection') {
        navigate('/admin/requests');
      } else {
        navigate('/admin/citizens');
      }
    }
    onClose();
  };

  const getIcon = (type) => {
    switch(type) {
      case 'request_update': return <BellDot className={styles.iconBlue} />;
      case 'validation': return <Check className={styles.iconGreen} />;
      case 'rejection': return <X className={styles.iconRed} />;
      default: return <Bell className={styles.iconGray} />;
    }
  };

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={styles.panel}
        >
          <div className={styles.header}>
            <h3>Notifications</h3>
            {notifications.some(n => !n.isRead) && (
              <button onClick={onMarkAllAsRead} className={styles.markAllBtn}>
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>
                <Bell size={24} />
                <p>Aucune notification pour le moment.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`${styles.item} ${!notif.isRead ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={styles.itemIcon}>
                    {getIcon(notif.type)}
                  </div>
                  <div className={styles.itemContent} onClick={() => handleNotificationClick(notif)} style={{ cursor: 'pointer', flex: 1 }}>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className={styles.time}>
                      {new Date(notif.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className={styles.itemActions} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onMarkAsRead(notif._id); }} 
                        style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }}
                        title="Marquer comme lu"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(notif._id); }} 
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(panelContent, document.body);
};

export default NotificationPanel;
