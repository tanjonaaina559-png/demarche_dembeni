import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';
import Toast from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft, FaPlus, FaTrash, FaImage, FaCheckCircle,
  FaTimes, FaClipboardList, FaFileAlt, FaCoins, FaInfoCircle
} from 'react-icons/fa';
import api from '../../services/api';
import getImageUrl from '../../utils/imageUrl';

const CATEGORIES = [
  { value: 'civil', label: 'État Civil' },
  { value: 'documents', label: 'Documents Officiels' },
  { value: 'enfance', label: 'Enfance & Loisirs' },
  { value: 'logement', label: 'Logement' },
  { value: 'urbanisme', label: 'Urbanisme' },
  { value: 'ecologie', label: 'Écologie & Déchets' },
  { value: 'autre', label: 'Autre' }
];

const ICONS_SUGGESTIONS = [
  'fas fa-file-alt', 'fas fa-id-card', 'fas fa-passport', 'fas fa-baby',
  'fas fa-ring', 'fas fa-book-open', 'fas fa-map-marker-alt', 'fas fa-baby-carriage',
  'fas fa-gamepad', 'fas fa-home', 'fas fa-hard-hat', 'fas fa-tools',
  'fas fa-map', 'fas fa-exclamation-triangle', 'fas fa-recycle', 'fas fa-truck'
];

