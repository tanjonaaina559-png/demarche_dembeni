const fs = require('fs');
let f = fs.readFileSync('src/pages/citizen/MesDocumentsNumeriques.jsx', 'utf8');
f = f.replace(/alert\(['"]Erreur lors de l.*?enregistrement['"]\);/g, 'alert("Erreur lors de l\\'enregistrement");');
fs.writeFileSync('src/pages/citizen/MesDocumentsNumeriques.jsx', f);
console.log("Fixed alert syntax");
