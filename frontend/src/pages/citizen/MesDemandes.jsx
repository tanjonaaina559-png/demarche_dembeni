import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FileText, Calendar, Hash, Clock, CheckCircle, 
  XCircle, Download, FileSearch, MessageSquare, Search, Filter, Eye
} from 'lucide-react';
import './MesDemandes.css';

const MesDemandes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('toutes');

  const downloadPdf = async (demandeId) => {
    try {
      const token = localStorage.getItem('token') ||
        JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${apiBase}/requests/${demandeId}/pdf`;
      // Follow redirect to Cloudinary URL
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'follow'
      });
      if (response.ok || response.redirected) {
        window.open(response.url || url, '_blank');
      } else if (response.status === 403) {
        alert('Le document sera disponible après validation par l\'administration.');
      } else {
        alert('Impossible de télécharger le document.');
      }
    } catch (error) {
      console.error('Erreur téléchargement PDF', error);
      // Fallback: try to open directly
      const token = localStorage.getItem('token') ||
        JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      window.open(`${apiBase}/requests/${demandeId}/pdf`, '_blank');
    }
  };

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        if (user) {
          const res = await api.get('/requests/my-requests');
          // sort by newest
          const sorted = Array.isArray(res.data) ? res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
          setDemandes(sorted);
        }
      } catch (err) {
        console.error('Erreur', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDemandes();
  }, [user]);

  if (loading) return <Loader />;

  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'rejetée': return { icon: <XCircle size={18} />, cls: 'rejetée', label: 'Rejetée', progress: '100%' };
      case 'terminée': return { icon: <CheckCircle size={18} />, cls: 'approuvée', label: 'Terminée', progress: '100%' };
      case 'validée': return { icon: <CheckCircle size={18} />, cls: 'approuvée', label: 'Validée', progress: '75%' };
      case 'complément demandé': return { icon: <Clock size={18} />, cls: 'en-cours', label: 'Complément demandé', progress: '50%' };
      case 'en cours': return { icon: <Clock size={18} />, cls: 'en-cours', label: 'En cours', progress: '50%' };
      case 'reçue': return { icon: <Clock size={18} />, cls: 'en-attente', label: 'Reçue', progress: '25%' };
      case 'en attente': 
      default: return { icon: <Clock size={18} />, cls: 'en-attente', label: 'En attente', progress: '0%' };
    }
  };

  const filteredDemandes = demandes.filter(demande => {
    const ref = demande.referenceNumber || demande._id;
    const matchesSearch = 
      (demande.procedureId?.title || demande.procedureId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (statusFilter === 'toutes') return matchesSearch;
    
    // Normalize status for filtering
    const stat = demande.status?.toLowerCase() || 'en attente';
    return matchesSearch && stat === statusFilter.toLowerCase();
  });

  return (
    <div className="mes-demandes-container">
      <div className="mes-demandes-header">
        <h1>Mes Demandes</h1>
        <p>Suivez l'état d'avancement de vos démarches administratives.</p>
      </div>

      <div className="mes-demandes-controls" style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input 
            type="text" 
            placeholder="Rechercher par référence ou procédure..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none' }}
          />
        </div>
        <div className="filter-box" style={{ flex: '0 1 200px', position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', appearance: 'none', background: '#fff' }}
          >
            <option value="toutes">Toutes les demandes</option>
            <option value="en attente">En attente</option>
            <option value="reçue">Reçue</option>
            <option value="en cours">En cours</option>
            <option value="complément demandé">Complément demandé</option>
            <option value="validée">Validée</option>
            <option value="rejetée">Rejetée</option>
            <option value="terminée">Terminée</option>
          </select>
        </div>
      </div>

      {demandes.length === 0 ? (
        <EmptyState 
          message="Vous n'avez effectué aucune demande pour le moment." 
          action={<Link to="/demarches" className="btn btn-primary">Faire une demande</Link>}
        />
      ) : filteredDemandes.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px' }}>
           <FileSearch size={48} color="#CBD5E1" style={{ marginBottom: '15px' }} />
           <h3>Aucun résultat</h3>
           <p style={{ color: '#6B7280' }}>Aucune demande ne correspond à vos critères de recherche.</p>
         </div>
      ) : (
        <div className="demandes-list">
          {filteredDemandes.map((demande, index) => {
            const statusConfig = getStatusConfig(demande.status);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }}
                key={demande._id} 
                className={`demande-card status-${statusConfig.cls}`}
              >
                <div className="demande-header">
                  <div className="demande-info">
                    <h3>
                      <FileText size={20} className="text-vert-600" />
                      {demande.procedureId?.title || demande.procedureId || 'Démarche administrative'}
                    </h3>
                    <div className="demande-meta">
                      <span className="meta-item"><Hash size={16}/> Réf: {demande.referenceNumber || demande._id.slice(-8).toUpperCase()}</span>
                      <span className="meta-item"><Calendar size={16}/> Soumise le: {new Date(demande.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className={`demande-status ${statusConfig.cls}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </div>
                </div>

                <div className="demande-timeline">
                  <div className="timeline-line"></div>
                  <div className="timeline-progress" style={{ width: statusConfig.progress }}></div>
                  
                  <div className={`timeline-step active completed`}>
                    <div className="step-icon"><FileSearch size={16} /></div>
                    <span className="step-label">Soumise</span>
                  </div>
                  
                  <div className={`timeline-step ${parseInt(statusConfig.progress) >= 25 ? 'active' : ''} ${parseInt(statusConfig.progress) >= 25 ? 'completed' : ''}`}>
                    <div className="step-icon"><CheckCircle size={16} /></div>
                    <span className="step-label">Reçue</span>
                  </div>

                  <div className={`timeline-step ${parseInt(statusConfig.progress) >= 50 ? 'active' : ''} ${parseInt(statusConfig.progress) >= 50 ? 'completed' : ''}`}>
                    <div className="step-icon"><Clock size={16} /></div>
                    <span className="step-label">Traitement</span>
                  </div>

                  <div className={`timeline-step ${parseInt(statusConfig.progress) >= 75 ? 'active' : ''} ${parseInt(statusConfig.progress) >= 75 ? 'completed' : ''}`}>
                    <div className="step-icon"><CheckCircle size={16} /></div>
                    <span className="step-label">Validée</span>
                  </div>
                  
                  <div className={`timeline-step ${statusConfig.progress === '100%' ? 'active' : ''} ${statusConfig.progress === '100%' ? 'completed' : ''}`}>
                    <div className="step-icon">
                      {statusConfig.cls === 'rejetée' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </div>
                    <span className="step-label">{statusConfig.cls === 'rejetée' ? 'Rejetée' : 'Terminée'}</span>
                  </div>
                </div>
                
                <div style={{ padding: '0 20px 20px', fontSize: '0.85rem', color: '#6B7280' }}>
                  Dernière mise à jour : {new Date(demande.updatedAt || demande.createdAt).toLocaleString('fr-FR')}
                </div>

                {demande.adminComment && (
                  <div className="demande-comment" style={{ background: '#F3F4F6', margin: '0 20px 15px', padding: '15px', borderRadius: '8px', display: 'flex', gap: '10px' }}>
                    <MessageSquare size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#4B5563' }} />
                    <div>
                      <strong style={{ display: 'block', color: '#374151', marginBottom: '4px' }}>Réponse de l'administration :</strong>
                      <p style={{ margin: 0, color: '#4B5563', lineHeight: '1.4' }}>{demande.adminComment}</p>
                    </div>
                  </div>
                )}

                <div className="demande-actions" style={{ borderTop: '1px solid #F3F4F6', padding: '15px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate('/citizen/requests')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: '500', cursor: 'pointer' }}>
                    <Eye size={16} /> Voir les détails
                  </button>
                  {['validée', 'terminée'].includes(demande.status?.toLowerCase()) ? (
                    <button onClick={() => downloadPdf(demande._id)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: 'var(--vert-600)', color: '#fff', border: 'none', fontWeight: '500', cursor: 'pointer' }}>
                      <Download size={16} /> Télécharger le document
                    </button>
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> Le document sera disponible après validation.
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MesDemandes;
