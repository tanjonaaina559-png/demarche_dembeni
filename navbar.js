/**
 * navbar.js — Navbar et Footer partagés pour toutes les pages du portail Dembéni
 * Usage : <script src="navbar.js"></script> dans le <body> + <div id="site-nav"> + <div id="site-footer">
 */

(function() {
  // Détecter la page active
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = [
    { href: 'accueil.html',       icon: 'fas fa-home',       label: 'Accueil'       },
    { href: 'demarches.html',     icon: 'fas fa-file-alt',   label: 'Démarches'     },
    { href: 'collecte.html',      icon: 'fas fa-recycle',    label: 'Collecte'      },
    { href: 'service_public.html',icon: 'fas fa-landmark',   label: 'Service public'},
    { href: 'contact.html',       icon: 'fas fa-envelope',   label: 'Contact'       },
  ];

  // ─── NAVBAR ────────────────────────────────────────────
  const navHTML = `
<nav class="navbar-green">
  <div class="nav-left">
    <a href="accueil.html" class="${(page === 'accueil.html' || page === 'index.html' || page === '') ? 'active' : ''}">Accueil</a>
    <a href="demarches.html" class="${page === 'demarches.html' ? 'active' : ''}">Démarches</a>
    <a href="#">Projet</a>
    <a href="service_public.html" class="${page === 'service_public.html' ? 'active' : ''}">Services publics</a>
  </div>
  
  <a href="accueil.html" class="nav-logo-center">DEMBENI</a>
  
  <div class="nav-right">
    <a href="#">Actualités</a>
    <a href="#">Culture et Patrimoine</a>
    <a href="#">Solidarité et Santé</a>
    <a href="contact.html" class="${page === 'contact.html' ? 'active' : ''}">Contact</a>
    <a href="inscription.html" class="${page === 'inscription.html' ? 'active' : ''}">S'inscrire</a>
  </div>
</nav>`;

  // ─── FOOTER ────────────────────────────────────────────
  const footerHTML = `
<footer class="footer">
  <div class="footer-top">
    <div class="footer-brand">
      <a href="accueil.html" class="footer-logo">
        <div class="logo-icon">D</div>
        <span class="logo-name">DEMBÉNI<em>.</em></span>
      </a>
      <p>Portail citoyen officiel de la commune de Dembéni, Mayotte. Simplifiez vos démarches administratives en ligne, en toute sécurité.</p>
      <div class="footer-socials">
        <a href="#" title="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
        <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
      </div>
    </div>

    <div class="footer-col">
      <h4>Navigation</h4>
      <ul>
        <li><a href="accueil.html">Accueil</a></li>
        <li><a href="demarches.html">Démarches</a></li>
        <li><a href="collecte.html">Collecte</a></li>
        <li><a href="service_public.html">Service public</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Services</h4>
      <ul>
        <li><a href="demarches.html">État civil</a></li>
        <li><a href="demarches.html">Documents officiels</a></li>
        <li><a href="demarches.html">Urbanisme</a></li>
        <li><a href="inscription.html">Crèche</a></li>
        <li><a href="collecte.html">Encombrants</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Contact</h4>
      <div class="footer-contact-item">
        <i class="fas fa-map-marker-alt"></i>
        <span>Mairie de Dembéni, Mayotte 97680</span>
      </div>
      <div class="footer-contact-item">
        <i class="fas fa-phone"></i>
        <span>+262 269 XX XX XX</span>
      </div>
      <div class="footer-contact-item">
        <i class="fas fa-envelope"></i>
        <span>dembenimairie@gmail.com</span>
      </div>
      <div class="footer-contact-item">
        <i class="far fa-clock"></i>
        <span>Lun–Ven · 8h00 – 16h30</span>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <p>&copy; 2026 Mairie de Dembéni — Tous droits réservés</p>
    <div class="footer-bottom-links">
      <a href="#">Mentions légales</a>
      <a href="#">Confidentialité</a>
      <a href="#">Accessibilité</a>
    </div>
  </div>
</footer>`;

  // ─── INJECT ────────────────────────────────────────────
  const navEl = document.getElementById('site-nav');
  if (navEl) navEl.outerHTML = navHTML;

  const ftEl = document.getElementById('site-footer');
  if (ftEl) ftEl.outerHTML = footerHTML;

  // ─── HAMBURGER ────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    const hb = document.getElementById('hamburger');
    const nl = document.getElementById('navLinks');
    if (hb && nl) {
      hb.addEventListener('click', () => nl.classList.toggle('open'));
    }
  });
})();
