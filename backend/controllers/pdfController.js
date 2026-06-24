const PDFDocument = require('pdfkit');

// ─── Color palette ─────────────────────────────────────────────────────────
const NAVY   = '#0D1B4B';   // header / section bar background
const WHITE  = '#FFFFFF';
const LIGHT  = '#F0F4FF';   // alternating row fill
const BORDER = '#0D1B4B';
const TEXT   = '#1a1a1a';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Draw a filled rectangle */
function fillRect(doc, x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}

/** Draw a border rectangle */
function strokeRect(doc, x, y, w, h, color = BORDER, lw = 0.5) {
  doc.save().rect(x, y, w, h).lineWidth(lw).stroke(color).restore();
}

/** Navy section header bar with white text */
function sectionBar(doc, x, y, w, h, label) {
  fillRect(doc, x, y, w, h, NAVY);
  doc.save()
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(WHITE)
    .text(label, x + 6, y + (h - 9) / 2 + 1, { width: w - 12, lineBreak: false })
    .restore();
}

/** Single labelled input field row */
function inputField(doc, x, y, w, label, value = '', labelWidth = 110) {
  const fieldH = 18;
  doc.save()
    .font('Helvetica')
    .fontSize(8)
    .fillColor(TEXT)
    .text(label, x + 4, y + (fieldH - 8) / 2 + 1, { width: labelWidth - 6, lineBreak: false })
    .restore();

  // input box
  const boxX = x + labelWidth;
  const boxW = w - labelWidth;
  fillRect(doc, boxX, y, boxW, fieldH, LIGHT);
  strokeRect(doc, boxX, y, boxW, fieldH);
  if (value) {
    doc.save()
      .font('Helvetica')
      .fontSize(8)
      .fillColor(TEXT)
      .text(value, boxX + 4, y + (fieldH - 8) / 2 + 1, { width: boxW - 8, lineBreak: false })
      .restore();
  }
  return fieldH;
}

/** Checkbox item  [ ] label */
function checkItem(doc, x, y, label, checked = false) {
  const boxSize = 10;
  strokeRect(doc, x, y, boxSize, boxSize);
  if (checked) {
    doc.save()
      .font('Helvetica-Bold').fontSize(8).fillColor(NAVY)
      .text('X', x + 1, y + 1, { width: 8, lineBreak: false })
      .restore();
  }
  doc.save()
    .font('Helvetica').fontSize(8).fillColor(TEXT)
    .text(label, x + 14, y + 1, { lineBreak: false })
    .restore();
}

// ─── Section-content helpers ─────────────────────────────────────────────────

function drawSection1(doc, x, y, w, type, userData) {
  const lw = Math.floor(w / 2) - 4; // half-width minus gap
  const gap = 6;
  let row = y;

  const field = (fx, fy, fw, label, val, lw2 = 110) => {
    inputField(doc, fx, fy, fw, label, val, lw2);
    return 20;
  };

  if (type === 'naissance') {
    row += field(x, row, w, 'Nom du parent', userData.nomParent);
    row += field(x, row, w, 'Date de naissance', userData.dateNaissance);
    row += field(x, row, w, 'Lieu de naissance', userData.lieuNaissance);
    row += field(x, row, w, 'Email', userData.email);
  } else if (type === 'residence') {
    row += field(x, row, lw, 'Nom', userData.nom);
    row += field(x, row - 20, lw + gap + lw, 'Adresse', userData.adresse, 60); // full width for address
    row += 4;
    inputField(doc, x, row, lw, 'Prénom(s)', userData.prenom);
    inputField(doc, x + lw + gap, row, lw, 'Durée résidence', userData.dureeResidence, 95);
    row += 20;
    row += field(x, row, lw, 'Téléphone', userData.telephone);
  } else {
    // CNI & passeport - two-column grid
    const fields = [
      ['Nom de naissance', userData.nom],
      ['Nationalité',      userData.nationalite],
      ['Nom d\'usage',     userData.nomUsage],
      ['Prénom(s)',        userData.prenom],
      ['Date de naissance',userData.dateNaissance],
      ['Adresse',         userData.adresse],
      ['Lieu de naissance',userData.lieuNaissance],
      ['Téléphone',       userData.telephone],
      ['Email',           userData.email],
    ];
    fields.forEach((f, i) => {
      const col = i % 2;
      const rowIdx = Math.floor(i / 2);
      inputField(doc, x + col * (lw + gap), y + rowIdx * 20, lw, f[0], f[1], 100);
    });
    row = y + Math.ceil(fields.length / 2) * 20;
  }
  return row;
}

