import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { getImageUrl } from '../utils/imageUrl';

const DemarcheDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [demarche, setDemarche] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemarche = async () => {
      try {
        const res = await api.get(`/procedures/${id}`);
        setDemarche(res.data);
      } catch (err) {
        console.error('Erreur', err);
        setError('Impossible de charger les détails de la démarche.');
      } finally {
        setLoading(false);
      }
    };
    fetchDemarche();
  }, [id]);

  if (loading) return <Loader />;

  if (!demarche) return (
    <div className="section" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h2>Démarche introuvable</h2>
      <Link to="/demarches" className="btn btn-primary" style={{ marginTop: '20px' }}>Retour aux démarches</Link>
    </div>
  );

  // Compute banner background style dynamically
  const bgImg = demarche.backgroundImage || demarche.imageUrl || demarche.image;
  const bannerBackgroundStyle = bgImg
    ? `linear-gradient(to right, rgba(22, 64, 34, 0.94), rgba(22, 64, 34, 0.75)), url(${getImageUrl(bgImg)})`
    : 'linear-gradient(135deg, var(--vert-700) 0%, var(--vert-900) 100%)';

  const docNames = demarche.documents && demarche.documents.length > 0
    ? demarche.documents.map(d => `${d.name}${d.required ? ' *' : ''}`)
    : (demarche.requiredDocs || []);

  return (
    <div className="page-wrapper" style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      
      {/* 1. DYNAMIC HERO BANNER */}
      <section className="page-banner" style={{
        padding: '70px 0 60px',
        backgroundImage: bannerBackgroundStyle,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        position: 'relative',
        boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.1)'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="breadcrumb" style={{ marginBottom: '25px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}><i className="fas fa-home"></i> Accueil</Link>
            <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}></i>
            <Link to="/demarches" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Démarches</Link>
            <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}></i>
            <span style={{ color: '#A7F3D0', fontWeight: '500' }}>{demarche.title}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '25px' }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <i className={demarche.icon || 'fas fa-file-alt'}></i>
            </div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <span className="badge" style={{
                background: '#A7F3D0',
                color: '#064E3B',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '10px'
              }}>{demarche.category || 'Citoyenneté'}</span>
              <h1 style={{ fontSize: '2.6rem', fontWeight: '800', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>{demarche.title}</h1>
              <p style={{ fontSize: '1.1rem', opacity: 0.95, maxWidth: '850px', lineHeight: '1.6' }}>{demarche.description || demarche.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC PREMIUM STATS STRIP */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--gris-200)', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', padding: '20px 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'space-around' }}>
            {demarche.statistics && demarche.statistics.length > 0 ? (
              demarche.statistics.map((s, idx) => (
                <div key={idx} style={{ textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ fontSize: '1.9rem', fontWeight: 'bold', color: 'var(--vert-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {s.icon && <i className={s.icon} style={{ fontSize: '1.2rem', color: 'var(--vert-400)' }}></i>}
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gris-500)', fontWeight: '600', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))
            ) : (
              <>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ fontSize: '1.9rem', fontWeight: 'bold', color: 'var(--vert-600)' }}>
                    <i className="far fa-clock" style={{ fontSize: '1.2rem', color: 'var(--vert-400)', marginRight: '8px' }}></i>
                    {demarche.duration || demarche.processingTime || 'Variable'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gris-500)', fontWeight: '600', marginTop: '4px' }}>Délai d'instruction</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <div style={{ fontSize: '1.9rem', fontWeight: 'bold', color: 'var(--vert-600)' }}>
                    <i className="fas fa-coins" style={{ fontSize: '1.2rem', color: 'var(--vert-400)', marginRight: '8px' }}></i>
                    {demarche.price || 'Gratuit'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gris-500)', fontWeight: '600', marginTop: '4px' }}>Frais administratifs</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. MULTI-COLUMN CONTENT LAYOUT */}
      <section className="section" style={{ padding: '50px 20px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: GUIDES & DETAILS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Detailed description block */}
              {demarche.detailedDescription && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={infoBoxStyle}>
                  <h3 style={boxTitleStyle}><i className="fas fa-info-circle" style={{ color: 'var(--vert-500)' }}></i> Présentation & Conditions</h3>
                  <p style={{ lineHeight: '1.7', color: 'var(--gris-600)', whiteSpace: 'pre-line', fontSize: '0.95rem', margin: 0 }}>
                    {demarche.detailedDescription}
                  </p>
                </motion.div>
              )}

              {/* Execution Steps */}
              {demarche.steps && demarche.steps.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={infoBoxStyle}>
                  <h3 style={boxTitleStyle}><i className="fas fa-map-signs" style={{ color: 'var(--vert-500)' }}></i> Étapes à suivre</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                    {demarche.steps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '15px' }}>
                        <div style={{
                          background: 'var(--vert-100)',
                          color: 'var(--vert-700)',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          flexShrink: 0
                        }}>{step.stepNumber || idx + 1}</div>
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>{step.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--gris-500)', lineHeight: '1.5' }}>{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Guidelines / Rules (Accepted vs Refused) */}
              {demarche.features && demarche.features.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {demarche.features.map((feat, idx) => {
                    const isOk = feat.type === 'accepted';
                    const isKo = feat.type === 'refused';
                    const listThemeColor = isOk ? '#10B981' : isKo ? '#EF4444' : '#3B82F6';
                    const listBgColor = isOk ? '#ECFDF5' : isKo ? '#FEF2F2' : '#EFF6FF';
                    
                    return (
                      <div key={idx} style={{
                        background: listBgColor,
                        padding: '20px',
                        borderRadius: '12px',
                        border: `1px solid ${isOk ? '#D1FAE5' : isKo ? '#FEE2E2' : '#DBEAFE'}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                      }}>
                        <h4 style={{
                          margin: '0 0 12px',
                          color: listThemeColor,
                          fontSize: '1.05rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <i className={isOk ? 'fas fa-check-circle' : isKo ? 'fas fa-times-circle' : 'fas fa-info-circle'}></i>
                          {feat.title}
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {feat.items && feat.items.map((item, bIdx) => (
                            <li key={bIdx} style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              fontSize: '0.9rem',
                              color: '#374151',
                              lineHeight: '1.5'
                            }}>
                              <i className={isOk ? 'fas fa-check' : isKo ? 'fas fa-times' : 'fas fa-circle'} style={{
                                color: listThemeColor,
                                marginTop: '4px',
                                fontSize: '12px'
                              }}></i>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Models Download Block */}
              {demarche.documents && demarche.documents.some(d => d.fileUrl) && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={infoBoxStyle}>
                  <h3 style={boxTitleStyle}><i className="fas fa-file-download" style={{ color: 'var(--vert-500)' }}></i> Formulaires à télécharger</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {demarche.documents.filter(d => d.fileUrl).map((doc, idx) => {
                      const isExternal = doc.fileUrl.startsWith('http');
                      const fileUrl = isExternal ? doc.fileUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${doc.fileUrl.replace(/\\/g, '/')}`;
                      return (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#F9FAFB',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid var(--gris-200)'
                      }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>{doc.name}</span>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap'
                        }}>
                          <i className="fas fa-download"></i> Télécharger (PDF)
                        </a>
                      </div>
                    )})}
                  </div>
                </motion.div>
              )}

            </div>

            {/* RIGHT COLUMN: CITIZEN FORM */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              style={{
                background: 'white',
                padding: '30px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
                border: '1px solid var(--gris-200)'
              }}
            >
              <h2 style={{
                fontSize: '1.4rem',
                color: '#111827',
                marginTop: 0,
                marginBottom: '8px',
                fontWeight: '800'
              }}>Faire une demande</h2>
              <p style={{ color: 'var(--gris-500)', fontSize: '0.88rem', margin: '0 0 25px' }}>
                Cliquez sur le bouton ci-dessous pour accéder au formulaire de demande en ligne et lancer l'instruction de votre dossier.
              </p>
              
              {!user && (
                <div className="alert alert-warning" style={{
                  padding: '15px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  borderRadius: '8px',
                  marginBottom: '25px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '0.88rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <i className="fas fa-exclamation-triangle"></i> Connexion requise
                  </div>
                  <div>Pour soumettre cette demande en ligne et suivre son avancement, vous devez vous connecter à votre espace citoyen.</div>
                  <Link to="/login" className="btn btn-primary" style={{ padding: '8px 15px', fontSize: '0.85rem', width: 'fit-content', marginTop: '5px' }}>Se connecter</Link>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <Link 
                  to={user ? `/demande/new?procedureId=${demarche._id}` : '/login'} 
                  state={!user ? { from: `/demande/new?procedureId=${demarche._id}` } : undefined}
                  className="btn btn-primary" 
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <i className="fas fa-edit"></i> {demarche.buttonText || 'Faire une demande'}
                </Link>
              </div>

            </motion.div>

          </div>

        </div>
      </section>

    </div>
  );
};

/* Internal Layout Styles */
const infoBoxStyle = {
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
  border: '1px solid var(--gris-200)'
};

const boxTitleStyle = {
  fontSize: '1.15rem',
  color: '#111827',
  marginTop: 0,
  marginBottom: '15px',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '1px solid #F3F4F6',
  paddingBottom: '10px'
};

const formLabelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: '600',
  fontSize: '0.82rem',
  color: '#374151'
};

const formInputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--gris-300)',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none'
};

export default DemarcheDetail;
