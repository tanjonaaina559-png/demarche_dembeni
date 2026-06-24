const fs = require('fs');
let f = fs.readFileSync('src/pages/citizen/NewRequest.jsx', 'utf8');

const regex = /const handleQuickCreate = async \(e\) => \{[\s\S]*?finally \{\s*setSubmittingQuick\(false\);\s*\}\s*\};/;

const replacement = `const handleQuickCreate = async (e) => {
    e.preventDefault();

    if (!quickFormData?.nom || !quickFormData?.prenom || !quickFormData?.dateNaissance) {
      showToast("Veuillez remplir les champs obligatoires", "error");
      return;
    }

    setSubmittingQuick(true);
    console.log("Generating document...");
    try {
      const payload = {
        documentType: quickDocType,
        formData: quickFormData
      };
      const res = await api.post('/citizen-documents', payload);
      console.log("API RESPONSE", res);
      console.log(res?.data);
      console.log(res?.data?.document);
      
      const newDoc = res?.data?.document;
      if (!newDoc) throw new Error("Document introuvable dans la réponse");
      
      if (res?.data?.pdfError) {
        showToast('Document créé sans PDF', 'warning');
      } else {
        showToast('Création réussie. Téléchargement du PDF...', 'success');
        const pdfRes = await api.get(\`/citizen-documents/pdf/\${newDoc?._id}\`, { responseType: 'blob' });
        
        if (pdfRes?.data) {
          const file = new File([pdfRes.data], \`\${newDoc?.documentType}-\${newDoc?.referenceNumber || 'demo'}.pdf\`, { type: 'application/pdf' });
          setFiles(prev => [...(prev || []), file]);
        }
      }
      
      setCitizenDocs(prev => [...(prev || []), newDoc]);
      
      setShowQuickCreator(false);
      if (!res?.data?.pdfError) showToast('Document généré et ajouté avec succès', 'success');
    } catch (err) {
      console.error(err);
      showToast(err?.message || "Erreur lors de la génération du document", "error");
    } finally {
      setSubmittingQuick(false);
    }
  };`;

if (!regex.test(f)) {
  console.log('Regex failed to match');
} else {
  f = f.replace(regex, replacement);
  fs.writeFileSync('src/pages/citizen/NewRequest.jsx', f);
  console.log('Fixed handleQuickCreate');
}
