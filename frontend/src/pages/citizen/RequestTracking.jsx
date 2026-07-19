import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { handlePdf } from '../../utils/pdfDownload';
import './RequestTracking.css';


// Backend stores French status values — map both for robustness
const STATUS_MAP = {
  'En attente':             { label: 'En attente',              icon: 'fas fa-clock',          color: '#92400e', bg: '#fef3c7' },
  'En cours':               { label: 'En cours',                icon: 'fas fa-sync-alt',       color: '#1e40af', bg: '#dbeafe' },
  'Informations demandées': { label: 'Informations demandées',  icon: 'fas fa-info-circle',    color: '#b45309', bg: '#fef3c7' },
  'Validée':                { label: 'Validée',                 icon: 'fas fa-check-circle',   color: '#065f46', bg: '#d1fae5' },
  'Rejetée':                { label: 'Rejetée',                 icon: 'fas fa-times-circle',   color: '#b91c1c', bg: '#fee2e2' },
  'Terminée':               { label: 'Terminée',                icon: 'fas fa-flag-checkered', color: '#3730a3', bg: '#e0e7ff' }
};

const TIMELINE_STEPS = ['En attente', 'En cours', 'Validée', 'Terminée'];

const RequestTracking = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/requests/my-requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching requests:', e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchRequests();
  }, [user]);

  const handlePdfAction = async (reqId, type, action) => {
    const result = await handlePdf(reqId, type, action);
    if (!result.ok) {
      alert(result.error);
    }
  };


  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status === 'En attente').length,
    inReview: requests.filter(r => r.status === 'En cours').length,
    approved: requests.filter(r => r.status === 'Validée').length,
    rejected: requests.filter(r => r.status === 'Rejetée').length,
  };

  return (
    <div style={{ padding: '0 20px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--vert-800)', margin: '0 0 10px' }}>Suivi de vos demandes</h1>
        <p style={{ color: 'var(--gris-500)', margin: 0 }}>Consultez l'état d'avancement de toutes vos démarches administratives en temps réel.</p>
      </div>

      {/* Stats cards */}
      <div className="tracking-stats">
        {[
          { label: 'Total', value: stats.total, icon: 'fas fa-folder', color: '#4F46E5' },
          { label: 'En attente', value: stats.pending, icon: 'fas fa-clock', color: '#D97706' },
          { label: 'En cours', value: stats.inReview, icon: 'fas fa-sync-alt', color: '#2563EB' },
          { label: 'Approuvées', value: stats.approved, icon: 'fas fa-check-circle', color: '#059669' },
          { label: 'Rejetées', value: stats.rejected, icon: 'fas fa-times-circle', color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="tracking-stat-card" style={{ borderLeftColor: s.color }}>
            <div className="tracking-stat-icon" style={{ color: s.color }}><i className={s.icon}></i></div>
            <div>
              <div className="tracking-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="tracking-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginTop: '2rem' }}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'En attente', label: 'En attente' },
          { key: 'Validée', label: 'Validées' },
          { key: 'Rejetée', label: 'Rejetées' },
        ].map(f => (
          <button key={f.key} className={`tab-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="tracking-new-btn-row">
        <Link to="/demarches" className="btn btn-primary">
          <i className="fas fa-plus"></i> Nouvelle demande
        </Link>
        <button className="btn btn-outline" onClick={fetchRequests}>
          <i className="fas fa-sync-alt"></i> Actualiser
        </button>
      </div>

      {loading ? (
        <div className="tracking-list" style={{ marginTop: '1.5rem' }}>
          {[1,2,3].map(i => (
            <div key={i} className="tracking-card tracking-card--skeleton">
              <div className="sk-shimmer" style={{ height: '22px', width: '40%', marginBottom: '0.5rem' }}></div>
              <div className="sk-shimmer" style={{ height: '14px', width: '60%' }}></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="no-results" style={{ marginTop: '3rem' }}>
          <i className="fas fa-inbox" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: '.4' }}></i><br />
          Aucune demande trouvée.<br />
          <Link to="/demarches" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            <i className="fas fa-plus"></i> Soumettre une demande
          </Link>
        </div>
      ) : (
        <div className="tracking-list" style={{ marginTop: '1.5rem' }}>
          {filtered.map(req => {
            const st = STATUS_MAP[req.status] || STATUS_MAP['En attente'];
            const isSelected = selected?._id === req._id;
            const stepIdx = TIMELINE_STEPS.indexOf(req.status);

            return (
              <div key={req._id} className={`tracking-card ${isSelected ? 'tracking-card--open' : ''}`}>
                <div className="tracking-card__header" onClick={() => setSelected(isSelected ? null : req)}>
                  <div className="tracking-card__left">
                    <span className="tracking-status-badge" style={{ background: st.bg, color: st.color }}>
                      <i className={st.icon}></i> {st.label}
                    </span>
                    <h3 className="tracking-card__title">{req.procedureId?.title || 'Démarche'}</h3>
                    <div className="tracking-card__meta">
                      <span><i className="far fa-calendar"></i> Soumis le {new Date(req.submittedAt || req.createdAt).toLocaleDateString('fr-FR')}</span>
                      {req.procedureId?.category && <span><i className="fas fa-tag"></i> {req.procedureId.category}</span>}
                    </div>
                  </div>
                  <div className="tracking-card__actions">
                    <button className="btn-icon-sm" title="Voir détails" onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : req); }}>
                      <i className={`fas fa-chevron-${isSelected ? 'up' : 'down'}`}></i>
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="tracking-card__body">
                    {/* Timeline */}
                    <div className="tracking-timeline">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const s = STATUS_MAP[step];
                        const done = stepIdx >= idx;
                        const current = stepIdx === idx;
                        return (
                          <div key={step} className={`tl-step ${done ? 'tl-step--done' : ''} ${current ? 'tl-step--current' : ''}`}>
                            <div className="tl-dot"><i className={s.icon}></i></div>
                            {idx < TIMELINE_STEPS.length - 1 && <div className={`tl-line ${done ? 'tl-line--done' : ''}`}></div>}
                            <span className="tl-label">{s.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Admin comment */}
                    {(req.commentaireAdmin || req.adminComment) && (
                      <div className="tracking-comment">
                        <i className="fas fa-comment-alt"></i>
                        <div>
                          <strong>Commentaire de l'administration :</strong>
                          <p>{req.commentaireAdmin || req.adminComment}</p>
                        </div>
                      </div>
                    )}

                    {/* Uploaded documents */}
                    {Array.isArray(req.uploadedFiles) && req.uploadedFiles.length > 0 && (
                      <div className="tracking-docs">
                        <strong><i className="fas fa-paperclip"></i> Documents joints :</strong>
                        <ul>
                          {req.uploadedFiles.map(doc => (
                            <li key={doc._id || doc}>
                              <a href={getImageUrl(`uploads/${doc.filename || doc}`)} target="_blank" rel="noreferrer">
                                <i className="fas fa-file-pdf"></i> {doc.originalName || doc.filename || 'Document'}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="tracking-card__footer-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <div className="btn-group" style={{ display: 'flex', border: '1px solid var(--vert-600)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button className="btn" onClick={() => handlePdfAction(req._id, 'receipt', 'view')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#fff', color: 'var(--vert-600)', border: 'none', cursor: 'pointer', borderRight: '1px solid #E5E7EB' }} title="Voir Récépissé">
                          <i className="fas fa-eye"></i> Récépissé
                        </button>
                        <button className="btn" onClick={() => handlePdfAction(req._id, 'receipt', 'download')} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: '#fff', color: 'var(--vert-600)', border: 'none', cursor: 'pointer' }} title="Télécharger Récépissé">
                          <i className="fas fa-download"></i>
                        </button>
                      </div>

                      {['validée', 'terminée'].includes(req.status?.toLowerCase()) ? (
                        <div className="btn-group" style={{ display: 'flex', border: '1px solid #1D4ED8', borderRadius: '8px', overflow: 'hidden' }}>
                          <button className="btn" onClick={() => handlePdfAction(req._id, 'official', 'view')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#1D4ED8', color: '#fff', border: 'none', cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.2)' }} title="Voir Document Officiel">
                            <i className="fas fa-eye"></i> Officiel
                          </button>
                          <button className="btn" onClick={() => handlePdfAction(req._id, 'official', 'download')} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: '#1D4ED8', color: '#fff', border: 'none', cursor: 'pointer' }} title="Télécharger Document Officiel">
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      ) : (
                        <div style={{ padding: '8px 12px', background: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fas fa-clock"></i> Le document sera disponible après validation par l'administration.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestTracking;
