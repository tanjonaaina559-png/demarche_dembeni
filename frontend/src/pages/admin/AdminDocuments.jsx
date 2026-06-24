import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import { Files, Trash2, Download, Eye, Search, FileText, Plus, Edit, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const ITEMS_PER_PAGE = 12;

const CATEGORIES = [
  'Etat civil',
  'Documents officiels',
  'Urbanisme',
  'Enfance et loisirs',
  'Ecologie',
  'Logement'
];

const AdminDocuments = () => {
  const { logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);

  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    active: true,
    pdf: null
  });

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/official-documents');
      setDocuments(res.data);
    } catch {
      showToast('Erreur lors du chargement des documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const getFileUrl = (doc) => {
    return `${API_BASE}${doc.pdfUrl}`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleOpenModal = (doc = null) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        title: doc.title,
        description: doc.description || '',
        category: doc.category,
        active: doc.active,
        pdf: null
      });
    } else {
      setEditingDoc(null);
      setFormData({
        title: '',
        description: '',
        category: CATEGORIES[0],
        active: true,
        pdf: null
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoc && !formData.pdf) {
      showToast('Le fichier PDF est requis pour un nouveau document', 'error');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('active', formData.active);
    if (formData.pdf) {
      data.append('pdf', formData.pdf);
    }

    try {
      if (editingDoc) {
        await api.put(`/official-documents/${editingDoc._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Document mis à jour avec succès');
      } else {
        await api.post('/official-documents', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Document ajouté avec succès');
      }
      setModalOpen(false);
      fetchDocuments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/official-documents/${confirm.id}`);
      showToast('Document supprimé avec succès');
      setConfirm({ open: false, id: null });
      fetchDocuments();
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/official-documents/${id}/toggle`);
      showToast('Statut mis à jour');
      fetchDocuments();
    } catch (err) {
      showToast('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const filtered = documents.filter(doc => {
    const q = searchTerm.toLowerCase();
    const matchSearch = doc.title.toLowerCase().includes(q) || 
                       (doc.description && doc.description.toLowerCase().includes(q)) ||
                       doc.fileName.toLowerCase().includes(q);
    const matchCat = filterCategory === 'all' || doc.category === filterCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <Loader />;

  return (
    <AdminLayout adminName="Admin" onLogout={() => logout()}>
      <Toast isOpen={toast.open} onClose={closeToast} message={toast.message} type={toast.type} />
      <ConfirmDialog
        isOpen={confirm.open}
        title="Supprimer le document"
        message="Cette action est irréversible. Le fichier sera définitivement supprimé. Continuer ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#164022', fontSize: '1.4rem', fontWeight: 700 }}>Documents officiels</h2>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.875rem' }}>
              Gérez les formulaires PDF officiels proposés aux citoyens.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10B981', color: 'white', padding: '10px 16px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={18} /> Ajouter un document
          </button>
        </div>

        {/* KPIs */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
          <DashboardCard title="Total Documents" value={documents.length} icon={<Files size={22} />} color="#3B82F6" />
          <DashboardCard title="Documents Actifs" value={documents.filter(d => d.active).length} icon={<CheckCircle size={22} />} color="#10B981" />
          <DashboardCard title="Documents Inactifs" value={documents.filter(d => !d.active).length} icon={<XCircle size={22} />} color="#EF4444" />
        </section>

        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f4f4f5', borderRadius: 10, padding: '10px 14px', flex: 1, minWidth: 250 }}>
            <Search size={16} style={{ color: '#9ca3af', marginRight: 8 }} />
            <input
              type="text"
              placeholder="Rechercher par titre ou nom de fichier..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#f4f4f5', outline: 'none', minWidth: 200 }}
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Documents Grid */}
        {paginated.length === 0 ? (
          <EmptyState message="Aucun document trouvé." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {paginated.map((doc, idx) => {
              const fileUrl = getFileUrl(doc);
              return (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    border: '1px solid #e4e4e7',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{
                    height: 100,
                    background: doc.active ? '#ECFDF5' : '#FEF2F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }} onClick={() => setPreviewDoc(doc)}>
                    <FileText size={40} color={doc.active ? "#10B981" : "#EF4444"} />
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: doc.active ? '#10B981' : '#EF4444',
                      color: 'white', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      padding: '4px 8px'
                    }}>
                      {doc.active ? 'ACTIF' : 'INACTIF'}
                    </div>
                  </div>

                  <div style={{ padding: '14px', flex: 1 }}>
                    <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: '#18181b' }}>
                      {doc.title}
                    </h3>
                    <p style={{ margin: '4px 0 8px', fontSize: '0.85rem', color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {doc.description || 'Aucune description'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#9CA3AF' }}>
                      <span style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: 4, color: '#4B5563' }}>{doc.category}</span>
                      <span>{formatSize(doc.size)}</span>
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => setPreviewDoc(doc)} style={actionBtn('#3B82F6', '#EFF6FF')} title="Aperçu"><Eye size={16} /></button>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" download style={actionBtn('#10B981', '#ECFDF5')} title="Télécharger"><Download size={16} /></a>
                    <button onClick={() => handleOpenModal(doc)} style={actionBtn('#F59E0B', '#FEF3C7')} title="Modifier"><Edit size={16} /></button>
                    <button onClick={() => handleToggleStatus(doc._id)} style={actionBtn(doc.active ? '#EF4444' : '#10B981', doc.active ? '#FEF2F2' : '#ECFDF5')} title={doc.active ? "Désactiver" : "Activer"}>
                      {doc.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setConfirm({ open: true, id: doc._id })} style={actionBtn('#EF4444', 'transparent')} title="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={paginBtn(false)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} style={paginBtn(p === currentPage)}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={paginBtn(false)}>›</button>
          </div>
        )}

      </motion.div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 500, padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.25rem', color: '#1F2937' }}>
              {editingDoc ? 'Modifier le document' : 'Ajouter un document'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Titre *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Catégorie *</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fichier PDF {editingDoc ? '(Laisser vide pour ne pas modifier)' : '*'}</label>
                <input type="file" accept="application/pdf" onChange={e => setFormData({...formData, pdf: e.target.files[0]})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="active" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
                <label htmlFor="active" style={{ fontWeight: 500, color: '#374151' }}>Document actif (visible pour les citoyens)</label>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#10B981', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', maxWidth: 900, width: '100%', height: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{previewDoc.title}</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href={getFileUrl(previewDoc)} target="_blank" rel="noopener noreferrer" download style={{ ...actionBtn('#10B981', '#ECFDF5'), padding: '6px 12px', textDecoration: 'none' }}><Download size={16} /> Télécharger</a>
                <button onClick={() => setPreviewDoc(null)} style={{ background: '#f4f4f5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>×</button>
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
                  <p style={{ marginBottom: '1rem', color: '#4B5563' }}>Impossible d'afficher le PDF.</p>
                  <button 
                    onClick={() => window.open(getFileUrl(previewDoc), '_blank')}
                    style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Ouvrir dans un nouvel onglet
                  </button>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', outline: 'none', fontSize: '0.95rem' };
const actionBtn = (color, bg) => ({ background: bg, color: color, border: 'none', borderRadius: 6, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const paginBtn = (active) => ({ padding: '6px 13px', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--gris-300)', background: active ? 'var(--vert-500)' : 'white', color: active ? 'white' : 'inherit', fontWeight: active ? 700 : 400 });

export default AdminDocuments;
