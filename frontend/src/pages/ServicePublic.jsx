import React from 'react';
import { Link } from 'react-router-dom';
import './ServicePublic.css';

const ServicePublic = () => {
  return (
    <>
      {/* HERO */}
      <section className="page-banner" style={{ background: 'linear-gradient(160deg, rgba(6, 64, 43, 0.85) 0%, rgba(13, 115, 76, 0.78) 60%, rgba(192, 35, 43, 0.55) 100%), url(/banner_bg.png) center center / cover no-repeat' }}>
        <div className="page-banner-inner">
          <div className="breadcrumb">
            <Link to="/"><i className="fas fa-home"></i> Accueil</Link>
            <i className="fas fa-chevron-right"></i>
            <span>Service Public</span>
          </div>
          <h1>Service Public de Proximité</h1>
          <p>Tous les services municipaux à votre disposition. Accueil, information, accompagnement dans vos démarches du quotidien.</p>
        </div>
      </section>

      {/* KPIs */}
      <div className="section section-sm" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div className="stats-strip" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <div className="stat-box"><div className="stat-num">98%</div><div className="stat-label">Satisfaction usagers</div></div>
          <div className="stat-box"><div className="stat-num">24/7</div><div className="stat-label">Portail en ligne</div></div>
          <div className="stat-box"><div className="stat-num">12</div><div className="stat-label">Services disponibles</div></div>
          <div className="stat-box"><div className="stat-num">&lt;48h</div><div className="stat-label">Délai de réponse</div></div>
        </div>
      </div>

      {/* SERVICES */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag"><i className="fas fa-concierge-bell"></i> Municipal</span>
          <h2 className="section-title">Nos services municipaux</h2>
          <div className="divider"></div>
          <p className="section-subtitle mt-2">Retrouvez l'ensemble des services proposés aux habitants de Dembéni.</p>
        </div>

        <div className="services-grid">
          <div className="svc-card">
            <div className="svc-icon"><i className="fas fa-landmark"></i></div>
            <h3>État Civil</h3>
            <p>Naissances, mariages, décès, livrets de famille. Délivrance d'actes et apostilles officielles.</p>
            <div className="svc-footer">
              <span className="svc-hours"><i className="far fa-clock"></i> Lun–Ven 8h–16h30</span>
              <Link to="/demarches" className="svc-link">Accéder <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          <div className="svc-card">
            <div className="svc-icon"><i className="fas fa-school"></i></div>
            <h3>Vie Scolaire</h3>
            <p>Inscriptions, périscolaire, cantine municipale et transport scolaire pour les enfants.</p>
            <div className="svc-footer">
              <span className="svc-hours"><i className="far fa-clock"></i> Lun–Ven 8h–12h</span>
              <Link to="/contact" className="svc-link">Contacter <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          <div className="svc-card">
            <div className="svc-icon"><i className="fas fa-hands-helping"></i></div>
            <h3>Action Sociale — CCAS</h3>
            <p>Accompagnement des familles, aide aux personnes âgées/handicapées et aides d'urgence.</p>
            <div className="svc-footer">
              <span className="svc-hours"><i className="far fa-clock"></i> Lun–Ven 8h–16h</span>
              <Link to="/contact" className="svc-link">Prendre RDV <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          <div className="svc-card">
            <div className="svc-icon"><i className="fas fa-city"></i></div>
            <h3>Urbanisme</h3>
            <p>Permis de construire, déclarations de travaux, consultation du PLU et conseils.</p>
            <div className="svc-footer">
              <span className="svc-hours"><i className="far fa-clock"></i> Mar &amp; Jeu 9h–12h</span>
              <Link to="/demarches" className="svc-link">Voir démarches <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          <div className="svc-card">
            <div className="svc-icon"><i className="fas fa-recycle"></i></div>
            <h3>Hygiène &amp; Propreté</h3>
            <p>Collecte des ordures, encombrants, nettoiement des espaces publics et déchetterie.</p>
            <div className="svc-footer">
              <span className="svc-hours"><i className="far fa-clock"></i> 7j/7 — programmé</span>
              <Link to="/collecte" className="svc-link">Calendrier <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          <div className="svc-card">
            <div className="svc-icon"><i className="fas fa-baby"></i></div>
            <h3>Petite Enfance</h3>
            <p>Crèche municipale et centre de loisirs. Accueil des enfants de 2 mois à 12 ans.</p>
            <div className="svc-footer">
              <span className="svc-hours"><i className="far fa-clock"></i> Lun–Ven 7h30–18h</span>
              <Link to="/inscription" className="svc-link">S'inscrire <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          <div className="svc-card">
            <div className="svc-icon"><i className="fas fa-road"></i></div>
            <h3>Voirie &amp; Espaces Publics</h3>
            <p>Signalement de dégradations, entretien des routes, éclairage et jardins municipaux.</p>
            <div className="svc-footer">
              <span className="svc-hours"><i className="far fa-clock"></i> Lun–Ven 7h–16h</span>
              <Link to="/contact" className="svc-link">Signaler <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>

          <div className="svc-card">
            <div className="svc-icon"><i className="fas fa-shield-alt"></i></div>
            <h3>Police Municipale</h3>
            <p>Maintien de l'ordre public, médiation, sécurité des manifestations et tranquillité.</p>
            <div className="svc-footer">
              <span className="svc-hours"><i className="far fa-clock"></i> 24h/24 – 7j/7</span>
              <Link to="/contact" className="svc-link">Contacter <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>
        </div>
      </section>

      {/* HORAIRES */}
      <div style={{ background: 'var(--vert-50)', borderTop: '1px solid var(--vert-100)', borderBottom: '1px solid var(--vert-100)' }}>
        <section className="section">
          <div className="section-header center">
            <span className="section-tag"><i className="far fa-clock"></i> Mairie</span>
            <h2 className="section-title">Horaires d'ouverture</h2>
            <div className="divider"></div>
          </div>

          <div className="table-wrap mt-3" style={{ maxWidth: '700px', margin: '2rem auto 0' }}>
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Matin</th>
                  <th>Après-midi</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Lundi</strong></td><td>8h00 – 12h00</td><td>13h30 – 16h30</td><td><span className="badge badge-vert">Ouvert</span></td></tr>
                <tr><td><strong>Mardi</strong></td><td>8h00 – 12h00</td><td>13h30 – 16h30</td><td><span className="badge badge-vert">Ouvert</span></td></tr>
                <tr><td><strong>Mercredi</strong></td><td>8h00 – 12h00</td><td>13h30 – 16h30</td><td><span className="badge badge-vert">Ouvert</span></td></tr>
                <tr><td><strong>Jeudi</strong></td><td>8h00 – 12h00</td><td>13h30 – 16h30</td><td><span className="badge badge-vert">Ouvert</span></td></tr>
                <tr><td><strong>Vendredi</strong></td><td>8h00 – 12h00</td><td>13h30 – 16h00</td><td><span className="badge badge-vert">Ouvert</span></td></tr>
                <tr><td><strong>Samedi</strong></td><td colSpan="2" style={{ color: 'var(--gris-300)' }}>Fermé</td><td><span className="badge badge-rouge">Fermé</span></td></tr>
                <tr><td><strong>Dimanche</strong></td><td colSpan="2" style={{ color: 'var(--gris-300)' }}>Fermé</td><td><span className="badge badge-rouge">Fermé</span></td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div style={{ padding: '3rem 0 0' }}>
        <div className="cta-band">
          <h2>Besoin d'aide ?</h2>
          <p>Notre équipe est disponible pour répondre à toutes vos questions et vous orienter vers le bon service.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary btn-lg"><i className="fas fa-envelope"></i> Nous contacter</Link>
            <Link to="/demarches" className="btn btn-secondary btn-lg"><i className="fas fa-list"></i> Toutes les démarches</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicePublic;
