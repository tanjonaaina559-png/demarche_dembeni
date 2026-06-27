import React from 'react';
import { Bell, Search, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './TopNavbar.module.css';
import { useLocation } from 'react-router-dom';

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
        
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={20} />
          <span className={styles.badge}>3</span>
        </button>
        
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
