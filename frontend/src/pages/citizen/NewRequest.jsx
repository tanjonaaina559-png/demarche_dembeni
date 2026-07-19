import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import UploadDocument from '../../components/ui/UploadDocument';
import Toast from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, UploadCloud, CheckCircle, ArrowRight, 
  ArrowLeft, Info, FileDigit, X, Loader2, Plus, Shield, AlertTriangle
} from 'lucide-react';
import './NewRequest.css';
import { getDocumentTemplate } from '../../utils/documentTemplates';
import ErrorBoundary from '../../components/ErrorBoundary';

// Style constants â€” defined here to be accessible throughout the component
const lStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' };
const iStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' };
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB',
  fontSize: '0.95rem', outline: 'none', background: 'white'
};

const STEPS = [
  { id: 1, title: 'DÃ©marche' },
  { id: 2, title: 'Formulaire' },
  { id: 3, title: 'PiÃ¨ces jointes' },
  { id: 4, title: 'Confirmation' }
];


const NewRequestComponent = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramProcId = searchParams.get('procedureId');


  // â”€â”€ Debug lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    console.log('MOUNT â€” NewRequestComponent');
    return () => console.log('UNMOUNT â€” NewRequestComponent');
  }, []);

  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProcedure, setSelectedProcedure] = useState('');
  // files is now [{id: string, file: File}] â€” stable keys prevent removeChild on removal
  const [files, setFiles] = useState([]);
  const fileIdCounter = React.useRef(0);
  const addFile = (file) => {
    const id = `file-${Date.now()}-${fileIdCounter.current++}`;
    setFiles(prev => [...prev, { id, file }]);
  };
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successData, setSuccessData] = useState(null);

  const [showDocModal, setShowDocModal] = useState(false);
  const [citizenDocs, setCitizenDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  // Quick Creator States
  const [showQuickCreator, setShowQuickCreator] = useState(false);
  const [quickDocType, setQuickDocType] = useState('');
  const [submittingQuick, setSubmittingQuick] = useState(false);
  const [quickFormData, setQuickFormData] = useState({
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
  });

  const openQuickCreator = (docName) => {
    setQuickDocType(docName);
    setShowQuickCreator(true);
  };

  const safeParseJSON = (value, fallback = {}) => {
    try {
      if (!value) return fallback;
      return typeof value === "string" ? JSON.parse(value) : value;
    } catch {
      return fallback;
    }
  };

  const handleQuickCreate = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    console.log("[QuickCreate] DÃ©marrage process...");
    
    try {
      const template = getDocumentTemplate(quickDocType);
      if (template) {
        const missing = (template?.fields || []).filter(f => f?.required && !quickFormData?.[f?.name]);
        if ((missing || []).length > 0) {
          showToast("Veuillez remplir les champs obligatoires", "error");
          return;
        }
      } else {
        if (!quickFormData?.nom || !quickFormData?.prenom || !quickFormData?.dateNaissance) {
          showToast("Veuillez remplir les champs obligatoires", "error");
          return;
        }
      }

      setSubmittingQuick(true);
      console.log("[QuickCreate] Soumission du payload MongoDB...");
      
      const payload = {
        documentType: quickDocType || "Document",
        formData: quickFormData || {}
      };
      
      const res = await api.post('/citizen-documents', payload);
      console.log("[QuickCreate] RÃ©ponse API POST :", res?.data);
      
      const newDoc = res?.data?.document;
      if (!newDoc) throw new Error("Document introuvable dans la rÃ©ponse API");
      
      if (res?.data?.pdfError) {
        showToast('Document crÃ©Ã© sans PDF', 'warning');
      } else {
        showToast('CrÃ©ation rÃ©ussie. Ajout du PDF en cours...', 'success');
        try {
          console.log("[QuickCreate] TÃ©lÃ©chargement du PDF...");
          const pdfRes = await api.get(`/citizen-documents/pdf/${newDoc?._id}`, { responseType: 'blob' });
          if (pdfRes?.data) {
            const fileName = `${newDoc?.documentType || 'doc'}-${newDoc?.referenceNumber || 'demo'}.pdf`;
            const file = new File([pdfRes.data], fileName, { type: 'application/pdf' });
            addFile(file);
            console.log("[QuickCreate] PDF ajoutÃ© avec succÃ¨s aux piÃ¨ces jointes.");
            console.log('STEP CHANGE â€” fichiers count:', files.length + 1);
          }
        } catch (pdfErr) {
          console.error("[QuickCreate] Erreur rÃ©cupÃ©ration PDF:", pdfErr);
          showToast("Document crÃ©Ã©, mais rÃ©cupÃ©ration du PDF Ã©chouÃ©e.", "error");
        }
      }
      
      setCitizenDocs(prev => [...(prev || []), newDoc]);
      setShowQuickCreator(false);
      
      if (!res?.data?.pdfError) {
        showToast('Document gÃ©nÃ©rÃ© et ajoutÃ© avec succÃ¨s', 'success');
      }
    } catch (err) {
      console.error("[QuickCreate] Erreur FATALE :", err);
      showToast(err?.message || "Une erreur inattendue a empÃªchÃ© la gÃ©nÃ©ration", "error");
    } finally {
      setSubmittingQuick(false);
      console.log("[QuickCreate] Processus terminÃ©.");
    }
  };


  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = () => setToast(prev => ({ ...prev, open: false }));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchProcsAndDocs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch citizen docs
        try {
          const docRes = await api.get('/citizen-documents/my-documents');
          setCitizenDocs(docRes.data || []);
        } catch(e) {
          console.error("Erreur chargement documents", e);
        }

        if (paramProcId) {
          try {
            const procRes = await api.get(`/procedures/${paramProcId}`);
            if (procRes.data) {
              setProcedures([procRes.data]);
              setSelectedProcedure(paramProcId);
              initializeFormData(procRes.data);
              setCurrentStep(2);
            } else {
              setError("ProcÃ©dure introuvable");
            }
          } catch (e) {
            setError("ProcÃ©dure introuvable");
            showToast("ProcÃ©dure introuvable", "error");
          }
        } else {
          try {
            const procRes = await api.get('/procedures');
            const activeProcedures = Array.isArray(procRes.data) ? procRes.data.filter(p => p?.isActive || p?.active !== false) : [];
            setProcedures(activeProcedures);
          } catch (e) {
            setError("Erreur de chargement des procÃ©dures");
          }
        }
      } catch (e) {
        console.error('Error fetching data', e);
        showToast('Erreur de chargement', 'error');
        setError("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchProcsAndDocs();
    return () => {
      console.log("CLEANUP FROM fetchProcsAndDocs useEffect");
    };
  }, [user, navigate, paramProcId]);

  useEffect(() => {
    if (location.state?.preloadedDoc) {
      const loadDoc = async () => {
        try {
          const doc = location.state.preloadedDoc;
          const res = await api.get(`/citizen-documents/pdf/${doc._id}`, { responseType: 'blob' });
          const file = new File([res.data], `${doc.documentType}-${doc.referenceNumber}.pdf`, { type: 'application/pdf' });
          addFile(file);
          console.log('[preloadedDoc] MOUNT â€” fichier prÃ©-sÃ©lectionnÃ© ajoutÃ©:', file.name);
          showToast(`Document ajoutÃ© automatiquement: ${doc.documentType}`, 'success');
          navigate(location.pathname + location.search, { replace: true, state: {} });
        } catch(e) {
          showToast('Erreur lors du chargement du document prÃ©-sÃ©lectionnÃ©', 'error');
        }
      };
      loadDoc();
    }
    return () => {
      console.log("CLEANUP FROM preloadedDoc useEffect");
    };
  }, [location.state, navigate, location.pathname, location.search]);

  const openDocModal = async () => {
    setShowDocModal(true);
    setLoadingDocs(true);
    try {
      const { data } = await api.get('/citizen-documents/my-documents');
      setCitizenDocs(data || []);
    } catch(e) {
      showToast('Erreur lors du chargement de vos documents', 'error');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSelectDemoDoc = async (doc) => {
    try {
      showToast(`TÃ©lÃ©chargement de ${doc.documentType}...`, 'success');
      const res = await api.get(`/citizen-documents/pdf/${doc._id}`, { responseType: 'blob' });
      const file = new File([res.data], `${doc.documentType}-${doc.referenceNumber}.pdf`, { type: 'application/pdf' });
      addFile(file);
      showToast(`Document ajoutÃ© automatiquement: ${doc.documentType}`, 'success');
      setShowDocModal(false);
    } catch(e) {
      showToast("Erreur lors de l'ajout du document.", "error");
    }
  };

  const getMatchingDemoDocs = (docName) => {
    if (!docName || (citizenDocs?.length || 0) === 0) return [];
    const nameLower = docName.toLowerCase();
    return (citizenDocs || []).filter(demoDoc => {
      const typeLower = demoDoc?.documentType?.toLowerCase() || '';
      if (nameLower.includes(typeLower) || typeLower.includes(nameLower)) return true;
      if (nameLower.includes('identitÃ©') && (typeLower.includes('cni') || typeLower.includes('carte nationale'))) return true;
      if (nameLower.includes('cni') && typeLower.includes('identitÃ©')) return true;
      if (nameLower.includes('domicile') && typeLower.includes('domicile')) return true;
      if (nameLower.includes('naissance') && typeLower.includes('naissance')) return true;
      return false;
    });
  };

  const handleProcedureChange = (procId) => {
    setSelectedProcedure(procId);
    if (procId) {
      initializeFormData(procedures.find(p => p?._id === procId));
    } else {
      setFormData({});
    }
  };

  const initializeFormData = (proc) => {
    if (!proc || !proc.requiredFields) return;
    const initialData = {};
    (proc.requiredFields || []).forEach(f => {
      let val = '';
      const nameLower = f?.name?.toLowerCase() || '';
      if (nameLower === 'nom' || nameLower === 'lastname') val = user?.lastname || user?.nom || '';
      else if (nameLower === 'prenom' || nameLower === 'firstname' || nameLower === 'prÃ©nom') val = user?.firstname || user?.prenom || '';
      else if (nameLower === 'email') val = user?.email || '';
      else if (nameLower === 'telephone' || nameLower === 'tÃ©lÃ©phone' || nameLower === 'phone') val = user?.phone || user?.telephone || '';
      else if (nameLower === 'adresse' || nameLower === 'address') val = user?.address || user?.adresse || '';
      else if (nameLower === 'cin' || nameLower === 'cni') val = user?.CIN || user?.cin || '';
      else if (nameLower === 'datenaissance' || nameLower === 'date de naissance') val = user?.dateNaissance ? user.dateNaissance.split('T')[0] : '';
      if (f?.name) {
        initialData[f.name] = val;
      }
    });
    setFormData(initialData);
  };

  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedProcDetails = (procedures || []).find(p => p?._id === selectedProcedure);

  const nextStep = () => {
    if (currentStep === 1 && !selectedProcedure) {
      showToast('Veuillez sÃ©lectionner une dÃ©marche.', 'error');
      return;
    }
    if (currentStep === 2) {
      const missingFields = (selectedProcDetails?.requiredFields || []).filter(f => f?.required && !formData[f.name]);
      if (missingFields && missingFields.length > 0) {
        showToast('Veuillez remplir tous les champs obligatoires.', 'error');
        return;
      }
    }
    console.log('STEP CHANGE â€”', currentStep, 'â†’', Math.min(currentStep + 1, 4));
    console.log("NEXT STEP CLICKED");
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    console.log('STEP CHANGE â€”', currentStep, 'â†’', Math.max(currentStep - 1, 1));
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleSubmit = async () => {
    const requiredDocs = (selectedProcDetails?.documents || []).filter(d => d?.required) || [];
    if ((files?.length || 0) < requiredDocs.length) {
      showToast(`Veuillez fournir au moins ${requiredDocs.length} document(s) obligatoire(s).`, 'error');
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    const formDataPayload = new FormData();
    formDataPayload.append('procedureId', selectedProcedure);
    formDataPayload.append('formData', JSON.stringify(formData));
    // Append the actual File objects
    files.forEach(({ file }) => formDataPayload.append('documents', file));

    try {
      const res = await api.post('/requests', formDataPayload, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploadProgress(100);
      setSuccessData(res.data.request);
      setCurrentStep(4);
    } catch (err) {
      console.error('Error submitting request', err);
      showToast(err.response?.data?.message || 'Erreur lors de la soumission de la demande', 'error');
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  // UI Renderers
  const renderStepIndicator = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#E5E7EB', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', top: '15px', left: '0', height: '2px', background: 'var(--vert-500)', zIndex: 1, width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`, transition: 'width 0.3s ease' }}></div>
      
      {STEPS.map(step => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        return (
          <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, background: 'white', padding: '0 10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'var(--vert-500)' : isCompleted ? '#10B981' : '#F3F4F6',
              color: isActive || isCompleted ? 'white' : '#9CA3AF',
              border: isActive || isCompleted ? 'none' : '2px solid #E5E7EB',
              fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s ease'
            }}>
              {isCompleted ? <CheckCircle size={18} /> : step.id}
            </div>
            <span style={{ fontSize: '0.8rem', marginTop: '8px', color: isActive ? 'var(--vert-700)' : '#6B7280', fontWeight: isActive ? 'bold' : 'normal' }}>
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );

  if (loading) return <Loader />;

  if (error) {
    return (
      <div style={{ padding: '0 20px 40px', maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '60px 20px', marginTop: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6' }}>
          <div style={{ width: '80px', height: '80px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#DC2626' }}>
            <X size={40} />
          </div>
          <h2 style={{ color: '#111827', fontSize: '1.8rem', marginBottom: '10px' }}>ProcÃ©dure introuvable</h2>
          <p style={{ color: '#6B7280', fontSize: '1.1rem', marginBottom: '30px' }}>La dÃ©marche que vous avez demandÃ©e n'existe pas ou n'est plus disponible.</p>
          <Link to="/demarches" className="btn btn-primary" style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={18} /> Retour aux dÃ©marches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: '850px', margin: '0 auto' }}>
      <Toast isOpen={toast.open} onClose={closeToast} message={toast.message} type={toast.type} />
      
      <div style={{ marginBottom: '30px', marginTop: '20px' }}>
        <h1 style={{ color: '#111827', margin: '0 0 10px', fontSize: '2rem' }}>Nouvelle demande</h1>
        <p style={{ color: '#6B7280', margin: 0 }}>Effectuez vos dÃ©marches administratives directement en ligne.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '30px', border: '1px solid #F3F4F6' }}>
        
        {renderStepIndicator()}

        <AnimatePresence mode="wait" initial={false}>
            {/* ── STEP 1  : SÃ©lection de la dÃ©marche ── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#1F2937' }}>Choisissez votre dÃ©marche</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
                  {(procedures || []).map(p => (
                    <div
                      key={p?._id}
                      onClick={() => handleProcedureChange(p?._id)}
                      style={{
                        border: `2px solid ${selectedProcedure === p?._id ? 'var(--vert-500)' : '#E5E7EB'}`,
                        background: selectedProcedure === p?._id ? '#F0FDF4' : 'white',
                        padding: '15px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'flex-start', gap: '12px'
                      }}
                    >
                      <div style={{ color: selectedProcedure === p?._id ? 'var(--vert-600)' : '#9CA3AF', marginTop: '2px' }}>
                        <FileDigit size={24} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', color: '#111827', fontSize: '1rem' }}>{p?.title || 'Sans titre'}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>DÃ©lai estimÃ©: {p?.duration || 'Variable'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </motion.div>
            )}

            {/* ── STEP 2  : Formulaire ── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <div>
                {selectedProcDetails ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', background: '#F9FAFB', padding: '12px', borderRadius: '8px' }}>
                      <Info size={20} color="var(--vert-500)" />
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Veuillez renseigner les informations requises pour : <strong>{selectedProcDetails?.title}</strong></span>
                    </div>
                    {(selectedProcDetails?.requiredFields || []).length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        {(selectedProcDetails?.requiredFields || []).map((field, idx) => {
                          if (!field) return null;
                          const nameLower = field?.name?.toLowerCase() || '';
                          let inputType = field?.type || 'text';
                          let extraProps = {};
                          if (inputType === 'text') {
                            if (nameLower.includes('tÃ©lÃ©phone') || nameLower.includes('telephone')) { inputType = 'tel'; extraProps = { pattern: '[0-9]*', maxLength: 20 }; }
                            else if (nameLower.includes('email')) { inputType = 'email'; }
                            else if (nameLower.includes('date')) { inputType = 'date'; }
                            else if (nameLower.includes('age') || nameLower.includes('Ã¢ge')) { inputType = 'number'; extraProps = { min: 0, max: 120 }; }
                            else if (nameLower.includes('nombre') || nameLower.includes('quantitÃ©')) { inputType = 'number'; extraProps = { min: 1 }; }
                            else if (nameLower.includes('description') || nameLower.includes('motif') || nameLower.includes('commentaire')) { inputType = 'textarea'; }
                          }
                          return (
                            <div key={field?.name || idx} style={{ gridColumn: inputType === 'textarea' ? '1 / -1' : 'auto' }}>
                              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                                {field?.label} {field?.required && <span style={{ color: '#DC2626' }}>*</span>}
                              </label>
                              {inputType === 'textarea' ? (
                                <textarea name={field?.name} value={formData[field?.name] || ''} onChange={handleFormDataChange} required={field?.required} rows="3" style={inputStyle} onInvalid={e => e.target.setCustomValidity('Ce champ est obligatoire')} onInput={e => e.target.setCustomValidity('')} {...extraProps} />
                              ) : inputType === 'select' ? (
                                <select name={field?.name} value={formData[field?.name] || ''} onChange={handleFormDataChange} required={field?.required} style={inputStyle} onInvalid={e => e.target.setCustomValidity('Ce champ est obligatoire')} onInput={e => e.target.setCustomValidity('')}>
                                  <option value="">SÃ©lectionner...</option>
                                  {(field?.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : (
                                <input type={inputType} name={field?.name} value={formData[field?.name] || ''} onChange={handleFormDataChange} required={field?.required} style={inputStyle} onInvalid={e => { if (e.target.validity.valueMissing) e.target.setCustomValidity('Ce champ est obligatoire'); else e.target.setCustomValidity(''); }} onInput={e => e.target.setCustomValidity('')} {...extraProps} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>
                        Aucune information supplÃ©mentaire n'est requise pour cette dÃ©marche. Cliquez sur Suivant.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Chargement de la procÃ©dure...</div>
                )}
              </div>
              </motion.div>
            )}

            {/* ── STEP 3  : PiÃ¨ces justificatives ── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1F2937' }}>PiÃ¨ces justificatives</h2>

                {(selectedProcDetails?.documents || []).length > 0 ? (
                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#065F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} /> Documents requis
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', color: '#064E3B', fontSize: '0.9rem' }}>
                      {(selectedProcDetails?.documents || []).map((doc, idx) => {
                        if (!doc) return null;
                        const matches = getMatchingDemoDocs(doc?.name);
                        return (
                          <li key={doc?.name || idx} style={{ marginBottom: '10px', background: 'white', padding: '10px', borderRadius: '8px', border: '1px dashed #A7F3D0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: (matches?.length || 0) > 0 ? '8px' : '0' }}>
                              <FileText size={16} color="#059669" />
                              <strong>{doc?.name}</strong>
                              {doc?.required
                                ? <span style={{ color: '#DC2626', fontSize: '0.8rem' }}>* (Obligatoire)</span>
                                : <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>(Optionnel)</span>}
                            </div>
                            {(matches?.length || 0) === 0 && doc?.required && (
                              <div style={{ paddingLeft: '24px', marginTop: '8px' }}>
                                <p style={{ margin: '0 0 5px', fontSize: '0.8rem', color: '#6B7280' }}>Je ne possÃ¨de pas encore ce document :</p>
                                <button type="button" onClick={() => openQuickCreator(doc.name)} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Plus size={16} /> CrÃ©er rapidement
                                </button>
                              </div>
                            )}
                            {(matches?.length || 0) > 0 && (
                              <div style={{ paddingLeft: '24px' }}>
                                {(matches || []).map(m => (
                                  <button key={m?._id || m?.documentType} type="button" onClick={() => handleSelectDemoDoc(m)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '8px', marginTop: '4px' }}>
                                    âœ“ Utiliser {m?.documentType} enregistrÃ©
                                  </button>
                                ))}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#6B7280', background: '#F9FAFB', borderRadius: '8px', marginBottom: '20px' }}>
                    Aucune piÃ¨ce justificative demandÃ©e pour cette dÃ©marche.
                  </div>
                )}

                <UploadDocument onUpload={(file) => addFile(file)} maxSizeMB={5} acceptedType=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf" />

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <button type="button" onClick={openDocModal} style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> Utiliser mes documents enregistrÃ©s
                  </button>
                </div>

                {(files?.length || 0) > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Documents prÃªts Ã  l'envoi ({files?.length || 0})</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(files || []).map(({ id, file }) => (
                        <li key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '10px 15px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <FileText size={18} color="#6B7280" />
                            <span>{file?.name} ({((file?.size || 0) / 1024 / 1024).toFixed(2)} Mo)</span>
                          </div>
                          <button type="button" onClick={() => removeFile(id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>âœ–</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {submitting && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ background: '#E5E7EB', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--vert-500)', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.2s' }}></div>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6B7280', marginTop: '8px' }}>Envoi en cours... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              </motion.div>
            )}

            {/* ── STEP 4  : Confirmation ── */}
            {currentStep === 4 && (() => {
              const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
              const rawPdf = successData?.generatedPdf;
              const pdfUrl = rawPdf
                ? (rawPdf.startsWith('http') ? rawPdf : `${API_BASE}${rawPdf.split('//').join('/')}`)
                : null;
              return (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white', boxShadow: '0 8px 20px rgba(16,185,129,0.35)' }}>
                    <CheckCircle size={36} />
                  </div>
                  <h2 style={{ color: '#111827', fontSize: '1.7rem', marginBottom: '8px' }}>Demande envoyÃ©e avec succÃ¨s&nbsp;!</h2>
                  <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '24px' }}>Votre dossier a bien Ã©tÃ© transmis aux services de la mairie.</p>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px 24px', maxWidth: '380px', margin: '0 auto 28px' }}>
                    <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NumÃ©ro de suivi</p>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--vert-700)', letterSpacing: '2px', fontFamily: 'monospace' }}>
                      {successData?.referenceNumber || successData?._id || '---'}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: '4px 0 0' }}>Conservez ce numÃ©ro pour le suivi de votre demande</p>
                  </div>
                  {pdfUrl ? (
                    <div style={{ marginBottom: 24 }}>
                      <h4 style={{ fontSize: '1rem', color: '#1F2937', marginBottom: 12 }}>ðŸ“„ Votre document gÃ©nÃ©rÃ©</h4>
                      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', maxWidth: 700, margin: '0 auto 16px', height: 400, background: '#F9FAFB' }}>
                        <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 20 }}>
                            <FileText size={40} color="#D1D5DB" />
                            <p style={{ color: '#6B7280', margin: 0 }}>AperÃ§u non disponible dans ce navigateur.</p>
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                              style={{ background: '#3B82F6', color: 'white', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                              Ouvrir dans un nouvel onglet
                            </a>
                          </div>
                        </object>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px 20px', maxWidth: 480, margin: '0 auto 24px', fontSize: '0.9rem', color: '#78350F' }}>
                      â„¹ï¸ Aucun template PDF officiel disponible pour cette procÃ©dure. Un rÃ©cÃ©pissÃ© standard sera gÃ©nÃ©rÃ© par la mairie.
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/mes-demandes" className="btn btn-primary" style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Suivre ma demande <ArrowRight size={18} />
                    </Link>
                    {pdfUrl && (
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download
                        className="btn btn-outline"
                        style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} /> TÃ©lÃ©charger le PDF
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
              );
            })()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
            <button 
              type="button" 
              onClick={prevStep} 
              disabled={currentStep === 1 || submitting}
              className="btn btn-outline" 
              style={{ padding: '10px 20px', opacity: currentStep === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={16} /> PrÃ©cÃ©dent
            </button>

            {currentStep < 3 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="btn btn-primary"
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Suivant <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: '#10B981', border: 'none' }}
              >
                {submitting ? 'Envoi...' : <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Soumettre <UploadCloud size={16} /></span>}
              </button>
            )}
          </div>
        )}

      </div>

      {/* Demo Docs Selection Modal */}
      <AnimatePresence>
        {showDocModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => e.target === e.currentTarget && setShowDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>SÃ©lectionner un document (DÃ©mo)</h3>
                <button onClick={() => setShowDocModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#6B7280" /></button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loadingDocs ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
                ) : (citizenDocs?.length || 0) === 0 ? (
                  <div style={{ textAlign: 'center', color: '#6B7280', padding: '20px' }}>Aucun document trouvÃ©. Vous pouvez en crÃ©er dans votre Espace Citoyen.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(citizenDocs || []).map(doc => (
                      <div key={doc?._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{doc?.documentType}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>RÃ©f: {doc?.referenceNumber}</div>
                        </div>
                        <button 
                          onClick={() => handleSelectDemoDoc(doc)}
                          style={{ padding: '6px 12px', background: 'var(--vert-500)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          SÃ©lectionner
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Creator Modal */}
      <AnimatePresence>
        {showQuickCreator && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => e.target === e.currentTarget && setShowQuickCreator(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#164022', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={24} color="#16A34A" /> CrÃ©ation rapide : {quickDocType}
                  </h3>
                </div>
                <button onClick={() => setShowQuickCreator(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#6B7280" /></button>
              </div>

              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B' }}>
                <AlertTriangle size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>DOCUMENT FICTIF DESTINÃ‰ UNIQUEMENT Ã€ LA DÃ‰MONSTRATION</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                {(() => {
                  const template = getDocumentTemplate(quickDocType);

                  return (
                    <form id="quick-create-form" onSubmit={handleQuickCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>Type de document</label>
                        <input value={template?.title || quickDocType} disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#F3F4F6' }} />
                      </div>
                      
                      {(template?.fields || []).map((field, idx) => (
                        <div key={idx} style={{ gridColumn: (field?.type === 'textarea' || field?.type === 'file') ? '1 / -1' : 'auto' }}>
                          <label style={lStyle}>{field?.label || 'Champ'} {field?.required && '*'}</label>
                          {field?.type === 'select' ? (
                            <select
                              required={field?.required}
                              value={quickFormData?.[field?.name] ?? ''}
                              onChange={e => setQuickFormData(prev => ({ ...(prev || {}), [field?.name || 'unknown']: e.target.value }))}
                              style={iStyle}
                            >
                              <option value="">SÃ©lectionner...</option>
                              {(field?.options || []).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field?.type === 'file' ? (
                            <input
                              type="file"
                              required={field?.required}
                              accept="image/*,application/pdf"
                              onChange={e => {
                                try {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setQuickFormData(prev => ({ ...(prev || {}), [field?.name || 'fichier']: reader.result }));
                                    };
                                    reader.onerror = () => {
                                      console.error("Erreur FileReader sur le champ :", field?.name);
                                      showToast("Impossible de lire le fichier", "error");
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                } catch (err) {
                                  console.error("Erreur sur input file:", err);
                                }
                              }}
                              style={iStyle}
                            />
                          ) : field?.type === 'textarea' ? (
                            <textarea
                              required={field?.required}
                              placeholder={field?.placeholder || ''}
                              value={quickFormData?.[field?.name] ?? ''}
                              onChange={e => setQuickFormData(prev => ({ ...(prev || {}), [field?.name || 'unknown']: e.target.value }))}
                              style={{...iStyle, minHeight: '80px', resize: 'vertical'}}
                            />
                          ) : (
                            <input
                              type={field?.type || 'text'}
                              required={field?.required}
                              placeholder={field?.placeholder || ''}
                              value={quickFormData?.[field?.name] ?? ''}
                              onChange={e => setQuickFormData(prev => ({ ...(prev || {}), [field?.name || 'unknown']: e.target.value }))}
                              style={iStyle}
                            />
                          )}
                        </div>
                      ))}
                    </form>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowQuickCreator(false)} style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" form="quick-create-form" disabled={submittingQuick} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--vert-500)', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {submittingQuick ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={18} />}
                  GÃ©nÃ©rer et Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};


export default function NewRequest() {
  return (
    <ErrorBoundary>
      <NewRequestComponent />
    </ErrorBoundary>
  );
}
