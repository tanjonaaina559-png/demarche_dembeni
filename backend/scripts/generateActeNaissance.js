const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outDir = path.join(__dirname, '../templates');

const generateActeNaissance = () => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.pipe(fs.createWriteStream(path.join(outDir, 'acte-naissance.pdf')));

  const PW = doc.page.width;
  const PH = doc.page.height;
  const mapping = [];

  const M = 40;
  const IW = PW - 2 * M;

  // --- Header ---
  doc.rect(M, 30, 80, 80).lineWidth(0.5).stroke('#ccc');
  doc.fontSize(8).fillColor('#000').text('RÉPUBLIQUE FRANÇAISE', M, 115, { width: 80, align: 'center' });
  doc.fontSize(7).text('DÉPARTEMENT DE MAYOTTE', M, 125, { width: 80, align: 'center' });
  doc.fontSize(8).font('Helvetica-Bold').text('COMMUNE DE DEMBÉNI', M, 135, { width: 80, align: 'center' });

  // Title Box
  doc.rect(140, 50, 380, 40).fillAndStroke('#f0f0f0', '#000');
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000').text("EXTRAIT D'ACTE DE NAISSANCE", 140, 62, { width: 380, align: 'center' });

  doc.fontSize(10).font('Helvetica').text('N° de référence : ', 350, 100);
  mapping.push({ key: 'referenceNumber', x: 440, y: PH - 100 - 8, size: 10, font: 'Helvetica-Bold' });

  let y = 160;
  doc.rect(M, y, IW, 20).fillAndStroke('#d9d9d9', '#000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text("INFORMATIONS SUR LA PERSONNE CONCERNÉE", M, y + 5, { width: IW, align: 'center' });

  y += 20;
  doc.rect(M, y, IW, 90).stroke('#000');
  
  doc.fontSize(10).font('Helvetica-Bold').text('NOM :', M + 10, y + 15);
  mapping.push({ key: 'nom', x: M + 150, y: PH - (y + 15) - 8, size: 10, font: 'Helvetica' });
  
  doc.text('PRÉNOMS :', M + 10, y + 35);
  mapping.push({ key: 'prenom', x: M + 150, y: PH - (y + 35) - 8, size: 10, font: 'Helvetica' });

  doc.text('DATE DE NAISSANCE :', M + 10, y + 55);
  mapping.push({ key: 'dateNaissance', x: M + 150, y: PH - (y + 55) - 8, size: 10, font: 'Helvetica' });

  doc.text('LIEU DE NAISSANCE :', M + 10, y + 75);
  mapping.push({ key: 'lieuNaissance', x: M + 150, y: PH - (y + 75) - 8, size: 10, font: 'Helvetica' });

  y += 110;
  doc.rect(M, y, IW, 20).fillAndStroke('#d9d9d9', '#000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text("FILIATION - PÈRE", M, y + 5, { width: IW, align: 'center' });
  
  y += 20;
  doc.rect(M, y, IW, 50).stroke('#000');
  doc.fontSize(10).font('Helvetica-Bold').text('NOM ET PRÉNOMS :', M + 10, y + 15);
  mapping.push({ key: 'pere_nom_complet', x: M + 150, y: PH - (y + 15) - 8, size: 10, font: 'Helvetica' });
  
  doc.text('PROFESSION :', M + 10, y + 35);
  mapping.push({ key: 'pere_profession', x: M + 150, y: PH - (y + 35) - 8, size: 10, font: 'Helvetica' });

  y += 70;
  doc.rect(M, y, IW, 20).fillAndStroke('#d9d9d9', '#000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text("FILIATION - MÈRE", M, y + 5, { width: IW, align: 'center' });
  
  y += 20;
  doc.rect(M, y, IW, 50).stroke('#000');
  doc.fontSize(10).font('Helvetica-Bold').text('NOM ET PRÉNOMS :', M + 10, y + 15);
  mapping.push({ key: 'mere_nom_complet', x: M + 150, y: PH - (y + 15) - 8, size: 10, font: 'Helvetica' });
  
  doc.text('PROFESSION :', M + 10, y + 35);
  mapping.push({ key: 'mere_profession', x: M + 150, y: PH - (y + 35) - 8, size: 10, font: 'Helvetica' });

  y += 70;
  doc.rect(M, y, IW, 20).fillAndStroke('#d9d9d9', '#000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text("MENTIONS MARGINALES", M, y + 5, { width: IW, align: 'center' });
  
  y += 20;
  doc.rect(M, y, IW, 60).stroke('#000');
  mapping.push({ key: 'mentions', x: M + 10, y: PH - (y + 15) - 8, size: 10, font: 'Helvetica' });

  y += 80;
  doc.rect(M, y, IW, 20).fillAndStroke('#d9d9d9', '#000');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text("VALIDATION ADMINISTRATIVE", M, y + 5, { width: IW, align: 'center' });
  
  y += 20;
  doc.rect(M, y, IW, 100).stroke('#000');
  
  doc.fontSize(10).font('Helvetica').text('Extrait délivré le : ', M + 10, y + 15);
  mapping.push({ key: 'date_validation', x: M + 110, y: PH - (y + 15) - 8, size: 10, font: 'Helvetica-Bold' });

  doc.text("Par l'Officier de l'État Civil (Délégation de signature) :", M + 10, y + 35);
  mapping.push({ key: 'agent', x: M + 10, y: PH - (y + 50) - 8, size: 10, font: 'Helvetica-Bold' });

  doc.text('Signature & Sceau :', M + 300, y + 15);
  doc.rect(M + 300, y + 30, 150, 60).stroke('#ccc');

  doc.end();
  fs.writeFileSync(path.join(outDir, 'acte-naissance.json'), JSON.stringify(mapping, null, 2));
  console.log('acte-naissance.pdf and json generated successfully!');
};

generateActeNaissance();
