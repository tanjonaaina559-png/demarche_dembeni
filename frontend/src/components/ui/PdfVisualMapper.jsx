import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Plus, Trash2, Check, X } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const COMMON_FIELDS = [
  { label: 'Nom', value: 'nom' },
  { label: 'Prénom', value: 'prenom' },
  { label: 'Email', value: 'email' },
  { label: 'Téléphone', value: 'telephone' },
  { label: 'Adresse', value: 'adresse' },
  { label: 'Date de Naissance', value: 'dateNaissance' },
  { label: 'Lieu de Naissance', value: 'lieuNaissance' },
  { label: 'Date soumission', value: 'date_soumission' },
  { label: 'Référence', value: 'referenceNumber' }
];

const PdfVisualMapper = ({ pdfUrl, file, initialMapping = [], onSave, onCancel }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [mappings, setMappings] = useState(initialMapping || []);
  const [activeMapping, setActiveMapping] = useState(null); // The one currently being edited
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Parse mappings if it's string
  useEffect(() => {
    if (typeof initialMapping === 'string') {
      try {
        setMappings(JSON.parse(initialMapping));
      } catch (e) {
        setMappings([]);
      }
    } else {
      setMappings(initialMapping || []);
    }
  }, [initialMapping]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePdfClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const newMapping = {
      id: Date.now().toString(),
      key: '',
      x: Math.round(x),
      y: Math.round(y),
      page: pageNumber,
      size: 11,
      font: 'Helvetica',
      type: 'text',
      isNew: true
    };
    
    setMappings([...mappings, newMapping]);
    setActiveMapping(newMapping.id);
  };

  const updateMapping = (id, updates) => {
    setMappings(mappings.map(m => m.id === id ? { ...m, ...updates, isNew: false } : m));
  };

  const removeMapping = (id) => {
    setMappings(mappings.filter(m => m.id !== id));
    if (activeMapping === id) setActiveMapping(null);
  };

  const saveAll = () => {
    // Filter out incomplete mappings
    const valid = mappings.filter(m => m.key && m.key.trim() !== '');
    // Remove temporary IDs
    const clean = valid.map(({ id, isNew, ...rest }) => rest);
    onSave(clean);
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: '80vh' }}>
      {/* Sidebar Editor */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16, background: '#f9fafb', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb', overflowY: 'auto' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Mappage visuel</h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
          Cliquez sur le PDF pour ajouter un champ dynamique.
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} style={btnStyle}>Précédent</button>
          <span style={{ fontSize: '0.9rem', padding: '6px 0' }}>Page {pageNumber} / {numPages}</span>
          <button onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} disabled={pageNumber >= (numPages || 1)} style={btnStyle}>Suivant</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
          {mappings.filter(m => m.page === pageNumber).map((m, idx) => (
            <div key={m.id || idx} style={{ background: 'white', padding: 12, borderRadius: 8, border: activeMapping === m.id ? '2px solid #10b981' : '1px solid #d1d5db' }} onClick={() => setActiveMapping(m.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Champ #{idx + 1}</span>
                <button onClick={(e) => { e.stopPropagation(); removeMapping(m.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
              </div>
              <input 
                type="text" 
                placeholder="Clé (ex: nom, prenom)" 
                value={m.key} 
                onChange={(e) => updateMapping(m.id, { key: e.target.value })}
                style={{ width: '100%', padding: 6, marginBottom: 8, border: '1px solid #d1d5db', borderRadius: 4, boxSizing: 'border-box' }}
                list="common-fields"
              />
              <datalist id="common-fields">
                {COMMON_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </datalist>
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ fontSize: '0.75rem', flex: 1 }}>Taille (pt)
                  <input type="number" value={m.size || 12} onChange={(e) => updateMapping(m.id, { size: parseInt(e.target.value) || 12 })} style={{ width: '100%', padding: 4, marginTop: 2 }} />
                </label>
                <label style={{ fontSize: '0.75rem', flex: 1 }}>Police
                  <select value={m.font || 'Helvetica'} onChange={(e) => updateMapping(m.id, { font: e.target.value })} style={{ width: '100%', padding: 4, marginTop: 2 }}>
                    <option value="Helvetica">Normal</option>
                    <option value="Helvetica-Bold">Gras</option>
                  </select>
                </label>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 8 }}>x: {m.x}, y: {m.y}</div>
            </div>
          ))}
          {mappings.filter(m => m.page === pageNumber).length === 0 && (
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: 20 }}>Aucun champ sur cette page</div>
          )}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 10, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Annuler</button>
          <button onClick={saveAll} style={{ flex: 1, padding: 10, background: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Enregistrer</button>
        </div>
      </div>

      {/* PDF View */}
      <div style={{ flex: 1, overflow: 'auto', background: '#e5e7eb', borderRadius: 12, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <div ref={containerRef} style={{ position: 'relative', cursor: 'crosshair', height: 'max-content' }} onClick={handlePdfClick}>
          <Document file={file || pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<div style={{ padding: 40 }}>Chargement du PDF...</div>}>
            <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>

          {/* Markers */}
          {mappings.filter(m => m.page === pageNumber).map((m, idx) => (
            <div
              key={m.id || idx}
              style={{
                position: 'absolute',
                left: m.x * scale,
                top: m.y * scale,
                background: activeMapping === m.id ? '#10b981' : '#3b82f6',
                color: 'white',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: m.size * scale,
                transform: 'translate(0, -100%)', // Render above the point like text
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                fontWeight: m.font === 'Helvetica-Bold' ? 'bold' : 'normal',
                opacity: 0.8
              }}
            >
              {m.key || 'Nouveau champ'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const btnStyle = { padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: 'white', cursor: 'pointer' };

export default PdfVisualMapper;
