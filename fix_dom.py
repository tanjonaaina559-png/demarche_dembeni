import re
with open('d:\\dembeni\\trae\\frontend\\src\\pages\\citizen\\NewRequest.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<AnimatePresence mode="wait">).*?(</AnimatePresence>)'
replacement = '''<AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onAnimationStart={() => console.log(`MOUNT STEP${currentStep}`)}
            onAnimationComplete={(def) => {
              if (def.opacity === 0) console.log(`UNMOUNT STEP${currentStep}`);
            }}
          >
            {/* STEP 1 : Procedure Selection */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#1F2937' }}>Choisissez votre démarche</h2>
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
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>Délai estimé: {p?.duration || 'Variable'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 : Dynamic Form */}
            {currentStep === 2 && (
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
                            if (nameLower.includes('téléphone') || nameLower.includes('telephone')) { inputType = 'tel'; extraProps = { pattern: '[0-9]*', maxLength: 20 }; }
                            else if (nameLower.includes('email')) { inputType = 'email'; }
                            else if (nameLower.includes('date')) { inputType = 'date'; }
                            else if (nameLower.includes('age') || nameLower.includes('âge')) { inputType = 'number'; extraProps = { min: 0, max: 120 }; }
                            else if (nameLower.includes('nombre') || nameLower.includes('quantité')) { inputType = 'number'; extraProps = { min: 1 }; }
                            else if (nameLower.includes('description') || nameLower.includes('motif') || nameLower.includes('commentaire')) { inputType = 'textarea'; }
                          }
                          return (
                            <div key={idx} style={{ gridColumn: inputType === 'textarea' ? '1 / -1' : 'auto' }}>
                              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                                {field?.label} {field?.required && <span style={{ color: '#DC2626' }}>*</span>}
                              </label>
                              {inputType === 'textarea' ? (
                                <textarea name={field?.name} value={formData[field?.name] || ''} onChange={handleFormDataChange} required={field?.required} rows="3" style={inputStyle} onInvalid={e => e.target.setCustomValidity('Ce champ est obligatoire')} onInput={e => e.target.setCustomValidity('')} {...extraProps} />
                              ) : inputType === 'select' ? (
                                <select name={field?.name} value={formData[field?.name] || ''} onChange={handleFormDataChange} required={field?.required} style={inputStyle} onInvalid={e => e.target.setCustomValidity('Ce champ est obligatoire')} onInput={e => e.target.setCustomValidity('')}>
                                  <option value="">Sélectionner...</option>
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
                        Aucune information supplémentaire n'est requise pour cette démarche. Cliquez sur Suivant.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>Chargement de la procédure...</div>
                )}
              </div>
            )}

            {/* STEP 3 : Uploads */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#1F2937' }}>Pièces justificatives</h2>

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
                          <li key={idx} style={{ marginBottom: '10px', background: 'white', padding: '10px', borderRadius: '8px', border: '1px dashed #A7F3D0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: (matches?.length || 0) > 0 ? '8px' : '0' }}>
                              <FileText size={16} color="#059669" />
                              <strong>{doc?.name}</strong>
                              {doc?.required
                                ? <span style={{ color: '#DC2626', fontSize: '0.8rem' }}>* (Obligatoire)</span>
                                : <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>(Optionnel)</span>}
                            </div>
                            {(matches?.length || 0) === 0 && doc?.required && (
                              <div style={{ paddingLeft: '24px', marginTop: '8px' }}>
                                <p style={{ margin: '0 0 5px', fontSize: '0.8rem', color: '#6B7280' }}>Je ne possède pas encore ce document :</p>
                                <button type="button" onClick={() => openQuickCreator(doc.name)} style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <Plus size={16} /> Créer rapidement
                                </button>
                              </div>
                            )}
                            {(matches?.length || 0) > 0 && (
                              <div style={{ paddingLeft: '24px' }}>
                                {(matches || []).map(m => (
                                  <button key={m?._id} type="button" onClick={() => handleSelectDemoDoc(m)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '8px', marginTop: '4px' }}>
                                    ✓ Utiliser {m?.documentType} enregistré
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
                    Aucune pièce justificative demandée pour cette démarche.
                  </div>
                )}

                <UploadDocument onUpload={(file) => addFile(file)} maxSizeMB={5} acceptedType=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf" />

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <button type="button" onClick={openDocModal} style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> Utiliser mes documents enregistrés
                  </button>
                </div>

                {(files?.length || 0) > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Documents prêts à l'envoi ({files?.length || 0})</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(files || []).map(({ id, file }) => (
                        <li key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '10px 15px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <FileText size={18} color="#6B7280" />
                            <span>{file?.name} ({((file?.size || 0) / 1024 / 1024).toFixed(2)} Mo)</span>
                          </div>
                          <button type="button" onClick={() => removeFile(id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>✖</button>
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
            )}

            {/* STEP 4 : Confirmation */}
            {currentStep === 4 && (
              <div>
                {(() => {
                  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                  const rawPdf = successData?.generatedPdf;
                  const pdfUrl = rawPdf
                    ? (rawPdf.startsWith('http') ? rawPdf : `${API_BASE}${rawPdf.replace(/\\\\/g, '/')}`)
                    : null;
                  return (
                    <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                      <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'white', boxShadow: '0 8px 20px rgba(16,185,129,0.35)' }}>
                        <CheckCircle size={36} />
                      </div>
                      <h2 style={{ color: '#111827', fontSize: '1.7rem', marginBottom: '8px' }}>Demande envoyée avec succès&nbsp;!</h2>
                      <p style={{ color: '#6B7280', fontSize: '1rem', marginBottom: '24px' }}>Votre dossier a bien été transmis aux services de la mairie.</p>

                      {/* Reference box */}
                      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px 24px', maxWidth: '380px', margin: '0 auto 28px' }}>
                        <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Numéro de suivi</p>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--vert-700)', letterSpacing: '2px', fontFamily: 'monospace' }}>
                          {successData?.referenceNumber || successData?._id || '---'}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: '4px 0 0' }}>Conservez ce numéro pour le suivi de votre demande</p>
                      </div>

                      {/* PDF Preview */}
                      {pdfUrl ? (
                        <div style={{ marginBottom: 24 }}>
                          <h4 style={{ fontSize: '1rem', color: '#1F2937', marginBottom: 12 }}>📄 Votre document généré</h4>
                          <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', maxWidth: 700, margin: '0 auto 16px', height: 400, background: '#F9FAFB' }}>
                            <object data={pdfUrl} type="application/pdf" width="100%" height="100%">
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 20 }}>
                                <FileText size={40} color="#D1D5DB" />
                                <p style={{ color: '#6B7280', margin: 0 }}>Aperçu non disponible dans ce navigateur.</p>
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
                          ℹ️ Aucun template PDF officiel disponible pour cette procédure. Un récépissé standard sera généré par la mairie.
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/mes-demandes" className="btn btn-primary" style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Suivre ma demande <ArrowRight size={18} />
                        </Link>
                        {pdfUrl && (
                          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download
                            className="btn btn-outline"
                            style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} /> Télécharger le PDF
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>'''

new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
if count > 0:
    with open('d:\\dembeni\\trae\\frontend\\src\\pages\\citizen\\NewRequest.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('SUCCESS')
else:
    print('FAILED')