function drawSection2(doc, x, y, w, type, checkboxData) {
  const colW = Math.floor(w / 2);
  let row = y + 4;

  if (type === 'cni' || type === 'passeport') {
    checkItem(doc, x + 4,          row, 'Première request', checkboxData.premiereRequest);
    checkItem(doc, x + colW,       row, 'Renouvellement',   checkboxData.renouvellement);
    row += 16;
    checkItem(doc, x + 4,          row, 'Perte ou vol',     checkboxData.perteVol);
    checkItem(doc, x + colW,       row, 'Autre ________',   false);
    row += 16;
  } else if (type === 'naissance') {
    checkItem(doc, x + 4,          row, 'Copie intégrale',          checkboxData.copieIntegrale);
    checkItem(doc, x + colW,       row, 'Extrait avec filiation',   checkboxData.extraitFiliation);
    row += 16;
    checkItem(doc, x + 4,          row, 'Extrait sans filiation',   checkboxData.extraitSansFiliation);
    row += 16;
  } else if (type === 'residence') {
    checkItem(doc, x + 4,          row, 'Request de certificat de résidence', true);
    row += 16;
  }
  return row + 4;
}

function drawSection3(doc, x, y, w, type, checkboxData) {
  const colW = Math.floor(w / 2);
  let row = y + 4;

  const items = {
    cni: [
      ['Preuve d\'identité (si renouvellement)', 'docPreuveId'],
      ['Acte de naissance',                      'docActeNaissance'],
      ['Justificatif de domicile',               'docJustifDomicile'],
      ['Déclaration de perte/vol',               'docDeclarationPerte'],
    ],
    passeport: [
      ['Preuve d\'identité',        'docPreuveId'],
      ['Timbre fiscal',             'docTimbre'],
      ['Acte de naissance',         'docActeNaissance'],
      ['Déclaration de perte/vol',  'docDeclarationPerte'],
      ['Justificatif de domicile',  'docJustifDomicile'],
      ['Ancien passeport',          'docAncienPass'],
    ],
    naissance: [
      ['Carte d\'identité du requestur', 'docCni'],
      ['Livret de famille',              'docLivret'],
    ],
    residence: [
      ['Pièce d\'identité',              'docCni'],
      ['Justificatif de domicile récent','docJustifDomicile'],
    ],
  };

  const list = items[type] || [];
  list.forEach((item, i) => {
    const col = i % 2;
    const r   = y + 4 + Math.floor(i / 2) * 16;
    checkItem(doc, x + 4 + col * colW, r, item[0], !!checkboxData[item[1]]);
  });
  row = y + 4 + Math.ceil(list.length / 2) * 16;
  return row + 4;
}

// ─── Titles ──────────────────────────────────────────────────────────────────

