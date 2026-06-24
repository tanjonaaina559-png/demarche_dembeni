import React, { useState } from 'react';
import api from '../services/api';
import './DynamicPdfForm.css';

const DynamicPdfForm = () => {
  const [type, setType] = useState('cni');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    adresse: '',
    nationalite: 'Française',
    nomUsage: '',
    lieuNaissance: '',
    telephone: '',
    email: '',
    nomParent: '',
    dureeResidence: ''
  });

  const [checkboxData, setCheckboxData] = useState({
    premiereDemande: false,
    renouvellement: false,
    perteVol: false,
    copieIntegrale: false,
    extraitFiliation: false,
    extraitSansFiliation: false,
    docPreuveId: false,
    docActeNaissance: false,
    docJustifDomicile: false,
    docTimbre: false,
    docDeclarationPerte: false,
    docAncienPass: false,
    docCni: false,
    docLivret: false
  });

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setCheckboxData({ ...checkboxData, [e.target.name]: e.target.checked });
  };

  const generatePDF = async () => {
    // Validation basique
    if (!userData.nom && !userData.nomParent) {
      setError('Veuillez remplir au moins le nom.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/pdf/generate', {
        type,
        userData,
        checkboxData
      }, {
        responseType: 'blob'
      });
      
      // Téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `formulaire-${type}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la génération du PDF. Assurez-vous que tous les champs requis sont remplis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dynamic-form-container">
      <div className="form-header text-center">
        <h2>Générateur de Formulaire Officiel</h2>
        <p>Générez un PDF dynamique basé sur le modèle officiel</p>
      </div>

      <div className="form-type-selector">
        <label>Type de document :</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="form-control">
          <option value="cni">Carte d'identité (CNI)</option>
          <option value="passeport">Passeport</option>
          <option value="naissance">Acte de naissance</option>
          <option value="residence">Certificat de résidence</option>
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-section">
        <h3>1. Informations du demandeur</h3>
        
        <div className="form-grid">
          {(type === 'cni' || type === 'passeport') && (
            <>
              <div className="form-group">
                <label>Nom de naissance *</label>
                <input type="text" name="nom" value={userData.nom} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Nationalité</label>
                <input type="text" name="nationalite" value={userData.nationalite} onChange={handleUserChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>Prénom(s) *</label>
                <input type="text" name="prenom" value={userData.prenom} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Date de naissance *</label>
                <input type="date" name="dateNaissance" value={userData.dateNaissance} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Lieu de naissance</label>
                <input type="text" name="lieuNaissance" value={userData.lieuNaissance} onChange={handleUserChange} className="form-control"/>
              </div>
              <div className="form-group">
                <label>Adresse *</label>
                <input type="text" name="adresse" value={userData.adresse} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" name="telephone" value={userData.telephone} onChange={handleUserChange} className="form-control"/>
              </div>
            </>
          )}

          {type === 'naissance' && (
            <>
              <div className="form-group">
                <label>Nom du parent *</label>
                <input type="text" name="nomParent" value={userData.nomParent} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Date naissance enfant *</label>
                <input type="date" name="dateNaissance" value={userData.dateNaissance} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Lieu naissance *</label>
                <input type="text" name="lieuNaissance" value={userData.lieuNaissance} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={userData.email} onChange={handleUserChange} className="form-control"/>
              </div>
            </>
          )}

          {type === 'residence' && (
            <>
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" name="nom" value={userData.nom} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Prénom(s) *</label>
                <input type="text" name="prenom" value={userData.prenom} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Adresse complète *</label>
                <input type="text" name="adresse" value={userData.adresse} onChange={handleUserChange} required className="form-control"/>
              </div>
              <div className="form-group">
                <label>Durée résidence *</label>
                <input type="text" name="dureeResidence" value={userData.dureeResidence} onChange={handleUserChange} required className="form-control" placeholder="ex: 5 ans"/>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>2. Motif de la demande</h3>
        <div className="checkbox-group">
          {(type === 'cni' || type === 'passeport') && (
            <>
              <label><input type="checkbox" name="premiereDemande" checked={checkboxData.premiereDemande} onChange={handleCheckboxChange}/> Première demande</label>
              <label><input type="checkbox" name="renouvellement" checked={checkboxData.renouvellement} onChange={handleCheckboxChange}/> Renouvellement</label>
              <label><input type="checkbox" name="perteVol" checked={checkboxData.perteVol} onChange={handleCheckboxChange}/> Perte ou vol</label>
            </>
          )}
          {type === 'naissance' && (
            <>
              <label><input type="checkbox" name="copieIntegrale" checked={checkboxData.copieIntegrale} onChange={handleCheckboxChange}/> Copie intégrale</label>
              <label><input type="checkbox" name="extraitFiliation" checked={checkboxData.extraitFiliation} onChange={handleCheckboxChange}/> Extrait avec filiation</label>
              <label><input type="checkbox" name="extraitSansFiliation" checked={checkboxData.extraitSansFiliation} onChange={handleCheckboxChange}/> Extrait sans filiation</label>
            </>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>3. Pièces justificatives</h3>
        <div className="checkbox-group">
          {type === 'cni' && (
            <>
              <label><input type="checkbox" name="docPreuveId" checked={checkboxData.docPreuveId} onChange={handleCheckboxChange}/> Preuve d'identité</label>
              <label><input type="checkbox" name="docActeNaissance" checked={checkboxData.docActeNaissance} onChange={handleCheckboxChange}/> Acte de naissance</label>
              <label><input type="checkbox" name="docJustifDomicile" checked={checkboxData.docJustifDomicile} onChange={handleCheckboxChange}/> Justificatif de domicile</label>
            </>
          )}
          {type === 'passeport' && (
            <>
              <label><input type="checkbox" name="docPreuveId" checked={checkboxData.docPreuveId} onChange={handleCheckboxChange}/> Preuve d'identité</label>
              <label><input type="checkbox" name="docActeNaissance" checked={checkboxData.docActeNaissance} onChange={handleCheckboxChange}/> Acte de naissance</label>
              <label><input type="checkbox" name="docJustifDomicile" checked={checkboxData.docJustifDomicile} onChange={handleCheckboxChange}/> Justificatif de domicile</label>
              <label><input type="checkbox" name="docTimbre" checked={checkboxData.docTimbre} onChange={handleCheckboxChange}/> Timbre fiscal</label>
              <label><input type="checkbox" name="docAncienPass" checked={checkboxData.docAncienPass} onChange={handleCheckboxChange}/> Ancien passeport</label>
            </>
          )}
        </div>
      </div>

      <div className="form-actions text-center" style={{ marginTop: '30px' }}>
        <button onClick={generatePDF} disabled={loading} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>
          {loading ? 'Génération en cours...' : 'Télécharger PDF officiel'}
        </button>
      </div>
    </div>
  );
};

export default DynamicPdfForm;
