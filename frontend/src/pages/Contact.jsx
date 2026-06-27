import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import InteractiveMap from '../components/ui/InteractiveMap';
import './Contact.css';

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Etat Civil',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/public-cms/settings');
        setSiteSettings(res.data);
      } catch (e) {
        // Non-blocking: map will use defaults
        console.warn('Could not load CMS settings for map', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Non renseigné',
        service: formData.service,
        subject: formData.subject,
        message: formData.message
      });
      setStatusMsg({ type: 'success', text: 'Message envoyé avec succès !' });
      setFormData({
        name: '', email: '', phone: '', service: 'Etat Civil', subject: '', message: ''
      });
      setTimeout(() => {
        setSubmitting(false);
        setTimeout(() => setStatusMsg(null), 5000);
      }, 1000);
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Erreur lors de l\'envoi. Veuillez réessayer.' });
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
              <div className="sk-shimmer" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }}></div>
              <div className="sk-shimmer" style={{ height: '460px', borderRadius: 'var(--radius-lg)' }}></div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: loading ? 'none' : 'block' }}>
        <section className="page-banner">
          <div className="page-banner-inner">
            <div className="breadcrumb">
              <Link to="/"><i className="fas fa-home"></i> Accueil</Link>
              <i className="fas fa-chevron-right"></i>
              <span>Contact</span>
            </div>
            <h1>Contactez la Mairie</h1>
            <p>Une question ? Un dossier en cours ? Notre équipe municipale est à votre écoute pour vous accompagner dans vos démarches.</p>
          </div>
        </section>

        <section className="section pt-0">
          <div style={{ height: '2rem' }}></div>

          <div className="contact-grid">
            {/* LEFT: INFO */}
            <div className="contact-info-panel">
              <h3>Coordonnées de la mairie</h3>
              
              <div className="c-info-item">
                <div className="c-info-icon"><i className="fas fa-map-marker-alt"></i></div>
                <div className="c-info-text">
                  <h4>Adresse physique</h4>
                  <p>Hôtel de Ville de Dembéni<br/>Route Nationale 3<br/>97680 Dembéni, Mayotte</p>
                </div>
              </div>
              
              <div className="c-info-item">
                <div className="c-info-icon"><i className="fas fa-phone-alt"></i></div>
                <div className="c-info-text">
                  <h4>Téléphone</h4>
                  <p>Standard : +262 269 00 00 00<br/>Urgences : +262 269 00 00 01</p>
                </div>
              </div>
              
              <div className="c-info-item">
                <div className="c-info-icon"><i className="fas fa-envelope"></i></div>
                <div className="c-info-text">
                  <h4>Email</h4>
                  <p>dembenimairie@gmail.com<br/>contact@dembeni.fr</p>
                </div>
              </div>

              <div className="c-info-item" style={{ marginBottom: 0 }}>
                <div className="c-info-icon"><i className="far fa-clock"></i></div>
                <div className="c-info-text">
                  <h4>Horaires d'ouverture</h4>
                  <p>Du Lundi au Jeudi : 8h00 - 12h00 / 13h30 - 16h30<br/>Vendredi : 8h00 - 12h00 / 13h30 - 16h00</p>
                </div>
              </div>
            </div>

            {/* RIGHT: FORM */}
            <div className="contact-form-panel">
              <h2 className="form-title">Envoyez-nous un message</h2>
              <p className="form-sub">Remplissez ce formulaire détaillé, le service concerné vous répondra sous 48h ouvrées.</p>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom complet *</label>
                    <input type="text" id="name" className="form-field" placeholder="Votre nom" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" id="email" className="form-field" placeholder="votre@email.fr" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" id="phone" className="form-field" placeholder="+262 6..." value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Service concerné</label>
                    <select id="service" className="form-field" value={formData.service} onChange={handleChange}>
                      <option value="Etat Civil">État Civil / Citoyenneté</option>
                      <option value="Urbanisme">Urbanisme / Travaux</option>
                      <option value="Scolaire">Vie Scolaire / Petite enfance</option>
                      <option value="Social">Action Sociale (CCAS)</option>
                      <option value="Collecte">Propreté / Collecte</option>
                      <option value="Autre">Autre demande</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label>Objet du message *</label>
                  <input type="text" id="subject" className="form-field" placeholder="Résumé de votre demande" value={formData.subject} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea id="message" className="form-field" rows="5" placeholder="Détaillez votre demande ici..." value={formData.message} onChange={handleChange} required></textarea>
                </div>

                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Envoi en cours...</>
                  ) : (
                    <><i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i> Envoyer le message</>
                  )}
                </button>
                
                {statusMsg && (
                  <div id="statusMessage" style={{ color: statusMsg.type === 'success' ? 'var(--vert-600)' : 'var(--rouge-500)' }}>
                    {statusMsg.type === 'success' ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-circle"></i>}
                    {statusMsg.text}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* INTERACTIVE GOOGLE MAP */}
          <div className="map-section">
            <InteractiveMap
              latitude={siteSettings?.mapLatitude}
              longitude={siteSettings?.mapLongitude}
              markerTitle={siteSettings?.mapMarkerTitle || 'Commune de Dembéni'}
              markerDesc={siteSettings?.mapMarkerDescription || 'Hôtel de Ville de Dembéni, Route Nationale 3, 97680 Dembéni, Mayotte'}
              contactPhone={siteSettings?.contactPhone || '+262 269 00 00 00'}
              contactEmail={siteSettings?.contactEmail || 'contact@dembeni.fr'}
              openingHours="Lun–Jeu : 8h00–12h / 13h30–16h30 · Ven : 8h00–12h / 13h30–16h00"
              mapsUrl={siteSettings?.mapUrl}
              height="450px"
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;
