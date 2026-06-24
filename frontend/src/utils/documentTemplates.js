export const getDocumentTemplate = (documentName) => {
  const name = (documentName || '').toLowerCase();

  if (name.includes('acte naissance') || name.includes('acte de naissance')) {
    return {
      title: "Acte de naissance",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom", type: "text", required: true },
        { name: "prenom", label: "Prénom", type: "text", required: true },
        { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "lieuNaissance", label: "Lieu de naissance", type: "text", required: true },
        { name: "nomPere", label: "Nom du père", type: "text", required: false },
        { name: "nomMere", label: "Nom de la mère", type: "text", required: false }
      ]
    };
  }
  if (name.includes('acte décès') || name.includes('acte de décès')) {
    return {
      title: "Acte de décès",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom du défunt", type: "text", required: true },
        { name: "prenom", label: "Prénom du défunt", type: "text", required: true },
        { name: "dateDeces", label: "Date décès", type: "date", required: true },
        { name: "lieuDeces", label: "Lieu décès", type: "text", required: true },
        { name: "nomDeclarant", label: "Nom déclarant", type: "text", required: true }
      ]
    };
  }
  if (name.includes('vaccination')) {
    return {
      title: "Carnet de vaccination",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom de l'enfant", type: "text", required: true },
        { name: "prenom", label: "Prénom", type: "text", required: true },
        { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "sexe", label: "Sexe", type: "select", options: ["Masculin", "Féminin"], required: true },
        { name: "nomPere", label: "Nom du père", type: "text", required: false },
        { name: "nomMere", label: "Nom de la mère", type: "text", required: false }
      ]
    };
  }
  if (name.includes('photo identité') || name.includes("photo d'identité")) {
    return {
      title: "Photo d'identité",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom", type: "text", required: true },
        { name: "prenom", label: "Prénom", type: "text", required: true },
        { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "sexe", label: "Sexe", type: "select", options: ["Masculin", "Féminin"], required: true },
        { name: "photo", label: "Photo d'identité", type: "file", required: true }
      ]
    };
  }
  if (name.includes('cni') || name.includes('carte d\'identité') || name.includes('carte nationale')) {
    return {
      title: "Carte Nationale d'Identité",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom", type: "text", required: true },
        { name: "prenom", label: "Prénom", type: "text", required: true },
        { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "lieuNaissance", label: "Lieu de naissance", type: "text", required: true },
        { name: "adresse", label: "Adresse", type: "text", required: true },
        { name: "telephone", label: "Téléphone", type: "tel", required: false, placeholder: "Optionnel" },
        { name: "cin", label: "CIN", type: "text", required: false, placeholder: "Optionnel (18 ans et plus)" },
        { name: "nationalite", label: "Nationalité", type: "text", required: false },
        { name: "nomPere", label: "Nom du père", type: "text", required: false },
        { name: "nomMere", label: "Nom de la mère", type: "text", required: false }
      ]
    };
  }
  if (name.includes('passeport')) {
    return {
      title: "Passeport",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom", type: "text", required: true },
        { name: "prenom", label: "Prénom", type: "text", required: true },
        { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "lieuNaissance", label: "Lieu de naissance", type: "text", required: true },
        { name: "nationalite", label: "Nationalité", type: "text", required: true }
      ]
    };
  }
  if (name.includes('livret famille') || name.includes('livret de famille')) {
    return {
      title: "Livret de famille",
      documentType: documentName,
      fields: [
        { name: "nomPere", label: "Nom époux", type: "text", required: true },
        { name: "prenomPere", label: "Prénom époux", type: "text", required: true },
        { name: "nomMere", label: "Nom épouse", type: "text", required: true },
        { name: "prenomMere", label: "Prénom épouse", type: "text", required: true },
        { name: "dateMariage", label: "Date mariage", type: "date", required: true },
        { name: "adresse", label: "Adresse", type: "text", required: true }
      ]
    };
  }
  if (name.includes('titre foncier')) {
    return {
      title: "Titre foncier",
      documentType: documentName,
      fields: [
        { name: "nomProprietaire", label: "Nom propriétaire", type: "text", required: true },
        { name: "adresseTerrain", label: "Adresse terrain", type: "text", required: true },
        { name: "surface", label: "Surface", type: "text", required: true },
        { name: "referenceCadastrale", label: "Référence cadastrale", type: "text", required: true }
      ]
    };
  }
  if (name.includes('plan terrain')) {
    return {
      title: "Plan terrain",
      documentType: documentName,
      fields: [
        { name: "nomProprietaire", label: "Nom propriétaire", type: "text", required: true },
        { name: "quartier", label: "Quartier", type: "text", required: true },
        { name: "numeroParcelle", label: "Numéro parcelle", type: "text", required: true },
        { name: "surface", label: "Surface", type: "text", required: true }
      ]
    };
  }
  if (name.includes('permis')) {
    return {
      title: "Permis",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom", type: "text", required: true },
        { name: "prenom", label: "Prénom", type: "text", required: true },
        { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "categorie", label: "Catégorie", type: "text", required: true }
      ]
    };
  }
  if (name.includes('encombrant')) {
    return {
      title: "Photo des encombrants",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom citoyen", type: "text", required: true },
        { name: "adresse", label: "Adresse", type: "text", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "observations", label: "Observations", type: "textarea", required: false },
        { name: "photo", label: "Photo du dépôt", type: "file", required: true }
      ]
    };
  }
  if (name.includes('domicile')) {
    return {
      title: "Justificatif de domicile",
      documentType: documentName,
      fields: [
        { name: "nom", label: "Nom", type: "text", required: true },
        { name: "prenom", label: "Prénom", type: "text", required: true },
        { name: "adresse", label: "Adresse", type: "text", required: true },
        { name: "quartier", label: "Quartier", type: "text", required: true },
        { name: "commune", label: "Commune", type: "text", required: true },
        { name: "telephone", label: "Téléphone (facultatif)", type: "tel", required: false, placeholder: "Optionnel" }
      ]
    };
  }

  // FALLBACK UNIVERSEL
  return {
    title: documentName || "Document",
    documentType: documentName || "Document",
    fields: [
      { name: "nom", label: "Nom", type: "text", required: true },
      { name: "prenom", label: "Prénom", type: "text", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "fichier", label: "Téléchargement image ou PDF", type: "file", required: true }
    ]
  };
};
