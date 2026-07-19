const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outDir = path.join(__dirname, '../templates');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const generatePixelPerfectCreche = () => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.pipe(fs.createWriteStream(path.join(outDir, 'creche.pdf')));

  const PW = doc.page.width;
  const PH = doc.page.height;
  const mapping = [];

  // --- Helpers ---
  const drawDottedLine = (x, y, width) => {
    doc.save()
       .moveTo(x, y)
       .lineTo(x + width, y)
       .dash(1, { space: 3 })
       .lineWidth(1)
       .strokeColor('#999999')
       .stroke()
       .restore();
  };

  const drawCheckbox = (x, y) => {
    doc.save()
       .rect(x, y, 10, 10)
       .lineWidth(0.5)
       .strokeColor('#000')
       .stroke()
       .restore();
  };

  // --- Header ---
  doc.fontSize(8).fillColor('#999').text('(Imprimé N°1)', PW - 80, 20);

  doc.rect(40, 30, 45, 55).lineWidth(0.5).stroke('#ccc');
  doc.fontSize(6).fillColor('#000').text('MAIRIE DE', 40, 90, { width: 45, align: 'center' });
  doc.fontSize(6).text('DEMBÉNI', 40, 98, { width: 45, align: 'center' });
  
  doc.fontSize(8).font('Helvetica-Oblique').text('Service Actions sociale et familiale', 40, 110);
  doc.fontSize(8).font('Helvetica-Oblique').text('Petite Enfance', 40, 120);

  doc.fontSize(18).font('Helvetica').text('Fiche de pré-inscription\nde demande de place en crèche\ncollective ou familiale', 150, 40, { width: 300, align: 'center', lineGap: 2 });

  doc.rect(30, 140, PW - 60, 20).lineWidth(1.5).stroke('#000');
  doc.fontSize(10).font('Helvetica-Bold').text('Les places en crèche sont réservées aux enfants dont les parents ont leur résidence principale à Dembéni', 30, 146, { width: PW - 60, align: 'center' });

  let y = 175;
  doc.fontSize(9).font('Helvetica-Bold').text('Attention : ', 30, y, { continued: true, underline: true })
     .font('Helvetica').text('Les formalités administratives de pré-inscription ne donnent pas droit à une place en crèche en établissement', { underline: false });
  y += 12;
  doc.text('collectif ou familial. Cette pré-inscription doit être confirmée par une inscription dans le mois qui suit la naissance', 30, y);
  y += 12;
  doc.text("de l'enfant, toute inscription qui sera déposée après le délai d'un mois perdra le bénéfice de la pré-inscription.", 30, y);

  y += 25;
  doc.fontSize(11).font('Helvetica-Bold').text('LA FAMILLE :', 30, y, { underline: true });

  y += 20;
  const boxW = (PW - 70) / 2;
  doc.rect(30, y, boxW, 165).lineWidth(1).stroke('#000');
  doc.rect(30 + boxW + 10, y, boxW, 165).lineWidth(1).stroke('#000');

  const drawResponsable = (startX, title, prefix) => {
    let ty = y + 10;
    doc.fontSize(10).font('Helvetica-Bold').text(title, startX, ty, { width: boxW, align: 'center' });
    ty += 25;

    doc.fontSize(9).font('Helvetica').text('Civilité :', startX + 10, ty);
    drawCheckbox(startX + 50, ty - 1);
    doc.text('Madame', startX + 65, ty);
    drawCheckbox(startX + 115, ty - 1);
    doc.text('Monsieur', startX + 130, ty);
    
    mapping.push({ key: `${prefix}_civilite`, x: startX + 53, y: PH - ty - 8, size: 10, font: 'Helvetica-Bold' });
    ty += 18;

    const fields = [
      { label: 'Nom', key: 'nom' },
      { label: 'Nom de naissance', key: 'nom_naissance' },
      { label: 'Prénom', key: 'prenom' },
      { label: 'Adresse mail', key: 'email' },
      { label: 'Téléphone', key: 'telephone' },
      { label: 'Adresse', key: 'adresse' }
    ];

    fields.forEach((f) => {
      doc.text(`${f.label} :`, startX + 10, ty);
      const textWidth = doc.widthOfString(`${f.label} :`);
      let lineX = startX + 15 + textWidth;
      let lineW = boxW - 30 - textWidth;
      
      if (f.label === 'Adresse') {
        lineX = startX + 10;
        lineW = boxW - 20;
      }
      
      drawDottedLine(lineX, ty + 8, lineW);
      mapping.push({ key: `${prefix}_${f.key}`, x: lineX + 5, y: PH - ty - 8, size: 9, font: 'Helvetica' });
      ty += 18;
    });
  };

  drawResponsable(30, 'Responsable légal 1', 'resp1');
  drawResponsable(30 + boxW + 10, 'Responsable légal 2', 'resp2');

  y += 180;
  doc.fontSize(11).font('Helvetica-Bold').text("L'ENFANT A NAÎTRE :", 30, y, { underline: true });
  y += 20;
  doc.fontSize(9).font('Helvetica').text('Date de naissance prévue le ', 30, y);
  drawDottedLine(160, y + 8, 300);
  mapping.push({ key: 'enfant_date_naissance', x: 165, y: PH - y - 8, size: 9, font: 'Helvetica' });

  y += 30;
  doc.fontSize(11).font('Helvetica-Bold').text("LES AUTRES ENFANTS DU FOYER ", 30, y, { underline: true, continued: true })
     .font('Helvetica-Bold').text("(à charge) :", { underline: false });
  
  y += 20;
  doc.fontSize(9).font('Helvetica').text('Nom(s) et prénom(s) / Date(s) de naissance / Structure(s) fréquentée(s) (Ex. : Crèche, Ecole, ...)', 30, y);
  y += 20;
  for (let i = 0; i < 4; i++) {
    drawDottedLine(30, y + 8, PW - 60);
    mapping.push({ key: `autre_enfant_${i+1}`, x: 35, y: PH - y - 8, size: 9, font: 'Helvetica' });
    y += 18;
  }

  y += 10;
  doc.rect(30, y, PW - 60, 45).fill('#f1f1f1');
  doc.fillColor('#000').fontSize(9).font('Helvetica-Bold').text('Pièces obligatoires à fournir :', 35, y + 5);
  doc.fontSize(9).font('Helvetica').text('•', 40, y + 18);
  doc.text('Justificatif de domicile datant de moins de 3 mois', 50, y + 18);
  doc.text('•', 40, y + 30);
  doc.text('Justificatif de grossesse', 50, y + 30);

  y += 65;
  doc.fontSize(9).font('Helvetica').text('Date : .... / .... / ........', 30, y);
  mapping.push({ key: 'date_soumission', x: 65, y: PH - y - 8, size: 9, font: 'Helvetica' });
  
  y += 25;
  doc.text('Signature Responsable légal 1 :', 30, y);
  doc.text('Signature Responsable légal 2 :', PW / 2 + 10, y);
  
  y += 15;
  doc.rect(30, y, 200, 80).lineWidth(0.5).stroke('#000');
  doc.rect(PW / 2 + 10, y, 200, 80).lineWidth(0.5).stroke('#000');

  y += 95;
  const footerText = "INFORMATION CONCERNANT VOS DONNÉES : En tant que responsable de traitement, la commune de Dembéni traite les données collectées pour la gestion de votre demande de pré-inscription en crèche.\nSur la gestion de vos données personnelles et pour exercer vos droits, vous pouvez vous reporter à la politique externe de protection des données sur le site internet de la commune.";
  doc.fontSize(6).font('Helvetica').fillColor('#000').text(footerText, 30, y, { width: PW - 60, align: 'justify' });

  doc.end();
  fs.writeFileSync(path.join(outDir, 'creche.json'), JSON.stringify(mapping, null, 2));
  console.log('creche.pdf and creche.json generated successfully!');
};

generatePixelPerfectCreche();