const ProcedureEdit = () => {
  const { logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // Loading and Error states
  const [fetching, setFetching] = useState(true);

  // Basic fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('civil');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('Gratuit');
  const [status, setStatus] = useState('active');
  const [buttonText, setButtonText] = useState('Faire la demande');
  const [buttonLink, setButtonLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [icon, setIcon] = useState('fas fa-file-alt');

  // Advanced fields (Arrays of objects)
  const [statistics, setStatistics] = useState([]);
  const [features, setFeatures] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);
  const [steps, setSteps] = useState([]);

  // Images (URLs from server vs files uploaded)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState('');

  // Drag and drop states
  const [dragOverImage, setDragOverImage] = useState(false);
  const [dragOverBg, setDragOverBg] = useState(false);
  const imageInputRef = useRef();
  const bgInputRef = useRef();

  // PDF Template
  const [pdfTemplateFile, setPdfTemplateFile] = useState(null);
  const [pdfTemplateName, setPdfTemplateName] = useState('');
  const [pdfFieldsMap, setPdfFieldsMap] = useState([]);
  const pdfInputRef = useRef();

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type });
  };

  const closeToast = () => setToast(prev => ({ ...prev, open: false }));

  // Load procedure on mount
  useEffect(() => {
    const fetchProcedure = async () => {
      try {
        const res = await api.get(`/procedures/${id}`);
        const p = res.data;
        setTitle(p.title || '');
        setSlug(p.slug || '');
        setCategory(p.category || 'civil');
        setDescription(p.description || p.desc || '');
        setDetailedDescription(p.detailedDescription || '');
        setDuration(p.duration || p.processingTime || '');
        setPrice(p.price || p.fees || 'Gratuit');
        setStatus(p.status || 'active');
        setButtonText(p.buttonText || 'Faire la demande');
        setButtonLink(p.buttonLink || '');
        setIsActive(p.isActive ?? p.active ?? true);
        setIcon(p.icon || 'fas fa-file-alt');

        // Set arrays
        setStatistics(Array.isArray(p.statistics) ? p.statistics : []);
        setFeatures(Array.isArray(p.features) ? p.features.map(f => ({ ...f, items: Array.isArray(f.items) ? f.items : [''] })) : []);
        setSteps(Array.isArray(p.steps) ? p.steps : []);
        setRequiredFields(Array.isArray(p.requiredFields) ? p.requiredFields : []);
        
        // Handle documents
        if (Array.isArray(p.documents) && p.documents.length > 0) {
          setDocuments(p.documents);
        } else if (Array.isArray(p.requiredDocs) && p.requiredDocs.length > 0) {
          setDocuments(p.requiredDocs.map(name => ({ name, required: true, fileUrl: '' })));
        } else {
          setDocuments([]);
        }

        // Set pdf config
        if (p.pdfTemplate) {
          setPdfTemplateName(p.pdfTemplate.split('/').pop());
        }
        if (p.pdfFields) {
          const mapArray = Object.entries(p.pdfFields).map(([dataKey, pdfField]) => ({ dataKey, pdfField }));
          setPdfFieldsMap(mapArray);
        }

        // Set image previews
        if (p.imageUrl || p.image) {
          setImagePreview(getImageUrl(p.imageUrl || p.image));
        }
        if (p.backgroundImage) {
          setBgPreview(getImageUrl(p.backgroundImage));
        }
      } catch (err) {
        console.error(err);
        showToast('Impossible de récupérer la démarche administrative', 'error');
      } finally {
        setFetching(false);
      }
    };
    fetchProcedure();
  }, [id]);

  // Helper: auto-generate slug
  const handleTitleChange = (val) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generated);
  };

  // Image Upload Handlers
  const handleImageChange = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Format non supporté (utilisez JPG, PNG ou WebP)', 'error');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleBgChange = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Format non supporté (utilisez JPG, PNG ou WebP)', 'error');
      return;
    }
    setBgFile(file);
    setBgPreview(URL.createObjectURL(file));
  };

  const handlePdfChange = (file) => {
    if (!file) return;
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      showToast('Format non supporté (utilisez PDF ou DOCX)', 'error');
      return;
    }
    setPdfTemplateFile(file);
    setPdfTemplateName(file.name);
  };

  // List Management (Statistics)
  const addStatistic = () => {
    setStatistics([...statistics, { value: '', label: '', icon: 'fas fa-chart-bar' }]);
  };
  const removeStatistic = (idx) => {
    setStatistics(statistics.filter((_, i) => i !== idx));
  };
  const updateStatistic = (idx, field, val) => {
    const updated = [...statistics];
    updated[idx][field] = val;
    setStatistics(updated);
  };

  // List Management (Features / Rules)
  const addFeature = () => {
    setFeatures([...features, { title: '', type: 'neutral', items: [''] }]);
  };
  const removeFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };
  const updateFeatureField = (idx, field, val) => {
    const updated = [...features];
    updated[idx][field] = val;
    setFeatures(updated);
  };
  const addFeatureBullet = (featIdx) => {
    const updated = [...features];
    updated[featIdx].items.push('');
    setFeatures(updated);
  };
  const removeFeatureBullet = (featIdx, bulletIdx) => {
    const updated = [...features];
    updated[featIdx].items = updated[featIdx].items.filter((_, i) => i !== bulletIdx);
    setFeatures(updated);
  };
  const updateFeatureBullet = (featIdx, bulletIdx, val) => {
    const updated = [...features];
    updated[featIdx].items[bulletIdx] = val;
    setFeatures(updated);
  };

  // List Management (Steps)
  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, title: '', description: '' }]);
  };
  const removeStep = (idx) => {
    const filtered = steps.filter((_, i) => i !== idx);
    // Re-index step numbers
    const reindexed = filtered.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setSteps(reindexed);
  };
  const updateStep = (idx, field, val) => {
    const updated = [...steps];
    updated[idx][field] = val;
    setSteps(updated);
  };

  // List Management (Required Documents)
  const addDocument = () => {
    setDocuments([...documents, { name: '', fileUrl: '', required: true }]);
  };
  const removeDocument = (idx) => {
    setDocuments(documents.filter((_, i) => i !== idx));
  };
  const updateDocument = (idx, field, val) => {
    const updated = [...documents];
    updated[idx][field] = val;
    setDocuments(updated);
  };

  // List Management (Required Fields)
  const addField = () => {
    setRequiredFields([...requiredFields, { name: '', label: '', type: 'text', required: true, options: [] }]);
  };
  const removeField = (idx) => {
    setRequiredFields(requiredFields.filter((_, i) => i !== idx));
  };
  const updateField = (idx, field, val) => {
    const updated = [...requiredFields];
    updated[idx][field] = val;
    setRequiredFields(updated);
  };

  // List Management (PDF Fields Map)
  const addPdfFieldMap = () => {
    setPdfFieldsMap([...pdfFieldsMap, { dataKey: '', pdfField: '' }]);
  };
  const removePdfFieldMap = (idx) => {
    setPdfFieldsMap(pdfFieldsMap.filter((_, i) => i !== idx));
  };
  const updatePdfFieldMap = (idx, field, val) => {
    const updated = [...pdfFieldsMap];
    updated[idx][field] = val;
    setPdfFieldsMap(updated);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Le titre est requis.', 'error');
      return;
    }
    if (!slug.trim()) {
      showToast('Le slug est requis.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', title);
      payload.append('slug', slug);
      payload.append('category', category);
      payload.append('description', description);
      payload.append('detailedDescription', detailedDescription);
      payload.append('duration', duration);
      payload.append('price', price);
      payload.append('status', status);
      payload.append('buttonText', buttonText);
      payload.append('buttonLink', buttonLink);
      payload.append('isActive', isActive);
      payload.append('icon', icon);

      // Arrays must be stringified for multipart/form-data
      payload.append('statistics', JSON.stringify(statistics));
      // Filter out empty rules/items
      const cleanedFeatures = features.map(f => ({
        ...f,
        items: f.items.filter(item => item.trim() !== '')
      })).filter(f => f.title.trim() !== '');
      payload.append('features', JSON.stringify(cleanedFeatures));
      
      const cleanedDocs = documents.filter(d => d.name.trim() !== '');
      payload.append('documents', JSON.stringify(cleanedDocs));

      const cleanedFields = requiredFields.filter(f => f.name.trim() !== '' && f.label.trim() !== '');
      payload.append('requiredFields', JSON.stringify(cleanedFields));
      
      const cleanedSteps = steps.filter(s => s.title.trim() !== '');
      payload.append('steps', JSON.stringify(cleanedSteps));

      if (imageFile) {
        payload.append('image', imageFile);
      }
      if (bgFile) {
        payload.append('backgroundImage', bgFile);
      }
      if (pdfTemplateFile) {
        payload.append('pdfTemplate', pdfTemplateFile);
        payload.append('pdfTemplateType', 'pdf');
      }

      const pdfFieldsObj = {};
      pdfFieldsMap.forEach(m => {
        if (m.dataKey && m.pdfField) {
          pdfFieldsObj[m.dataKey] = m.pdfField;
        }
      });
      payload.append('pdfFields', JSON.stringify(pdfFieldsObj));

      // Content-Type + boundary auto-set by api interceptor when FormData detected.
      // Do NOT override manually — it would break Multer's boundary parsing.
      await api.put(`/admin/procedures/${id}`, payload);

      showToast('Démarche administrative mise à jour avec succès !', 'success');
      setTimeout(() => navigate('/admin/procedures'), 1500);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Erreur lors de l\'enregistrement des modifications.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) return <Loader />;

  return (
    <AdminLayout adminName="Admin" onLogout={() => logout()}>
      <Toast isOpen={toast.open} onClose={closeToast} message={toast.message} type={toast.type} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
        {/* Header navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
          <Link to="/admin/procedures" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}>
            <FaArrowLeft /> Retour
          </Link>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#164022', margin: 0 }}>Modifier la Démarche Administrative</h1>
            <p style={{ color: 'var(--gris-500)', fontSize: '0.9rem', margin: '5px 0 0' }}>Modifiez en temps réel chaque section et élément visuel.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* 1. INFORMATIONS GÉNÉRALES */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              style={sectionStyle}
            >
              <h3 style={sectionTitleStyle}><i className="fas fa-info-circle" style={{ color: 'var(--vert-500)' }}></i> Informations Générales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Titre de la démarche *</label>
                  <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} required placeholder="Ex: Inscription en crèche" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Slug (URL unique) *</label>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="ex-inscription-en-creche" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Catégorie *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                    {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Délai de traitement</label>
                  <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 48h, 1 mois, Commission en juin..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Frais / Tarif</label>
                  <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: Gratuit, 86 € (timbre fiscal)..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Icône FontAwesome (facultatif)</label>
                  <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Ex: fas fa-baby-carriage" style={inputStyle} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                    {ICONS_SUGGESTIONS.map(sug => (
                      <button type="button" key={sug} onClick={() => setIcon(sug)} style={{ background: icon === sug ? 'var(--vert-100)' : 'var(--gris-100)', color: icon === sug ? 'var(--vert-700)' : 'var(--gris-600)', border: icon === sug ? '1px solid var(--vert-400)' : '1px solid var(--gris-200)', borderRadius: '4px', padding: '3px 6px', fontSize: '11px', cursor: 'pointer' }}>
                        <i className={sug}></i>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
                  <input type="checkbox" id="isActiveCheck" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <label htmlFor="isActiveCheck" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Activer cette démarche dans le catalogue</label>
                </div>
              </div>
            </motion.section>

            {/* 2. TEXTES & DESCRIPTIONS */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05 }}
              style={sectionStyle}
            >
              <h3 style={sectionTitleStyle}><i className="fas fa-align-left" style={{ color: 'var(--vert-500)' }}></i> Descriptions détaillées</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Description courte (s'affiche sur la carte générale)</label>
                  <textarea rows="2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brève description attractive en une ou deux phrases..." style={inputStyle}></textarea>
                </div>
                <div>
                  <label style={labelStyle}>Contenu détaillé (s'affiche sur la page de détail)</label>
                  <textarea rows="6" value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} placeholder="Présentez en détail les règles d'attribution, les bénéficiaires, etc. (Supporte le texte brut)." style={inputStyle}></textarea>
                </div>
              </div>
            </motion.section>

            {/* 3. VISUELS & MÉDIAS */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              style={sectionStyle}
            >
              <h3 style={sectionTitleStyle}><i className="fas fa-images" style={{ color: 'var(--vert-500)' }}></i> Médias & Fonds</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Card Image */}
                <div>
                  <label style={labelStyle}>Image miniature (Carte)</label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOverImage(true); }}
                    onDragLeave={() => setDragOverImage(false)}
                    onDrop={e => { e.preventDefault(); setDragOverImage(false); handleImageChange(e.dataTransfer.files[0]); }}
                    onClick={() => imageInputRef.current?.click()}
                    style={{ ...dragStyle, border: `2px dashed ${dragOverImage ? 'var(--vert-500)' : '#D1D5DB'}`, background: dragOverImage ? '#F0FDF4' : '#FAFAFA' }}
                  >
                    {imagePreview ? (
                      <div style={{ position: 'relative' }}>
                        <img src={imagePreview} alt="Card Preview" style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                        <button type="button" onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(''); }} style={removeImgBtnStyle}><FaTimes size={10} /></button>
                      </div>
                    ) : (
                      <>
                        <FaImage size={28} color="#9CA3AF" style={{ marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Glisser-déposer ou cliquer pour la miniature</p>
                      </>
                    )}
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageChange(e.target.files[0])} />
                </div>

                {/* Background Image */}
                <div>
                  <label style={labelStyle}>Image de fond (Bannière détaillée)</label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOverBg(true); }}
                    onDragLeave={() => setDragOverBg(false)}
                    onDrop={e => { e.preventDefault(); setDragOverBg(false); handleBgChange(e.dataTransfer.files[0]); }}
                    onClick={() => bgInputRef.current?.click()}
                    style={{ ...dragStyle, border: `2px dashed ${dragOverBg ? 'var(--vert-500)' : '#D1D5DB'}`, background: dragOverBg ? '#F0FDF4' : '#FAFAFA' }}
                  >
                    {bgPreview ? (
                      <div style={{ position: 'relative' }}>
                        <img src={bgPreview} alt="Background Preview" style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                        <button type="button" onClick={e => { e.stopPropagation(); setBgFile(null); setBgPreview(''); }} style={removeImgBtnStyle}><FaTimes size={10} /></button>
                      </div>
                    ) : (
                      <>
                        <FaImage size={28} color="#9CA3AF" style={{ marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>Glisser-déposer ou cliquer pour le fond</p>
                      </>
                    )}
                  </div>
                  <input ref={bgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleBgChange(e.target.files[0])} />
                </div>

              </div>
            </motion.section>

            {/* 4. STATISTIQUES EN BANDEAU */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.15 }}
              style={sectionStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}><FaCoins style={{ color: 'var(--vert-500)' }} /> Statistiques Clés (Chiffres en bandeau)</h3>
                <button type="button" onClick={addStatistic} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaPlus /> Ajouter un chiffre
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {statistics.map((stat, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid var(--gris-200)' }}>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={stat.value} onChange={e => updateStatistic(i, 'value', e.target.value)} placeholder="Ex: 100%, 48h, 2/mois" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <div style={{ flex: 2 }}>
                      <input type="text" value={stat.label} onChange={e => updateStatistic(i, 'label', e.target.value)} placeholder="Ex: Gratuit habitants, Délai moyen" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={stat.icon} onChange={e => updateStatistic(i, 'icon', e.target.value)} placeholder="Ex: fas fa-coins" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <button type="button" onClick={() => removeStatistic(i)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '5px' }}>
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
                {statistics.length === 0 && <p style={emptyTextStyle}>Aucun bloc statistique configuré. (Ils s'affichent sous forme de bandeau premium sur la page)</p>}
              </div>
            </motion.section>

            {/* 5. GUIDE REGLES (ACCEPTÉ / REFUSÉ) */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              style={sectionStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}><FaClipboardList style={{ color: 'var(--vert-500)' }} /> Règles d'Acceptation & Refus (Guide Pratique)</h3>
                <button type="button" onClick={addFeature} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaPlus /> Ajouter une liste
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ background: '#F9FAFB', padding: '15px', borderRadius: '10px', border: '1px solid var(--gris-200)', position: 'relative' }}>
                    <button type="button" onClick={() => removeFeature(fIdx)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                      <FaTrash size={16} />
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label style={labelStyle}>Titre de la section</label>
                        <input type="text" value={feat.title} onChange={e => updateFeatureField(fIdx, 'title', e.target.value)} placeholder="Ex: Objets acceptés, Conditions requises" style={{ ...inputStyle, marginBottom: 0 }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Type de liste</label>
                        <select value={feat.type} onChange={e => updateFeatureField(fIdx, 'type', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }}>
                          <option value="accepted">Accepté (Vert)</option>
                          <option value="refused">Refusé (Rouge)</option>
                          <option value="neutral">Neutre / Info (Bleu)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Éléments de la liste (puces)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {feat.items.map((bullet, bIdx) => (
                          <div key={bIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <i className="fas fa-circle" style={{ fontSize: '8px', color: feat.type === 'accepted' ? '#10B981' : feat.type === 'refused' ? '#EF4444' : '#3B82F6' }}></i>
                            <input type="text" value={bullet} onChange={e => updateFeatureBullet(fIdx, bIdx, e.target.value)} placeholder="Élément de la liste..." style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                            <button type="button" onClick={() => removeFeatureBullet(fIdx, bIdx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addFeatureBullet(fIdx)} className="btn btn-outline" style={{ width: 'fit-content', padding: '3px 8px', fontSize: '11px', marginTop: '5px' }}>
                          <FaPlus /> Ajouter une ligne
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {features.length === 0 && <p style={emptyTextStyle}>Aucun guide de règles configuré. (Permet d'afficher ce qui est accepté ou refusé, comme sur la page encombrants)</p>}
              </div>
            </motion.section>

            {/* 6. ETAPES DE RÉALISATION */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.25 }}
              style={sectionStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}><FaClipboardList style={{ color: 'var(--vert-500)' }} /> Étapes du parcours citoyen</h3>
                <button type="button" onClick={addStep} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaPlus /> Ajouter une étape
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', background: '#F9FAFB', padding: '15px', borderRadius: '10px', border: '1px solid var(--gris-200)' }}>
                    <div style={{ background: 'var(--vert-500)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
                      {step.stepNumber}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="text" value={step.title} onChange={e => updateStep(idx, 'title', e.target.value)} placeholder="Titre de l'étape (Ex: Prise de rendez-vous)" style={{ ...inputStyle, marginBottom: 0 }} />
                      <textarea rows="2" value={step.description} onChange={e => updateStep(idx, 'description', e.target.value)} placeholder="Que doit faire le citoyen durant cette étape ?" style={{ ...inputStyle, marginBottom: 0 }}></textarea>
                    </div>
                    <button type="button" onClick={() => removeStep(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', alignSelf: 'center' }}>
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
                {steps.length === 0 && <p style={emptyTextStyle}>Aucune étape configurée. (Permet d'afficher un parcours fléché "Étape 1, 2, 3...")</p>}
              </div>
            </motion.section>

            {/* 7. CHAMPS DU FORMULAIRE */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.28 }}
              style={sectionStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}><i className="fas fa-keyboard" style={{ color: 'var(--vert-500)' }}></i> Champs du formulaire citoyen</h3>
                <button type="button" onClick={addField} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaPlus /> Ajouter un champ
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {requiredFields.map((field, idx) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#F9FAFB', padding: '15px', borderRadius: '8px', border: '1px solid var(--gris-200)' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={labelStyle}>Nom de la variable</label>
                      <input type="text" value={field.name} onChange={e => updateField(idx, 'name', e.target.value)} placeholder="Ex: nomEpoux" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={labelStyle}>Label affiché</label>
                      <input type="text" value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} placeholder="Ex: Nom de l'époux" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <label style={labelStyle}>Type</label>
                      <select value={field.type} onChange={e => updateField(idx, 'type', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }}>
                        <option value="text">Texte</option>
                        <option value="number">Nombre</option>
                        <option value="date">Date</option>
                        <option value="email">Email</option>
                        <option value="tel">Téléphone</option>
                        <option value="textarea">Zone de texte</option>
                        <option value="select">Liste déroulante</option>
                      </select>
                    </div>
                    {field.type === 'select' && (
                      <div style={{ flex: '1 1 100%', marginTop: '5px' }}>
                        <label style={labelStyle}>Options (séparées par une virgule)</label>
                        <input type="text" value={field.options?.join(', ')} onChange={e => updateField(idx, 'options', e.target.value.split(',').map(s=>s.trim()))} placeholder="Ex: Option 1, Option 2" style={{ ...inputStyle, marginBottom: 0 }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginTop: '20px' }}>
                      <input type="checkbox" id={`reqFieldCheck_${idx}`} checked={field.required} onChange={e => updateField(idx, 'required', e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      <label htmlFor={`reqFieldCheck_${idx}`} style={{ fontSize: '13px', cursor: 'pointer' }}>Obligatoire</label>
                    </div>
                    <button type="button" onClick={() => removeField(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', marginTop: '20px' }}>
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
                {requiredFields.length === 0 && <p style={emptyTextStyle}>Aucun champ de formulaire configuré. Si vide, seul les documents seront demandés.</p>}
              </div>
            </motion.section>

            {/* 8. DOCUMENTS À FOURNIR / TÉLÉCHARGER */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              style={sectionStyle}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}><FaFileAlt style={{ color: 'var(--vert-500)' }} /> Documents requis & Téléchargements</h3>
                <button type="button" onClick={addDocument} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaPlus /> Ajouter un document
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {documents.map((doc, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid var(--gris-200)' }}>
                    <div style={{ flex: 2 }}>
                      <input type="text" value={doc.name} onChange={e => updateDocument(idx, 'name', e.target.value)} placeholder="Nom du document (Ex: Justificatif de domicile de -3 mois)" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <div style={{ flex: 2 }}>
                      <input type="text" value={doc.fileUrl} onChange={e => updateDocument(idx, 'fileUrl', e.target.value)} placeholder="URL modèle PDF à télécharger (Ex: /formulaires/cerfa.pdf)" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <input type="checkbox" id={`reqDocCheck_${idx}`} checked={doc.required} onChange={e => updateDocument(idx, 'required', e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      <label htmlFor={`reqDocCheck_${idx}`} style={{ fontSize: '13px', cursor: 'pointer' }}>Obligatoire</label>
                    </div>
                    <button type="button" onClick={() => removeDocument(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
                {documents.length === 0 && <p style={emptyTextStyle}>Aucun document requis configuré. (Ceux-ci apparaîtront lors de la soumission de la demande et en téléchargement PDF)</p>}
              </div>
            </motion.section>

            {/* 8. PARAMÈTRES DU BOUTON ACTIONS */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.35 }}
              style={sectionStyle}
            >
              <h3 style={sectionTitleStyle}><i className="fas fa-external-link-alt" style={{ color: 'var(--vert-500)' }}></i> Bouton d'action personnalisé</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={labelStyle}>Texte du bouton</label>
                  <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Ex: Faire la demande, S'inscrire à la collecte" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Lien personnalisé (si externe ou redirection)</label>
                  <input type="text" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} placeholder="Ex: /collecte, /contact... (Ne pas utiliser de liens externes)" style={inputStyle} />
                </div>
              </div>
            </motion.section>

            {/* 9. MODÈLE DE DOCUMENT OFFICIEL (PDF) */}
            <motion.section 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              style={sectionStyle}
            >
              <h3 style={sectionTitleStyle}><i className="fas fa-file-pdf" style={{ color: 'var(--vert-500)' }}></i> Modèle de Document Officiel (PDF)</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--gris-500)', marginBottom: '15px' }}>
                Uploadez un modèle PDF officiel contenant des champs de formulaire interactifs (AcroForm). Remplissez le tableau ci-dessous pour faire correspondre les données saisies par le citoyen avec les noms des champs PDF.
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Fichier Modèle (PDF)</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button type="button" onClick={() => pdfInputRef.current?.click()} className="btn btn-outline" style={{ padding: '8px 15px' }}>
                    Choisir un fichier
                  </button>
                  <span style={{ fontSize: '0.9rem', color: pdfTemplateName ? 'var(--vert-600)' : 'var(--gris-400)' }}>
                    {pdfTemplateName ? <><i className="fas fa-check-circle"></i> {pdfTemplateName}</> : 'Aucun modèle sélectionné'}
                  </span>
                  {pdfTemplateName && (
                    <button type="button" onClick={() => { setPdfTemplateFile(null); setPdfTemplateName(''); }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                      <FaTimes />
                    </button>
                  )}
                </div>
                <input ref={pdfInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handlePdfChange(e.target.files[0])} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={labelStyle}>Mapping des variables (Données ➔ PDF)</label>
                <button type="button" onClick={addPdfFieldMap} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaPlus /> Ajouter un mapping
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pdfFieldsMap.map((mapItem, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid var(--gris-200)' }}>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={mapItem.dataKey} onChange={e => updatePdfFieldMap(idx, 'dataKey', e.target.value)} placeholder="Clé de donnée (Ex: nom, referenceParcelle)" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <div style={{ flex: 0, color: 'var(--gris-400)' }}><i className="fas fa-arrow-right"></i></div>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={mapItem.pdfField} onChange={e => updatePdfFieldMap(idx, 'pdfField', e.target.value)} placeholder="Nom du champ PDF (Ex: text_nom)" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>
                    <button type="button" onClick={() => removePdfFieldMap(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
                {pdfFieldsMap.length === 0 && <p style={emptyTextStyle}>Aucun mapping configuré.</p>}
              </div>
            </motion.section>

            {/* Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <Link to="/admin/procedures" className="btn btn-outline" style={{ padding: '12px 24px' }}>Annuler</Link>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
                {submitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> Enregistrement...</>
                ) : (
                  <><FaCheckCircle /> Enregistrer les modifications</>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

/* Component Styles */
const sectionStyle = {
  background: 'white',
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
  border: '1px solid var(--gris-200)'
};

const sectionTitleStyle = {
  fontSize: '1.2rem',
  color: '#164022',
  marginTop: 0,
  marginBottom: '18px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '1px solid var(--gris-100)',
  paddingBottom: '10px'
};

const labelStyle = {
  display: 'block',
  fontWeight: '600',
  marginBottom: '6px',
  fontSize: '0.85rem',
  color: '#374151'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '7px',
  border: '1px solid #D1D5DB',
  outline: 'none',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  marginBottom: '15px'
};

const dragStyle = {
  borderRadius: '10px',
  padding: '25px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '140px'
};

const removeImgBtnStyle = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  background: '#EF4444',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '22px',
  height: '22px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const emptyTextStyle = {
  color: 'var(--gris-400)',
  fontSize: '0.85rem',
  margin: '10px 0',
  fontStyle: 'italic',
  textAlign: 'center'
};

export default ProcedureEdit;
