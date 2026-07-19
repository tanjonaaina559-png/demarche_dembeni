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
import { handlePdf } from '../../utils/pdfDownload';
import { Inbox, Eye, Trash2, Check, X, Search, Filter, Download, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import PdfViewer from '../../components/ui/PdfViewer';
import DocumentCard from '../../components/ui/DocumentCard';

const ITEMS_PER_PAGE = 10;
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Requests = () => {
  const { logout } = useAuth();
  const [requests, setRequests]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [commentaire, setCommentaire]     = useState('');
  const [status, setStatus]               = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [currentPage, setCurrentPage]     = useState(1);

  /* Toast */
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);

  /* ConfirmDialog */
  const [confirm, setConfirm] = useState({ open: false, id: null });

  /* ── Fetch ── */
  const fetchRequests = async () => {
    try {
      const res = await api.get(`/admin/requests?t=${Date.now()}`);
      setRequests(Array.isArray(res?.data) ? res.data : []);
    } catch {
      showToast('Erreur lors du chargement des demandes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  /* ── Helpers ── */
  const getCitizenName = (citizen) => {
    if (!citizen) return 'Inconnu';
    const full = `${citizen.firstname || ''} ${citizen.lastname || ''}`.trim();
    return full || citizen.email || 'Inconnu';
  };

  const handlePdfAction = async (id, type = 'receipt', action = 'view') => {
    console.log(`[PDF] ${action.toUpperCase()}`, id, 'type:', type);
    const result = await handlePdf(id, type, action);
    if (!result.ok) {
      showToast(result.error, 'error');
    }
  };

  const statusBadge = (s) => {
    const map = {
      'Validée':                { bg: '#D1FAE5', color: '#059669' },
      'Terminée':               { bg: '#DCFCE7', color: '#16A34A' },
      'Rejetée':                { bg: '#FEE2E2', color: '#DC2626' },
      'En attente':             { bg: '#FEF3C7', color: '#D97706' },
      'Reçue':                  { bg: '#FEF3C7', color: '#D97706' },
      'En cours':               { bg: '#DBEAFE', color: '#2563EB' },
      'Complément demandé':     { bg: '#F3E8FF', color: '#7C3AED' },
    };
    const style = map[s] || { bg: '#F3F4F6', color: '#6B7280' };
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 20, fontSize: 12,
        fontWeight: 700, background: style.bg, color: style.color,
      }}>
        {s || 'En attente'}
      </span>
    );
  };

  /* ── Mise à jour statut ── */
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log('[UPDATE STATUS]', selectedRequest._id, status);
    const url = `/requests/${selectedRequest._id}/status`;
    console.log('[API REQUEST]', url);
    try {
      const res = await api.put(url, {
        status,
        adminComment: commentaire,
      });
      console.log('[API RESPONSE]', res);
      
      setRequests(prev => prev.map(req => 
        req._id === selectedRequest._id 
          ? { ...req, status: status, adminComment: commentaire } 
          : req
      ));
      
      showToast('Statut mis à jour avec succès');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Boutons rapides ── */
  const handleQuickApprove = async (id) => {
    if (submitting) return;
    setSubmitting(true);
    console.log('[VALIDATE]', id);
    const url = `/requests/${id}/status`;
    console.log('[API REQUEST]', url);
    try {
      const res = await api.put(url, { status: 'Validée' });
      console.log('[API RESPONSE]', res);
      
      setRequests(prev => prev.map(req => 
        req._id === id ? { ...req, status: 'Validée' } : req
      ));
      
      showToast('Demande validée');
      fetchRequests();
    } catch(err) { console.error(err); showToast('Erreur', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleQuickReject = async (id) => {
    if (submitting) return;
    setSubmitting(true);
    console.log('[REJECT]', id);
    const url = `/requests/${id}/status`;
    console.log('[API REQUEST]', url);
    try {
      const res = await api.put(url, { status: 'Rejetée' });
      console.log('[API RESPONSE]', res);
      
      setRequests(prev => prev.map(req => 
        req._id === id ? { ...req, status: 'Rejetée' } : req
      ));
      
      showToast('Demande rejetée');
      fetchRequests();
    } catch(err) { console.error(err); showToast('Erreur', 'error'); }
    finally { setSubmitting(false); }
  };

  /* ── Suppression ── */
  const handleDelete = async () => {
    const id = confirm.id;
    setConfirm({ open: false, id: null });
    console.log('[DELETE]', id);
    const url = `/admin/requests/${id}`;
    console.log('[API REQUEST]', url);
    try {
      const res = await api.delete(url);
      console.log('[API RESPONSE]', res);
      showToast('Demande supprimée');
      fetchRequests();
    } catch(err) { console.error(err); showToast('Erreur lors de la suppression', 'error'); }
  };

  /* ── Colonnes ── */
  const columns = [
    {
      Header: 'Réf.', accessor: '_id',
      Cell: row => <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>#{row.referenceNumber || row._id?.slice(-6).toUpperCase()}</span>,
    },
    {
      Header: 'Citoyen', accessor: 'citizenId',
      Cell: row => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>{getCitizenName(row?.citizenId)}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{row?.citizenId?.email || ''}</div>
        </div>
      ),
    },
    {
      Header: 'Démarche', accessor: 'procedureId',
      Cell: row => <span style={{ fontSize: '0.875rem' }}>{row?.procedureId?.title || '-'}</span>,
    },
    { Header: 'Statut', accessor: 'status', Cell: row => statusBadge(row?.status) },
    {
      Header: 'Date', accessor: 'createdAt',
      Cell: row => <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{row?.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '-'}</span>,
    },
    {
      Header: 'Actions', accessor: 'actions',
      Cell: row => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            title="Voir / gérer"
            disabled={submitting}
            style={{ background: '#eff6ff', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: submitting ? 'not-allowed' : 'pointer', color: '#3b82f6', opacity: submitting ? 0.5 : 1 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log('[VIEW]', row._id); setSelectedRequest(row); setStatus(row.status || 'En attente'); setCommentaire(row.adminComment || ''); }}
          >
            <Eye size={16} />
          </button>
          {row.status !== 'Validée' && (
            <button
              title="Valider"
              disabled={submitting}
              style={{ background: '#ecfdf5', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: submitting ? 'not-allowed' : 'pointer', color: '#10B981', opacity: submitting ? 0.5 : 1 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickApprove(row._id); }}
            >
              <Check size={16} />
            </button>
          )}
          {row.status !== 'Rejetée' && (
            <button
              title="Rejeter"
              disabled={submitting}
              style={{ background: '#fff1f2', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: submitting ? 'not-allowed' : 'pointer', color: '#ef4444', opacity: submitting ? 0.5 : 1 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickReject(row._id); }}
            >
              <X size={16} />
            </button>
          )}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              title="Voir Récépissé PDF"
              disabled={submitting}
              style={{ background: '#f0fdf4', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: submitting ? 'not-allowed' : 'pointer', color: '#16a34a', opacity: submitting ? 0.5 : 1 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePdfAction(row._id, 'receipt', 'view'); }}
            >
              <Eye size={16} />
            </button>
            <button
              title="Télécharger Récépissé PDF"
              disabled={submitting}
              style={{ background: '#f0fdf4', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: submitting ? 'not-allowed' : 'pointer', color: '#16a34a', opacity: submitting ? 0.5 : 1 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePdfAction(row._id, 'receipt', 'download'); }}
            >
              <Download size={16} />
            </button>
          </div>
          {row.status === 'Validée' && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                title="Voir Document Officiel"
                disabled={submitting}
                style={{ background: '#eff6ff', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: submitting ? 'not-allowed' : 'pointer', color: '#1E40AF', opacity: submitting ? 0.5 : 1 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePdfAction(row._id, 'official', 'view'); }}
              >
                <Eye size={16} />
              </button>
              <button
                title="Télécharger Document Officiel"
                disabled={submitting}
                style={{ background: '#eff6ff', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: submitting ? 'not-allowed' : 'pointer', color: '#1E40AF', opacity: submitting ? 0.5 : 1 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePdfAction(row._id, 'official', 'download'); }}
              >
                <Download size={16} />
              </button>
            </div>
          )}
          <button
            title="Supprimer"
            disabled={submitting}
            style={{ background: '#fef2f2', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: submitting ? 'not-allowed' : 'pointer', color: '#dc2626', opacity: submitting ? 0.5 : 1 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm({ open: true, id: row._id }); }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  /* ── Filtrage + Pagination ── */
  const filtered = requests.filter(r => {
    const name = getCitizenName(r?.citizenId);
    const matchSearch = !searchTerm ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r?.procedureId?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || r?.status === filterStatus;
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
        title="Supprimer la demande"
        message="Cette action est irréversible. Supprimer définitivement cette demande ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

        {/* KPI */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '20px', marginBottom: '28px' }}>
          <DashboardCard title="Total Demandes" value={requests.length}                                         icon={<Inbox size={24} />}       color="#3B82F6" />
          <DashboardCard title="En attente"     value={requests.filter(r => r.status === 'En attente').length}  icon={<Clock size={24} />}       color="#F59E0B" />
          <DashboardCard title="Validées"       value={requests.filter(r => r.status === 'Validée').length}    icon={<CheckCircle size={24} />} color="#10B981" />
          <DashboardCard title="Rejetées"       value={requests.filter(r => r.status === 'Rejetée').length}    icon={<XCircle size={24} />}     color="#EF4444" />
        </section>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 12, marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', background: '#f4f4f5', borderRadius: 10, padding: '10px 14px', border: '1.5px solid transparent', gap: 8 }}>
            <Search size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Rechercher par citoyen ou démarche..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 10, padding: '10px 14px', border: '1.5px solid #e4e4e7', gap: 8 }}>
            <Filter size={16} style={{ color: '#9ca3af' }} />
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <option value="">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Reçue">Reçue</option>
              <option value="En cours">En cours</option>
              <option value="Complément demandé">Complément demandé</option>
              <option value="Validée">Validée</option>
              <option value="Rejetée">Rejetée</option>
              <option value="Terminée">Terminée</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <section style={{ background: 'white', borderRadius: 16, border: '1px solid #e4e4e7', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f4f4f5', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#18181b', fontSize: '0.95rem' }}>{filtered.length} demande{filtered.length > 1 ? 's' : ''}</span>
          </div>
          {paginated.length > 0
            ? <DataTable columns={columns} data={paginated} />
            : <EmptyState message="Aucune demande trouvée." />}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={paginBtn(false)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} style={paginBtn(p === currentPage)}>{p}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={paginBtn(false)}>›</button>
          </div>
        )}   

      </motion.div>

      {/* ── MODAL DÉTAIL / GESTION ── */}
      {selectedRequest && (
        <div className="modal-overlay active" onClick={() => setSelectedRequest(null)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()}
            style={{ maxWidth: 640, width: '92%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f4f4f5' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#18181b' }}>Gestion de la demande</h2>
              <button onClick={() => setSelectedRequest(null)} style={{ background: '#f4f4f5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Infos + PDF download */}
            <div style={{ background: '#F9FAFB', padding: 14, borderRadius: 8, marginBottom: 16, lineHeight: 1.9 }}>
              <strong>Citoyen :</strong> {getCitizenName(selectedRequest.citizenId)}<br />
              <strong>Email :</strong> {selectedRequest.citizenId?.email || '-'}<br />
              <strong>Démarche :</strong> {selectedRequest.procedureId?.title || '-'}<br />
              <strong>Statut :</strong> {statusBadge(selectedRequest.status)}<br />
              <strong>Date :</strong> {new Date(selectedRequest.createdAt).toLocaleString('fr-FR')}
            </div>
            {/* PDF téléchargement */}
            <div style={{ marginBottom: 16, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => downloadRequestPdf(selectedRequest._id, 'receipt')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <Download size={16} /> Télécharger le récépissé PDF
              </button>
              {selectedRequest.status === 'Validée' && (
                <button
                  type="button"
                  onClick={() => downloadRequestPdf(selectedRequest._id, 'official')}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#1E40AF', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  <Download size={16} /> Télécharger Document Officiel
                </button>
              )}
            </div>

            {/* Données formulaire */}
            {selectedRequest.formData && Object.keys(selectedRequest.formData).length > 0 && (
              <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 8, marginBottom: 16 }}>
                <h4 style={{ marginBottom: 10, color: 'var(--vert-700)' }}>Données du formulaire</h4>
                {Object.entries(selectedRequest.formData).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: 4, fontSize: 14 }}>
                    <strong style={{ textTransform: 'capitalize' }}>{key} :</strong> {String(value)}
                  </div>
                ))}
              </div>
            )}

            {/* Documents joints */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 10 }}>Documents joints</h4>
              {selectedRequest.uploadedFiles?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedRequest.uploadedFiles.map((doc, idx) => {
                    const isObj = doc && typeof doc === 'object';
                    const filePath = isObj ? doc.path : doc;
                    const fileName = isObj ? (doc.originalName || doc.filename || `Document ${idx + 1}`) : `Document ${idx + 1}`;
                    const mimeType = isObj ? doc.mimetype : '';
                    // Use Cloudinary URL directly if it starts with http
                    const fileUrl = filePath
                      ? (String(filePath).startsWith('http')
                          ? String(filePath)
                          : `${API_BASE}/${String(filePath).replace(/\\/g, '/')}`)
                      : null;
                    const isPdf = mimeType === 'application/pdf' || String(filePath || '').toLowerCase().endsWith('.pdf');
                    if (!fileUrl) return null;
                    return isPdf ? (
                      <PdfViewer key={idx} url={fileUrl} title={fileName} />
                    ) : (
                      <DocumentCard
                        key={idx}
                        title={fileName}
                        date={new Date(selectedRequest.createdAt).toLocaleDateString()}
                        url={fileUrl}
                      />
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--gris-500)', fontSize: 14 }}>Aucun document joint.</p>
              )}
            </div>

            {/* Formulaire statut + commentaire */}
            <form onSubmit={handleUpdateStatus}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Changer le statut</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--gris-300)' }}
                >
                  <option value="En attente">En attente</option>
                  <option value="Reçue">Reçue</option>
                  <option value="En cours">En cours</option>
                  <option value="Complément demandé">Complément demandé</option>
                  <option value="Validée">Validée</option>
                  <option value="Rejetée">Rejetée</option>
                  <option value="Terminée">Terminée</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Commentaire administrateur</label>
                <textarea
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  rows={3}
                  placeholder="Message visible par le citoyen..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--gris-300)', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedRequest(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

/* Style bouton pagination */
const paginBtn = (active) => ({
  padding: '6px 13px', borderRadius: 6, cursor: 'pointer',
  border: '1px solid var(--gris-300)',
  background: active ? 'var(--vert-500)' : 'white',
  color: active ? 'white' : 'inherit',
  fontWeight: active ? 700 : 400,
});

export default Requests;
