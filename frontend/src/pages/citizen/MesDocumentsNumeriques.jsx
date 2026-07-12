import React, { useState, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Loader2, Shield, FolderOpen, Plus,
  Edit, Trash2, Eye, Paperclip, AlertTriangle, X
} from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DOC_TYPES = [
  "Carte Nationale d'Identité",
  'Acte de naissance',
  'Livret de famille',
  'Justificatif de domicile',
  "Photo d'identité",
  'Acte de décès',
  'Titre foncier',
  'Plan terrain',
  'Carnet de vaccination'
];

export default function MesDocumentsNumeriques() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    documentType: DOC_TYPES[0],
    formData: {
      nom: user?.lastname || user?.nom || '',
      prenom: user?.firstname || user?.prenom || '',
      dateNaissance: '',
      lieuNaissance: '',
      adresse: user?.address || user?.adresse || '',
      telephone: user?.phone || user?.telephone || '',
      cin: user?.CIN || user?.cin || '',
      nationalite: 'Mahoraise',
      profession: '',
      nomPere: '',
      nomMere: ''
    }
  });

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/citizen-documents/my-documents');
      setDocs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleDownload = async (doc) => {
    setDownloading(doc._id);
    try {
      // pdfUrl is always a full Cloudinary URL (https://res.cloudinary.com/...)
      const url = doc.pdfUrl?.startsWith('http')
        ? doc.pdfUrl
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${doc.pdfUrl?.replace(/\\/g, '/')}`;
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = `${doc.documentType}-${doc.referenceNumber}.pdf`;
      a.click();
    } catch (err) {
      console.error(err);
      alert('Erreur lors du téléchargement');
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = (doc) => {
    // pdfUrl is always a full Cloudinary URL (https://res.cloudinary.com/...)
    const url = doc.pdfUrl?.startsWith('http')
      ? doc.pdfUrl
      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${doc.pdfUrl?.replace(/\\/g, '/')}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return;
    try {
      await api.delete(`/citizen-documents/${id}`);
      fetchDocs();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleUseForRequest = (doc) => {
    navigate('/demande/new', { state: { preloadedDoc: doc } });
  };

  const openCreateModal = () => {
    setEditingDoc(null);
    setFormData({
      documentType: DOC_TYPES[0],
      formData: {
        nom: user?.lastname || user?.nom || '',
        prenom: user?.firstname || user?.prenom || '',
        dateNaissance: '',
        lieuNaissance: '',
        adresse: user?.address || user?.adresse || '',
        telephone: user?.phone || user?.telephone || '',
        nationalite: 'Mahoraise',
        profession: '',
        nomPere: '',
        nomMere: ''
      }
    });
    setShowModal(true);
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setFormData({
      documentType: doc.documentType,
      formData: {
        nom: doc.formData.nom || '',
        prenom: doc.formData.prenom || '',
        dateNaissance: doc.formData.dateNaissance || '',
        lieuNaissance: doc.formData.lieuNaissance || '',
        adresse: doc.formData.adresse || '',
        telephone: doc.formData.telephone || '',
        nationalite: doc.formData.nationalite || 'Mahoraise',
        profession: doc.formData.profession || '',
        nomPere: doc.formData.nomPere || '',
        nomMere: doc.formData.nomMere || ''
      }
    });
    setShowModal(true);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      formData: { ...prev.formData, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDoc) {
        await api.put(`/citizen-documents/${editingDoc._id}`, formData);
      } else {
        await api.post('/citizen-documents', formData);
      }
      setShowModal(false);
      fetchDocs();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const age = formData.formData.dateNaissance 
    ? new Date().getFullYear() - new Date(formData.formData.dateNaissance).getFullYear() 
    : null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Warning Alert */}
      <div style={{
        background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
        padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        color: '#991B1B'
      }}>
        <AlertTriangle size={20} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
          <strong>Attention:</strong> Documents fictifs destinés uniquement à la démonstration et aux tests de la plateforme. Ils n'ont aucune valeur légale.
        </span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#164022', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={26} style={{ color: '#16A34A' }} />
            Mes Documents Numériques (Démo)
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.88rem' }}>
            Créez et gérez vos documents fictifs pour tester la plateforme
          </p>
        </div>
        <button
          onClick={openCreateModal}
          style={{
            background: 'var(--vert-500)', color: 'white', border: 'none',
            padding: '0.75rem 1.25rem', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600,
            boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
          }}
        >
          <Plus size={18} />
          Créer un document
        </button>
      </div>

      {/* Document Cards */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 size={32} style={{ color: '#16A34A', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : docs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'white', borderRadius: '16px', padding: '4rem 2rem',
            textAlign: 'center', border: '2px dashed #D1D5DB'
          }}
        >
          <FolderOpen size={48} style={{ color: '#D1D5DB', marginBottom: '1rem' }} />
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Aucun document numérique disponible</h3>
          <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
            Vous n'avez pas encore créé de document fictif.
          </p>
          <button
            onClick={openCreateModal}
            style={{
              background: 'white', color: 'var(--vert-600)', border: '1px solid var(--vert-500)',
              padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
            }}
          >
            <Plus size={16} />
            Créer mon premier document
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          <AnimatePresence>
            {docs.map((doc, idx) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: 'white', borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex', flexDirection: 'column'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
              >
                {/* Card header */}
                <div style={{
                  background: 'linear-gradient(135deg, #164022, #16A34A)',
                  padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
                  }}>
                    <FileText size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>
                      {doc.documentType}
                    </h3>
                    <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                      Réf: {doc.referenceNumber}
                    </p>
                  </div>
                  <span style={{
                    background: '#FEF3C7', color: '#92400E', fontSize: '0.65rem',
                    fontWeight: 700, padding: '2px 8px', borderRadius: '999px', flexShrink: 0
                  }}>
                    DÉMO
                  </span>
                </div>

                {/* Card body */}
                <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', color: '#374151', marginBottom: '0.5rem' }}>
                      <strong>Nom :</strong> {doc.formData?.nom || '-'} {doc.formData?.prenom || '-'}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '1rem' }}>
                      Généré le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* Actions Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <button
                      onClick={() => handlePreview(doc)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        background: '#F3F4F6', color: '#4B5563', border: 'none',
                        borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                      }}
                    >
                      <Eye size={14} /> Aperçu
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc._id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        background: '#EFF6FF', color: '#2563EB', border: 'none',
                        borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                      }}
                    >
                      {downloading === doc._id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
                      Télécharger
                    </button>
                    <button
                      onClick={() => openEditModal(doc)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        background: '#FEF3C7', color: '#D97706', border: 'none',
                        borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                      }}
                    >
                      <Edit size={14} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        background: '#FEF2F2', color: '#DC2626', border: 'none',
                        borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'
                      }}
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                  
                  {/* Utiliser pour une demande */}
                  <button
                    onClick={() => handleUseForRequest(doc)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
                      borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      width: '100%', marginTop: '0.25rem'
                    }}
                  >
                    <Paperclip size={14} /> Utiliser pour une demande
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="var(--vert-500)" />
                  {editingDoc ? 'Modifier le document' : 'Créer un document fictif'}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                  <X size={20} color="#6B7280" />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Type de document</label>
                    <select
                      value={formData.documentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
                      required
                    >
                      {DOC_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nom *</label>
                      <input type="text" name="nom" value={formData.formData.nom} onChange={handleFieldChange} style={inputStyle} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Prénom *</label>
                      <input type="text" name="prenom" value={formData.formData.prenom} onChange={handleFieldChange} style={inputStyle} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Date de naissance *</label>
                      <input type="date" name="dateNaissance" value={formData.formData.dateNaissance} onChange={handleFieldChange} style={inputStyle} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Lieu de naissance *</label>
                      <input type="text" name="lieuNaissance" value={formData.formData.lieuNaissance} onChange={handleFieldChange} style={inputStyle} required />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Adresse *</label>
                    <input type="text" name="adresse" value={formData.formData.adresse} onChange={handleFieldChange} style={inputStyle} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Téléphone</label>
                      <input type="tel" name="telephone" placeholder="Optionnel" value={formData.formData.telephone || ''} onChange={handleFieldChange} style={inputStyle} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>CIN</label>
                      <input type="text" name="cin" placeholder="Optionnel (18 ans et plus)" value={formData.formData.cin || ''} onChange={handleFieldChange} style={inputStyle} />
                      {age !== null && age >= 18 && <span style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>Recommandé mais non obligatoire</span>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nationalité</label>
                      <input type="text" name="nationalite" value={formData.formData.nationalite} onChange={handleFieldChange} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nom du père</label>
                      <input type="text" name="nomPere" value={formData.formData.nomPere} onChange={handleFieldChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nom de la mère</label>
                      <input type="text" name="nomMere" value={formData.formData.nomMere} onChange={handleFieldChange} style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Profession</label>
                    <input type="text" name="profession" value={formData.formData.profession} onChange={handleFieldChange} style={inputStyle} />
                  </div>

                </div>
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#F9FAFB', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.2rem', background: 'white', border: '1px solid #D1D5DB', borderRadius: '6px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting} style={{ padding: '0.6rem 1.2rem', background: 'var(--vert-500)', border: 'none', borderRadius: '6px', fontWeight: 600, color: 'white', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                    {editingDoc ? 'Mettre à jour' : 'Créer le document'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
};
