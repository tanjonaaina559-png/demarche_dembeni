import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../layouts/AdminLayout';
// ... (omitting intermediate imports for brevity)
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import getImageUrl from '../../utils/imageUrl';
import {
  FaFileAlt, FaEdit, FaTrash, FaPlus, FaToggleOn, FaToggleOff,
  FaImage, FaTimes, FaCheckCircle,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const EMPTY_FORM = {
  title: '', category: '', description: '',
  processingTime: '', fees: 'Gratuit', active: true,
  requiredDocs: [],
};

const CATEGORIES = [
  'civil', 'documents', 'enfance', 'logement', 'urbanisme', 'ecologie', 'autre',
];

const Procedures = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [procedures, setProcedures]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterCat, setFilterCat]       = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const PER_PAGE = 8;

  /* Modal */
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [selected, setSelected]         = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [newDoc, setNewDoc]             = useState('');
  const [submitting, setSubmitting]     = useState(false);

  /* Image */
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver]         = useState(false);
  const fileInputRef                    = useRef();

  /* Toast */
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') =>
    setToast({ open: true, message, type });
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);

  /* ConfirmDialog */
  const [confirm, setConfirm] = useState({ open: false, id: null });

  /* ── Fetch ── */
  const fetchProcedures = async () => {
    try {
      const res = await api.get('/admin/procedures');
      setProcedures(Array.isArray(res?.data) ? res.data : []);
    } catch {
      showToast('Erreur lors du chargement des démarches', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProcedures(); }, []);

  // Show success toast passed from ProcedureCreate via router state
  useEffect(() => {
    if (location.state?.successMessage) {
      showToast(location.state.successMessage, 'success');
      // Clear the state so it doesn't re-show on refresh
      window.history.replaceState({}, document.title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Image helpers ── */
  const handleImageFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Format non supporté. Utilisez JPG, PNG ou WebP.', 'error');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  /* ── Modal ── */
  const openModal = (proc = null) => {
    setSelected(proc);
    setFormData(proc ? {
      title: proc.title || '',
      category: proc.category || '',
      description: proc.description || '',
      processingTime: proc.processingTime || '',
      fees: proc.fees || 'Gratuit',
      active: proc.active ?? true,
      requiredDocs: Array.isArray(proc.requiredDocs) ? [...proc.requiredDocs] : [],
    } : EMPTY_FORM);
    setImageFile(null);
    setImagePreview(proc?.image ? getImageUrl(proc.image) : '');
    setNewDoc('');
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelected(null); };

  /* ── RequiredDocs ── */
  const addDoc = () => {
    const doc = newDoc.trim();
    if (!doc) return;
    setFormData(f => ({ ...f, requiredDocs: [...f.requiredDocs, doc] }));
    setNewDoc('');
  };
  const removeDoc = (i) =>
    setFormData(f => ({ ...f, requiredDocs: f.requiredDocs.filter((_, idx) => idx !== i) }));

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { showToast('Le titre est obligatoire', 'error'); return; }
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'requiredDocs') payload.append(k, JSON.stringify(v));
        else payload.append(k, v);
      });
      if (imageFile) payload.append('image', imageFile);

      // NOTE: Do NOT pass headers here — the api.js interceptor detects FormData
      // and lets the browser generate 'multipart/form-data; boundary=...' automatically.
      // Manually setting Content-Type destroys the boundary and breaks Multer parsing.
      if (selected) {
        await api.put(`/admin/procedures/${selected._id}`, payload);
        showToast('Démarche mise à jour avec succès');
      } else {
        await api.post('/admin/procedures', payload);
        showToast('Démarche créée avec succès');
      }
      closeModal();
      fetchProcedures();
    } catch {
      showToast("Erreur lors de l'enregistrement", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Toggle active ── */
  const handleToggle = async (proc) => {
    try {
      await api.put(`/admin/procedures/${proc._id}/toggle`);
      showToast(`Démarche ${proc.active ? 'désactivée' : 'activée'}`);
      fetchProcedures();
    } catch {
      showToast('Erreur lors du changement de statut', 'error');
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    const id = confirm.id;
    setConfirm({ open: false, id: null });
    try {
      await api.delete(`/admin/procedures/${id}`);
      showToast('Démarche supprimée');
      fetchProcedures();
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  /* ── Filter + paginate ── */
  const filtered = procedures.filter(p =>
    (p?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p?.category?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterCat || p?.category === filterCat)
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  /* ── Columns ── */
  const columns = [
    {
      Header: 'Titre', accessor: 'title',
      Cell: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {row?.image && (
            <img
              src={getImageUrl(row.image)}
              alt={row.title}
              style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          <strong>{row?.title || ''}</strong>
        </div>
      ),
    },
    { Header: 'Catégorie', accessor: 'category', Cell: row => row?.category || '-' },
    { Header: 'Délai', accessor: 'processingTime', Cell: row => row?.processingTime || '-' },
    { Header: 'Frais', accessor: 'fees', Cell: row => row?.fees || 'Gratuit' },
    {
      Header: 'Statut', accessor: 'active',
      Cell: row => (
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 12,
          background: row?.active ? '#D1FAE5' : '#FEE2E2',
          color: row?.active ? '#059669' : '#DC2626',
        }}>
          {row?.active ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      Header: 'Actions', accessor: 'actions',
      Cell: row => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            title={row?.active ? 'Désactiver' : 'Activer'}
            onClick={() => handleToggle(row)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
          >
            {row?.active
              ? <FaToggleOn color="#10B981" />
              : <FaToggleOff color="#9CA3AF" />}
          </button>
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }}
            onClick={() => navigate(`/admin/procedure/edit/${row._id}`)}>
            <FaEdit />
          </button>
          <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }}
            onClick={() => setConfirm({ open: true, id: row._id })}>
            <FaTrash color="red" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  return (
    <AdminLayout
      adminName="Admin"
      onLogout={() => logout()}
    >
      <Toast
        isOpen={toast.open}
        onClose={closeToast}
        message={toast.message}
        type={toast.type}
      />
      <ConfirmDialog
        isOpen={confirm.open}
        title="Supprimer la démarche"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette démarche ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#164022' }}>Gestion des Démarches</h2>
          <button className="btn btn-primary" onClick={() => navigate('/admin/procedure/create')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaPlus /> Ajouter une démarche
          </button>
        </div>

        {/* KPI cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1.2rem' }}>
          <DashboardCard title="Total Démarches" value={procedures.length}                        icon={<FaFileAlt size={22} />} color="#06B6D4" />
          <DashboardCard title="Actives"          value={procedures.filter(p => p.active).length} icon={<FaCheckCircle size={22} />} color="#10B981" />
          <DashboardCard title="Inactives"        value={procedures.filter(p => !p.active).length} icon={<FaToggleOff size={22} />} color="#F59E0B" />
        </section>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 12, margin: '1.5rem 0 1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Rechercher par titre ou catégorie..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gris-300)', outline: 'none' }}
          />
          <select
            value={filterCat}
            onChange={e => { setFilterCat(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--gris-300)', background: 'white' }}
          >
            <option value="">Toutes catégories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Tableau */}
        <section style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          {paginated.length > 0
            ? <DataTable columns={columns} data={paginated} />
            : <EmptyState message="Aucune démarche trouvée." />}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                style={{
                  padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
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


    </AdminLayout>
  );
};

/* Styles réutilisables */
const labelStyle = { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, color: '#374151' };
const inputStyle  = {
  width: '100%', padding: '9px 12px', borderRadius: 7,
  border: '1px solid #D1D5DB', outline: 'none',
  fontSize: 14, boxSizing: 'border-box',
};

export default Procedures;
