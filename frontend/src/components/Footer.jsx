import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Footer = () => {
  const [footer, setFooter] = useState(null);

  useEffect(() => {
    api.get('/content/footer')
      .then(res => setFooter(res.data))
      .catch(() => setFooter(null));
  }, []);

  const footerData = {
    brandDescription: footer?.brandDescription || 'Portail citoyen officiel de la commune de Dembéni, Mayotte. Simplifiez vos démarches administratives en ligne, en toute sécurité.',
    socialLinks: (footer?.socialLinks && footer.socialLinks.length > 0) ? footer.socialLinks : [
      { icon: 'fab fa-facebook-f', url: '#', title: 'Facebook' },
      { icon: 'fab fa-twitter', url: '#', title: 'Twitter' },
      { icon: 'fab fa-instagram', url: '#', title: 'Instagram' }
    ],
    navLinks: (footer?.navigationLinks && footer.navigationLinks.length > 0) ? footer.navigationLinks :
              (footer?.navLinks && footer.navLinks.length > 0) ? footer.navLinks : [
      { text: 'Accueil', url: '/' },
      { text: 'Démarches', url: '/demarches' },
      { text: 'Collecte', url: '/collecte' },
      { text: 'Service public', url: '/service-public' },
      { text: 'Contact', url: '/contact' }
    ],
    serviceLinks: (footer?.servicesLinks && footer.servicesLinks.length > 0) ? footer.servicesLinks :
                  (footer?.serviceLinks && footer.serviceLinks.length > 0) ? footer.serviceLinks : [
      { text: 'État civil', url: '/demarches' },
      { text: 'Documents officiels', url: '/demarches' },
      { text: 'Urbanisme', url: '/demarches' },
      { text: 'Crèche', url: '/inscription' },
      { text: 'Encombrants', url: '/collecte' }
    ],
    contact: {
      address: footer?.address || 'Mairie de Dembéni, Mayotte 97680',
      phone: footer?.phone || '+262 269 XX XX XX',
      email: footer?.email || 'dembenimairie@gmail.com',
      hours: footer?.openingHours || 'Lun–Ven · 8h00 – 16h30'
    },
    copyrightText: footer?.copyrightText || '© 2026 Mairie de Dembéni — Tous droits réservés',
    bottomLinks: (footer?.legalLinks && footer.legalLinks.length > 0) ? footer.legalLinks :
                 (footer?.bottomLinks && footer.bottomLinks.length > 0) ? footer.bottomLinks : [
      { text: 'Mentions légales', url: '#' },
      { text: 'Confidentialité', url: '#' },
      { text: 'Accessibilité', url: '#' }
    ]
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="logo-icon">D</div>
            <span className="logo-name">DEMBÉNI<em>.</em></span>
          </Link>
          <p>{footerData.brandDescription}</p>
          <div className="footer-socials">
            {footerData.socialLinks.map((link, i) => (
              <a key={i} href={link.url} title={link.title}><i className={link.icon}></i></a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            {footerData.navLinks.map((link, i) => (
              <li key={i}><Link to={link.url}>{link.text}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {footerData.serviceLinks.map((link, i) => (
              <li key={i}><Link to={link.url}>{link.text}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <div className="footer-contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{footerData.contact.address}</span>
          </div>
          <div className="footer-contact-item">
            <i className="fas fa-phone"></i>
            <span>{footerData.contact.phone}</span>
          </div>
          <div className="footer-contact-item">
            <i className="fas fa-envelope"></i>
            <span>{footerData.contact.email}</span>
          </div>
          <div className="footer-contact-item">
            <i className="far fa-clock"></i>
            <span>{footerData.contact.hours}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{footerData.copyrightText}</p>
        <div className="footer-bottom-links">
          {footerData.bottomLinks.map((link, i) => (
            <a key={i} href={link.url}>{link.text}</a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
