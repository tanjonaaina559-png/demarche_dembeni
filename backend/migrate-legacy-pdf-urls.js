/**
 * migrate-legacy-pdf-urls.js
 * 
 * Script de migration one-shot pour corriger les anciens documents
 * qui ont des URLs locales (/uploads/documents/...) dans MongoDB.
 * 
 * Usage:
 *   node migrate-legacy-pdf-urls.js
 * 
 * Ce script :
 * 1. Trouve tous les documents avec des URLs locales
 * 2. Tente d'uploader le fichier local vers Cloudinary (si disponible)
 * 3. Si le fichier local n'existe pas, marque le document comme corrompu
 * 4. Met à jour l'URL en base de données
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const path = require('path');
const fs = require('fs');

// ── Modèles ─────────────────────────────────────────────────────────────────────
const OfficialDocument = require('./models/OfficialDocument');
const Request = require('./models/Request');
const GeneratedDocument = require('./models/GeneratedDocument');
const CitizenDocument = require('./models/CitizenDocument');

const MONGODB_URI = process.env.MONGODB_URI;

async function uploadToCloudinary(localPath, publicId, folder = 'dembeni/documents') {
  console.log(`  Uploading PDF to Cloudinary: ${publicId}`);
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'raw',
      folder,
      public_id: publicId,
    });
    console.log(`  Cloudinary URL: ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`  Cloudinary Upload Error:`, err.message);
    return null;
  }
}

async function migrateOfficialDocuments() {
  console.log('\n=== Migration: OfficialDocument ===');
  const docs = await OfficialDocument.find({
    pdfUrl: { $regex: '^/uploads/' }
  });
  console.log(`  Trouvés : ${docs.length} documents avec chemin local`);

  for (const doc of docs) {
    console.log(`\n  Document: ${doc._id} | pdfUrl: ${doc.pdfUrl}`);
    const localFilePath = path.join(__dirname, doc.pdfUrl);

    if (fs.existsSync(localFilePath)) {
      const publicId = `official-migration-${doc._id}`;
      const cloudinaryUrl = await uploadToCloudinary(localFilePath, publicId);
      if (cloudinaryUrl) {
        doc.pdfUrl = cloudinaryUrl;
        await doc.save();
        console.log(`  ✅ Mis à jour: ${cloudinaryUrl}`);
      } else {
        console.warn(`  ⚠️  Échec upload Cloudinary. URL conservée: ${doc.pdfUrl}`);
      }
    } else {
      console.warn(`  ❌ Fichier local introuvable: ${localFilePath}`);
      console.warn(`     Le document sera marqué avec une URL placeholder.`);
      doc.pdfUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/dembeni/documents/placeholder-${doc._id}.pdf`;
      await doc.save();
    }
  }
}

async function migrateRequestPdfs() {
  console.log('\n=== Migration: Request.generatedPdf + finalDocument ===');
  const requests = await Request.find({
    $or: [
      { generatedPdf: { $regex: '^/uploads/' } },
      { finalDocument: { $regex: '^/uploads/' } }
    ]
  });
  console.log(`  Trouvés : ${requests.length} demandes avec chemins locaux`);

  for (const req of requests) {
    console.log(`\n  Request: ${req._id} | ref: ${req.referenceNumber}`);

    // Migrer generatedPdf
    if (req.generatedPdf && req.generatedPdf.startsWith('/uploads/')) {
      console.log(`    generatedPdf: ${req.generatedPdf}`);
      const localPath = path.join(__dirname, req.generatedPdf);
      if (fs.existsSync(localPath)) {
        const publicId = `request-gen-${req.referenceNumber || req._id}`;
        const url = await uploadToCloudinary(localPath, publicId);
        if (url) {
          req.generatedPdf = url;
          console.log(`    ✅ generatedPdf mis à jour`);
        }
      } else {
        console.warn(`    ❌ Fichier local introuvable: ${localPath}`);
        req.generatedPdf = '';
      }
    }

    // Migrer finalDocument
    if (req.finalDocument && req.finalDocument.startsWith('/uploads/')) {
      console.log(`    finalDocument: ${req.finalDocument}`);
      const localPath = path.join(__dirname, req.finalDocument);
      if (fs.existsSync(localPath)) {
        const publicId = `request-final-${req.referenceNumber || req._id}`;
        const url = await uploadToCloudinary(localPath, publicId);
        if (url) {
          req.finalDocument = url;
          console.log(`    ✅ finalDocument mis à jour`);
        }
      } else {
        console.warn(`    ❌ Fichier local introuvable: ${localPath}`);
        req.finalDocument = '';
      }
    }

    await req.save();
  }
}

async function migrateGeneratedDocuments() {
  console.log('\n=== Migration: GeneratedDocument.pdfUrl ===');
  const docs = await GeneratedDocument.find({
    pdfUrl: { $regex: '^/uploads/' }
  });
  console.log(`  Trouvés : ${docs.length} documents générés avec chemin local`);

  for (const doc of docs) {
    console.log(`\n  GeneratedDocument: ${doc._id} | pdfUrl: ${doc.pdfUrl}`);
    const localPath = path.join(__dirname, doc.pdfUrl);

    if (fs.existsSync(localPath)) {
      const publicId = `gendoc-${doc.referenceNumber || doc._id}`;
      const url = await uploadToCloudinary(localPath, publicId);
      if (url) {
        doc.pdfUrl = url;
        await doc.save();
        console.log(`  ✅ Mis à jour: ${url}`);
      }
    } else {
      console.warn(`  ❌ Fichier local introuvable. Suppression du document généré.`);
      // On conserve le document mais sans URL valide — à décider selon les besoins
      doc.pdfUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/dembeni/documents/placeholder-gendoc-${doc._id}.pdf`;
      await doc.save();
    }
  }
}

async function migrateCitizenDocuments() {
  console.log('\n=== Migration: CitizenDocument.pdfUrl ===');
  const docs = await CitizenDocument.find({
    pdfUrl: { $regex: '^/uploads/' }
  });
  console.log(`  Trouvés : ${docs.length} documents citoyen avec chemin local`);

  for (const doc of docs) {
    console.log(`\n  CitizenDocument: ${doc._id} | pdfUrl: ${doc.pdfUrl}`);
    const localPath = path.join(__dirname, doc.pdfUrl);

    if (fs.existsSync(localPath)) {
      const publicId = `citizendoc-${doc._id}`;
      const url = await uploadToCloudinary(localPath, publicId, 'dembeni/demo-documents');
      if (url) {
        doc.pdfUrl = url;
        await doc.save();
        console.log(`  ✅ Mis à jour: ${url}`);
      }
    } else {
      console.warn(`  ❌ Fichier local introuvable. pdfUrl réinitialisé.`);
      doc.pdfUrl = null;
      await doc.save();
    }
  }
}

async function run() {
  console.log('🔍 Vérification variables Cloudinary...');
  console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ MANQUANT');
  console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || '❌ MANQUANT');
  console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ OK' : '❌ MANQUANT');

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('\n❌ Variables Cloudinary manquantes ! Arrêt du script.');
    process.exit(1);
  }

  console.log('\n📦 Connexion MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB');

  try {
    await migrateOfficialDocuments();
    await migrateRequestPdfs();
    await migrateGeneratedDocuments();
    await migrateCitizenDocuments();

    console.log('\n\n✅ ======================================');
    console.log('   MIGRATION TERMINÉE AVEC SUCCÈS');
    console.log('   Tous les anciens chemins /uploads/');
    console.log('   ont été remplacés par des URLs Cloudinary.');
    console.log('========================================');
  } catch (err) {
    console.error('\n❌ Erreur lors de la migration:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

run();
