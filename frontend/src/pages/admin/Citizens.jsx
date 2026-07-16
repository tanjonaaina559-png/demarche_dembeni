import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import Loader from '../../components/ui/Loader';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import { FaUsers, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ITEMS_PER_PAGE = 10;

const Citizens = () => {
  const { logout } = useAuth();
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres et pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Notifications / Confirmations
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });

  const showToast = useCallback((message, type = 'success') => setToast({ open: true, message, type }), []);
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);

  // ── Chargement des citoyens ──────────────────────────────────────────────────
  const fetchCitizens = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/citizens');
      setCitizens(Array.isArray(res?.data) ? res.data : []);
    } catch {
      showToast('Erreur lors du chargement des citoyens', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchCitizens(); }, [fetchCitizens]);

  // ── Validation (Approuver) — Optimistic UI ───────────────────────────────────
  const handleValidate = async (id) => {
    // Mise à jour immédiate du statut dans l'UI
    setCitizens(prev => prev.map(c => c._id === id ? { ...c, status: 'approved' } : c));
    try {
      await api.put(`/admin/citizens/${id}/validate`);
      showToast('Citoyen approuvé avec succès ✅', 'success');
    } catch (err) {
      // Annulation de la mise à jour en cas d'erreur réseau
      setCitizens(prev => prev.map(c => c._id === id ? { ...c, status: 'pending' } : c));
      showToast('Erreur lors de la validation', 'error');
    }
  };

  // ── Refus — Optimistic UI ────────────────────────────────────────────────────
  const handleReject = async (id) => {
    setCitizens(prev => prev.map(c => c._id === id ? { ...c, status: 'rejected' } : c));
    try {
      await api.put(`/admin/citizens/${id}/reject`);
      showToast('Citoyen refusé', 'success');
    } catch {
      setCitizens(prev => prev.map(c => c._id === id ? { ...c, status: 'pending' } : c));
      showToast('Erreur lors du refus', 'error');
    }
  };

  // ── Suppression — Optimistic UI ──────────────────────────────────────────────
  const executeDelete = async () => {
    const { id } = confirm;
    // Snapshot de la liste avant suppression pour pouvoir annuler
    const snapshot = [...citizens];
    // Ferme le modal et met à jour l'UI immédiatement
    setConfirm({ open: false, id: null, name: '' });
    setCitizens(prev => prev.filter(c => c._id !== id));

    try {
      await api.delete(`/admin/citizens/${id}`);
      showToast('Citoyen supprimé définitivement', 'success');
    } catch {
      // Restaure la liste en cas d'erreur réseau
      setCitizens(snapshot);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const requestDelete = (id, name) => setConfirm({ open: true, id, name });

  // ── Filtrage et Pagination ───────────────────────────────────────────────────
  const filteredCitizens = citizens.filter(c => {
    const searchStr = `${c.firstname || ''} ${c.lastname || ''} ${c.email || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCitizens.length / ITEMS_PER_PAGE));
  const currentCitizens = filteredCitizens.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Réinitialise la page quand les filtres changent
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

  // ── Badge de statut ──────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const styles = {
      approved: { bg: '#D1FAE5', color: '#059669', label: '✓ Validé' },
      active:   { bg: '#D1FAE5', color: '#059669', label: '✓ Validé' },
      pending:  { bg: '#FEF3C7', color: '#D97706', label: '⏳ En attente' },
      rejected: { bg: '#FEE2E2', color: '#DC2626', label: '✗ Refusé' },
    };
    const s = styles[status] || { bg: '#F3F4F6', color: '#4B5563', label: status };
    return (
      <span style={{
        padding: '5px 12px', background: s.bg, color: s.color,
        borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700',
        display: 'inline-block', whiteSpace: 'nowrap'
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <AdminLayout>
      <Toast isOpen={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />

      <ConfirmDialog
        isOpen={confirm.open}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer ${confirm.name} ? Cette action est irréversible.`}
        onConfirm={executeDelete}
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>

        {/* ── En-tête ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: '0 0 6px 0', fontWeight: '700' }}>
              Gestion des Citoyens
            </h1>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '0.95rem' }}>
              Administrez les comptes et validez les nouvelles inscriptions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <DashboardCard title="Total" value={citizens.length} icon={<FaUsers />} color="#3B82F6" />
            <DashboardCard title="En attente" value={citizens.filter(c => c.status === 'pending').length} icon={<FaUsers />} color="#F59E0B" />
          </div>
        </div>

        {/* ── Conteneur principal ── */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #F3F4F6' }}>

          {/* Barre de recherche et filtres */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: '#F9FAFB' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '380px' }}>
              <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '0.85rem' }} />
              <input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaFilter style={{ color: '#9CA3AF', fontSize: '0.85rem' }} />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Validés</option>
                <option value="rejected">Refusés</option>
              </select>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9CA3AF', fontSize: '0.85rem' }}>
              {filteredCitizens.length} résultat(s)
            </span>
          </div>

          {/* Tableau — NOTE: Pas de Framer Motion à l'intérieur de tbody/tr
              Les motion.tr dans AnimatePresence causent des erreurs insertBefore
              car Framer insère des wrappers DOM qui cassent la structure table valide */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}><Loader /></div>
            ) : currentCitizens.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
                <FaUsers size={40} style={{ opacity: 0.15, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 8px', color: '#374151' }}>Aucun citoyen trouvé</h3>
                <p style={{ margin: 0 }}>Modifiez vos critères de recherche ou de filtre.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '12px 24px', fontWeight: '600', fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Citoyen</th>
                    <th style={{ padding: '12px 24px', fontWeight: '600', fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Contact</th>
                    <th style={{ padding: '12px 24px', fontWeight: '600', fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Inscription</th>
                    <th style={{ padding: '12px 24px', fontWeight: '600', fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Statut</th>
                    <th style={{ padding: '12px 24px', fontWeight: '600', fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCitizens.map((citizen) => (
                    <tr
                      key={citizen._id}
                      style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '700', fontSize: '0.95rem'
                          }}>
                            {(citizen.firstname?.[0] || '').toUpperCase()}{(citizen.lastname?.[0] || '').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.92rem' }}>
                              {citizen.firstname} {citizen.lastname}
                            </div>
                            <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                              CIN: {citizen.CIN || 'Non renseigné'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#4B5563', fontSize: '0.88rem' }}>
                        <div>{citizen.email}</div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>{citizen.phone || '—'}</div>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#6B7280', fontSize: '0.88rem' }}>
                        {citizen.createdAt
                          ? new Date(citizen.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {getStatusBadge(citizen.status)}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {citizen.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleValidate(citizen._id)}
                                title="Approuver ce citoyen"
                                style={{ padding: '7px 10px', background: '#D1FAE5', color: '#059669', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.15s' }}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, { background: '#10B981', color: '#fff' })}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, { background: '#D1FAE5', color: '#059669' })}
                              >
                                <FaCheckCircle size={14} /> Approuver
                              </button>
                              <button
                                onClick={() => handleReject(citizen._id)}
                                title="Refuser ce citoyen"
                                style={{ padding: '7px 10px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.15s' }}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, { background: '#EF4444', color: '#fff' })}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, { background: '#FEE2E2', color: '#DC2626' })}
                              >
                                <FaTimesCircle size={14} /> Refuser
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => requestDelete(citizen._id, `${citizen.firstname} ${citizen.lastname}`)}
                            title="Supprimer ce citoyen"
                            style={{ padding: '7px 10px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.15s' }}
                            onMouseEnter={e => Object.assign(e.currentTarget.style, { background: '#FEE2E2', color: '#DC2626' })}
                            onMouseLeave={e => Object.assign(e.currentTarget.style, { background: '#F3F4F6', color: '#6B7280' })}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredCitizens.length > ITEMS_PER_PAGE && (
            <div style={{ padding: '14px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB' }}>
              <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong>–<strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredCitizens.length)}</strong> sur <strong>{filteredCitizens.length}</strong>
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '7px 14px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#374151' }}
                >
                  <FaChevronLeft size={11} /> Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '7px 14px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#374151' }}
                >
                  Suivant <FaChevronRight size={11} />
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
