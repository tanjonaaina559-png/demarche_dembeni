import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import api from '../../services/api';
import { FileText, Plus, Edit, Trash2, Eye, Upload, Link2, CheckCircle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PdfVisualMapper from '../../components/ui/PdfVisualMapper';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const AdminPdfTemplates = () => {
  const { logout } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);

  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [mapperOpen, setMapperOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    title: '',
    procedureId: '',
    status: 'active',
    templateFile: null,
    mapping: [],
    isDemonstration: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      const [tmplRes, procRes] = await Promise.all([
        api.get('/pdf-templates'),
        api.get('/procedures'),
      ]);
      setTemplates(tmplRes.data || []);
      setProcedures(procRes.data || []);
    } catch (err) {
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = (tmpl = null) => {
    if (tmpl) {
      setEditingTemplate(tmpl);
      setForm({
        title: tmpl.title,
        procedureId: tmpl.procedureId?._id || tmpl.procedureId || '',
        status: tmpl.status || 'active',
        templateFile: null,
        mapping: tmpl.mapping || [],
        isDemonstration: tmpl.isDemonstration || false,
      });
    } else {
      setEditingTemplate(null);
      setForm({ title: '', procedureId: '', status: 'active', templateFile: null, mapping: [], isDemonstration: false });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingTemplate && !form.templateFile) {
      showToast('Le fichier PDF est requis', 'error');
      return;
    }

    const data = new FormData();
    data.append('title', form.title);
    data.append('procedureId', form.procedureId || 'null');
    data.append('status', form.status);
    data.append('mapping', JSON.stringify(form.mapping));
    data.append('isDemonstration', form.isDemonstration);
    if (form.templateFile) data.append('templateFile', form.templateFile);

    setSubmitting(true);
    try {
      if (editingTemplate) {
        await api.put(`/pdf-templates/${editingTemplate._id}`, data);
        showToast('Template mis à jour avec succès');
      } else {
        await api.post('/pdf-templates', data);
        showToast('Template ajouté avec succès');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur d\'enregistrement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/pdf-templates/${confirm.id}`);
      showToast('Template supprimé');
      setConfirm({ open: false, id: null });
      fetchAll();
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <Loader />;

  return (
    <AdminLayout adminName="Admin" onLogout={() => logout()}>
      <Toast isOpen={toast.open} onClose={closeToast} message={toast.message} type={toast.type} />
      <ConfirmDialog
        isOpen={confirm.open}
        title="Supprimer le template"
        message="Cette action est irréversible. Le fichier PDF sera définitivement supprimé."
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: '#164022', fontSize: '1.4rem', fontWeight: 700 }}>
              Templates PDF Officiels
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.875rem' }}>
              Gérez les formulaires PDF officiels par procédure. Les citoyens recevront ces PDFs remplis automatiquement.
            </p>
          </div>
          <button
            onClick={() => openModal()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10B981', color: 'white', padding: '10px 18px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            <Plus size={18} /> Ajouter un template
          </button>
        </div>

        {/* KPIs */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <DashboardCard title="Total Templates" value={templates.length} icon={<FileText size={22} />} color="#3B82F6" />
          <DashboardCard title="Actifs" value={templates.filter(t => t.status === 'active').length} icon={<CheckCircle size={22} />} color="#10B981" />
          <DashboardCard title="Liés à une procédure" value={templates.filter(t => t.procedureId).length} icon={<Link2 size={22} />} color="#8B5CF6" />
        </section>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <EmptyState message="Aucun template PDF trouvé. Cliquez sur « Ajouter un template » pour commencer." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {templates.map((tmpl, idx) => (
              <motion.div
                key={tmpl._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  background: 'white', borderRadius: 12, border: '1px solid #E4E4E7',
                  overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Preview area */}
                <div
                  style={{
                    height: 100, background: tmpl.status === 'active' ? '#F0FDF4' : '#FEF2F2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', flexDirection: 'column', gap: 6,
                  }}
                  onClick={() => setPreviewTemplate(tmpl)}
                >
                  <FileText size={36} color={tmpl.status === 'active' ? '#10B981' : '#EF4444'} />
                  <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{tmpl.fileName || 'template.pdf'}</span>
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: tmpl.status === 'active' ? '#10B981' : '#EF4444',
                    color: 'white', borderRadius: 6, fontSize: 11, fontWeight: 700, padding: '3px 8px',
                  }}>
                    {tmpl.status === 'active' ? 'ACTIF' : 'INACTIF'}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px', flex: 1 }}>
                  <h3 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem', color: '#18181B' }}>{tmpl.title}</h3>
                  {tmpl.procedureId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#8B5CF6', marginBottom: 6 }}>
                      <Link2 size={14} />
                      <span>{tmpl.procedureId.title || 'Procédure liée'}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: '#9CA3AF', marginBottom: 6 }}>Aucune procédure associée</div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{formatSize(tmpl.size)} — {new Date(tmpl.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>

                {/* Actions */}
                <div style={{ padding: '10px 14px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
                  <button onClick={() => setPreviewTemplate(tmpl)} style={btn('#3B82F6', '#EFF6FF')} title="Aperçu"><Eye size={16} /></button>
                  <a href={`${API_BASE}${tmpl.templateFile}`} target="_blank" rel="noopener noreferrer" download style={{ ...btn('#10B981', '#ECFDF5'), textDecoration: 'none' }} title="Télécharger">
                    <FileText size={16} />
                  </a>
                  <button onClick={() => openModal(tmpl)} style={btn('#F59E0B', '#FEF3C7')} title="Modifier"><Edit size={16} /></button>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => setConfirm({ open: true, id: tmpl._id })} style={btn('#EF4444', 'transparent')} title="Supprimer"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => e.target === e.currentTarget && setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 580, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h3 style={{ margin: '0 0 20px', fontSize: '1.3rem', color: '#1F2937', fontWeight: 700 }}>
                {editingTemplate ? '✏️ Modifier le template' : '📄 Nouveau Template PDF Officiel'}
              </h3>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Title */}
                <div>
                  <label style={lbl}>Titre du template *</label>
                  <input
                    required type="text"
                    placeholder="Ex: Formulaire Acte de Naissance"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    style={inp}
                  />
                </div>

                {/* Procedure */}
                <div>
                  <label style={lbl}>Procédure associée</label>
                  <select
                    value={form.procedureId}
                    onChange={e => setForm(f => ({ ...f, procedureId: e.target.value }))}
                    style={inp}
                  >
                    <option value="">— Aucune (template générique) —</option>
                    {procedures.map(p => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
                    Lié à une procédure = ce PDF sera automatiquement généré lors des demandes de ce type.
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label style={lbl}>Statut</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>

                {/* PDF File */}
                <div>
                  <label style={lbl}>Fichier PDF template {editingTemplate ? '(laisser vide pour conserver)' : '*'}</label>
                  <div style={{ border: '2px dashed #D1D5DB', borderRadius: 8, padding: 16, textAlign: 'center', background: '#F9FAFB', cursor: 'pointer' }}>
                    <Upload size={24} color="#9CA3AF" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#6B7280' }}>
                      {form.templateFile ? form.templateFile.name : 'Cliquez ou déposez un fichier PDF ici'}
                    </p>
                    <input
                      type="file" accept="application/pdf"
                      onChange={e => setForm(f => ({ ...f, templateFile: e.target.files[0] || null }))}
                      style={{ display: 'block', width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Demonstration Mode */}
                <div>
                  <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={form.isDemonstration}
                      onChange={e => setForm(f => ({ ...f, isDemonstration: e.target.checked }))}
                    />
                    Mode Démonstration
                  </label>
                  <p style={{ margin: '4px 0 0 24px', fontSize: '0.8rem', color: '#6B7280' }}>
                    Ajoute automatiquement un filigrane "DOCUMENT DE DÉMONSTRATION" sur le PDF généré.
                  </p>
                </div>

                {/* Field Mapping Button */}
                <div>
                  <label style={lbl}>Mappage Visuel des Champs</label>
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: '#6B7280' }}>
                    Placez visuellement les champs dynamiques sur le document PDF.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!editingTemplate && !form.templateFile) {
                        showToast('Veuillez d\'abord ajouter un fichier PDF pour le mapper.', 'error');
                        return;
                      }
                      setMapperOpen(true);
                    }}
                    style={{ ...btn('#fff', '#3B82F6'), width: '100%', padding: '10px', gap: 8 }}
                  >
                    <MapPin size={18} />
                    Ouvrir l'éditeur de mappage ({form.mapping.length} champ{form.mapping.length > 1 ? 's' : ''} mappé{form.mapping.length > 1 ? 's' : ''})
                  </button>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setModalOpen(false)}
                    style={{ flex: 1, padding: '11px', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting}
                    style={{ flex: 2, padding: '11px', background: submitting ? '#9CA3AF' : '#10B981', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {submitting ? 'Enregistrement...' : (editingTemplate ? '✓ Mettre à jour' : '✓ Créer le template')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Mapper Modal */}
      <AnimatePresence>
        {mapperOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: 'white', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 1200, padding: 20 }}
            >
              <PdfVisualMapper 
                file={form.templateFile}
                pdfUrl={editingTemplate ? `${API_BASE}${editingTemplate.templateFile}` : null}
                initialMapping={form.mapping}
                onSave={(newMapping) => {
                  setForm(f => ({ ...f, mapping: newMapping }));
                  setMapperOpen(false);
                }}
                onCancel={() => setMapperOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => e.target === e.currentTarget && setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: 'white', borderRadius: 16, overflow: 'hidden', maxWidth: 900, width: '100%', height: '88vh', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E4E7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{previewTemplate.title}</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href={`${API_BASE}${previewTemplate.templateFile}`} target="_blank" rel="noopener noreferrer" style={{ ...btn('#10B981', '#ECFDF5'), textDecoration: 'none', padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Upload size={14} /> Ouvrir dans onglet
                  </a>
                  <button onClick={() => setPreviewTemplate(null)} style={{ background: '#F4F4F5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>×</button>
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <object
                  data={`${API_BASE}${previewTemplate.templateFile}`}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
                    <FileText size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
                    <p style={{ color: '#6B7280', marginBottom: 12 }}>Aperçu indisponible dans le navigateur.</p>
                    <button onClick={() => window.open(`${API_BASE}${previewTemplate.templateFile}`, '_blank')}
                      style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                      Ouvrir dans un nouvel onglet
                    </button>
                  </div>
                </object>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

const btn = (color, bg) => ({
  background: bg, color, border: 'none', borderRadius: 6, padding: 8,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
});
const lbl = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#374151', fontSize: '0.9rem' };
const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' };

export default AdminPdfTemplates;
