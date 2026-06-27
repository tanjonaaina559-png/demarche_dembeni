import React from 'react';
import './PdfViewer.css';

const PdfViewer = ({ url, title }) => {
  return (
    <div className="pdf-viewer-container">
      <div className="pdf-header">
        <h4><i className="fas fa-file-pdf"></i> {title || 'Aperçu du document'}</h4>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
          <i className="fas fa-download"></i> Télécharger
        </a>
      </div>
      <div className="pdf-iframe-wrapper">
        <object 
          data={`${url}#toolbar=0`} 
          type="application/pdf"
          className="pdf-iframe"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--gris-600)' }}>Impossible d'afficher le PDF.</p>
            <button 
              onClick={() => window.open(url, '_blank')}
              style={{ background: 'var(--vert-600)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Ouvrir dans un nouvel onglet
            </button>
          </div>
        </object>
      </div>
    </div>
  );
};

export default PdfViewer;
