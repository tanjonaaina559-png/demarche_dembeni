import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Documents.css';
import { Search, FileSearch } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'Tous les formulaires' },
  { key: 'Etat civil', label: 'Etat civil' },
  { key: 'Documents officiels', label: 'Documents officiels' },
  { key: 'Urbanisme', label: 'Urbanisme' },
  { key: 'Enfance et loisirs', label: 'Enfance et loisirs' },
  { key: 'Ecologie', label: 'Ecologie' },
  { key: 'Logement', label: 'Logement' }
];

const CATEGORY_ICONS = {
  'Etat civil': 'fas fa-baby',
  'Documents officiels': 'fas fa-id-card',
  'Enfance et loisirs': 'fas fa-child',
  'Logement': 'fas fa-home',
  'Urbanisme': 'fas fa-hard-hat',
  'Ecologie': 'fas fa-recycle',
};

const Documents = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await api.get('/official-documents/active');
        setForms(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        console.error('Erreur lors du chargement des documents', e);
        setForms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  const getFileUrl = (doc) => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${doc.pdfUrl}`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (doc) => {
    const fileUrl = getFileUrl(doc);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', doc.fileName);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filtered = forms.filter(f => {
    const matchCat = activeCategory === 'all' || f.category === activeCategory;
    const q = debouncedSearchQuery.toLowerCase();
    const matchSearch = (f.title || '').toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q) ||
      (f.category || '').toLowerCase().includes(q) ||
      (f.fileName || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      <section className="page-banner">
        <div className="page-banner-inner">
          <div className="breadcrumb">
            <Link to="/"><i className="fas fa-home"></i> Accueil</Link>
            <i className="fas fa-chevron-right"></i>
            <span>Documents &amp; Formulaires</span>
          </div>
          <h1>Centre de documents administratifs</h1>
          <p>Téléchargez gratuitement tous les formulaires et documents officiels nécessaires à vos démarches en mairie.</p>
        </div>
      </section>

      <div style={{ 
        maxWidth: '650px', 
        width: '100%', 
        margin: '-30px auto 3rem',
        padding: '0 5%',
        position: 'relative', 
        zIndex: 10 
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          borderRadius: '999px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          padding: '6px',
          position: 'relative',
          border: '1px solid var(--vert-100)'
        }}>
          <Search 
            style={{ 
              position: 'absolute', 
              left: '26px', 
              color: 'var(--gris-400)', 
              width: '20px', 
              height: '20px' 
            }} 
          />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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
            padding: '0 28px',
            borderRadius: '999px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
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
          <p><strong>Astuce :</strong> Téléchargez, imprimez et remplissez vos formulaires officiels avant de vous déplacer en mairie. Mairie ouverte du lundi au vendredi, 8h-16h30.</p>
        </div>

        <div className="tabs" style={{ marginTop: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat.key); setSearchQuery(''); }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="docs-grid" style={{ marginTop: '2rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="doc-card doc-card--skeleton">
                <div className="sk-shimmer" style={{ height: '48px', width: '48px', borderRadius: '50%', marginBottom: '1rem' }}></div>
                <div className="sk-shimmer" style={{ height: '20px', width: '80%', marginBottom: '0.5rem' }}></div>
                <div className="sk-shimmer" style={{ height: '14px', width: '100%', marginBottom: '0.3rem' }}></div>
                <div className="sk-shimmer" style={{ height: '14px', width: '70%' }}></div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', color: 'var(--gris-600)', fontSize: '1.05rem', fontWeight: '500' }}>
              {filtered.length} document{filtered.length > 1 ? 's' : ''} officiel{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
            </div>
            <div className="docs-grid">
            {filtered.map(form => (
              <div key={form._id} className="doc-card">
                <div className="doc-card__header">
                  <div className="doc-card__icon">
                    <i className={CATEGORY_ICONS[form.category] || 'fas fa-file-alt'}></i>
                  </div>
                  <span className="doc-card__category">
                    {form.category}
                  </span>
                </div>
                <h3 className="doc-card__title">{form.title}</h3>
                <p className="doc-card__desc">{form.description}</p>
                <div className="doc-card__footer">
                  <span className="doc-card__size">
                    <i className="fas fa-file-pdf"></i> {formatSize(form.size)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    className="btn btn-outline doc-card__btn"
                    onClick={() => setPreviewDoc(form)}
                    style={{ flex: 1, padding: '8px 0', border: '1px solid var(--vert-600)', color: 'var(--vert-600)', background: 'transparent' }}
                  >
                    <i className="fas fa-eye"></i> Aperçu
                  </button>
                  <button
                    className="btn btn-primary doc-card__btn"
                    onClick={() => handleDownload(form)}
                    style={{ flex: 1, padding: '8px 0' }}
                  >
                    <i className="fas fa-download"></i> Télécharger
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid var(--gris-200)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--vert-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <FileSearch size={32} color="var(--vert-500)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--vert-800)', marginBottom: '0.5rem', fontWeight: '600' }}>Aucun document officiel trouvé</h3>
            <p style={{ color: 'var(--gris-500)', fontSize: '0.95rem' }}>Essayez avec un autre mot-clé ou catégorie.</p>
          </div>
        )}
      </section>

      {/* Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', maxWidth: '900px', width: '100%', height: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--gris-900)' }}>{previewDoc.title}</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href={getFileUrl(previewDoc)} target="_blank" rel="noopener noreferrer" download style={{ background: 'var(--vert-50)', color: 'var(--vert-600)', border: 'none', borderRadius: '6px', padding: '8px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                  <i className="fas fa-download"></i> Télécharger
                </a>
                <button onClick={() => setPreviewDoc(null)} style={{ background: '#f4f4f5', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--gris-600)' }}>×</button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <object 
                data={getFileUrl(previewDoc)} 
                type="application/pdf" 
                width="100%" 
                height="100%"
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
                  <p style={{ marginBottom: '1rem', color: 'var(--gris-600)' }}>Impossible d'afficher le PDF.</p>
                  <button 
                    onClick={() => window.open(getFileUrl(previewDoc), '_blank')}
                    style={{ background: 'var(--vert-600)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Ouvrir dans un nouvel onglet
                  </button>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Documents;
