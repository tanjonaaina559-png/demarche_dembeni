const fs = require('fs');
let f = fs.readFileSync('src/pages/citizen/NewRequest.jsx', 'utf8');
f = f.replace(/showToast\([^)]*l.*?ajout[^)]*\);/g, `showToast("Erreur lors de l'ajout du document.", "error");`);
fs.writeFileSync('src/pages/citizen/NewRequest.jsx', f);
console.log("Fixed quote syntax");
