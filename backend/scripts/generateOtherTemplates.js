const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outDir = path.join(__dirname, '../templates');

const drawHeader = (doc, title) => {
  const PW = doc.page.width;
  const M = 40;
  
  doc.rect(M, 30, 80, 80).lineWidth(0.5).stroke('#ccc');
  doc.fontSize(8).fillColor('#000').text('RÉPUBLIQUE FRANÇAISE', M, 115, { width: 80, align: 'center' });
  doc.fontSize(7).text('DÉPARTEMENT DE MAYOTTE', M, 125, { width: 80, align: 'center' });
  doc.fontSize(8).font('Helvetica-Bold').text('COMMUNE DE DEMBÉNI', M, 135, { width: 80, align: 'center' });

  doc.rect(140, 50, 380, 40).fillAndStroke('#f0f0f0', '#000');
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000').text(title, 140, 62, { width: 380, align: 'center' });

  doc.fontSize(10).font('Helvetica').text('N° de référence : ', 350, 100);
};

const drawFooter = (doc, y, mapping) => {
  const PW = doc.page.width;
  const PH = doc.page.height;
  const M = 40;
  const IW = PW - 2 * M;

  doc.rect(M, y, IW, 20).fillAndStroke('#d9d9d9', '#000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text("VALIDATION ADMINISTRATIVE", M, y + 5, { width: IW, align: 'center' });
  
  y += 20;
  doc.rect(M, y, IW, 100).stroke('#000');
  
  doc.fontSize(10).font('Helvetica').text('Document délivré le : ', M + 10, y + 15);
  mapping.push({ key: 'date_validation', x: M + 120, y: PH - (y + 15) - 8, size: 10, font: 'Helvetica-Bold' });

  doc.text("Par l'Officier de l'État Civil (Délégation de signature) :", M + 10, y + 35);
  mapping.push({ key: 'agent', x: M + 10, y: PH - (y + 50) - 8, size: 10, font: 'Helvetica-Bold' });

  doc.text('Signature & Sceau :', M + 300, y + 15);
  doc.rect(M + 300, y + 30, 150, 60).stroke('#ccc');
};

const generateResidence = () => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.pipe(fs.createWriteStream(path.join(outDir, 'certificat-residence.pdf')));
  const mapping = [];
  const PW = doc.page.width, PH = doc.page.height, M = 40, IW = PW - 2 * M;

  drawHeader(doc, "CERTIFICAT DE RÉSIDENCE");
  mapping.push({ key: 'referenceNumber', x: 440, y: PH - 100 - 8, size: 10, font: 'Helvetica-Bold' });

  let y = 160;
  doc.fontSize(12).font('Helvetica').text("Le Maire de la Commune de Dembéni certifie que :", M, y);
  
  y += 30;
  doc.rect(M, y, IW, 150).stroke('#000');
  
  doc.fontSize(11).font('Helvetica-Bold').text('NOM :', M + 10, y + 20);
  mapping.push({ key: 'nom', x: M + 100, y: PH - (y + 20) - 8, size: 11, font: 'Helvetica' });
  
  doc.text('PRÉNOMS :', M + 10, y + 50);
  mapping.push({ key: 'prenom', x: M + 100, y: PH - (y + 50) - 8, size: 11, font: 'Helvetica' });

  doc.text('NÉ(E) LE :', M + 10, y + 80);
  mapping.push({ key: 'dateNaissance', x: M + 100, y: PH - (y + 80) - 8, size: 11, font: 'Helvetica' });

  doc.text('À :', M + 250, y + 80);
  mapping.push({ key: 'lieuNaissance', x: M + 280, y: PH - (y + 80) - 8, size: 11, font: 'Helvetica' });

  doc.text('RÉSIDE À :', M + 10, y + 110);
  mapping.push({ key: 'adresse', x: M + 100, y: PH - (y + 110) - 8, size: 11, font: 'Helvetica' });

  y += 180;
  doc.fontSize(11).font('Helvetica').text("Est domicilié(e) dans la commune de Dembéni à l'adresse susmentionnée.", M, y);

  y += 150;
  drawFooter(doc, y, mapping);

  doc.end();
  fs.writeFileSync(path.join(outDir, 'certificat-residence.json'), JSON.stringify(mapping, null, 2));
  console.log('certificat-residence generated');
};

