const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outDir = path.join(__dirname, '../templates');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helper to save mapping
const saveMapping = (filename, mapping) => {
  const name = filename.replace('.pdf', '.json');
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(mapping, null, 2));
};

const drawDottedLine = (doc, x, y, width) => {
  doc.save().moveTo(x, y).lineTo(x + width, y).dash(2, { space: 2 }).strokeColor('#aaaaaa').stroke().restore();
};

const generateCrecheTemplate = () => {
  const filename = 'creche.pdf';
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(fs.createWriteStream(path.join(outDir, filename)));

  const M = 40;
  const PW = doc.page.width;
  const IW = PW - 2 * M;
  const mapping = [];

  doc.fontSize(8).fillColor('#666').text('(Imprimé N°1)', M, M, { align: 'right' });
  doc.rect(M, M, 60, 60).stroke();
  doc.fontSize(8).fillColor('#000').text('MAIRIE DE DEMBÉNI', M, M + 65, { width: 60, align: 'center' });

  doc.fontSize(16).font('Helvetica-Bold').text('Fiche de pré-inscription\nde demande de place en crèche\ncollective ou familiale', M + 80, M + 10, { width: IW - 80, align: 'center' });

  let y = M + 90;
  doc.rect(M, y, IW, 20).stroke();
  doc.fontSize(10).font('Helvetica-Bold').text('Les places en crèche sont réservées aux enfants dont les parents ont leur résidence principale à Dembéni', M, y + 6, { width: IW, align: 'center' });
  y += 30;

  doc.fontSize(9).font('Helvetica').text('Attention : ', M, y, { continued: true, underline: true }).font('Helvetica').text('Les formalités administratives...', { underline: false });
  y += 45;

  doc.fontSize(11).font('Helvetica-Bold').text('LA FAMILLE :', M, y, { underline: true });
  y += 15;

  const boxW = (IW - 10) / 2;
  doc.rect(M, y, boxW, 140).stroke();
  doc.rect(M + boxW + 10, y, boxW, 140).stroke();

  const drawResp = (x, title, prefix) => {
    let ty = y + 10;
    doc.fontSize(10).font('Helvetica-Bold').text(title, x, ty, { width: boxW, align: 'center' });
    ty += 20;
    
    doc.fontSize(9).font('Helvetica').text('Civilité :', x + 10, ty);
    // Placeholder civilité
    mapping.push({ key: `${prefix}_civilite`, x: x + 60, y: doc.page.height - ty - 8, size: 9, placeholder: `{{${prefix}_civilite}}` });
    ty += 15;
    
    const fields = [
      { label: 'Nom', key: 'nom' },
      { label: 'Nom de naissance', key: 'nom_naissance' },
      { label: 'Prénom', key: 'prenom' },
      { label: 'Adresse mail', key: 'email' },
      { label: 'Téléphone', key: 'telephone' },
      { label: 'Adresse', key: 'adresse' }
    ];
    
    fields.forEach(f => {
      doc.text(`${f.label} :`, x + 10, ty);
      drawDottedLine(doc, x + 90, ty + 8, boxW - 100);
      mapping.push({ key: `${prefix}_${f.key}`, x: x + 95, y: doc.page.height - ty - 8, size: 9, placeholder: `{{${prefix}_${f.key}}}` });
      ty += 15;
    });
  };

  drawResp(M, 'Responsable légal 1', 'resp1');
  drawResp(M + boxW + 10, 'Responsable légal 2', 'resp2');

  y += 155;

  doc.fontSize(11).font('Helvetica-Bold').text("L'ENFANT A NAÎTRE :", M, y, { underline: true });
  y += 15;
  doc.fontSize(9).font('Helvetica').text('Date de naissance prévue le ', M, y);
  drawDottedLine(doc, M + 130, y + 8, 200);
  mapping.push({ key: 'enfant_date_naissance', x: M + 135, y: doc.page.height - y - 8, size: 9, placeholder: '{{enfant_date_naissance}}' });

  y += 25;

  doc.fontSize(11).font('Helvetica-Bold').text("LES AUTRES ENFANTS DU FOYER (à charge) :", M, y, { underline: true });
  y += 15;
  doc.fontSize(9).font('Helvetica').text('Nom(s) et prénom(s) / Date(s) de naissance / Structure(s) fréquentée(s)', M, y);
  y += 15;
  for (let i = 0; i < 4; i++) {
    drawDottedLine(doc, M, y + 8, IW);
    mapping.push({ key: `autre_enfant_${i+1}`, x: M + 5, y: doc.page.height - y - 8, size: 9, placeholder: `{{autre_enfant_${i+1}}}` });
    y += 15;
  }

  y += 10;
  doc.rect(M, y, IW, 40).fill('#f3f4f6');
  doc.fillColor('#000').fontSize(9).font('Helvetica-Bold').text('Pièces obligatoires à fournir :', M + 10, y + 8);
  doc.font('Helvetica').text('•    Justificatif de domicile datant de moins de 3 mois', M + 10, y + 20);
  doc.text('•    Justificatif de grossesse', M + 10, y + 30);

  y += 55;
  doc.fontSize(9).font('Helvetica').text('Date :', M, y);
  mapping.push({ key: 'date_soumission', x: M + 35, y: doc.page.height - y - 8, size: 9, placeholder: '{{date_soumission}}' });
  y += 20;

  doc.text('Signature Responsable légal 1 :', M, y);
  doc.text('Signature Responsable légal 2 :', M + boxW + 10, y);
  y += 10;
  doc.rect(M, y, boxW - 20, 60).stroke();
  doc.rect(M + boxW + 10, y, boxW - 20, 60).stroke();

  y += 75;
  doc.fontSize(6).fillColor('#666').text("INFORMATION CONCERNANT VOS DONNÉES...", M, y, { width: IW });

  doc.end();
  saveMapping(filename, mapping);
  console.log(`Template ${filename} + mapping JSON generated.`);
};

