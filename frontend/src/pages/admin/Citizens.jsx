import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import { FaUsers, FaEye, FaTrash, FaBan, FaCheckCircle, FaUserEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 10;

const Citizens = () => {
  const { logout } = useAuth();
  const [citizens, setCitizens]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  /* Modal edit/view */
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [editData, setEditData]               = useState({});
  const [history, setHistory]                 = useState([]);
  const [historyLoading, setHistoryLoading]   = useState(false);
  const [submitting, setSubmitting]           = useState(false);

  /* Toast */
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);

  /* Confirm */
  const [confirm, setConfirm] = useState({ open: false, id: null });

  /* ── Fetch ── */
  const fetchCitizens = async () => {
    try {
      const res = await api.get('/admin/citizens');
      setCitizens(Array.isArray(res?.data) ? res.data : []);
    } catch {
      showToast('Erreur lors du chargement des citoyens', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCitizens(); }, []);

  /* ── Open Modal ── */
  const openModal = async (citizen) => {
    setSelectedCitizen(citizen);
    setEditData({
      firstname: citizen.firstname || '',
      lastname:  citizen.lastname  || '',
      email:     citizen.email     || '',
      phone:     citizen.phone     || '',
      address:   citizen.address   || '',
    });
    setHistory([]);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/requests/user/${citizen._id}`);
      setHistory(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  /* ── Update ── */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/citizens/${selectedCitizen._id}`, editData);
      showToast('Citoyen mis à jour avec succès');
      setSelectedCitizen(null);
      fetchCitizens();
    } catch {
      showToast('Erreur de mise à jour', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Toggle suspend/activate ── */
  const handleToggleStatus = async (id, currentStatus) => {
    const isActive = currentStatus === 'active' || currentStatus === 'approved';
    const action   = isActive ? 'suspend' : 'activate';
    try {
      await api.put(`/admin/citizens/${id}/${action}`);
      showToast(isActive ? 'Citoyen suspendu' : 'Citoyen réactivé');
      fetchCitizens();
    } catch { showToast('Erreur', 'error'); }
  };

  /* ── Validate (pending → approved) ── */
  const handleValidate = async (id) => {
    console.log('APPROVE CLICKED', id);
    try {
      await api.put(`/admin/citizens/${id}/validate`);
      showToast('Citoyen approuvé avec succès ✅');
      fetchCitizens();
    } catch { showToast('Erreur lors de la validation', 'error'); }
  };

  /* ── Reject (pending → rejected) ── */
  const handleReject = async (id) => {
    console.log('REJECT CLICKED', id);
    try {
      await api.put(`/admin/citizens/${id}/reject`);
      showToast('Citoyen refusé');
      fetchCitizens();
    } catch { showToast('Erreur lors du refus', 'error'); }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    const id = confirm.id;
    setConfirm({ open: false, id: null });
    try {
      await api.delete(`/admin/citizens/${id}`);
      showToast('Citoyen supprimé');
      fetchCitizens();
    } catch { showToast('Erreur lors de la suppression', 'error'); }
  };

  /* ── Status badge ── */
  const statusBadge = (status) => {
    const map = {
      active:    { bg: '#D1FAE5', color: '#059669' },
      approved:  { bg: '#D1FAE5', color: '#059669' },
      pending:   { bg: '#FEF3C7', color: '#D97706' },
      rejected:  { bg: '#FEE2E2', color: '#DC2626' },
      suspended: { bg: '#FEE2E2', color: '#B45309' },
    };
    const s = map[status] || { bg: '#F3F4F6', color: '#6B7280' };
    return (
      <span style={{ padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 12, background: s.bg, color: s.color }}>
        {status || 'inconnu'}
      </span>
    );
  };

  /* ── Colonnes ── */
  const columns = [
    {
      Header: 'Nom complet', accessor: 'fullname',
      Cell: row => `${row?.firstname || ''} ${row?.lastname || ''}`.trim() || '-',
    },
    { Header: 'Email', accessor: 'email', Cell: row => row?.email || '' },
    { Header: 'Téléphone', accessor: 'phone', Cell: row => row?.phone || '-' },
    { Header: 'Statut', accessor: 'status', Cell: row => statusBadge(row?.status) },
    {
      Header: 'Inscrit le', accessor: 'createdAt',
      Cell: row => row?.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '-',
    },
    {
      Header: 'Actions', accessor: 'actions',
      Cell: row => (
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Voir/Modifier */}
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }}
            title="Voir/Modifier" onClick={() => openModal(row)}>
            <FaEye />
          </button>
          
          {/* Si status est pending: Approuver / Refuser */}
          {row.status === 'pending' && (
            <>
              <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }}
                title="Approuver" onClick={() => handleValidate(row._id)}>
                <FaCheckCircle color="#10B981" />
              </button>
              <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }}
                title="Refuser" onClick={() => handleReject(row._id)}>
                <FaBan color="#EF4444" />
              </button>
            </>
          )}


          {/* Suspendre / Réactiver (pour les statuts autres que pending) */}
          {row.status !== 'pending' && (
            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }}
              title={row.status === 'active' || row.status === 'approved' ? 'Suspendre' : 'Réactiver'}
              onClick={() => handleToggleStatus(row._id, row.status)}>
              {row.status === 'active' || row.status === 'approved'
                ? <FaBan color="#EF4444" />
                : <FaCheckCircle color="#10B981" />}
            </button>
          )}
          
          {/* Supprimer */}
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }}
            title="Supprimer" onClick={() => setConfirm({ open: true, id: row._id })}>
            <FaTrash color="red" />
          </button>
        </div>
      ),
    },
  ];

  /* ── Filtrage + Pagination ── */
  const filtered = citizens.filter(c => {
    const name = `${c?.firstname || ''} ${c?.lastname || ''}`.toLowerCase();
    const matchSearch = !searchTerm ||
      name.includes(searchTerm.toLowerCase()) ||
      (c?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || c?.status === filterStatus;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <Loader />;

  return (
    <AdminLayout
      adminName="Admin"
      onLogout={() => logout()}
    >
      <Toast isOpen={toast.open} onClose={closeToast} message={toast.message} type={toast.type} />
      <ConfirmDialog
        isOpen={confirm.open}
        title="Supprimer le citoyen"
        message="Cette action est irréversible. Supprimer définitivement ce citoyen ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

        {/* KPI */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1.2rem' }}>
          <DashboardCard title="Total Citoyens"     value={citizens.length} icon={<FaUsers size={22} />} color="#4F46E5" />
          <DashboardCard title="Actifs / Approuvés" value={citizens.filter(c => c.status === 'active' || c.status === 'approved').length} icon={<FaCheckCircle size={22} />} color="#10B981" />
          <DashboardCard title="En attente"         value={citizens.filter(c => c.status === 'pending').length} icon={<FaUserEdit size={22} />} color="#F59E0B" />
          <DashboardCard title="Suspendus / Refusés" value={citizens.filter(c => c.status === 'rejected' || c.status === 'suspended').length} icon={<FaBan size={22} />} color="#EF4444" />
        </section>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 12, margin: '1.5rem 0 1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gris-300)', outline: 'none' }}
          />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gris-300)', background: 'white' }}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="rejected">Refusé</option>
          </select>
        </div>

        {/* Tableau */}
        <section style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          {paginated.length > 0
            ? <DataTable columns={columns} data={paginated} />
            : <EmptyState message="Aucun citoyen trouvé." />}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)}
                style={{
                  padding: '6px 13px', borderRadius: 6, cursor: 'pointer',
                  border: '1px solid var(--gris-300)',
                  background: p === currentPage ? 'var(--vert-500)' : 'white',
                  color: p === currentPage ? 'white' : 'inherit',
                  fontWeight: p === currentPage ? 700 : 400,
                }}
              >{p}</button>
            ))}
          </div>
        )}

      </motion.div>

      {/* ── MODAL CITOYEN ── */}
      {selectedCitizen && (
        <div className="modal-overlay active" onClick={() => setSelectedCitizen(null)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()}
            style={{ maxWidth: 800, width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="close-btn" onClick={() => setSelectedCitizen(null)}>×</button>
            <h2 style={{ marginBottom: 20, borderBottom: '2px solid var(--vert-500)', paddingBottom: 10, color: '#164022' }}>
              Détails du citoyen
            </h2>

            {/* Formulaire édition */}
            <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              <div>
                <label style={labelS}>Prénom</label>
                <input type="text" value={editData.firstname} onChange={e => setEditData(d => ({ ...d, firstname: e.target.value }))} style={inputS} />
              </div>
              <div>
                <label style={labelS}>Nom</label>
                <input type="text" value={editData.lastname} onChange={e => setEditData(d => ({ ...d, lastname: e.target.value }))} style={inputS} />
              </div>
              <div>
                <label style={labelS}>Email</label>
                <input type="email" value={editData.email} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))} style={inputS} />
              </div>
              <div>
                <label style={labelS}>Téléphone</label>
                <input type="text" value={editData.phone} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} style={inputS} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelS}>Adresse</label>
                <input type="text" value={editData.address} onChange={e => setEditData(d => ({ ...d, address: e.target.value }))} style={inputS} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Mettre à jour'}
                </button>
              </div>
            </form>

            {/* Historique demandes */}
            <h3 style={{ marginBottom: 12, color: '#164022' }}>Historique des demandes</h3>
            {historyLoading ? (
              <p style={{ color: 'var(--gris-500)' }}>Chargement...</p>
            ) : history.length > 0 ? (
              <div style={{ background: 'var(--gris-50)', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: 8 }}>Démarche</th>
                      <th style={{ padding: 8 }}>Date</th>
                      <th style={{ padding: 8 }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(req => (
                      <tr key={req._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: 8 }}>{req.procedure || '-'}</td>
                        <td style={{ padding: 8 }}>{new Date(req.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td style={{ padding: 8 }}>
                          <span style={{
                            fontSize: 12, padding: '3px 8px', borderRadius: 12, fontWeight: 700,
                            background: req.status === 'approuvée' ? '#D1FAE5' : req.status === 'rejetée' ? '#FEE2E2' : '#FEF3C7',
                            color: req.status === 'approuvée' ? '#059669' : req.status === 'rejetée' ? '#DC2626' : '#D97706',
                          }}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--gris-500)', fontSize: 14 }}>Aucune demande effectuée par ce citoyen.</p>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const labelS = { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, color: '#374151' };
const inputS  = { width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: 14, boxSizing: 'border-box' };

export default Citizens;