const generateMariage = () => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.pipe(fs.createWriteStream(path.join(outDir, 'mariage.pdf')));
  const mapping = [];
  const PW = doc.page.width, PH = doc.page.height, M = 40, IW = PW - 2 * M;

  drawHeader(doc, "EXTRAIT D'ACTE DE MARIAGE");
  mapping.push({ key: 'referenceNumber', x: 440, y: PH - 100 - 8, size: 10, font: 'Helvetica-Bold' });

  let y = 160;
  doc.rect(M, y, IW, 20).fillAndStroke('#d9d9d9', '#000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text("INFORMATIONS SUR LE MARIAGE", M, y + 5, { width: IW, align: 'center' });
  
  y += 20;
  doc.rect(M, y, IW, 140).stroke('#000');
  
  doc.fontSize(10).font('Helvetica-Bold').text('DATE DU MARIAGE :', M + 10, y + 20);
  mapping.push({ key: 'date_mariage', x: M + 150, y: PH - (y + 20) - 8, size: 10, font: 'Helvetica' });

  doc.text('ÉPOUX :', M + 10, y + 50);
  mapping.push({ key: 'epoux_nom', x: M + 150, y: PH - (y + 50) - 8, size: 10, font: 'Helvetica' });

  doc.text('ÉPOUSE :', M + 10, y + 80);
  mapping.push({ key: 'epouse_nom', x: M + 150, y: PH - (y + 80) - 8, size: 10, font: 'Helvetica' });

  doc.text('RÉGIME MATRIMONIAL :', M + 10, y + 110);
  mapping.push({ key: 'regime', x: M + 150, y: PH - (y + 110) - 8, size: 10, font: 'Helvetica' });

  y += 180;
  drawFooter(doc, y, mapping);

  doc.end();
  fs.writeFileSync(path.join(outDir, 'mariage.json'), JSON.stringify(mapping, null, 2));
  console.log('mariage generated');
};

const generateDeces = () => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.pipe(fs.createWriteStream(path.join(outDir, 'deces.pdf')));
  const mapping = [];
  const PW = doc.page.width, PH = doc.page.height, M = 40, IW = PW - 2 * M;

  drawHeader(doc, "EXTRAIT D'ACTE DE DÉCÈS");
  mapping.push({ key: 'referenceNumber', x: 440, y: PH - 100 - 8, size: 10, font: 'Helvetica-Bold' });

  let y = 160;
  doc.rect(M, y, IW, 20).fillAndStroke('#d9d9d9', '#000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text("INFORMATIONS SUR LE DÉFUNT", M, y + 5, { width: IW, align: 'center' });
  
  y += 20;
  doc.rect(M, y, IW, 140).stroke('#000');
  
  doc.fontSize(10).font('Helvetica-Bold').text('NOM :', M + 10, y + 20);
  mapping.push({ key: 'nom', x: M + 150, y: PH - (y + 20) - 8, size: 10, font: 'Helvetica' });

  doc.text('PRÉNOMS :', M + 10, y + 50);
  mapping.push({ key: 'prenom', x: M + 150, y: PH - (y + 50) - 8, size: 10, font: 'Helvetica' });

  doc.text('DATE DU DÉCÈS :', M + 10, y + 80);
  mapping.push({ key: 'date_deces', x: M + 150, y: PH - (y + 80) - 8, size: 10, font: 'Helvetica' });

  doc.text('LIEU DU DÉCÈS :', M + 10, y + 110);
  mapping.push({ key: 'lieu_deces', x: M + 150, y: PH - (y + 110) - 8, size: 10, font: 'Helvetica' });

  y += 180;
  drawFooter(doc, y, mapping);

  doc.end();
  fs.writeFileSync(path.join(outDir, 'deces.json'), JSON.stringify(mapping, null, 2));
  console.log('deces generated');
};

generateResidence();
generateMariage();
generateDeces();
