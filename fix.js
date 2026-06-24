const fs = require('fs');

let pdfController = fs.readFileSync('backend/controllers/pdfController.js', 'utf8');
pdfController = pdfController.replace(/\\\`/g, '\`');
pdfController = pdfController.replace(/\\\$/g, '$');
fs.writeFileSync('backend/controllers/pdfController.js', pdfController);

let dynamicPdf = fs.readFileSync('frontend/src/pages/DynamicPdfForm.jsx', 'utf8');
dynamicPdf = dynamicPdf.replace(/\\\`/g, '\`');
dynamicPdf = dynamicPdf.replace(/\\\$/g, '$');
fs.writeFileSync('frontend/src/pages/DynamicPdfForm.jsx', dynamicPdf);
console.log('Fixed');
