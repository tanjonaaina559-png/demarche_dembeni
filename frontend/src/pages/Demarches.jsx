import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Demarches.css';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import getImageUrl from '../utils/imageUrl';
import { Search, SearchX } from 'lucide-react';

const Demarches = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [demarchesList, setDemarchesList] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedModal, setSelectedModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Sync state when URL parameter changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
    setSearchParams({ category: cat });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchDemarches = async () => {
      try {
        const res = await api.get('/procedures');

console.log("DONNEES API :", res.data);

setDemarchesList(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Erreur lors du chargement des démarches', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDemarches();
  }, []);

  const closeModal = (e) => {
    if (!e || e.target.classList.contains('modal-overlay') || e.target.closest('.close-btn')) {
      setSelectedModal(null);
      document.body.style.overflow = '';
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const openModal = (demarche) => {
    setSelectedModal(demarche);
    document.body.style.overflow = 'hidden';
  };
console.log("demarchesList =", demarchesList);
console.log("activeCategory =", activeCategory);
  const filteredDemarches = (Array.isArray(demarchesList) ? demarchesList : []).filter(d => {
    let matchesCategory = false;
    if (activeCategory === 'all') {
      matchesCategory = true;
    } else if (activeCategory === 'etat-civil' || activeCategory === 'civil') {
      matchesCategory = d.category === 'etat-civil' || d.category === 'civil';
    } else {
      matchesCategory = d.category === activeCategory;
    }
    const q = debouncedSearchQuery.toLowerCase();
    const matchesSearch = (d.title || '').toLowerCase().includes(q) || 
                          (d.description || d.desc || '').toLowerCase().includes(q) ||
                          (d.category || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });
console.log("filteredDemarches =", filteredDemarches);
console.log("Nombre =", filteredDemarches.length);
  const totalPages = Math.ceil(filteredDemarches.length / itemsPerPage);
  const paginatedDemarches = filteredDemarches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const grid = document.getElementById('demarchesGrid');
    if (grid) window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
  };

  return (
    <>
      {loading && (
        <div id="page-skeleton">
          <div className="sk-banner">
            <div className="sk-banner-bread"></div>
            <div className="sk-banner-title"></div>
            <div className="sk-banner-sub"></div>
          </div>
          <div className="sk-body">
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div className="sk-shimmer" style={{ height: '36px', width: '140px', borderRadius: '50px' }}></div>
              <div className="sk-shimmer" style={{ height: '36px', width: '100px', borderRadius: '50px' }}></div>
              <div className="sk-shimmer" style={{ height: '36px', width: '110px', borderRadius: '50px' }}></div>
              <div className="sk-shimmer" style={{ height: '36px', width: '130px', borderRadius: '50px' }}></div>
              <div className="sk-shimmer" style={{ height: '36px', width: '100px', borderRadius: '50px' }}></div>
            </div>
            <div className="sk-cards-grid">
              {[1, 2, 3, 4].map(i => (
                <div className="sk-card" key={i}>
                  <div className="sk-card-body">
                    <div className="sk-card-icon sk-shimmer"></div>
                    <div className="sk-card-title sk-shimmer"></div>
                    <div className="sk-card-text sk-shimmer"></div>
                    <div className="sk-card-text-2 sk-shimmer"></div>
                  </div>
                </div>
              ))}
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
              <span>Démarches Administratives</span>
            </div>
            <h1>Vos démarches en ligne</h1>
            <p>Accédez à tous vos services municipaux de manière simplifiée. Trouvez l'information et initiez vos procédures depuis chez vous, 24h/24.</p>
          </div>
        </section>

        <div style={{ 
          maxWidth: '600px', 
          width: '100%', 
          margin: '-30px auto 3rem',
          padding: '0 1rem', 
          position: 'relative', 
          zIndex: 10 
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '999px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            padding: '4px',
            height: '68px',
            position: 'relative',
            border: '1px solid var(--vert-100)'
          }}>
            <Search 
              style={{ 
                position: 'absolute', 
                left: '24px', 
                color: 'var(--gris-400)', 
                width: '20px', 
                height: '20px' 
              }} 
            />
            <input 
              type="text" 
              placeholder="Rechercher une démarche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                height: '60px',
                fontSize: '15px',
                paddingLeft: '50px',
                color: 'var(--gris-700)',
                fontFamily: 'var(--font-body)',
                borderRadius: '999px',
                width: '100%'
              }}
            />
            <button style={{
              background: 'var(--vert-600)',
              color: 'white',
              border: 'none',
              height: '52px',
              padding: '0 24px',
              borderRadius: '999px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              marginRight: '4px',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.target.style.background = 'var(--vert-700)'}
            onMouseOut={(e) => e.target.style.background = 'var(--vert-600)'}
            >
              Rechercher
            </button>
          </div>
        </div>

        <section className="section pt-0">
          <div className="info-alert" style={{ marginTop: '1rem' }}>
            <i className="fas fa-info-circle"></i>
            <p><strong>Rappel :</strong> Certaines démarches nécessitent une prise de rendez-vous en mairie. Mairie ouverte du lundi au vendredi, de 8h à 16h30. Téléphone : <strong>+262 XXX XXX XXX</strong></p>
          </div>

          <div className="tabs">
            <button className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryChange('all')}>Tous les services</button>
            <button className={`tab-btn ${activeCategory === 'etat-civil' || activeCategory === 'civil' ? 'active' : ''}`} onClick={() => handleCategoryChange('etat-civil')}>État Civil</button>
            <button className={`tab-btn ${activeCategory === 'documents' ? 'active' : ''}`} onClick={() => handleCategoryChange('documents')}>Documents</button>
            <button className={`tab-btn ${activeCategory === 'enfance' ? 'active' : ''}`} onClick={() => handleCategoryChange('enfance')}>Enfance & Loisirs</button>
            <button className={`tab-btn ${activeCategory === 'logement' ? 'active' : ''}`} onClick={() => handleCategoryChange('logement')}>Logement</button>
            <button className={`tab-btn ${activeCategory === 'urbanisme' ? 'active' : ''}`} onClick={() => handleCategoryChange('urbanisme')}>Urbanisme</button>
            <button className={`tab-btn ${activeCategory === 'ecologie' ? 'active' : ''}`} onClick={() => handleCategoryChange('ecologie')}>Écologie</button>
          </div>

          <div className="demarches-grid" id="demarchesGrid">
            {paginatedDemarches.length > 0 ? (
              paginatedDemarches.map(d => (
                <div key={d._id || d.id} className="demarche-card" onClick={() => openModal(d)}>
                  <div className="card-top">
                    <div className="card-icon">
                      {(d.imageUrl || d.image)
                        ? <img src={getImageUrl(d.imageUrl || d.image)} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                        : null
                      }
                      <i className={d.icon || 'fas fa-file-alt'} style={(d.imageUrl || d.image) ? { display: 'none' } : {}}></i>
                    </div>
                    <div className="card-meta">
                      <h3>{d.title}</h3>
                      <span className={`badge ${d.badgeClass || 'badge-vert'}`}>{d.badge || d.fees || d.category}</span>
                    </div>
                  </div>
                  <p className="card-desc">{d.description || d.desc || 'Aucune description disponible.'}</p>
                  <div className="card-footer" style={{ flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="card-info-mini"><i className="far fa-clock"></i> {d.processingTime || d.info || 'Variable'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '14px' }} onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!isAuthenticated) {
                          setShowAuthModal(true);
                        } else {
                          navigate(`/demarches/${d._id || d.id}`);
                        }
                      }}>
                        Faire la demande
                      </button>
                      <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '14px' }} onClick={(e) => { e.stopPropagation(); navigate('/documents'); }}>
                        <i className="fas fa-file-pdf"></i> Formulaires
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid var(--gris-200)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--vert-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <SearchX size={32} color="var(--vert-500)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--vert-800)', marginBottom: '0.5rem', fontWeight: '600' }}>Aucune démarche trouvée</h3>
                <p style={{ color: 'var(--gris-500)', fontSize: '0.95rem' }}>Nous n'avons trouvé aucune démarche correspondant à vos critères. Essayez avec d'autres mots-clés ou parcourez nos catégories.</p>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === 1} 
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <i className="fas fa-chevron-left"></i> Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page} 
                  className={`btn ${currentPage === page ? 'btn-primary' : 'btn-outline'}`} 
                  onClick={() => handlePageChange(page)}
                  style={{ width: '40px', padding: '10px 0' }}
                >
                  {page}
                </button>
              ))}
              <button 
                className="btn btn-outline" 
                disabled={currentPage === totalPages} 
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Suivant <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </section>

        <div className={`modal-overlay ${selectedModal ? 'active' : ''}`} onClick={closeModal}>
          {selectedModal && (
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}><i className="fas fa-times"></i></button>
              <div className="modal-icon">
                {(selectedModal.imageUrl || selectedModal.image)
                  ? <img src={getImageUrl(selectedModal.imageUrl || selectedModal.image)} alt={selectedModal.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => e.target.style.display='none'} />
                  : <i className={selectedModal.icon || 'fas fa-file-alt'}></i>
                }
              </div>
              <h2>{selectedModal.title}</h2>
              <p>{selectedModal.description || selectedModal.desc}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <strong><i className="far fa-clock"></i> Délai :</strong><br/>
                  {selectedModal.processingTime || 'Variable'}
                </div>
                <div>
                  <strong><i className="fas fa-tag"></i> Catégorie :</strong><br/>
                  <span style={{ textTransform: 'capitalize' }}>{selectedModal.category}</span>
                </div>
                {selectedModal.fees && (
                  <div>
                    <strong><i className="fas fa-coins"></i> Tarif :</strong><br/>
                    {selectedModal.fees}
                  </div>
                )}
              </div>

              {selectedModal.requiredDocs && selectedModal.requiredDocs.length > 0 && (
                <div className="modal-steps" style={{ marginBottom: '1.5rem' }}>
                  <h4><i className="fas fa-file-alt" style={{ marginRight: '8px', color: 'var(--vert-500)' }}></i> Documents requis</h4>
                  <ul>
                    {selectedModal.requiredDocs.map((doc, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>
                        <i className="fas fa-check" style={{ color: 'var(--vert-500)', marginRight: '8px' }}></i> {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="modal-actions" style={{ flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
                  if (!isAuthenticated) {
                    closeModal();
                    setShowAuthModal(true);
                  } else {
                    navigate(`/demarches/${selectedModal._id || selectedModal.id}`);
                  }
                }}>
                  <i className="fas fa-paper-plane"></i> Faire la demande en ligne
                </button>
                <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { closeModal(); navigate('/documents'); }}>
                  <i className="fas fa-download"></i> Télécharger un formulaire
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AUTH MODAL */}
        <div className={`modal-overlay ${showAuthModal ? 'active' : ''}`} onClick={() => setShowAuthModal(false)}>
          {showAuthModal && (
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '30px', maxWidth: '400px' }}>
              <button className="close-btn" onClick={() => setShowAuthModal(false)}><i className="fas fa-times"></i></button>
              <div className="modal-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><i className="fas fa-lock"></i></div>
              <h2 style={{ marginBottom: '15px' }}>Connexion requise</h2>
              <p style={{ marginBottom: '25px', color: 'var(--gris-500)', lineHeight: '1.5' }}>
                Veuillez vous connecter ou créer un compte citoyen pour effectuer une démarche.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center' }}>Se connecter</Link>
                <Link to="/inscription" className="btn btn-outline" style={{ justifyContent: 'center' }}>Créer un compte</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Demarches;
