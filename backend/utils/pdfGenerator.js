const PDFDocument = require('pdfkit');
const { PDFDocument: PDFLibDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// ─── Utility ──────────────────────────────────────────────────────────────────

const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
};

const generateReferenceNumber = async (RequestModel) => {
  const count = await RequestModel.countDocuments();
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(6, '0');
  return `DEM-${year}-${seq}`;
};

// ─── Build citizen data map ────────────────────────────────────────────────────
const buildCitizenData = (citizen, formData = {}, referenceNumber = '', request = {}) => ({
  // Reference / metadata
  reference: referenceNumber || '',
  referenceNumber: referenceNumber || '',
  numero_dossier: (request._id || '').toString().slice(-8).toUpperCase(),
  date_soumission: new Date().toLocaleDateString('fr-FR'),
  date_depot: new Date().toLocaleDateString('fr-FR'),

  // Citizen identity
  nom: citizen.lastname || citizen.lastName || citizen.nom || '',
  prenom: citizen.firstname || citizen.firstName || citizen.prenom || '',
  email: citizen.email || '',
  telephone: citizen.phone || citizen.telephone || '',
  adresse: citizen.address || citizen.adresse || '',
  dateNaissance: citizen.dateNaissance ? new Date(citizen.dateNaissance).toLocaleDateString('fr-FR') : '',
  lieuNaissance: citizen.lieuNaissance || '',
  nationalite: citizen.nationalite || 'Mahoraise',

  // All form fields (override/extend)
  ...formData,
});

