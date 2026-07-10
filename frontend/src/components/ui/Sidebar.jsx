import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, Users, FileText, Inbox, 
  Files, LayoutTemplate, BarChart2, Settings, 
  LogOut, ChevronLeft, ChevronRight, Menu,
  ChevronDown, Home
} from 'lucide-react';
import styles from './Sidebar.module.css';
import classNames from 'classnames';
import LogoutConfirmModal from './LogoutConfirmModal';
import LogoDembeni from './LogoDembeni';

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/admin/citizens', icon: <Users size={20} />, label: 'Citoyens' },
  { to: '/admin/procedures', icon: <FileText size={20} />, label: 'Démarches' },
  { to: '/admin/requests', icon: <Inbox size={20} />, label: 'Demandes' },
  { to: '/admin/documents', icon: <Files size={20} />, label: 'Documents officiels' },
  { to: '/admin/pdf-templates', icon: <FileText size={20} />, label: '📄 Templates PDF' },
  { 
    label: 'CMS', icon: <LayoutTemplate size={20} />, isSubmenu: true,
    children: [
      { to: '/admin/cms/hero', label: 'Accueil & Hero' },
      { to: '/admin/cms/faq', label: 'FAQ' },
      { to: '/admin/cms/collecte', label: 'Collectes' },
      { to: '/admin/cms/settings', label: 'Paramètres CMS' }
    ]
  },
  { to: '/admin/statistics', icon: <BarChart2 size={20} />, label: 'Statistiques' },
  { to: '/admin/home-cms', icon: <Home size={20} />, label: '🏠 Gestion Accueil' },
  { to: '/admin/settings', icon: <Settings size={20} />, label: 'Paramètres' },
];

const Sidebar = ({ isOpen, toggle, collapsed, setCollapsed }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleCollapse = () => setCollapsed(!collapsed);

  return (
    <aside className={classNames(styles.sidebar, { [styles.collapsed]: collapsed })}>
      <div className={styles.sidebarHeader}>
        {!collapsed && (
          <div className={styles.brandWrapper} style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '10px 0' }}>
            <LogoDembeni size="sm" theme="dark" withText={true} />
          </div>
        )}
        <button className={styles.collapseBtn} onClick={handleCollapse}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navGroupTitle}>{!collapsed && 'Menu Principal'}</div>
        
        {navItems.map((item, idx) => {
          if (item.isSubmenu) {
            const isActiveChild = item.children.some(child => location.pathname === child.to);
            return (
              <div key={idx} className={styles.submenuWrapper}>
                <div 
                  className={classNames(styles.navItem, { [styles.active]: isActiveChild })}
                  onClick={() => setOpenSubmenu(!openSubmenu)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className={styles.label}>{item.label}</span>
                      <ChevronDown size={16} className={classNames(styles.chevron, { [styles.chevronOpen]: openSubmenu })} />
                    </>
                  )}
                </div>
                {!collapsed && openSubmenu && (
                  <div className={styles.submenuItems}>
                    {item.children.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) => classNames(styles.subnavItem, { [styles.active]: isActive })}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => classNames(styles.navItem, { [styles.active]: isActive })}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <LogoutConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={async () => { await logout(); }}
        />
        <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
          <LogOut size={20} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
        {!collapsed && (
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>A</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>Admin</span>
              <span className={styles.userRole}>Administrateur</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
