const Request = require('../models/Request');
const UploadedDocument = require('../models/UploadedDocument');
const Notification = require('../models/Notification');
const { createAdminNotification } = require('../utils/notificationHelper');
const Procedure = require('../models/Procedure');
const OfficialPdfTemplate = require('../models/OfficialPdfTemplate');
const mongoose = require('mongoose');
const pdfGenerator = require('../utils/pdfGenerator');
const GeneratedDocument = require('../models/GeneratedDocument');

// ─── Create a new request + auto-generate PDF receipt ─────────────────────────
exports.createRequest = async (req, res) => {
  try {
    const { procedureId } = req.body;

    if (!procedureId) {
      return res.status(400).json({ message: 'Validation Error: procedureId est requis.' });
    }
    if (!req.body.formData) {
      return res.status(400).json({ message: 'Validation Error: formData est requis.' });
    }

    // Lookup procedure
    let procedureRef = null;
    let procedureTitle = '';
    if (procedureId && mongoose.Types.ObjectId.isValid(procedureId)) {
      const proc = await Procedure.findById(procedureId);
      if (proc) {
        procedureRef = proc._id;
        procedureTitle = proc.title;
      }
    }

    // Handle file uploads
    const uploadedDocs = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // file.path is the Cloudinary secure_url when using cloudinaryCitizenUpload
        const cloudinaryUrl = file.path;
        const doc = new UploadedDocument({
          filename: file.filename || file.originalname,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: cloudinaryUrl, // Cloudinary URL
          uploader: req.user._id
        });
        await doc.save();
        uploadedDocs.push(doc._id);
      }
    }

    let parsedFormData = {};
    if (req.body.formData) {
      try {
        parsedFormData = typeof req.body.formData === 'string'
          ? JSON.parse(req.body.formData)
          : req.body.formData;
      } catch (e) {
        console.error('Error parsing formData', e);
      }
    }

    const newRequest = new Request({
      citizenId: req.user._id,
      procedureId: procedureRef,
      formData: parsedFormData,
      uploadedFiles: uploadedDocs
    });

    await newRequest.save();

    // Populate before PDF generation so citizen + procedure names are available
    const populated = await Request.findById(newRequest._id)
      .populate('citizenId', 'firstname lastname email phone address')
      .populate('procedureId', 'title category pdfTemplate pdfFields')
      .populate('uploadedFiles');

    // Auto-generate official PDF: check OfficialPdfTemplate first
    try {
      let pdfPath;

      // 1. Look for an OfficialPdfTemplate linked to this procedure
      const officialTemplate = procedureRef
        ? await OfficialPdfTemplate.findOne({ procedureId: procedureRef, status: 'active' })
        : null;

      if (officialTemplate) {
        pdfPath = await pdfGenerator.generateFromOfficialTemplate(
          populated.toObject(),
          populated.citizenId,
          populated.referenceNumber,
          officialTemplate
        );
      } else if (populated.procedureId && populated.procedureId.pdfTemplate) {
        // 2. Legacy: procedure has a pdfTemplate field
        pdfPath = await pdfGenerator.generateTemplatePdf(
          populated.toObject(),
          populated.citizenId,
          populated.referenceNumber,
          populated.procedureId
        );
      } else {
        // 3. Generic professional receipt
        pdfPath = await pdfGenerator.generateReceiptPdf(
          { ...populated.toObject(), procedureType: populated.procedureId?.title },
          populated.citizenId,
          populated.referenceNumber
        );
      }

      populated.generatedPdf = pdfPath;
      await Request.findByIdAndUpdate(newRequest._id, { generatedPdf: pdfPath });

      await GeneratedDocument.create({
        citizenId: req.user._id,
        requestId: newRequest._id,
        documentType: (officialTemplate || populated.procedureId?.pdfTemplate) ? 'official' : 'receipt',
        referenceNumber: ((officialTemplate || populated.procedureId?.pdfTemplate) ? 'DOC-' : 'REC-') + populated.referenceNumber,
        pdfUrl: pdfPath,
        status: 'available'
      });
    } catch (pdfErr) {
      console.warn('PDF generation failed (non-blocking):', pdfErr.message);
    }

    // Citizen notification
    await Notification.create({
      user: req.user._id,
      title: 'Demande soumise',
      message: `Votre demande "${procedureTitle || 'Démarche administrative'}" a été soumise avec succès. Vous pouvez télécharger votre récépissé depuis votre espace.`,
      type: 'request_update',
      relatedId: newRequest._id
    });

    // Admin notification
    try {
      await createAdminNotification(
        'Nouvelle demande reçue',
        `Une nouvelle demande "${procedureTitle || 'Démarche administrative'}" a été soumise par ${req.user.firstname || 'un citoyen'}.`,
        'system',
        newRequest._id
      );
    } catch (err) {
      console.error('Error sending admin notification on createRequest', err);
    }

    res.status(201).json({
      message: 'Demande soumise avec succès',
      request: populated
    });
  } catch (error) {
    console.error('createRequest error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message, stack: error.stack });
  }
};

