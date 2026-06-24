import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Collecte.css';

const Collecte = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    date: '',
    items: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id.replace('col_', '')]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');

    try {
      await api.post('/contact', {
        name: formData.name,
        email: 'encombrants-collecte@dembeni.fr',
        phone: formData.phone,
        service: 'Collecte',
        subject: `Demande de collecte d'encombrants - ${formData.date}`,
        message: `Adresse exacte : ${formData.address}\n\nDescription des objets : ${formData.items}`
      });
      setSubmitting(false);
      setStatusMsg('success');
      setFormData({ name: '', phone: '', address: '', date: '', items: '' });
      setTimeout(() => setStatusMsg(''), 6000);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      setStatusMsg('error');
    }
  };

  return (
    <>
      {loading && (
        <div id="page-skeleton">
          <div className="sk-navbar">
            <div className="sk-nav-links">
              <div className="sk-nav-link"></div>
              <div className="sk-nav-link" style={{ width: '60px' }}></div>
              <div className="sk-nav-link"></div>
            </div>
            <div className="sk-logo"></div>
            <div className="sk-nav-links">
              <div className="sk-nav-link" style={{ width: '70px' }}></div>
              <div className="sk-nav-link" style={{ width: '90px' }}></div>
            </div>
          </div>
          <div className="sk-banner">
            <div className="sk-banner-bread"></div>
            <div className="sk-banner-title"></div>
            <div className="sk-banner-sub"></div>
          </div>
          <div className="sk-body">
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.2rem' }}>
              <div className="sk-shimmer" style={{ height: '80px', borderRadius: '14px' }}></div>
              <div className="sk-shimmer" style={{ height: '80px', borderRadius: '14px' }}></div>
              <div className="sk-shimmer" style={{ height: '80px', borderRadius: '14px' }}></div>
              <div className="sk-shimmer" style={{ height: '80px', borderRadius: '14px' }}></div>
            </div>
            {/* Calendar cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.2rem', marginTop: '2rem' }}>
              <div className="sk-shimmer" style={{ height: '70px', borderRadius: '14px' }}></div>
              <div className="sk-shimmer" style={{ height: '70px', borderRadius: '14px' }}></div>
              <div className="sk-shimmer" style={{ height: '70px', borderRadius: '14px' }}></div>
              <div className="sk-shimmer" style={{ height: '70px', borderRadius: '14px' }}></div>
            </div>
            {/* Form block */}
            <div className="sk-shimmer" style={{ height: '280px', borderRadius: 'var(--radius-xl)', marginTop: '2rem' }}></div>
          </div>
        </div>
      )}

      <div style={{ display: loading ? 'none' : 'block' }}>
        <section className="page-banner">
          <div className="page-banner-inner">
            <div className="breadcrumb">
              <Link to="/"><i className="fas fa-home"></i> Accueil</Link>
              <i className="fas fa-chevron-right"></i>
              <span>Collecte Décentralisée</span>
            </div>
            <h1><i className="fas fa-recycle" style={{ opacity: .8, marginRight: '10px' }}></i>Collecte d'Encombrants</h1>
            <p>Planifiez la collecte de vos objets volumineux. Service 100% gratuit pour les habitants, deux fois par mois.</p>
          </div>
        </section>

        {/* STATS */}
        <div className="section section-sm">
          <div className="stats-strip">
            <div className="stat-box"><div className="stat-num">2×</div><div className="stat-label">Collectes par mois</div></div>
            <div className="stat-box"><div className="stat-num">100%</div><div className="stat-label">Gratuit habitants</div></div>
            <div className="stat-box"><div className="stat-num">48h</div><div className="stat-label">Délai confirmation</div></div>
            <div className="stat-box"><div className="stat-num">6</div><div className="stat-label">Quartiers desservis</div></div>
          </div>
        </div>

        {/* CALENDRIER */}
        <section className="section">
          <div className="section-header">
            <span className="section-tag"><i className="far fa-calendar-alt"></i> Planification</span>
            <h2 className="section-title">Calendrier des collectes — Mai/Juin 2026</h2>
            <div className="divider"></div>
            <p className="section-subtitle mt-2">Inscrivez-vous avant J-3 du passage prévu dans votre quartier.</p>
          </div>

          <div className="cal-grid">
            <div className="cal-card">
              <div className="cal-date"><span className="d">08</span><span className="m">Mai</span></div>
              <div className="cal-info">
                <h4>Quartier Centre-Ville</h4>
                <p>7h00 – 14h00 &nbsp;·&nbsp; <span className="badge badge-vert">Places disponibles</span></p>
              </div>
            </div>
            <div className="cal-card">
              <div className="cal-date"><span className="d">12</span><span className="m">Mai</span></div>
              <div className="cal-info">
                <h4>Quartier Nord & RN4</h4>
                <p>7h00 – 14h00 &nbsp;·&nbsp; <span className="badge badge-vert">Places disponibles</span></p>
              </div>
            </div>
            <div className="cal-card">
              <div className="cal-date"><span className="d">19</span><span className="m">Mai</span></div>
              <div className="cal-info">
                <h4>Quartier Sud</h4>
                <p>7h00 – 14h00 &nbsp;·&nbsp; <span className="badge badge-rouge">Complet</span></p>
              </div>
            </div>
            <div className="cal-card">
              <div className="cal-date"><span className="d">22</span><span className="m">Mai</span></div>
              <div className="cal-info">
                <h4>Quartier Ouest & Résidences</h4>
                <p>7h00 – 14h00 &nbsp;·&nbsp; <span className="badge badge-vert">Places disponibles</span></p>
              </div>
            </div>
            <div className="cal-card">
              <div className="cal-date"><span className="d">05</span><span className="m">Juin</span></div>
              <div className="cal-info">
                <h4>Toute la commune</h4>
                <p>7h00 – 15h00 &nbsp;·&nbsp; <span className="badge badge-gris">Ouverture inscriptions</span></p>
              </div>
            </div>
            <div className="cal-card">
              <div className="cal-date"><span className="d">19</span><span className="m">Juin</span></div>
              <div className="cal-info">
                <h4>Toute la commune</h4>
                <p>7h00 – 15h00 &nbsp;·&nbsp; <span className="badge badge-gris">Ouverture inscriptions</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* GUIDE ACCEPTÉ/REFUSÉ */}
        <div style={{ background: 'var(--gris-100)', padding: '1px 0' }}>
          <section className="section">
            <div className="section-header center">
              <span className="section-tag"><i className="fas fa-info-circle"></i> Règles</span>
              <h2 className="section-title">Ce qui est accepté & refusé</h2>
              <div className="divider"></div>
            </div>

            <div className="guide-row mt-3">
              <div className="guide-box ok">
                <div className="gh3"><i className="fas fa-check-circle"></i> Objets acceptés</div>
                <ul className="guide-list">
                  <li><i className="fas fa-check"></i> Meubles (armoires, canapés, tables)</li>
                  <li><i className="fas fa-check"></i> Électroménager (frigos, lave-linge, fours)</li>
                  <li><i className="fas fa-check"></i> Literie (matelas, sommiers, oreillers)</li>
                  <li><i className="fas fa-check"></i> Cartons et emballages en volume</li>
                  <li><i className="fas fa-check"></i> Petits appareils électroniques</li>
                  <li><i className="fas fa-check"></i> Jouets et articles de puériculture</li>
                </ul>
              </div>
              <div className="guide-box ko">
                <div className="gh3"><i className="fas fa-times-circle"></i> Objets refusés</div>
                <ul className="guide-list">
                  <li><i className="fas fa-times"></i> Gravats et matériaux de construction</li>
                  <li><i className="fas fa-times"></i> Déchets verts (branches, herbe, terre)</li>
                  <li><i className="fas fa-times"></i> Produits chimiques et dangereux</li>
                  <li><i className="fas fa-times"></i> Pneus et batteries automobiles</li>
                  <li><i className="fas fa-times"></i> Amiante et matériaux polluants</li>
                  <li><i className="fas fa-times"></i> Déchets ménagers courants</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* FORMULAIRE D'INSCRIPTION */}
        <section className="section">
          <div className="form-section">
            <h2><i className="fas fa-clipboard-list" style={{ marginRight: '10px', opacity: .8 }}></i>S'inscrire à la collecte</h2>
            <p className="sub">Remplissez ce formulaire pour réserver votre créneau. Confirmation sous 48h par téléphone ou email.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input type="text" className="form-field dark" id="col_name" placeholder="Votre nom et prénom" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input type="tel" className="form-field dark" id="col_phone" placeholder="+262 6XX XXX XXX" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Adresse exacte *</label>
                  <input type="text" className="form-field dark" id="col_address" placeholder="Numéro, rue, quartier" value={formData.address} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Créneau souhaité *</label>
                  <select className="form-field dark" id="col_date" value={formData.date} onChange={handleChange} required>
                    <option value="">— Choisir un créneau —</option>
                    <option value="08 Mai – Centre-Ville (7h–14h)">08 Mai – Centre-Ville (7h–14h)</option>
                    <option value="12 Mai – Quartier Nord & RN4 (7h–14h)">12 Mai – Quartier Nord & RN4 (7h–14h)</option>
                    <option value="22 Mai – Quartier Ouest (7h–14h)">22 Mai – Quartier Ouest (7h–14h)</option>
                    <option value="05 Juin – Toute la commune (7h–15h)">05 Juin – Toute la commune (7h–15h)</option>
                    <option value="19 Juin – Toute la commune (7h–15h)">19 Juin – Toute la commune (7h–15h)</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label>Description des objets à collecter *</label>
                  <textarea className="form-field dark" id="col_items" rows="3" placeholder="Ex : 1 armoire 2 portes, 1 vieux matelas, 1 frigo hors service…" value={formData.items} onChange={handleChange} required></textarea>
                </div>
              </div>
              <button type="submit" className="btn-form-submit" disabled={submitting}>
                {submitting ? (
                  <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Envoi en cours…</>
                ) : (
                  <><i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i> Envoyer ma demande</>
                )}
              </button>
              
              {statusMsg === 'success' && (
                <p id="formStatus" style={{ color: '#A5D6A7', marginTop: '1rem' }}>
                  <i className="fas fa-check-circle"></i> Demande envoyée ! Vous serez contacté sous 48h.
                </p>
              )}
              {statusMsg === 'error' && (
                <p id="formStatus" style={{ color: '#FF8A80', marginTop: '1rem' }}>
                  <i className="fas fa-exclamation-circle"></i> Erreur lors de l'envoi de votre demande. Veuillez réessayer.
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default Collecte;