const generateGenericTemplate = (title, filename) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(fs.createWriteStream(path.join(outDir, filename)));

  const M = 50;
  const PW = doc.page.width;
  const IW = PW - 2 * M;
  const mapping = [];

  doc.save().fillOpacity(0.06).fontSize(52).fillColor('#0D1B4B').rotate(-40, { origin: [PW / 2, doc.page.height / 2] }).text('DOCUMENT OFFICIEL', 40, doc.page.height / 2 - 25, { width: PW - 80, align: 'center' }).restore();

  doc.fontSize(16).font('Helvetica-Bold').fillColor('#000').text('MAIRIE DE DEMBÉNI', M, M);
  doc.fontSize(10).font('Helvetica').fillColor('#666').text('République Française | Département de Mayotte', M, M + 20);
  doc.rect(M, M + 45, IW, 2).fill('#1E40AF');

  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1E40AF').text(title.toUpperCase(), M, M + 70, { width: IW, align: 'center' });

  doc.rect(M, M + 110, IW, 30).fill('#f8fafc');
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text('RÉFÉRENCE DOSSIER :', M + 10, M + 120);
  mapping.push({ key: 'referenceNumber', x: M + 150, y: doc.page.height - (M + 120) - 10, size: 11, font: 'Helvetica-Bold', placeholder: '{{referenceNumber}}' });

  let y = M + 160;

  doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS DU DEMANDEUR', M, y);
  doc.rect(M, y + 15, IW, 1).fill('#e2e8f0');
  y += 30;

  doc.fontSize(10).font('Helvetica-Bold').text('Nom :', M, y);
  mapping.push({ key: 'nom', x: M + 100, y: doc.page.height - y - 10, size: 10, placeholder: '{{nom}}' }); y += 20;

  doc.font('Helvetica-Bold').text('Prénom :', M, y);
  mapping.push({ key: 'prenom', x: M + 100, y: doc.page.height - y - 10, size: 10, placeholder: '{{prenom}}' }); y += 20;

  doc.font('Helvetica-Bold').text('Adresse :', M, y);
  mapping.push({ key: 'adresse', x: M + 100, y: doc.page.height - y - 10, size: 10, placeholder: '{{adresse}}' }); y += 40;

  doc.fontSize(12).font('Helvetica-Bold').text('DÉTAILS DE LA DEMANDE', M, y);
  doc.rect(M, y + 15, IW, 1).fill('#e2e8f0');
  y += 30;

  doc.fontSize(10).font('Helvetica-Bold').text('Date de demande :', M, y);
  mapping.push({ key: 'date_soumission', x: M + 120, y: doc.page.height - y - 10, size: 10, placeholder: '{{date_demande}}' }); y += 20;

  doc.font('Helvetica-Bold').text('Date de validation :', M, y);
  mapping.push({ key: 'date_validation', x: M + 120, y: doc.page.height - y - 10, size: 10, placeholder: '{{date_validation}}' }); y += 40;

  doc.undash();
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000').text('SIGNATURE OFFICIELLE', M + IW - 150, y);
  doc.font('Helvetica').text('L\'Agent de l\'État Civil', M + IW - 150, y + 15);
  doc.rect(M + IW - 150, y + 35, 130, 60).stroke();

  doc.end();
  saveMapping(filename, mapping);
  console.log(`Template ${filename} + mapping JSON generated.`);
};

generateCrecheTemplate();
generateGenericTemplate('Acte de Naissance', 'acte-naissance.pdf');
generateGenericTemplate('Certificat de Résidence', 'certificat-residence.pdf');
generateGenericTemplate('Acte de Mariage', 'mariage.pdf');
generateGenericTemplate('Acte de Décès', 'deces.pdf');
