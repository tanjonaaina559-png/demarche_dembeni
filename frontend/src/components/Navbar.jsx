import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import LogoutConfirmModal from './ui/LogoutConfirmModal';
import LogoDembeni from './ui/LogoDembeni';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  // Open the confirmation modal — do NOT call logout directly
  const handleLogoutRequest = () => {
    closeMobileMenu();
    setShowLogoutModal(true);
  };

  // Called only when user confirms inside the modal
  const handleLogoutConfirm = async () => {
    await logout(); // clears token + storage, then redirects to /
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownRef]);

  const renderAuthLinks = () => {
    if (!user) {
      return (
        <NavLink to="/login" className="btn-citoyen" onClick={closeMobileMenu}>
          <i className="fas fa-sign-in-alt"></i> Se connecter
        </NavLink>
      );
    }

    const isCitizen = user.role === 'citizen';
    const displayName = isCitizen
      ? `${user.firstname || user.prenom || ''} ${user.lastname || user.nom || ''}`.trim() || 'Citoyen'
      : `${user.firstname || user.prenom || ''} ${user.lastname || user.nom || ''}`.trim() || 'Administrateur';
    const avatarLetter = displayName.charAt(0).toUpperCase();
    const roleBadge = isCitizen ? 'Citoyen' : 'Admin';

    return (
      <div className="nav-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          className="nav-dropdown-btn"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            background: 'none', border: 'none', color: '#164022', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '1rem', padding: '0.5rem'
          }}
        >
          <span style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: isCitizen ? '#409859' : '#1a5c9e',
            color: '#fff', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
          }}>{avatarLetter}</span>
          <span>{displayName}</span>
          <span style={{
            fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px',
            background: isCitizen ? 'rgba(64,152,89,0.12)' : 'rgba(26,92,158,0.12)',
            color: isCitizen ? '#409859' : '#1a5c9e', fontWeight: 700, letterSpacing: '0.02em'
          }}>{roleBadge}</span>
          <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
        </button>

        {dropdownOpen && (
          <div className="nav-dropdown-menu" style={{
            position: 'absolute', top: '110%', right: 0, background: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: '12px',
            minWidth: '230px', zIndex: 1000, overflow: 'hidden',
            display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            {isCitizen ? (
              <>
                <NavLink to="/citizen/profile" className="dropdown-item" onClick={closeMobileMenu}>Mon Profil</NavLink>
                <NavLink to="/mes-demandes" className="dropdown-item" onClick={closeMobileMenu}>Mes demandes</NavLink>
                <NavLink to="/citizen/documents" className="dropdown-item" onClick={closeMobileMenu}>Mes documents numériques</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/admin/dashboard" className="dropdown-item" onClick={closeMobileMenu}>Tableau de bord</NavLink>
                <NavLink to="/admin/citizens" className="dropdown-item" onClick={closeMobileMenu}>Administration</NavLink>
                <NavLink to="/admin/settings" className="dropdown-item" onClick={closeMobileMenu}>Mon Profil</NavLink>
              </>
            )}
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 0' }}></div>
            <button onClick={handleLogoutRequest} className="dropdown-item text-danger" style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 15px', width: '100%', color: '#DC2626' }}>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
      <nav className="navbar-green">
        <div className="nav-left">
          <NavLink to="/" onClick={closeMobileMenu}>Accueil</NavLink>
          <NavLink to="/demarches" onClick={closeMobileMenu}>Démarches</NavLink>
          <NavLink to="/documents" onClick={closeMobileMenu}>Documents</NavLink>
          <NavLink to="/services" onClick={closeMobileMenu}>Services</NavLink>
        </div>
        
        <div className="nav-logo-center" onClick={closeMobileMenu}>
          <span className="nav-logo-line" aria-hidden="true"></span>
          <div className="nav-logo-identity">
            <LogoDembeni size="sm" theme="light" withText={false} />
            <span className="nav-logo-wordmark">
              <span className="nav-logo-demb">DEMB</span><span className="nav-logo-e">E</span><span className="nav-logo-ni">NI</span>
            </span>
          </div>
          <span className="nav-logo-line" aria-hidden="true"></span>
        </div>
        
        <div className="nav-right">
          <NavLink to="/contact" onClick={closeMobileMenu}>Contact</NavLink>
          {renderAuthLinks()}
        </div>

        <button className="nav-hamburger" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-menu-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="mobile-menu-content">
              <NavLink to="/" onClick={closeMobileMenu}>Accueil</NavLink>
              <NavLink to="/demarches" onClick={closeMobileMenu}>Démarches</NavLink>
              <NavLink to="/documents" onClick={closeMobileMenu}>Documents</NavLink>
              <NavLink to="/services" onClick={closeMobileMenu}>Services</NavLink>
              <NavLink to="/contact" onClick={closeMobileMenu}>Contact</NavLink>
              {user ? (
                <>
                  {user.role === 'citizen' ? (
                    <>
                      <NavLink to="/citizen/profile" className="mt-2" onClick={closeMobileMenu}>Mon Profil</NavLink>
                      <NavLink to="/mes-demandes" onClick={closeMobileMenu}>Mes demandes</NavLink>
                      <NavLink to="/citizen/documents" onClick={closeMobileMenu}>Mes documents numériques</NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink to="/admin/dashboard" className="mt-2" onClick={closeMobileMenu}>Tableau de bord</NavLink>
                      <NavLink to="/admin/citizens" onClick={closeMobileMenu}>Administration</NavLink>
                      <NavLink to="/admin/settings" onClick={closeMobileMenu}>Mon Profil</NavLink>
                    </>
                  )}
                  <button onClick={handleLogoutRequest} className="btn-admin mt-2">Déconnexion</button>
                </>
              ) : (
                <NavLink to="/login" className="btn-citoyen mt-2" onClick={closeMobileMenu}>
                  <i className="fas fa-sign-in-alt"></i> Se connecter
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
