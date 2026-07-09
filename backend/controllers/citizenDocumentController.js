/**
 * citizenDocumentController.js
 * CRUD + PDF generation for demo citizen documents.
 * Every PDF carries a "DOCUMENT DE DÉMONSTRATION" watermark.
 */

const CitizenDocument = require('../models/CitizenDocument');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { createAdminNotification } = require('../utils/notificationHelper');
const cloudinary = require('../config/cloudinary');

// ── Output dir ─────────────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, '..', 'uploads', 'demo-documents');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Colors ─────────────────────────────────────────────────────────────────────
const GREEN  = '#164022';
const LIME   = '#22C55E';
const NAVY   = '#0D1B4B';
const WHITE  = '#FFFFFF';
const GREY   = '#F8FAF9';
const MUTED  = '#6B7280';
const BORDER = '#D1D5DB';
const RED    = '#DC2626';

// ── Reference generator ────────────────────────────────────────────────────────
function generateRef() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `DEM-DOC-${year}-${rand}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fillRect(doc, x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}

function drawWatermark(doc) {
  doc.save()
    .rotate(-45, { origin: [297, 421] })
    .fontSize(52)
    .font('Helvetica-Bold')
    .fillColor('red')
    .opacity(0.08)
    .text('DOCUMENT DE DÉMONSTRATION', 60, 300, { align: 'center', width: 480 })
    .text('NON OFFICIEL', 60, 380, { align: 'center', width: 480 })
    .restore();
}

// ── Build PDF in memory → save to disk ────────────────────────────────────────
async function buildPDF(doc, citizenDoc) {
  const refNo   = citizenDoc.referenceNumber;
  const docType = citizenDoc.documentType;
  const fd      = citizenDoc.formData;
  const now     = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  return new Promise((resolve, reject) => {
    const filename = `doc-${citizenDoc._id}.pdf`;
    const pdfDoc   = new PDFDocument({ size: 'A4', margin: 0 });
    
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'dembeni/demo-documents', public_id: filename },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    pdfDoc.pipe(stream);

    // ── Background
    fillRect(pdfDoc, 0, 0, 595, 842, WHITE);

    // ── Header band
    fillRect(pdfDoc, 0, 0, 595, 110, GREEN);

    pdfDoc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('rgba(255,255,255,0.6)')
      .text('COMMUNE DE DEMBÉNI — MAYOTTE', 0, 18, { align: 'center', width: 595 });

    pdfDoc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(WHITE)
      .text('COMMUNE DE DEMBÉNI', 0, 32, { align: 'center', width: 595 });

    pdfDoc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(LIME)
      .text('Administration Municipale — Espace Citoyen Numérique', 0, 58, { align: 'center', width: 595 });

    // ── Demo warning band
    fillRect(pdfDoc, 0, 110, 595, 26, '#FEF9C3');
    pdfDoc
      .fontSize(8.5)
      .font('Helvetica-Bold')
      .fillColor('#92400E')
      .text('⚠  DOCUMENT FICTIF — USAGE DÉMONSTRATION UNIQUEMENT — NON OFFICIEL', 0, 119, { align: 'center', width: 595 });

    // ── Document type title
    fillRect(pdfDoc, 40, 155, 515, 44, GREY);
    pdfDoc.save().rect(40, 155, 515, 44).lineWidth(1).stroke(BORDER).restore();
    pdfDoc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(GREEN)
      .text(docType.toUpperCase(), 40, 168, { align: 'center', width: 515 });

    // ── Reference / date block
    pdfDoc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor(MUTED)
      .text(`Référence : ${refNo}`, 40, 212, { width: 250 });
    pdfDoc.text(`Émis le : ${now}`, 305, 212, { width: 250, align: 'right' });

    // ── Separator
    pdfDoc.save().moveTo(40, 230).lineTo(555, 230).lineWidth(0.5).stroke(BORDER).restore();

    const formatKey = (key) => {
      const mapping = {
        nom: 'Nom', prenom: 'Prénom', dateNaissance: 'Date de naissance', lieuNaissance: 'Lieu de naissance',
        adresse: 'Adresse', telephone: 'Téléphone', cin: 'CIN', nationalite: 'Nationalité', profession: 'Profession',
        nomPere: 'Nom du père / Époux', nomMere: 'Nom de la mère / Épouse', prenomPere: 'Prénom époux', prenomMere: 'Prénom épouse',
        sexe: 'Sexe', dateMariage: 'Date de mariage', quartier: 'Quartier', commune: 'Commune',
        dateDeces: 'Date de décès', lieuDeces: 'Lieu de décès', nomDeclarant: 'Nom déclarant',
        nomProprietaire: 'Nom propriétaire', adresseTerrain: 'Adresse terrain', surface: 'Surface',
        referenceCadastrale: 'Référence cadastrale', numeroParcelle: 'Numéro parcelle'
      };
      return mapping[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    const fields = Object.keys(fd).map(k => [formatKey(k), fd[k] || 'Non renseigné']);

    let y = 248;
    fields.forEach(([label, value], idx) => {
      const isImage = typeof value === 'string' && value.startsWith('data:image/');
      
      pdfDoc.fontSize(9).font('Helvetica');
      const textHeight = !isImage ? pdfDoc.heightOfString(value || '—', { width: 325 }) : 0;
      const height = isImage ? 110 : Math.max(26, textHeight + 10);
      
      if (idx % 2 === 0) fillRect(pdfDoc, 40, y - 6, 515, height, GREY);
      
      pdfDoc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(NAVY)
        .text(label + ' :', 52, y, { width: 170 });
        
      if (isImage) {
        try {
          const base64Data = value.split(',')[1];
          const imgBuffer = Buffer.from(base64Data, 'base64');
          pdfDoc.image(imgBuffer, 230, y - 2, { fit: [200, 100] });
        } catch(e) {
          pdfDoc.fontSize(9).font('Helvetica').fillColor('red').text('Erreur image', 230, y);
        }
      } else {
        pdfDoc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#1a1a1a')
          .text(value || '—', 230, y, { width: 325 });
      }
      
      y += height;
    });

    // ── Separator
    y += 10;
    pdfDoc.save().moveTo(40, y).lineTo(555, y).lineWidth(0.5).stroke(BORDER).restore();
    y += 20;

    // ── Signature / stamp block
    const boxY = y;
    pdfDoc.save().rect(40, boxY, 240, 90).lineWidth(0.5).stroke(BORDER).restore();
    pdfDoc.save().rect(315, boxY, 240, 90).lineWidth(0.5).stroke(BORDER).restore();

    pdfDoc.fontSize(8).font('Helvetica-Bold').fillColor(MUTED)
      .text('Signature du titulaire :', 52, boxY + 10, { width: 216 });
    pdfDoc.fontSize(8).font('Helvetica-Bold').fillColor(MUTED)
      .text('Cachet de la Mairie :', 327, boxY + 10, { width: 216 });

    // Stamp circle
    pdfDoc.save()
      .circle(435, boxY + 50, 28)
      .lineWidth(1.5)
      .stroke(GREEN)
      .restore();
    pdfDoc.fontSize(5.5).font('Helvetica-Bold').fillColor(GREEN)
      .text('COMMUNE\nDE DEMBÉNI\nMAYOTTE', 407, boxY + 35, { align: 'center', width: 56 });

    y = boxY + 110;

    // ── Demo seal
    fillRect(pdfDoc, 40, y, 515, 32, '#FEF2F2');
    pdfDoc.save().rect(40, y, 515, 32).lineWidth(1).stroke('#FECACA').restore();
    pdfDoc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(RED)
      .text('DOCUMENT DE DÉMONSTRATION — CE DOCUMENT N\'A AUCUNE VALEUR JURIDIQUE', 40, y + 11, { align: 'center', width: 515 });

    // ── Footer band
    fillRect(pdfDoc, 0, 800, 595, 42, GREEN);
    pdfDoc
      .fontSize(7.5)
      .font('Helvetica')
      .fillColor('rgba(255,255,255,0.6)')
      .text('Mairie de Dembéni • BP — 97680 Dembéni, Mayotte • mairie@dembeni.yt', 0, 812, { align: 'center', width: 595 });
    pdfDoc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('rgba(255,255,255,0.45)')
      .text(`Ref: ${refNo} • Généré le ${now} • Portail Numérique Dembéni`, 0, 826, { align: 'center', width: 595 });

    // ── Watermark
    drawWatermark(pdfDoc);

    pdfDoc.end();
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// CONTROLLERS
// ════════════════════════════════════════════════════════════════════════════════

// GET /api/citizen-docs
exports.getMyDocuments = async (req, res) => {
  try {
    const docs = await CitizenDocument.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// POST /api/citizen-docs
exports.createDocument = async (req, res) => {
  try {
    const { documentType, formData } = req.body;
    if (!documentType) return res.status(400).json({ success: false, message: 'Type de document requis' });

    const refNo = generateRef();

    const doc = await CitizenDocument.create({
      citizenId: req.user._id,
      documentType,
      formData: formData || {},
      referenceNumber: refNo,
      isDemo: true
    });

    // Generate PDF with safe try/catch
    let pdfGenerationFailed = false;
    try {
      const pdfPath = await buildPDF(null, doc);
      doc.pdfUrl = pdfPath;
      await doc.save();
    } catch (pdfErr) {
      console.error('Erreur génération PDF:', pdfErr);
      doc.pdfUrl = null;
      await doc.save();
      pdfGenerationFailed = true;
    }

    try {
      await createAdminNotification(
        'Documents ajoutés',
        `Le citoyen ${req.user.firstname || 'un citoyen'} a ajouté un nouveau document de type ${documentType}.`,
        'system',
        doc._id
      );
    } catch (err) {
      console.error('Error sending admin notification on document create', err);
    }

    res.status(201).json({ 
      success: true, 
      message: pdfGenerationFailed ? 'Document créé sans PDF' : 'Document créé avec succès', 
      document: doc,
      pdfError: pdfGenerationFailed
    });
  } catch (err) {
    console.error('Erreur création document:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/citizen-docs/:id
exports.updateDocument = async (req, res) => {
  try {
    const doc = await CitizenDocument.findOne({ _id: req.params.id, citizenId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document introuvable' });

    const { formData, documentType } = req.body;
    if (documentType) doc.documentType = documentType;
    if (formData)     doc.formData     = formData;

    // Regenerate PDF
    const pdfPath = await buildPDF(null, doc);
    doc.pdfUrl = pdfPath;
    await doc.save();

    res.json({ message: 'Document mis à jour', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// DELETE /api/citizen-docs/:id
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await CitizenDocument.findOneAndDelete({ _id: req.params.id, citizenId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document introuvable' });

    // Remove PDF file from cloudinary
    if (doc.pdfUrl && doc.pdfUrl.includes('cloudinary')) {
      const publicIdMatch = doc.pdfUrl.match(/\/v\d+\/(.+)$/);
      if (publicIdMatch) {
        let publicId = publicIdMatch[1];
        if (publicId.includes('.')) {
          publicId = publicId.substring(0, publicId.lastIndexOf('.'));
        }
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      }
    }

    res.json({ message: 'Document supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// GET /api/citizen-docs/:id/download
exports.downloadDocument = async (req, res) => {
  try {
    const doc = await CitizenDocument.findOne({ _id: req.params.id, citizenId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Document introuvable' });

    // Regenerate PDF on demand to ensure it exists
    const pdfPath = await buildPDF(null, doc);
    doc.pdfUrl = pdfPath;
    await doc.save();

    if (doc.pdfUrl.startsWith('http')) {
      return res.redirect(doc.pdfUrl);
    }

    // fallback for local (should not happen anymore)
    const fullPath = path.join(__dirname, '..', doc.pdfUrl);
    res.download(fullPath, `${doc.documentType}-${doc.referenceNumber}.pdf`);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
