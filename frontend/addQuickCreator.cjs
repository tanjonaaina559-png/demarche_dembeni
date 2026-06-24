const fs = require('fs');

let f = fs.readFileSync('src/pages/citizen/NewRequest.jsx', 'utf8');

// 1. Add states for quick creator
const stateInsert = `  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

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

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    setSubmittingQuick(true);
    try {
      const payload = {
        documentType: quickDocType,
        formData: quickFormData
      };
      const res = await api.post('/citizen-documents', payload);
      const newDoc = res.data.document;
      
      // Télécharger le PDF et l'ajouter aux fichiers
      showToast('Création réussie. Téléchargement du PDF...', 'success');
      const pdfRes = await api.get(\`/citizen-documents/pdf/\${newDoc._id}\`, { responseType: 'blob' });
      const file = new File([pdfRes.data], \`\${newDoc.documentType}-\${newDoc.referenceNumber}.pdf\`, { type: 'application/pdf' });
      setFiles(prev => [...prev, file]);
      
      // Update citizenDocs so it shows as created
      setCitizenDocs(prev => [...prev, newDoc]);
      
      setShowQuickCreator(false);
      showToast('✓ Document généré et ajouté automatiquement à votre dossier.', 'success');
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la création du document.", "error");
    } finally {
      setSubmittingQuick(false);
    }
  };
`;
f = f.replace("  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });", stateInsert);

// 2. Change Optional/Required logic
const requiredCheck = `{doc?.required ? <span style={{ color: '#DC2626', fontSize: '0.8rem' }}>* (Obligatoire)</span> : <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>(Optionnel)</span>}`;
f = f.replace(`{doc?.required && <span style={{ color: '#DC2626', fontSize: '0.8rem' }}>* (Obligatoire)</span>}`, requiredCheck);

// 3. Add the Quick Create button block
const buttonBlock = `                          {matches.length === 0 && doc?.required && (
                            <div style={{ paddingLeft: '24px', marginTop: '8px' }}>
                               <p style={{ margin: '0 0 5px', fontSize: '0.8rem', color: '#6B7280' }}>Je ne possède pas encore ce document :</p>
                               <button type="button" onClick={() => openQuickCreator(doc.name)} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                 <Plus size={16} /> Créer rapidement
                               </button>
                            </div>
                          )}`;

f = f.replace(`{matches.length > 0 && (`, buttonBlock + `\n                          {matches.length > 0 && (`);

// 4. Add the Quick Creator Modal JSX at the end before </div>
const modalJSX = `      {/* Quick Creator Modal */}
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
                    <Shield size={24} color="#16A34A" /> Création rapide : {quickDocType}
                  </h3>
                </div>
                <button onClick={() => setShowQuickCreator(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#6B7280" /></button>
              </div>

              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B' }}>
                <AlertTriangle size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>DOCUMENT FICTIF DESTINÉ UNIQUEMENT À LA DÉMONSTRATION</span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                <form id="quick-create-form" onSubmit={handleQuickCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' }}>Type de document</label>
                  <input value={quickDocType} disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#F3F4F6' }} /></div>
                  
                  <div><label style={lStyle}>Nom *</label><input required value={quickFormData.nom} onChange={e => setQuickFormData({...quickFormData, nom: e.target.value})} style={iStyle}/></div>
                  <div><label style={lStyle}>Prénom *</label><input required value={quickFormData.prenom} onChange={e => setQuickFormData({...quickFormData, prenom: e.target.value})} style={iStyle}/></div>
                  <div><label style={lStyle}>Date de naissance *</label><input type="date" required value={quickFormData.dateNaissance} onChange={e => setQuickFormData({...quickFormData, dateNaissance: e.target.value})} style={iStyle}/></div>
                  <div><label style={lStyle}>Lieu de naissance *</label><input required value={quickFormData.lieuNaissance} onChange={e => setQuickFormData({...quickFormData, lieuNaissance: e.target.value})} style={iStyle}/></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={lStyle}>Adresse *</label><input required value={quickFormData.adresse} onChange={e => setQuickFormData({...quickFormData, adresse: e.target.value})} style={iStyle}/></div>
                  <div><label style={lStyle}>Téléphone</label><input type="tel" value={quickFormData.telephone} onChange={e => setQuickFormData({...quickFormData, telephone: e.target.value})} style={iStyle}/></div>
                  <div><label style={lStyle}>Nationalité</label><input value={quickFormData.nationalite} onChange={e => setQuickFormData({...quickFormData, nationalite: e.target.value})} style={iStyle}/></div>
                  <div><label style={lStyle}>Profession</label><input value={quickFormData.profession} onChange={e => setQuickFormData({...quickFormData, profession: e.target.value})} style={iStyle}/></div>
                  <div><label style={lStyle}>Nom du père</label><input value={quickFormData.nomPere} onChange={e => setQuickFormData({...quickFormData, nomPere: e.target.value})} style={iStyle}/></div>
                  <div><label style={lStyle}>Nom de la mère</label><input value={quickFormData.nomMere} onChange={e => setQuickFormData({...quickFormData, nomMere: e.target.value})} style={iStyle}/></div>
                </form>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowQuickCreator(false)} style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" form="quick-create-form" disabled={submittingQuick} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--vert-500)', color: 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {submittingQuick ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={18} />}
                  Générer et Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>`;

f = f.replace("    </div>\n  );\n};\n\nconst inputStyle = {", modalJSX + "\n  );\n};\n\nconst lStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '5px' };\nconst iStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' };\n\nconst inputStyle = {");

// Add missing lucide imports
f = f.replace("ArrowLeft, Info, FileDigit, X, Loader2", "ArrowLeft, Info, FileDigit, X, Loader2, Plus, Shield, AlertTriangle");

fs.writeFileSync('src/pages/citizen/NewRequest.jsx', f);
console.log('Update done');
