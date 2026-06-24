import React from 'react';
import './DocumentCard.css';

const DocumentCard = ({ title, date, size, url, status, onDelete, onValidate }) => {
  return (
    <div className="document-card premium-card">
      <div className="doc-icon">
        <i className="fas fa-file-pdf"></i>
      </div>
      <div className="doc-info">
        <h4 className="doc-title">{title}</h4>
        <div className="doc-meta">
          <span><i className="far fa-calendar-alt"></i> {date}</span>
          {size && <span><i className="fas fa-hdd"></i> {size}</span>}
        </div>
      </div>
      <div className="doc-status">
        {status === 'valide' && <span className="badge badge-vert">Validé</span>}
        {status === 'en_attente' && <span className="badge badge-jaune">En attente</span>}
        {status === 'rejete' && <span className="badge badge-rouge">Rejeté</span>}
      </div>
      <div className="doc-actions">
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-action view" title="Ouvrir">
          <i className="fas fa-external-link-alt"></i>
        </a>
        <a href={url} download className="btn-action download" title="Télécharger">
          <i className="fas fa-download"></i>
        </a>
        {onValidate && status === 'en_attente' && (
          <button onClick={onValidate} className="btn-action validate" title="Valider">
            <i className="fas fa-check"></i>
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="btn-action delete" title="Supprimer">
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
