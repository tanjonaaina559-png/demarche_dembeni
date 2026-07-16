import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import Loader from '../../components/ui/Loader';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import { FaUsers, FaEye, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 10;

const Citizens = () => {
  const { logout } = useAuth();
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres et pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal / Confirmations
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [confirm, setConfirm] = useState({ open: false, action: null, id: null, title: '', message: '' });

  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);

  // Fetch
  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/citizens');
      setCitizens(Array.isArray(res?.data) ? res.data : []);
    } catch {
      showToast('Erreur lors du chargement des citoyens', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  // Actions d'approbation / refus immédiates (Optimistic UI)
  const handleValidate = async (id) => {
    setCitizens(prev => prev.map(c => c._id === id ? { ...c, status: 'approved' } : c));
    try {
      await api.put(`/admin/citizens/${id}/validate`);
      showToast('Citoyen approuvé avec succès', 'success');
    } catch {
      setCitizens(prev => prev.map(c => c._id === id ? { ...c, status: 'pending' } : c));
      showToast('Erreur lors de la validation', 'error');
    }
  };

  const handleReject = async (id) => {
    setCitizens(prev => prev.map(c => c._id === id ? { ...c, status: 'rejected' } : c));
    try {
      await api.put(`/admin/citizens/${id}/reject`);
      showToast('Citoyen refusé avec succès', 'success');
    } catch {
      setCitizens(prev => prev.map(c => c._id === id ? { ...c, status: 'pending' } : c));
      showToast('Erreur lors du refus', 'error');
    }
  };

  const executeDelete = async () => {
    const id = confirm.id;
    setConfirm({ open: false, action: null, id: null, title: '', message: '' });
    
    // Optimistic UI pour la suppression
    const previousCitizens = [...citizens];
    setCitizens(prev => prev.filter(c => c._id !== id));
    
    try {
      await api.delete(`/admin/citizens/${id}`);
      showToast('Citoyen supprimé définitivement', 'success');
    } catch {
      setCitizens(previousCitizens); // Restauration en cas d'erreur
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const requestDelete = (id, name) => {
    setConfirm({
      open: true,
      action: 'delete',
      id,
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer définitivement le citoyen ${name} ? Cette action est irréversible.`
    });
  };

  // Filtrage et Pagination
  const filteredCitizens = citizens.filter(c => {
    const matchesSearch = (c.firstname + ' ' + c.lastname + ' ' + c.email).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCitizens.length / ITEMS_PER_PAGE);
  const currentCitizens = filteredCitizens.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Remise à zéro de la page si les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Design des Badges de Statut
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
      case 'active':
        return <span style={{ padding: '6px 12px', background: '#D1FAE5', color: '#059669', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaCheckCircle/> Validé</span>;
      case 'pending':
        return <span style={{ padding: '6px 12px', background: '#FEF3C7', color: '#D97706', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706', animation: 'pulse 2s infinite' }}></div> En attente</span>;
      case 'rejected':
        return <span style={{ padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaTimesCircle/> Refusé</span>;
      default:
        return <span style={{ padding: '6px 12px', background: '#F3F4F6', color: '#4B5563', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <Toast isOpen={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />
      
      <ConfirmDialog
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.action === 'delete' ? executeDelete : () => {}}
        onCancel={() => setConfirm({ ...confirm, open: false })}
        confirmText="Confirmer"
        cancelText="Annuler"
        type="danger"
      />

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: '0 0 8px 0', fontWeight: '700' }}>Gestion des Citoyens</h1>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '0.95rem' }}>Administrez les comptes citoyens et validez les nouvelles inscriptions.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DashboardCard title="Total" value={citizens.length} icon={<FaUsers />} color="#3B82F6" />
            <DashboardCard title="En attente" value={citizens.filter(c => c.status === 'pending').length} icon={<FaUsers />} color="#F59E0B" />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden' }}>
          
          {/* Barre d'outils : Recherche et Filtres */}
          <div style={{ padding: '20px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: '#F9FAFB' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
              <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input 
                type="text" 
                placeholder="Rechercher par nom, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaFilter style={{ color: '#6B7280' }} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '12px 36px 12px 16px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.95rem', outline: 'none', background: '#fff', cursor: 'pointer', appearance: 'none' }}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Validés</option>
                <option value="rejected">Refusés</option>
              </select>
            </div>
          </div>

          {/* Tableau */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}><Loader /></div>
            ) : currentCitizens.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
                <FaUsers size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h3>Aucun citoyen trouvé</h3>
                <p>Modifiez vos critères de recherche ou de filtre.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F3F4F6', color: '#4B5563', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Citoyen</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Contact</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Inscription</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600' }}>Statut</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {currentCitizens.map((citizen) => (
                      <motion.tr 
                        key={citizen._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ borderBottom: '1px solid #F3F4F6', background: '#fff', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                      >
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                              {(citizen.firstname?.[0] || '') + (citizen.lastname?.[0] || '')}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.95rem' }}>{citizen.firstname} {citizen.lastname}</div>
                              <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>CIN: {citizen.CIN || 'Non renseigné'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px', color: '#4B5563', fontSize: '0.9rem' }}>
                          <div>{citizen.email}</div>
                          <div>{citizen.phone}</div>
                        </td>
                        <td style={{ padding: '20px 24px', color: '#4B5563', fontSize: '0.9rem' }}>
                          {new Date(citizen.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          {getStatusBadge(citizen.status)}
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {citizen.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleValidate(citizen._id)}
                                  title="Approuver"
                                  style={{ padding: '8px', background: '#D1FAE5', color: '#059669', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                  onMouseEnter={e => Object.assign(e.currentTarget.style, { background: '#10B981', color: '#fff' })}
                                  onMouseLeave={e => Object.assign(e.currentTarget.style, { background: '#D1FAE5', color: '#059669' })}
                                >
                                  <FaCheckCircle size={16} />
                                </button>
                                <button 
                                  onClick={() => handleReject(citizen._id)}
                                  title="Refuser"
                                  style={{ padding: '8px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                  onMouseEnter={e => Object.assign(e.currentTarget.style, { background: '#EF4444', color: '#fff' })}
                                  onMouseLeave={e => Object.assign(e.currentTarget.style, { background: '#FEE2E2', color: '#DC2626' })}
                                >
                                  <FaTimesCircle size={16} />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => requestDelete(citizen._id, `${citizen.firstname} ${citizen.lastname}`)}
                              title="Supprimer"
                              style={{ padding: '8px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseEnter={e => Object.assign(e.currentTarget.style, { background: '#E5E7EB', color: '#4B5563' })}
                              onMouseLeave={e => Object.assign(e.currentTarget.style, { background: '#F3F4F6', color: '#6B7280' })}
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredCitizens.length > 0 && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB' }}>
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                Affichage de <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> à <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredCitizens.length)}</strong> sur <strong>{filteredCitizens.length}</strong> citoyens
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '8px 16px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '0.9rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if(currentPage !== 1) e.currentTarget.style.background = '#F3F4F6' }}
                  onMouseLeave={e => { if(currentPage !== 1) e.currentTarget.style.background = '#fff' }}
                >
                  <FaChevronLeft size={12} /> Précédent
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '8px 16px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '0.9rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if(currentPage !== totalPages) e.currentTarget.style.background = '#F3F4F6' }}
                  onMouseLeave={e => { if(currentPage !== totalPages) e.currentTarget.style.background = '#fff' }}
                >
                  Suivant <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Citizens;
