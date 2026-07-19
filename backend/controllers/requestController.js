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
      let generationType = 'receipt';

      // 1. Look for an OfficialPdfTemplate linked to this procedure
      const officialTemplate = procedureRef
        ? await OfficialPdfTemplate.findOne({ procedureId: procedureRef, status: 'active' })
        : null;

      if (officialTemplate) {
        generationType = 'official-template';
        console.log(`[createRequest] Génération PDF via OfficialPdfTemplate : ${officialTemplate._id}`);
        pdfPath = await pdfGenerator.generateFromOfficialTemplate(
          populated.toObject(),
          populated.citizenId,
          populated.referenceNumber,
          officialTemplate
        );
      } else if (populated.procedureId && populated.procedureId.pdfTemplate) {
        // 2. Legacy: procedure has a pdfTemplate field
        generationType = 'template';
        console.log(`[createRequest] Génération PDF via pdfTemplate procédure`);
        pdfPath = await pdfGenerator.generateTemplatePdf(
          populated.toObject(),
          populated.citizenId,
          populated.referenceNumber,
          populated.procedureId
        );
      } else {
        // 3. Generic professional receipt
        generationType = 'receipt';
        console.log(`[createRequest] Génération récépissé générique`);
        pdfPath = await pdfGenerator.generateReceiptPdf(
          { ...populated.toObject(), procedureType: populated.procedureId?.title },
          populated.citizenId,
          populated.referenceNumber
        );
      }

      console.log(`[createRequest] PDF généré (${generationType}) → ${pdfPath}`);

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
      console.error(`[createRequest] Échec génération PDF (non-bloquant) : ${pdfErr.message}`, pdfErr.stack);
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
      .select('referenceNumber status procedureId formData uploadedFiles adminComment generatedPdf finalDocument createdAt updatedAt')
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
    console.log("REQUEST ID =", req.params.id);
    console.log("NEW STATUS =", req.body.status);

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Demande introuvable' });
    }
    
    console.log("REQUEST FOUND =", request);
    console.log("BEFORE SAVE =", request.status);

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

        try {
          await GeneratedDocument.create({
            citizenId: request.citizenId,
            requestId: request._id,
            documentType: 'official',
            referenceNumber: `DOC-${request.referenceNumber}`,
            pdfUrl: request.generatedPdf,
            status: 'available'
          });
        } catch (genErr) {
          console.error('[GeneratedDocument] Erreur lors de la création:', genErr.message);
          // Ignorer si E11000 Duplicate Key
        }
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
        // Envoi d'email en mode fire-and-forget pour ne pas bloquer l'API
        emailService.sendEmail({
          email: citizen.email,
          subject: 'Mise à jour de votre demande - Mairie de Dembéni',
          message: `Bonjour ${citizen.firstname || ''},\n\nLe statut de votre demande "${proc?.title || 'Démarche'}" est passé à : ${status}.\n${adminComment ? 'Commentaire : ' + adminComment : ''}\n\nCordialement,\nMairie de Dembéni`
        }).catch(emailErr => {
          console.warn('Email notification failed:', emailErr.message);
        });
      }
    } catch (emailErr) {
      console.warn('Email block failed:', emailErr.message);
    }

    res.json({ message: 'Statut mis à jour avec succès', request });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ─── Dynamic PDF Streaming Handlers (No Cloudinary) ────────────────────────
const handleDynamicPdf = async (req, res, type) => {
  const requestId = req.params.id;
  console.log(`[PDF Dynamic] ─── Début ───────────────────────────────`);
  console.log(`[PDF Dynamic] requestId  : ${requestId}, type: ${type}`);

  try {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: `ID invalide : ${requestId}` });
    }

    const request = await Request.findById(requestId)
      .populate('citizenId', 'firstname lastname email phone address')
      .populate('procedureId', 'title category pdfTemplate pdfFields')
      .populate('uploadedFiles');

    if (!request) {
      return res.status(404).json({ message: 'Demande introuvable.' });
    }

    if (
      request.citizenId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    if (type === 'official' && !['Validée', 'Terminée'].includes(request.status)) {
      return res.status(403).json({ message: 'Le document officiel sera disponible après validation.' });
    }

    const pdfGenerator = require('../utils/pdfGenerator');
    let pdfBuffer;

    if (type === 'official') {
      const OfficialPdfTemplate = require('../models/OfficialPdfTemplate');
      const officialTemplate = request.procedureId?._id
        ? await OfficialPdfTemplate.findOne({ procedureId: request.procedureId._id, status: 'active' })
        : null;

      if (officialTemplate && officialTemplate.templateFile) {
        console.log(`[PDF Dynamic] Using OfficialPdfTemplate`);
        pdfBuffer = await pdfGenerator.generateFromOfficialTemplate(
          request.toObject(), request.citizenId, request.referenceNumber, officialTemplate
        );
      } else if (request.procedureId?.pdfTemplate) {
        console.log(`[PDF Dynamic] Using Procedure pdfTemplate: ${request.procedureId.pdfTemplate}`);
        pdfBuffer = await pdfGenerator.generateTemplatePdf(
          request.toObject(), request.citizenId, request.referenceNumber, request.procedureId
        );
      } else {
        console.log(`[PDF Dynamic] Fallback to generic official PDFKit`);
        pdfBuffer = await pdfGenerator.generateOfficialPdf(
          request.toObject(), request.citizenId, request.referenceNumber
        );
      }
    } else {
      console.log(`[PDF Dynamic] Generating generic PDFKit receipt`);
      pdfBuffer = await pdfGenerator.generateReceiptPdf(
        { ...request.toObject(), procedureType: request.procedureId?.title },
        request.citizenId, request.referenceNumber
      );
    }

    // Set headers and return the raw binary buffer directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${type === 'official' ? 'document-officiel' : 'recepisse'}-${request.referenceNumber}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error(`[PDF Dynamic] Erreur : ${error.message}`);
    res.status(500).json({ message: `Impossible de générer le PDF : ${error.message}` });
  }
};

exports.downloadReceipt = (req, res) => handleDynamicPdf(req, res, 'receipt');
exports.downloadOfficial = (req, res) => handleDynamicPdf(req, res, 'official');
exports.downloadLegacyPdf = (req, res) => handleDynamicPdf(req, res, req.query.type === 'official' ? 'official' : 'receipt');


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

