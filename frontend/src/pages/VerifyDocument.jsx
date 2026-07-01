import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, FileText, User, Calendar, Hash, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import './VerifyDocument.css';

const VerifyDocument = () => {
  const { reference } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyDoc = async () => {
      try {
        // Use standard axios instance for API call
        const response = await api.get(`/requests/verify/${reference}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Document introuvable ou invalide.');
      } finally {
        setLoading(false);
      }
    };
    if (reference) verifyDoc();
  }, [reference]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-header">
          <img src="/logo-dembeni.png" alt="Mairie de Dembéni" className="verify-logo" onError={(e) => { e.target.style.display='none' }} />
          <h1>Vérification d'Authenticité</h1>
          <p>Portail de la Mairie de Dembéni</p>
        </div>

        <div className="verify-body">
          {loading ? (
            <div className="verify-loading">
              <div className="spinner"></div>
              <p>Vérification en cours...</p>
            </div>
          ) : error ? (
            <div className="verify-error">
              <ShieldAlert size={48} color="#EF4444" />
              <h2>Document Non Reconnu</h2>
              <p>{error}</p>
              <div className="verify-warning">
                Ce document n'a pas été trouvé dans notre registre ou n'a pas encore été validé. 
                Veuillez vérifier la référence ou contacter l'administration.
              </div>
            </div>
          ) : (
            <div className="verify-success">
              <div className="verify-badge">
                <ShieldCheck size={48} color="#10B981" />
                <h2>Document Valide et Authentique</h2>
              </div>
              
              <div className="verify-details">
                <div className="detail-row">
                  <span className="detail-label"><Hash size={16} /> Référence</span>
                  <span className="detail-value reference">{data.reference}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><FileText size={16} /> Type de document</span>
                  <span className="detail-value">{data.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><User size={16} /> Bénéficiaire</span>
                  <span className="detail-value beneficiary">{data.citizen}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label"><Calendar size={16} /> Date de validation</span>
                  <span className="detail-value">
                    {new Date(data.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="verify-footer-note">
                Document certifié par la plateforme numérique de la Mairie de Dembéni.
              </div>
            </div>
          )}
        </div>
        
        <div className="verify-footer">
          <Link to="/" className="verify-back">
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyDocument;
