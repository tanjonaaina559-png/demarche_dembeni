import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LayoutDashboard, FolderOpen, PlusCircle,
  User, Settings, LogOut, Bell, Search, UserCircle,
  ChevronLeft, ChevronRight, ClipboardList, Home, FileText,
  Check, Trash2
} from 'lucide-react';
import getImageUrl from '../utils/imageUrl';
import LogoutConfirmModal from '../components/ui/LogoutConfirmModal';
import './CitizenLayout.css';

const CitizenLayout = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/notifications').catch(() => ({ data: [] })).then(({ data }) => setNotifications(data || []));
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`).catch(() => {});
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch { /* ignore */ }
  };

  const handleLogoutRequest = () => {
    setMobileOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    if (onLogout) onLogout();
    else await logout();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { to: '/citizen/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
    { to: '/mes-demandes',      icon: <FolderOpen size={20} />,      label: 'Mes demandes' },
    { to: '/citizen/documents', icon: <FileText size={20} />,        label: 'Documents (Démo)' },
    { to: '/suivi',             icon: <ClipboardList size={20} />,    label: 'Suivi & Historique' },
    { to: '/demarches',       icon: <PlusCircle size={20} />,       label: 'Nouvelle démarche' },
    { to: '/citizen/profile',   icon: <User size={20} />,             label: 'Mon profil' },
    { to: '/citizen/profile?tab=security', icon: <Settings size={20} />, label: 'Sécurité' },
  ];

  return (
    <div className={`citizen-layout ${collapsed ? 'collapsed' : ''}`}>
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
      {/* SIDEBAR */}
      <aside className={`citizen-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <Link to="/" className="sidebar-brand">
              <div className="sidebar-logo-badge">D</div>
              <span className="sidebar-brand-name">Dembéni</span>
            </Link>
          )}
          <button className="collapse-btn desktop-only" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Agrandir' : 'Réduire'}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button className="close-btn mobile-only" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User mini-profile in sidebar */}
        {!collapsed && (
          <div className="sidebar-user-section">
            <div className="sidebar-user-avatar">
              {user?.profilePicture ? (
                <img src={getImageUrl(user.profilePicture)} alt="Profil" />
              ) : (
                <UserCircle size={32} />
              )}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.firstname} {user?.lastname}</span>
              <span className="sidebar-user-badge">● Connecté</span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {!collapsed && <div className="sidebar-nav-label">Navigation</div>}
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link sidebar-home-link" onClick={() => setMobileOpen(false)}>
            <span className="sidebar-icon"><Home size={20} /></span>
            {!collapsed && <span className="sidebar-label">Retour au site</span>}
          </Link>
          <button className="sidebar-link logout-btn" onClick={handleLogoutRequest}>
            <span className="sidebar-icon"><LogOut size={20} /></span>
            {!collapsed && <span className="sidebar-label">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>}

      {/* MAIN CONTENT */}
      <div className="citizen-main">
        {/* TOP NAVBAR */}
        <header className={`citizen-topbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="topbar-left">
            <button className="mobile-toggle mobile-only" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="search-bar desktop-only">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Rechercher une démarche..." />
            </div>
          </div>

          <div className="topbar-right">
            {/* Notifications */}
            <div className="notif-wrapper" ref={notifRef}>
              <button className="notif-btn" onClick={() => setShowNotifs(!showNotifs)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="notif-dropdown"
                  >
                    <div className="notif-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4>Notifications</h4>
                        <span style={{ fontSize: '12px', color: 'var(--gris-500)' }}>{unreadCount} non lues</span>
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} style={{ fontSize: '12px', color: 'var(--vert-600)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">
                          <Bell size={28} style={{ opacity: 0.2, margin: '0 auto 8px', display: 'block' }} />
                          Aucune notification
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div onClick={() => markAsRead(n._id)} style={{ cursor: 'pointer', flex: 1 }}>
                              <p className="notif-title">{n.title || n.message}</p>
                              {n.title && <p className="notif-desc">{n.message}</p>}
                              <span className="notif-time">{new Date(n.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {!n.isRead && (
                                <button onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }} title="Marquer comme lu">
                                  <Check size={16} />
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Supprimer">
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
            </div>

            {/* Profile */}
            <Link to="/citizen/profile" className="profile-menu">
              <div className="profile-avatar">
                {user?.profilePicture ? (
                  <img src={getImageUrl(user.profilePicture)} alt="Profil" />
                ) : (
                  <UserCircle size={32} style={{ color: 'var(--vert-600)' }} />
                )}
              </div>
              <div className="profile-info desktop-only">
                <span className="profile-name">{user?.firstname} {user?.lastname}</span>
                <span className="profile-role">Espace Citoyen</span>
              </div>
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <main className="citizen-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CitizenLayout;
