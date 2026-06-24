const fs = require('fs');
let f = fs.readFileSync('src/pages/citizen/MesDocumentsNumeriques.jsx', 'utf8');

// The issue was: alert('Erreur lors de l\'enregistrement'); which turned into alert('Erreur lors de l\\'enregistrement'); or similar.
f = f.replace(/alert\('Erreur lors de l\\'enregistrement'\);/g, 'alert("Erreur lors de l\'enregistrement");');
f = f.replace(/alert\('Erreur lors de l'enregistrement'\);/g, 'alert("Erreur lors de l\'enregistrement");');
// Also fix the other potentially broken alerts
f = f.replace(/alert\('Erreur lors du téléchargement'\);/g, 'alert("Erreur lors du téléchargement");');
f = f.replace(/alert\('Erreur lors de la suppression'\);/g, 'alert("Erreur lors de la suppression");');

// Fix any encoding bugs like tAclAcchargement
f = f.replace(/tAclAcchargement/g, "téléchargement");

fs.writeFileSync('src/pages/citizen/MesDocumentsNumeriques.jsx', f);
console.log("Fixed syntax");
