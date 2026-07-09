import React from 'react';
import { Bell, Search, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './TopNavbar.module.css';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import NotificationPanel from './NotificationPanel';

const getPageTitle = (pathname) => {
  if (pathname.includes('/dashboard')) return 'Tableau de bord';
  if (pathname.includes('/citizens')) return 'Citoyens';
  if (pathname.includes('/procedures')) return 'Démarches Administratives';
  if (pathname.includes('/requests')) return 'Gestion des Demandes';
  if (pathname.includes('/documents')) return 'Documents Officiels';
  if (pathname.includes('/cms')) return 'Gestion du Contenu (CMS)';
  if (pathname.includes('/statistics')) return 'Statistiques';
  if (pathname.includes('/settings')) return 'Paramètres';
  return 'Administration';
};

const TopNavbar = ({ adminName, onLogout }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  const handleViewSite = () => {
    window.open('/', '_blank', 'noopener,noreferrer');
  };

  const [notifications, setNotifications] = React.useState([]);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const bellRef = React.useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    // Optional: poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.header
      className={styles.topbar}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      </div>
      
      <div className={styles.actions}>
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input type="text" placeholder="Rechercher..." className={styles.searchInput} />
        </div>

        {/* ── Voir le site (new tab) ──────────────────────────── */}
        <button
          className={styles.viewSiteBtn}
          onClick={handleViewSite}
          title="Voir le portail public"
          aria-label="Ouvrir le site public dans un nouvel onglet"
        >
          <Globe size={16} className={styles.viewSiteIcon} />
          <span className={styles.viewSiteLabel}>Voir le site</span>
        </button>
        
        <button 
          className={styles.iconBtn} 
          aria-label="Notifications"
          ref={bellRef}
          onClick={() => setIsNotifOpen(!isNotifOpen)}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </button>
        
        <NotificationPanel 
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          btnRef={bellRef}
        />
        
        <div className={styles.divider}></div>
        
        <div className={styles.profile}>
          <div className={styles.avatar}>
            {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className={styles.name}>{adminName || 'Admin'}</span>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;
