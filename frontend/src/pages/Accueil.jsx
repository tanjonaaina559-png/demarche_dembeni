import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './Accueil.css';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import { useAuth } from '../context/AuthContext';
import { UserCircle, FileText, Bell, LogOut, ChevronRight } from 'lucide-react';
import LogoDembeni from '../components/ui/LogoDembeni';



const Accueil = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [toastMsg, setToastMsg] = useState(location.state?.logoutMessage || null);

  // Dynamic data state
  const [hero, setHero] = useState({});
  const [settings, setSettings] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [collecteSchedule, setCollecteSchedule] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [servicePublic, setServicePublic] = useState({});
  const [loisirs, setLoisirs] = useState({});
  const [passport, setPassport] = useState({});
  const [footer, setFooter] = useState({});

  const fetchData = async () => {
    try {
      const { data } = await api.get('/home').catch(() => ({ data: { contents: [], cards: [] } }));
      
      const contents = data.contents || [];
      const cardsData = data.cards || [];
      
      const getSection = (name) => contents.find(c => c.section === name) || {};

      setHero(getSection('hero'));
      setSettings(getSection('settings'));
      setFaqs(contents.filter(c => c.section === 'faq'));
      setCollecteSchedule(getSection('collecte'));
      setProcedures(cardsData);
      setServicePublic(getSection('services'));
      setLoisirs(getSection('enfance'));
      setPassport(getSection('passeport'));
      setFooter(getSection('footer'));

      // Simulate skeleton loading
      setTimeout(() => setLoading(false), 500);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  // Data mappings straight from DB
  const heroData = {
    title: hero.title || '',
    subtitle: hero.subtitle || '',
    description: hero.description || '',
    stats: hero.statistics || [],
    alertText: hero.alertText || '',
    showAlert: hero.showAlert !== false
  };

  const servicePublicData = {
    tagText: servicePublic.tagText || '',
    tagIcon: servicePublic.tagIcon || '',
    title: servicePublic.title || '',
    description: servicePublic.description || '',
    image: servicePublic.imageUrl || servicePublic.backgroundImage || '',
    imageAlt: 'Service public',
    stats: servicePublic.statistics || [],
    buttonText: servicePublic.buttonText || '',
    buttonLink: servicePublic.buttonLink || '#'
  };

  const loisirsData = {
    tagText: loisirs.tagText || '',
    tagIcon: loisirs.tagIcon || '',
    title: loisirs.title || '',
    activitiesTitle: loisirs.activitiesTitle || '',
    activities: loisirs.activities || [],
    pricingTitle: loisirs.pricingTitle || '',
    pricingNote: loisirs.pricingNote || '',
    tarifs: loisirs.tarifs || [],
    buttonText: loisirs.buttonText || '',
    buttonLink: loisirs.buttonLink || '#'
  };

  const passportData = {
    tagText: passport.tagText || '',
    tagIcon: passport.tagIcon || '',
    title: passport.title || '',
    steps: passport.steps || [],
    buttonText: passport.buttonText || '',
    buttonLink: passport.buttonLink || '#'
  };

  const footerCtaData = {
    title: footer?.ctaTitle || '',
    description: footer?.ctaDescription || '',
    buttons: footer?.ctaButtons || []
  };

  return (
    <>
      {/* Toast session expirée / déconnexion */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            style={{
              position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
              background: '#1F2937', color: 'white', padding: '14px 24px',
              borderRadius: '12px', zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px',
              maxWidth: '90vw', textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔒</span>
            {toastMsg}
            <button onClick={() => setToastMsg(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '8px' }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div id="page-skeleton">
          {/* Navbar skeleton */}
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
              <div className="sk-nav-link" style={{ width: '50px' }}></div>
            </div>
          </div>
          {/* Hero skeleton */}
          <div className="sk-hero">
            <div className="sk-hero-content">
              <div className="sk-hero-tag"></div>
              <div className="sk-hero-title"></div>
              <div className="sk-hero-title-2"></div>
              <div className="sk-hero-para"></div>
              <div className="sk-hero-para" style={{ width: '60%' }}></div>
              <div className="sk-hero-btns">
                <div className="sk-hero-btn"></div>
                <div className="sk-hero-btn"></div>
              </div>
            </div>
            <div className="sk-hero-card">
              <div className="sk-hero-card-line" style={{ width: '80%' }}></div>
              <div className="sk-hero-card-line"></div>
              <div className="sk-hero-card-line" style={{ width: '70%' }}></div>
              <div className="sk-hero-card-line"></div>
              <div className="sk-hero-card-line" style={{ width: '60%' }}></div>
            </div>
          </div>
          {/* Body skeleton */}
          <div className="sk-body">
            <div className="sk-section-header">
              <div className="sk-tag sk-shimmer"></div>
              <div className="sk-h2 sk-shimmer"></div>
              <div className="sk-divider sk-shimmer"></div>
              <div className="sk-sub sk-shimmer"></div>
            </div>
            <div className="sk-cards-grid">
              {[1, 2, 3].map((i) => (
                <div className="sk-card" key={i}>
                  <div className="sk-card-img sk-shimmer"></div>
                  <div className="sk-card-body">
                    <div className="sk-card-icon sk-shimmer"></div>
                    <div className="sk-card-title sk-shimmer"></div>
                    <div className="sk-card-text sk-shimmer"></div>
                    <div className="sk-card-text-2 sk-shimmer"></div>
                    <div className="sk-card-btn sk-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: loading ? 'none' : 'block' }}>
        {/* HERO */}
        <section className="hero">
          <div 
            className="hero-bg" 
            style={{ backgroundImage: `url(${getImageUrl(hero.imageUrl || hero.backgroundImage)})` }}
          ></div>
          <div className="hero-inner">
            <div className="hero-content">
              <div style={{ marginBottom: '1.5rem' }}>
                <LogoDembeni size="xl" theme="light" withText={true} isLink={false} />
              </div>
              <span className="hero-tag"><i className="fas fa-map-marker-alt"></i> Commune de Dembéni — Mayotte</span>
              <h1>
                {heroData.title}<br />
                <strong>{heroData.subtitle}</strong>
              </h1>
              <p>{heroData.description}</p>
              <div className="hero-actions">
                {hero.buttons && hero.buttons.length > 0 ? (
                  hero.buttons.map((btn, i) => (
                    <Link key={i} to={btn.link} className={i === 0 ? "btn-hero-primary" : "btn-hero-ghost"}>
                      {i === 0 ? <i className="fas fa-rocket"></i> : <i className="fas fa-info-circle"></i>} {btn.text}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link to="/demarches" className="btn-hero-primary">
                      <i className="fas fa-rocket"></i> Lancer une démarche
                    </Link>
                    <Link to="/service-public" className="btn-hero-ghost">
                      <i className="fas fa-info-circle"></i> Nos services
                    </Link>
                  </>
                )}
              </div>
            </div>

            {heroData.stats && heroData.stats.length > 0 && (
              <div className="hero-stats">
                <h3>{hero.servicesHeading}</h3>
                {heroData.stats.map((stat, i) => (
                  <div className="hero-stat-row" key={i}>
                    <div className="stat-icon"><i className={`fas ${stat.icon}`}></i></div>
                    <div className="info">
                      <div className="num">{stat.value}</div>
                      <div className="lbl">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="hero-wave">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 60L1440 60L1440 20C1200 60 800 0 500 30C280 52 100 10 0 30L0 60Z" fill="#F8FAF9"></path>
            </svg>
          </div>
        </section>

        {/* Citizen Welcome Card */}
        {user && user.role === 'citizen' && (
          <section style={{ padding: '0 5%', marginTop: '-30px', position: 'relative', zIndex: 10, marginBottom: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="citizen-welcome-card"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '30px 40px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,255,255,0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '30px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', background: 'var(--vert-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vert-600)',
                  border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflow: 'hidden'
                }}>
                  {user.profilePicture ? (
                    <img src={getImageUrl(user.profilePicture)} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserCircle size={36} />
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--gris-800)' }}>Bonjour, {user.firstname}</h3>
                    <span style={{ background: '#D1FAE5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Connecté</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--gris-500)', fontSize: '0.95rem' }}>Bienvenue sur votre espace citoyen. Accédez rapidement à vos services.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <Link to="/citizen/dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'white' }}>
                  <FileText size={18} /> Mon Tableau de bord
                </Link>
                <Link to="/mes-demandes" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px' }}>
                  Mes Demandes <ChevronRight size={18} />
                </Link>
              </div>
            </motion.div>
          </section>
        )}

        {/* DÉMARCHES EN LIGNE */}
        <section className="section" id="services">
          <div className="section-header center">
            <span className="section-tag"><i className="fas fa-laptop"></i> En ligne</span>
            <h2 className="section-title">Démarches administratives</h2>
            <div className="divider"></div>
            <p className="section-subtitle mt-2">Accédez rapidement à tous les services de la mairie depuis votre domicile.</p>
          </div>

          {heroData.showAlert && heroData.alertText && (
            <div className="info-alert">
              <i className="fas fa-info-circle"></i>
              <p><strong>Information :</strong> {heroData.alertText}</p>
            </div>
          )}

          <div className="services-grid">
            {/* Always display the 6 category cards - never individual DB procedures */}
            {procedures.map((proc, idx) => (
              <motion.div
                key={proc._id}
                className="service-card-new"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="scn-img">
                  <img
                    src={getImageUrl(proc.imageUrl || proc.image)}
                    alt={proc.title}
                    onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(); }}
                  />
                </div>
                <div className="scn-body">
                  <div className="scn-icon"><i className={`fas ${proc.icon || 'fa-briefcase'}`}></i></div>
                  <h3>{proc.title}</h3>
                  <p>{proc.description}</p>

                  {proc.informations && proc.informations.length > 0 && (
                    <div className="scn-stats">
                      {proc.informations.map((info, si) => (
                        <div className="scn-stat" key={si}>
                          <span>{info}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {proc.statistics && proc.statistics.length > 0 && (
                    <div className="scn-stats">
                      {proc.statistics.map((stat, si) => (
                        <div className="scn-stat" key={si}>
                          <strong>{stat.value}</strong>
                          <span>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {proc.actions && proc.actions.length > 0 && (
                    <div className="scn-actions">
                      {proc.actions.map((action, ai) => (
                        <Link to={proc.slug || proc.buttonLink} className="scn-action-btn" key={ai}>
                          <i className={`fas ${action.icon || 'fa-chevron-right'}`}></i>
                          <span>{action.text || action}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link to={proc.buttonLink || proc.slug} className="btn-scn-main">
                    {proc.buttonText || 'Accéder au service'} <i className="fas fa-arrow-circle-right"></i>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* COLLECTE SECTION */}
        <div style={{ background: 'var(--vert-50)', borderTop: '1px solid var(--vert-100)', borderBottom: '1px solid var(--vert-100)', padding: '1rem 0' }}>
          <section className="section" style={{ padding: '3rem 2.5rem' }}>
            <div className="highlight-row">
              <div className="highlight-img">
                <img
                  src={getImageUrl(collecteSchedule?.imageUrl || collecteSchedule?.posterImage)}
                  alt="Collecte des encombrants Dembeni"
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(); }}
                />
              </div>
              <div className="highlight-content">
                <span className="section-tag"><i className="fas fa-recycle"></i> Écologie</span>
                <h2 className="section-title">Collecte d'encombrants</h2>
                <div className="divider"></div>
                <p className="mt-2">{collecteSchedule?.instructions}</p>
                <ul className="checklist">
                  {collecteSchedule?.importantNotes && collecteSchedule.importantNotes.length > 0 && (
                    collecteSchedule.importantNotes.map((note, i) => (
                      <li key={i}><i className="fas fa-check"></i> {note}</li>
                    ))
                  )}
                </ul>
                {collecteSchedule?.buttonText && (
                  <Link to={collecteSchedule.buttonLink || '/collecte'} className="btn btn-primary">{collecteSchedule.buttonText} <i className="fas fa-arrow-right"></i></Link>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* SERVICE PUBLIC SECTION */}
        <section className="section">
          <div className="highlight-row reverse">
            <div className="highlight-img">
              <img
                src={getImageUrl(servicePublicData.image)}
                alt={servicePublicData.imageAlt}
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = getImageUrl(); }}
              />
            </div>
            <div className="highlight-content">
              <span className="section-tag"><i className={`fas ${servicePublicData.tagIcon}`}></i> {servicePublicData.tagText}</span>
              <h2 className="section-title">{servicePublicData.title}</h2>
              <div className="divider"></div>
              <p className="mt-2">{servicePublicData.description}</p>
              <div className="stats-strip mt-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {servicePublicData.stats.map((stat, i) => (
                  <div className="stat-box" key={i}>
                    <div className="stat-num">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
              <Link to={servicePublicData.buttonLink} className="btn btn-primary mt-3">{servicePublicData.buttonText} <i className="fas fa-arrow-right"></i></Link>
            </div>
          </div>
        </section>

        {/* ENFANCE & LOISIRS */}
        <section className="section" id="loisirs" style={{ background: 'var(--gris-100)', borderRadius: 'var(--radius-xl)', maxWidth: '100%', padding: '4rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2.5rem' }}>
            <div className="section-header center">
              <span className="section-tag"><i className={`fas ${loisirsData.tagIcon}`}></i> {loisirsData.tagText}</span>
              <h2 className="section-title">{loisirsData.title}</h2>
              <div className="divider"></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2.5rem' }} className="loisirs-grid">
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--vert-800)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-palette" style={{ color: 'var(--vert-500)' }}></i> {loisirsData.activitiesTitle}
                </h3>
                <div className="activities-grid">
                  {loisirsData.activities.map((act, i) => (
                    <div className="activity-card" key={i}><i className={`fas ${act.icon}`}></i><span>{act.label}</span></div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--vert-800)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fas fa-euro-sign" style={{ color: 'var(--vert-500)' }}></i> {loisirsData.pricingTitle}
                </h3>
                <div className="tarif-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  {loisirsData.tarifs.map((tarif, i) => (
                    <div className={`tarif-card ${tarif.isFeatured ? 'featured' : ''}`} key={i}>
                      <h3>{tarif.label}</h3>
                      <div className="tarif-price">{tarif.price}<span>{tarif.unit}</span></div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--gris-500)', marginTop: '1rem' }}><i className="fas fa-info-circle" style={{ color: 'var(--vert-400)' }}></i> {loisirsData.pricingNote}</p>
                <Link to={loisirsData.buttonLink} className="btn btn-primary mt-3" style={{ width: '100%', justifyContent: 'center' }}>{loisirsData.buttonText} <i className="fas fa-arrow-right"></i></Link>
              </div>
            </div>
          </div>
        </section>

        {/* PASSEPORT & CNI */}
        <section className="section" id="passeport">
          <div className="section-header center">
            <span className="section-tag"><i className={`fas ${passportData.tagIcon}`}></i> {passportData.tagText}</span>
            <h2 className="section-title">{passportData.title}</h2>
            <div className="divider"></div>
          </div>

          <div className="passport-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
            {passportData.steps.map((step, idx) => (
              <div key={idx} style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gris-200)' }}>
                <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--vert-800), var(--vert-600))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', fontSize: '1.5rem' }}>
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <h4 style={{ color: 'var(--vert-900)', marginBottom: '.5rem', fontWeight: '700' }}>{step.title}</h4>
                <p style={{ color: 'var(--gris-600)', fontSize: '0.9rem' }}>{step.description}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to={passportData.buttonLink} className="btn btn-primary btn-lg">{passportData.buttonText} <i className="fas fa-arrow-right"></i></Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="section-header center">
            <span className="section-tag"><i className="fas fa-question-circle"></i> Aide</span>
            <h2 className="section-title">Questions fréquentes</h2>
            <div className="divider"></div>
          </div>

          <div className="faq-grid mt-3">
            {faqs.map((faq) => (
              <div className="faq-card" key={faq._id}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ padding: '0 0 5rem' }}>
          <div className="cta-band">
            <h2>{footerCtaData.title}</h2>
            <p>{footerCtaData.description}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {footerCtaData.buttons.map((btn, i) => (
                <Link key={i} to={btn.link} className={`btn btn-${btn.variant} btn-lg`}>
                  <i className={`fas ${btn.icon}`}></i> {btn.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Accueil;
