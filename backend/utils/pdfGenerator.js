const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const generateReferenceNumber = async (RequestModel) => {
  const count = await RequestModel.countDocuments();
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(6, '0');
  return `DEM-${year}-${seq}`;
};

const generateReceiptPdf = async (request, citizen, referenceNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `receipt-${referenceNumber}.pdf`;
      const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Add watermark
      doc.save()
         .fillOpacity(0.1)
         .fontSize(60)
         .rotate(-45, { origin: [doc.page.width/2, doc.page.height/2] })
         .text('RÉCÉPISSÉ DE DÉPÔT', 100, 300)
         .restore();

      // Header
      doc.fontSize(16).font('Helvetica-Bold').text('COMMUNE DE DEMBENI', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('République Française', { align: 'center' });
      doc.moveDown(2);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('RÉCÉPISSÉ DE DÉPÔT', { align: 'center', underline: true });
      doc.moveDown(2);

      // Citizen Info & Request Info
      doc.fontSize(12).font('Helvetica');
      doc.text(`Référence automatique : ${referenceNumber}`);
      doc.text(`Numéro dossier : ${request._id.toString().slice(-8).toUpperCase()}`);
      doc.moveDown();
      
      doc.text(`Nom : ${citizen.lastName || ''}`);
      doc.text(`Prénom : ${citizen.firstName || ''}`);
      doc.text(`Email : ${citizen.email || ''}`);
      doc.text(`Téléphone : ${citizen.phone || ''}`);
      doc.moveDown();
      
      doc.text(`Type de démarche : ${request.procedureType || ''}`);
      doc.text(`Date de dépôt : ${new Date(request.createdAt || Date.now()).toLocaleDateString('fr-FR')}`);
      doc.text(`Statut : En attente`);
      doc.moveDown();

      // Attached Files
      doc.font('Helvetica-Bold').text('Liste des pièces jointes :');
      doc.font('Helvetica');
      if (request.uploadedFiles && request.uploadedFiles.length > 0) {
        request.uploadedFiles.forEach(file => {
          doc.text(`- ${file.field || file.filename}`);
        });
      } else {
        doc.text('- Aucune pièce jointe.');
      }
      doc.moveDown(2);

      // QR Code
      const qrData = JSON.stringify({
        ref: referenceNumber,
        name: `${citizen.firstName} ${citizen.lastName}`,
        type: request.procedureType
      });
      const qrImageBuffer = await QRCode.toBuffer(qrData);
      doc.image(qrImageBuffer, doc.page.width - 150, 50, { width: 100 });

      // Footer
      doc.fontSize(10).text('Mairie de Dembéni - Mayotte', 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/documents/${filename}`);
      });
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

const generateOfficialPdf = async (request, citizen, referenceNumber, stampOptions = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `official-${referenceNumber}.pdf`;
      const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, filename);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Add watermark
      doc.save()
         .fillOpacity(0.1)
         .fontSize(60)
         .rotate(-45, { origin: [doc.page.width/2, doc.page.height/2] })
         .text('DOCUMENT OFFICIEL', 100, 300)
         .restore();

      // Header
      doc.fontSize(16).font('Helvetica-Bold').text('COMMUNE DE DEMBENI', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('République Française', { align: 'center' });
      doc.moveDown(2);

      // Title based on procedure
      let title = 'DOCUMENT OFFICIEL';
      if (request.procedureType) {
        title = request.procedureType.toUpperCase();
      }
      doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center', underline: true });
      doc.moveDown(2);

      // Citizen Info & Request Info
      doc.fontSize(12).font('Helvetica');
      doc.text(`Référence : ${referenceNumber}`);
      doc.text(`Date de délivrance : ${new Date().toLocaleDateString('fr-FR')}`);
      doc.moveDown();
      
      doc.text(`Nous soussignés, Mairie de Dembéni, attestons que :`);
      doc.moveDown();
      
      doc.font('Helvetica-Bold');
      doc.text(`M./Mme ${citizen.firstName || ''} ${citizen.lastName || ''}`);
      doc.font('Helvetica');
      doc.text(`Email : ${citizen.email || ''}`);
      doc.text(`Téléphone : ${citizen.phone || ''}`);
      doc.moveDown();
      
      doc.text(`a effectué la démarche suivante avec succès : ${request.procedureType || ''}.`);
      doc.text(`Ce document est délivré pour servir et valoir ce que de droit.`);
      doc.moveDown(4);

      // Stamps and Signatures
      doc.text('Fait à Dembéni,', 300);
      doc.text(`Le ${new Date().toLocaleDateString('fr-FR')}`, 300);
      doc.moveDown(2);
      
      if (stampOptions.addStamp) {
        doc.font('Helvetica-Bold').text('CACHET DE LA MAIRIE', 300);
      }
      if (stampOptions.addSignature) {
        doc.font('Helvetica-Oblique').text('Signature électronique approuvée', 300);
      }

      // QR Code
      const qrData = JSON.stringify({
        ref: referenceNumber,
        name: `${citizen.firstName} ${citizen.lastName}`,
        type: request.procedureType,
        official: true
      });
      const qrImageBuffer = await QRCode.toBuffer(qrData);
      doc.image(qrImageBuffer, doc.page.width - 150, 50, { width: 100 });

      // Footer
      doc.fontSize(10).text('Mairie de Dembéni - Mayotte', 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/documents/${filename}`);
      });
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateReferenceNumber,
  generateReceiptPdf,
  generateOfficialPdf
};
