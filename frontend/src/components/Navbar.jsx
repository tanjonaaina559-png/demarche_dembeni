import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const renderAuthLinks = () => {
    if (!user) {
      return (
        <>
          <NavLink to="/citizen/login" className="btn-citoyen" onClick={closeMobileMenu}>
            <i className="fas fa-user-circle"></i> Citoyen
          </NavLink>
          <NavLink to="/admin/login" className="btn-admin" onClick={closeMobileMenu}>
            <i className="fas fa-shield-alt"></i> Administrateur
          </NavLink>
        </>
      );
    }

    const isCitizen = user.role === 'citizen';
    const name = isCitizen ? `${user.firstname || user.prenom || ''} ${user.lastname || user.nom || ''}`.trim() : 'Admin Dembeni';
    const iconClass = isCitizen ? 'fas fa-user-circle' : 'fas fa-shield-alt';

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
          <i className={iconClass}></i> {name} <i className="fas fa-chevron-down" style={{ fontSize: '0.8rem' }}></i>
        </button>

        {dropdownOpen && (
          <div className="nav-dropdown-menu" style={{
            position: 'absolute', top: '100%', right: 0, background: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px',
            minWidth: '220px', zIndex: 1000, overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            {isCitizen ? (
              <>
                <NavLink to="/citizen/profile" className="dropdown-item" onClick={closeMobileMenu}>Mon profil</NavLink>
                <NavLink to="/mes-demandes" className="dropdown-item" onClick={closeMobileMenu}>Mes demandes</NavLink>
                <NavLink to="/citizen/documents" className="dropdown-item" onClick={closeMobileMenu}>Mes documents numériques</NavLink>
                <NavLink to="/citizen/settings" className="dropdown-item" onClick={closeMobileMenu}>Paramètres</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/admin/dashboard" className="dropdown-item" onClick={closeMobileMenu}>Tableau de bord</NavLink>
                <NavLink to="/admin/requests" className="dropdown-item" onClick={closeMobileMenu}>Gestion des demandes</NavLink>
                <NavLink to="/admin/procedures" className="dropdown-item" onClick={closeMobileMenu}>Gestion des démarches</NavLink>
                <NavLink to="/admin/cms" className="dropdown-item" onClick={closeMobileMenu}>CMS</NavLink>
                <NavLink to="/admin/statistics" className="dropdown-item" onClick={closeMobileMenu}>Statistiques</NavLink>
                <NavLink to="/admin/settings" className="dropdown-item" onClick={closeMobileMenu}>Paramètres</NavLink>
              </>
            )}
            <button onClick={handleLogout} className="dropdown-item text-danger" style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 15px', width: '100%' }}>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <nav className="navbar-green">
        <div className="nav-left">
          <NavLink to="/" onClick={closeMobileMenu}>Accueil</NavLink>
          <NavLink to="/demarches" onClick={closeMobileMenu}>Démarches</NavLink>
          <NavLink to="/documents" onClick={closeMobileMenu}>Documents</NavLink>
          <NavLink to="/services" onClick={closeMobileMenu}>Services</NavLink>
        </div>
        
        <NavLink to="/" className="nav-logo-center" onClick={closeMobileMenu}>DEMBENI</NavLink>
        
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
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
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
                    <NavLink to="/citizen/profile" className="mt-2" onClick={closeMobileMenu}>Mon profil</NavLink>
                    <NavLink to="/mes-demandes" onClick={closeMobileMenu}>Mes demandes</NavLink>
                    <NavLink to="/citizen/documents" onClick={closeMobileMenu}>Mes documents numériques</NavLink>
                    <NavLink to="/citizen/settings" onClick={closeMobileMenu}>Paramètres</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/admin/dashboard" className="mt-2" onClick={closeMobileMenu}>Tableau de bord</NavLink>
                    <NavLink to="/admin/requests" onClick={closeMobileMenu}>Gestion des demandes</NavLink>
                    <NavLink to="/admin/procedures" onClick={closeMobileMenu}>Gestion des démarches</NavLink>
                    <NavLink to="/admin/cms" onClick={closeMobileMenu}>CMS</NavLink>
                    <NavLink to="/admin/statistics" onClick={closeMobileMenu}>Statistiques</NavLink>
                    <NavLink to="/admin/settings" onClick={closeMobileMenu}>Paramètres</NavLink>
                  </>
                )}
                <button onClick={handleLogout} className="btn-admin mt-2">Déconnexion</button>
              </>
            ) : (
              <>
                <NavLink to="/citizen/login" className="btn-citoyen mt-2" onClick={closeMobileMenu}>
                  <i className="fas fa-user-circle"></i> Citoyen
                </NavLink>
                <NavLink to="/admin/login" className="btn-admin mt-1" onClick={closeMobileMenu}>
                  <i className="fas fa-shield-alt"></i> Administrateur
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