// ─── Citizen: Get own requests ─────────────────────────────────────────────────
exports.getCitizenRequests = async (req, res) => {
  try {
    const requests = await Request.find({ citizenId: req.user._id })
      .populate('procedureId', 'title category')
      .populate('uploadedFiles')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ─── Admin: Get all requests ───────────────────────────────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('citizenId', 'firstname lastname email')
      .populate('procedureId', 'title category')
      .populate('uploadedFiles')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ─── Admin: Update request status + regenerate PDF if validated ───────────────
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Demande introuvable' });
    }

    request.status = status || request.status;
    if (adminComment !== undefined) {
      request.adminComment = adminComment;
    }
    await request.save();

    // Regenerate PDF when status changes to reflect updated status
    if (status === 'Validée' && !request.finalDocument) {
      // In the new system, generatedPdf is the official filled template.
      // We will just use it as the final document, avoiding the generic pdfkit generation.
      if (request.generatedPdf) {
        request.finalDocument = request.generatedPdf;
        await request.save();

        await GeneratedDocument.create({
          citizenId: request.citizenId,
          requestId: request._id,
          documentType: 'official',
          referenceNumber: `DOC-${request.referenceNumber}`,
          pdfUrl: request.generatedPdf,
          status: 'available'
        });
      }
    }

    // Determine notification type
    const notifType = status === 'Validée' ? 'validation'
                    : status === 'Rejetée' ? 'rejection'
                    : 'request_update';

    await Notification.create({
      user: request.citizenId,
      title: 'Mise à jour de votre demande',
      message: `Le statut de votre demande n°${request.referenceNumber || request._id} est passé à : ${status}.${adminComment ? ' Commentaire : ' + adminComment : ''}`,
      type: notifType,
      relatedId: request._id
    });

    // Email (non-blocking)
    try {
      const emailService = require('../utils/emailService');
      const citizen = await require('../models/User').findById(request.citizenId);
      if (citizen && citizen.email) {
        const proc = await Procedure.findById(request.procedureId);
        await emailService.sendEmail({
          email: citizen.email,
          subject: 'Mise à jour de votre demande - Mairie de Dembéni',
          message: `Bonjour ${citizen.firstname || ''},\n\nLe statut de votre demande "${proc?.title || 'Démarche'}" est passé à : ${status}.\n${adminComment ? 'Commentaire : ' + adminComment : ''}\n\nCordialement,\nMairie de Dembéni`
        });
      }
    } catch (emailErr) {
      console.warn('Email notification failed:', emailErr.message);
    }

    res.json({ message: 'Statut mis à jour avec succès', request });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ─── Download generated PDF receipt/official (citizen or admin) ────────────────────────
exports.downloadPdfReceipt = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('citizenId', 'firstname lastname email phone address')
      .populate('procedureId', 'title category');

    if (!request) {
      return res.status(404).json({ message: 'Demande introuvable' });
    }

    if (!['Validée', 'Terminée'].includes(request.status)) {
      return res.status(403).json({ message: 'Le document sera disponible après validation par l\'administration.' });
    }

    // Ensure user owns the request or is admin
    if (
      request.citizenId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const type = req.query.type || 'receipt';
    const pdfUrl = type === 'official' ? request.finalDocument : request.generatedPdf;

    if (!pdfUrl) {
      return res.status(404).json({ message: 'PDF non disponible' });
    }

    if (pdfUrl.startsWith('http')) {
      return res.redirect(pdfUrl);
    }

    // fallback for legacy local files
    const path = require('path');
    const fullPath = path.join(__dirname, '..', pdfUrl);
    
    res.download(fullPath);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ─── Get generated documents for a citizen ───────────────────────────────────
exports.getCitizenDocuments = async (req, res) => {
  try {
    const documents = await GeneratedDocument.find({ citizenId: req.user._id })
      .populate({ path: 'requestId', select: 'procedureType status procedureId', populate: { path: 'procedureId', select: 'title' } })
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ─── Verify document by reference ────────────────────────────────────────────
exports.verifyDocument = async (req, res) => {
  try {
    const { reference } = req.params;
    const request = await Request.findOne({ referenceNumber: reference })
      .populate('citizenId', 'firstname lastname email')
      .populate('procedureId', 'title category');

    if (!request) {
      return res.status(404).json({ message: 'Document introuvable ou invalide.' });
    }

    if (request.status !== 'Validée' && request.status !== 'Terminée') {
      return res.status(403).json({ message: 'Ce document n\'est pas encore validé par l\'administration.' });
    }

    res.json({
      authenticity: 'VALIDE',
      reference: request.referenceNumber,
      type: request.procedureId?.title || request.procedureType,
      citizen: `${request.citizenId?.firstname || ''} ${request.citizenId?.lastname || ''}`.trim(),
      date: request.updatedAt || request.createdAt,
      status: request.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification', error: error.message });
  }
};