function getTitle(type) {
  switch (type) {
    case 'cni':       return 'GUIDE & FORMULAIRE DE DEMANDE CARTE D\'IDENTITÉ (CNI)';
    case 'passeport': return 'GUIDE & FORMULAIRE DE DEMANDE CARTE – PASSEPORT (P)';
    case 'naissance': return 'GUIDE & FORMULAIRE DE DEMANDE D\'ACTE DE NAISSANCE';
    case 'residence': return 'GUIDE & FORMULAIRE DE DEMANDE DE CERTIFICAT DE RÉSIDENCE';
    default:          return 'FORMULAIRE DE DEMANDE OFFICIELLE – MAIRIE DE DEMBÉNI';
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

exports.generatePdf = async (req, res) => {
  try {
    const { type, userData = {}, checkboxData = {} } = req.body;
    if (!type) return res.status(400).json({ message: 'type requis (cni|passeport|naissance|residence)' });

    const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: getTitle(type) } });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="formulaire-${type}.pdf"`,
    });
    doc.pipe(res);

    const PW = 595.28;  // A4 width  (pt)
    const PH = 841.89;  // A4 height (pt)
    const M  = 28;      // outer margin

    // ── BACKGROUND ──────────────────────────────────────────────────────────
    fillRect(doc, 0, 0, PW, PH, WHITE);

    // ── OUTER BORDER ────────────────────────────────────────────────────────
    strokeRect(doc, M, M, PW - 2 * M, PH - 2 * M, NAVY, 1.5);

    let curY = M + 8;
    const innerW = PW - 2 * M - 4; // usable width inside the border
    const innerX = M + 2;

    // ── HEADER ──────────────────────────────────────────────────────────────
    // "RÉPUBLIQUE FRANÇAISE | MAIRIE DE DEMBÉNI"
    doc.save()
      .font('Helvetica-Bold').fontSize(9).fillColor(NAVY)
      .text('RÉPUBLIQUE FRANÇAISE  |  MAIRIE DE DEMBÉNI', innerX, curY, {
        width: innerW, align: 'center', lineBreak: false,
      }).restore();
    curY += 14;

    // Main title bar
    fillRect(doc, innerX, curY, innerW, 26, NAVY);
    doc.save()
      .font('Helvetica-Bold').fontSize(12).fillColor(WHITE)
      .text(getTitle(type), innerX + 6, curY + 7, { width: innerW - 12, align: 'center', lineBreak: false })
      .restore();
    curY += 30;

    // Intro text
    doc.save()
      .font('Helvetica').fontSize(7.5).fillColor(TEXT)
      .text(
        'Conformément à la réglementation, la carte nationale d\'identité et le passeport sont des documents officiels délivrés sur request.\n' +
        'Les démarches s\'effectuent SUR RENDEZ-VOUS auprès du service de l\'État Civil de la mairie avec les pièces justificatives requises.',
        innerX + 4, curY, { width: innerW - 8, align: 'justify' }
      ).restore();
    curY += 28;

    // ── SECTION 1 ────────────────────────────────────────────────────────────
    sectionBar(doc, innerX, curY, innerW, 16, '1.  INFORMATION SUR LE DEMANDEUR');
    curY += 16;
    fillRect(doc, innerX, curY, innerW, 1, NAVY);
    curY += 2;

    const afterS1 = drawSection1(doc, innerX + 4, curY, innerW - 8, type, userData);
    curY = afterS1 + 6;
    strokeRect(doc, innerX, M + 8, innerW, curY - M - 10, NAVY, 0.5); // section border

    // ── SECTION 2 ────────────────────────────────────────────────────────────
    sectionBar(doc, innerX, curY, innerW, 16, '2.  MOTIF DE LA DEMANDE');
    curY += 16;

    const afterS2 = drawSection2(doc, innerX, curY, innerW, type, checkboxData);
    curY = afterS2 + 2;
    strokeRect(doc, innerX, curY - afterS2 + 16 - 16, innerW, afterS2 - 2, NAVY, 0.5);

    // ── SECTION 3 ────────────────────────────────────────────────────────────
    sectionBar(doc, innerX, curY, innerW, 16, '3.  PIÈCES JUSTIFICATIVES À JOINDRE  (originaux et copies)');
    curY += 16;

    const afterS3 = drawSection3(doc, innerX, curY, innerW, type, checkboxData);
    curY = afterS3 + 4;
    strokeRect(doc, innerX, curY - afterS3 + 16 - 16, innerW, afterS3, NAVY, 0.5);

    // ── BOTTOM: SIGNATURE + MAIRIE ────────────────────────────────────────────
    const bottomY = PH - M - 80;
    const halfW   = Math.floor(innerW / 2) - 4;

    // Signature box
    strokeRect(doc, innerX, bottomY, halfW, 70, NAVY, 1);
    fillRect(doc, innerX, bottomY, halfW, 16, NAVY);
    doc.save()
      .font('Helvetica-Bold').fontSize(9).fillColor(WHITE)
      .text('SIGNATURE DU DEMANDEUR', innerX + 4, bottomY + 4, { width: halfW - 8, lineBreak: false })
      .restore();
    doc.save()
      .font('Helvetica').fontSize(8).fillColor(TEXT)
      .text('Date et signature :', innerX + 6, bottomY + 24)
      .restore();

    // Mairie box
    const mX = innerX + halfW + 8;
    strokeRect(doc, mX, bottomY, halfW, 70, NAVY, 1);
    fillRect(doc, mX, bottomY, halfW, 16, NAVY);
    doc.save()
      .font('Helvetica-Bold').fontSize(9).fillColor(WHITE)
      .text('POUR LA MAIRIE', mX + 4, bottomY + 4, { width: halfW - 8, lineBreak: false })
      .restore();

    // Dashed inner border
    doc.save()
      .rect(mX + 6, bottomY + 20, halfW - 12, 44)
      .dash(3, { space: 3 })
      .lineWidth(0.5)
      .stroke(NAVY)
      .restore();
    doc.save()
      .font('Helvetica').fontSize(7.5).fillColor(TEXT)
      .text('Confirmation d\'apportement sur\nofficielle du sertie de Dembéni.', mX + 10, bottomY + 28)
      .restore();

    // Watermark
    doc.save()
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#E8EEF5')
      .opacity(0.5)
      .rotate(-35, { origin: [PW / 2, PH / 2] })
      .text('FORMULAIRE PDF – MAIRIE DE DEMBÉNI', 60, PH / 2 - 10, { width: PW - 120, align: 'center' })
      .restore();

    // Footer
    doc.save()
      .font('Helvetica').fontSize(7).fillColor('#888')
      .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} – Mairie de Dembéni – Service État Civil`,
        innerX, PH - M - 10, { width: innerW, align: 'center', lineBreak: false })
      .restore();

    doc.end();
  } catch (error) {
    console.error('Erreur PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Erreur lors de la génération du PDF', error: error.message });
    }
  }
};