// ─── 1. Template-based PDF (pdf-lib overlay) ────────────────────────────────
const fillTemplatePdf = async (templatePath, citizenData, referenceNumber, mapping = [], isDemonstration = false) => {
  let existingPdfBytes;

  if (templatePath.startsWith('http')) {
    const resp = await fetch(templatePath);
    if (!resp.ok) throw new Error(`Impossible de récupérer le template: ${templatePath}`);
    existingPdfBytes = await resp.arrayBuffer();
  } else {
    const absPath = path.isAbsolute(templatePath)
      ? templatePath
      : path.resolve(__dirname, '..', templatePath.replace(/^\//, ''));

    if (!fs.existsSync(absPath)) {
      throw new Error(`Fichier template introuvable: ${absPath}`);
    }
    existingPdfBytes = fs.readFileSync(absPath);
  }

  const pdfDoc = await PDFLibDocument.load(existingPdfBytes, { ignoreEncryption: true });

  // Try to fill AcroForm fields
  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    for (const field of fields) {
      const name = field.getName();
      // Look for matching key (case-insensitive)
      const key = Object.keys(citizenData).find(
        k => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(k.toLowerCase())
      );
      if (key && citizenData[key]) {
        try {
          const tf = form.getTextField(name);
          tf.setText(String(citizenData[key]));
        } catch (e) {
          // not a text field
        }
      }
    }

    try { form.flatten(); } catch (e) {}
  } catch (formErr) {
    // PDF has no AcroForm — we'll overlay text directly on each page
    console.warn('[fillTemplatePdf] No form fields found, using text overlay');
  }

  const pages = pdfDoc.getPages();
  let font;
  let boldFont;
  try { font = await pdfDoc.embedFont(StandardFonts.Helvetica); } catch (e) {}
  try { boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold); } catch (e) {}

  // Apply visual mapping overlay
  if (mapping && mapping.length > 0) {
    for (const m of mapping) {
      if (!m.key || m.x == null || m.y == null) continue;
      const value = citizenData[m.key];
      if (value !== undefined && value !== null && value !== '') {
        const pageIdx = (m.page || 1) - 1;
        if (pageIdx >= 0 && pageIdx < pages.length) {
          const page = pages[pageIdx];
          const textFont = m.font === 'Helvetica-Bold' && boldFont ? boldFont : (font || undefined);
          // Frontend sends y from top-left, pdf-lib uses bottom-left origin
          page.drawText(String(value), {
            x: m.x,
            y: page.getHeight() - m.y,
            size: m.size || 12,
            font: textFont,
            color: rgb(0, 0, 0),
          });
        }
      }
    }
  }

  // Add watermark + reference overlay on first page
  if (pages.length > 0) {
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    if (boldFont) {
      // Watermark diagonal if demonstration mode
      if (isDemonstration) {
        firstPage.drawText('DOCUMENT DE DÉMONSTRATION', {
          x: 80,
          y: height / 2,
          size: 28,
          font: boldFont,
          color: rgb(0.85, 0.85, 0.85),
          rotate: { type: 'degrees', angle: -35 },
          opacity: 0.3,
        });
      }

      // Reference number bottom-right
      firstPage.drawText(`Réf: ${referenceNumber}  |  ${new Date().toLocaleDateString('fr-FR')}`, {
        x: 30,
        y: 20,
        size: 8,
        font: boldFont,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Embed QR Code for verification
    try {
      // Use standard verification URL
      const verifyUrl = `https://portail-dembeni.yt/verify-document/${referenceNumber}`;
      const qrBuf = await QRCode.toBuffer(verifyUrl, { margin: 1 });
      const qrImage = await pdfDoc.embedPng(qrBuf);
      
      // Draw QR Code on the bottom left or right (adjust based on template)
      // Let's place it at bottom right
      firstPage.drawImage(qrImage, {
        x: width - 80,
        y: 10,
        width: 60,
        height: 60,
      });
    } catch (qrErr) {
      console.error('Erreur génération QR Code:', qrErr);
    }
  }

  return await pdfDoc.save();
};

// ─── 2. Professional receipt PDF (pdfkit) ─────────────────────────────────────
const generateReceiptPdf = (request, citizen, referenceNumber) =>
  new Promise(async (resolve, reject) => {
    try {
      const uploadDir = ensureUploadDir();
      const filename = `receipt-${referenceNumber}.pdf`;
      const filePath = path.join(uploadDir, filename);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const NAVY = '#0D1B4B';
      const PW = doc.page.width;
      const M = 50;
      const IW = PW - 2 * M;

      // Watermark
      doc.save()
        .fillOpacity(0.06).fontSize(52).fillColor(NAVY)
        .rotate(-40, { origin: [PW / 2, doc.page.height / 2] })
        .text('MAIRIE DE DEMBÉNI', 40, doc.page.height / 2 - 25, { width: PW - 80, align: 'center' })
        .restore();

      // Header band
      doc.rect(M, M, IW, 34).fill(NAVY);
      doc.fontSize(13).font('Helvetica-Bold').fillColor('white')
        .text('MAIRIE DE DEMBÉNI — RÉCÉPISSÉ DE DÉPÔT', M + 8, M + 10, { width: IW - 80, lineBreak: false });

      // QR Code
      const qrBuf = await QRCode.toBuffer(JSON.stringify({
        ref: referenceNumber,
        nom: `${citizen.lastname || ''} ${citizen.firstname || ''}`,
        procedure: request.procedureType || '',
      }));
      doc.image(qrBuf, PW - M - 70, M + 2, { width: 70 });

      let y = M + 50;

      // Subtitle
      doc.fontSize(10).font('Helvetica').fillColor('#444')
        .text('République Française  |  Commune de Dembéni  |  Mayotte', M, y, { width: IW, align: 'center' });
      y += 24;

      // Divider
      doc.moveTo(M, y).lineTo(M + IW, y).lineWidth(0.5).stroke('#CBD5E1');
      y += 14;

      // Reference
      doc.rect(M, y, IW, 30).fill('#F0F4FF');
      doc.fontSize(11).font('Helvetica-Bold').fillColor(NAVY)
        .text(`N° de référence : ${referenceNumber}`, M + 10, y + 9, { lineBreak: false });
      doc.fontSize(9).font('Helvetica').fillColor('#555')
        .text(`Déposé le : ${new Date().toLocaleDateString('fr-FR')}`, M + IW - 180, y + 11, { lineBreak: false });
      y += 44;

      // Section helper
      const section = (label, yy) => {
        doc.rect(M, yy, IW, 22).fill(NAVY);
        doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
          .text(label, M + 6, yy + 6, { width: IW - 12, lineBreak: false });
        return yy + 24;
      };

      const row = (label, value, yy, half = false) => {
        const w = half ? IW / 2 - 5 : IW;
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text(label + ' :', M + 4, yy, { continued: true, width: 120 });
        doc.font('Helvetica').fillColor('#1F2937').text(' ' + (value || '—'), { width: w - 130, lineBreak: false });
        return yy + 18;
      };

      // Section 1 — Identité du demandeur
      y = section('1.  IDENTITÉ DU DEMANDEUR', y);
      y = row('Nom', citizen.lastname || citizen.lastName || '', y);
      y = row('Prénom(s)', citizen.firstname || citizen.firstName || '', y);
      y = row('Email', citizen.email || '', y);
      y = row('Téléphone', citizen.phone || citizen.telephone || '', y);
      y = row('Adresse', citizen.address || citizen.adresse || '', y);
      y += 12;

      // Section 2 — Démarche
      y = section('2.  DÉMARCHE SOUMISE', y);
      y = row('Type de démarche', request.procedureType || '—', y);
      y = row('Date de dépôt', new Date().toLocaleDateString('fr-FR'), y);
      y = row('Statut', 'En attente de traitement', y);
      y = row('Numéro de dossier', referenceNumber, y);
      y += 12;

      // Section 3 — Form data
      const fd = request.formData || {};
      if (Object.keys(fd).length > 0) {
        y = section('3.  INFORMATIONS COMPLÉMENTAIRES', y);
        Object.entries(fd).forEach(([k, v]) => {
          if (v) { y = row(k.replace(/_/g, ' '), String(v), y); }
        });
        y += 12;
      }

      // Section 4 — Pièces jointes
      y = section('4.  PIÈCES JUSTIFICATIVES', y);
      if (request.uploadedFiles && request.uploadedFiles.length > 0) {
        request.uploadedFiles.forEach(f => {
          doc.fontSize(9).font('Helvetica').fillColor('#1F2937')
            .text(`  ✓  ${f.originalName || f.filename || 'Document joint'}`, M + 4, y);
          y += 15;
        });
      } else {
        doc.fontSize(9).font('Helvetica').fillColor('#9CA3AF').text('  Aucune pièce jointe.', M + 4, y);
        y += 15;
      }
      y += 12;

      // Footer
      const footerY = doc.page.height - 60;
      doc.moveTo(M, footerY).lineTo(M + IW, footerY).lineWidth(0.5).stroke('#CBD5E1');
      doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF')
        .text(
          `Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} — Mairie de Dembéni`,
          M, footerY + 8, { width: IW, align: 'center' }
        );

      doc.end();
      stream.on('finish', () => resolve(`/uploads/documents/${filename}`));
      stream.on('error', reject);
    } catch (err) { reject(err); }
  });

// ─── 3. Official validated PDF (pdfkit) ───────────────────────────────────────
const generateOfficialPdf = (request, citizen, referenceNumber, stampOptions = {}) =>
  new Promise(async (resolve, reject) => {
    try {
      const uploadDir = ensureUploadDir();
      const filename = `official-${referenceNumber}.pdf`;
      const filePath = path.join(uploadDir, filename);
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const NAVY = '#0D1B4B';
      const GREEN = '#065F46';
      const PW = doc.page.width;
      const M = 50;
      const IW = PW - 2 * M;

      // Watermark
      doc.save()
        .fillOpacity(0.05).fontSize(52).fillColor(NAVY)
        .rotate(-40, { origin: [PW / 2, doc.page.height / 2] })
        .text('DOCUMENT OFFICIEL — VALIDÉ', 40, doc.page.height / 2 - 25, { width: PW - 80, align: 'center' })
        .restore();

      // Header
      doc.rect(M, M, IW, 34).fill(NAVY);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('white')
        .text('MAIRIE DE DEMBÉNI — DOCUMENT OFFICIEL VALIDÉ', M + 8, M + 10, { width: IW - 80, lineBreak: false });

      const qrBuf = await QRCode.toBuffer(JSON.stringify({
        ref: referenceNumber,
        nom: `${citizen.lastname || ''} ${citizen.firstname || ''}`,
        official: true,
        date: new Date().toISOString(),
      }));
      doc.image(qrBuf, PW - M - 70, M + 2, { width: 70 });

      let y = M + 50;
      doc.fontSize(10).font('Helvetica').fillColor('#444')
        .text('République Française  |  Commune de Dembéni  |  Mayotte', M, y, { width: IW, align: 'center' });
      y += 24;
      doc.moveTo(M, y).lineTo(M + IW, y).lineWidth(0.5).stroke('#CBD5E1');
      y += 14;

      // Status badge
      doc.rect(M, y, IW, 30).fill('#DCFCE7');
      doc.rect(M, y, 4, 30).fill('#16A34A');
      doc.fontSize(11).font('Helvetica-Bold').fillColor(GREEN)
        .text(`✓  DEMANDE VALIDÉE — Réf: ${referenceNumber}`, M + 14, y + 9, { lineBreak: false });
      doc.fontSize(9).font('Helvetica').fillColor('#555')
        .text(`Le ${new Date().toLocaleDateString('fr-FR')}`, M + IW - 120, y + 11, { lineBreak: false });
      y += 44;

      const section = (label, yy) => {
        doc.rect(M, yy, IW, 22).fill(NAVY);
        doc.fontSize(9).font('Helvetica-Bold').fillColor('white')
          .text(label, M + 6, yy + 6, { width: IW - 12, lineBreak: false });
        return yy + 24;
      };
      const row = (label, value, yy) => {
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text(label + ' :', M + 4, yy, { continued: true, width: 140 });
        doc.font('Helvetica').fillColor('#1F2937').text(' ' + (value || '—'), { width: IW - 150, lineBreak: false });
        return yy + 18;
      };

      y = section('IDENTITÉ DU BÉNÉFICIAIRE', y);
      y = row('Nom', citizen.lastname || citizen.lastName || '', y);
      y = row('Prénom(s)', citizen.firstname || citizen.firstName || '', y);
      y = row('Email', citizen.email || '', y);
      y = row('Téléphone', citizen.phone || citizen.telephone || '', y);
      y += 12;

      y = section('DÉMARCHE VALIDÉE', y);
      y = row('Démarche', request.procedureType || '—', y);
      y = row('Date de validation', new Date().toLocaleDateString('fr-FR'), y);
      y = row('Référence dossier', referenceNumber, y);
      y += 20;

      // Attestation
      doc.fontSize(10).font('Helvetica').fillColor('#1F2937')
        .text(
          `Nous soussignés, Mairie de Dembéni, attestons que la démarche ci-dessus a été examinée et validée par nos services. Ce document est délivré pour servir et valoir ce que de droit.`,
          M, y, { width: IW, align: 'justify', lineGap: 3 }
        );
      y += 60;

      // Signatures
      const halfW = (IW - 20) / 2;
      doc.rect(M, y, halfW, 70).stroke(NAVY);
      doc.rect(M, y, halfW, 18).fill(NAVY);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('white').text('SIGNATURE DU DEMANDEUR', M + 4, y + 5, { width: halfW - 8, lineBreak: false });
      doc.fontSize(8).font('Helvetica').fillColor('#555').text('Date et signature :', M + 6, y + 28);

      const mX = M + halfW + 20;
      doc.rect(mX, y, halfW, 70).stroke(NAVY);
      doc.rect(mX, y, halfW, 18).fill(NAVY);
      doc.fontSize(8).font('Helvetica-Bold').fillColor('white').text('CACHET DE LA MAIRIE', mX + 4, y + 5, { width: halfW - 8, lineBreak: false });
      if (stampOptions.addStamp) {
        doc.fontSize(8).font('Helvetica').fillColor('#555').text('Cachet officiel', mX + 6, y + 28);
      }
      if (stampOptions.addSignature) {
        doc.fontSize(8).font('Helvetica-Oblique').fillColor('#2563EB').text('Signature électronique approuvée', mX + 6, y + 44);
      }

      // Footer
      const footerY = doc.page.height - 50;
      doc.moveTo(M, footerY - 10).lineTo(M + IW, footerY - 10).lineWidth(0.5).stroke('#CBD5E1');
      doc.fontSize(8).font('Helvetica').fillColor('#9CA3AF')
        .text(`Document officiel généré le ${new Date().toLocaleDateString('fr-FR')} — Mairie de Dembéni — Service État Civil`, M, footerY, { width: IW, align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(`/uploads/documents/${filename}`));
      stream.on('error', reject);
    } catch (err) { reject(err); }
  });

// ─── 4. Generate filled PDF from uploaded template ────────────────────────────
const generateTemplatePdf = async (request, citizen, referenceNumber, procedure) => {
  if (!procedure || !procedure.pdfTemplate) {
    throw new Error('Aucun template PDF associé à cette procédure.');
  }

  const formData = request.formData || {};
  const citizenData = buildCitizenData(citizen, formData, referenceNumber, request);

  const pdfBytes = await fillTemplatePdf(procedure.pdfTemplate, citizenData, referenceNumber);

  const uploadDir = ensureUploadDir();
  const filename = `official-${referenceNumber}.pdf`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, pdfBytes);

  return `/uploads/documents/${filename}`;
};

// ─── 5. Generate from OfficialPdfTemplate model (new system) ──────────────────
const generateFromOfficialTemplate = async (request, citizen, referenceNumber, template) => {
  if (!template || !template.templateFile) {
    throw new Error('Aucun template PDF officiel associé.');
  }

  const formData = request.formData || {};
  const citizenData = buildCitizenData(citizen, formData, referenceNumber, request);

  // Apply fieldMapping from the template (legacy object format) or array
  let mappedData = { ...citizenData };
  if (template.fieldMapping && !Array.isArray(template.fieldMapping)) {
    const map = template.fieldMapping instanceof Map
      ? Object.fromEntries(template.fieldMapping)
      : template.fieldMapping;

    Object.entries(map).forEach(([dataKey, pdfFieldName]) => {
      if (citizenData[dataKey] !== undefined) {
        mappedData[pdfFieldName] = citizenData[dataKey];
      }
    });
  }

  const templatePathAbs = path.resolve(__dirname, '..', template.templateFile.replace(/^\//, ''));
  const mappingArray = Array.isArray(template.mapping) ? template.mapping : [];
  
  const pdfBytes = await fillTemplatePdf(
    templatePathAbs, 
    mappedData, 
    referenceNumber, 
    mappingArray, 
    template.isDemonstration || false
  );

  const uploadDir = ensureUploadDir();
  const filename = `official-${referenceNumber}.pdf`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, pdfBytes);

  return `/uploads/documents/${filename}`;
};

module.exports = {
  generateReferenceNumber,
  generateReceiptPdf,
  generateOfficialPdf,
  generateTemplatePdf,
  generateFromOfficialTemplate,
  fillTemplatePdf,
  buildCitizenData,
};
