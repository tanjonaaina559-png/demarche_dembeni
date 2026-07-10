/**
 * fix-legacy-official-doc.js
 * Migre les OfficialDocument avec une URL /uploads/ locale vers Cloudinary.
 * Télécharge le fichier depuis le disque local (si disponible) ou signale l'entrée orpheline.
 *
 * Usage: node fix-legacy-official-doc.js
 */

const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://dembeniadmin:dembeni123@cluster0.7qzjcfb.mongodb.net/?appName=Cluster0';

const OfficialDocument = mongoose.models.OfficialDocument ||
  mongoose.model('OfficialDocument', new mongoose.Schema({
    title: String,
    pdfUrl: String,
    fileName: String,
    category: String,
    active: Boolean,
    size: Number,
  }, { timestamps: true }));

async function uploadBufferToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'dembeni/documents',
        resource_type: 'raw',
        public_id: publicId,
        allowed_formats: ['pdf'],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  MIGRATION — OfficialDocument URLs locales → Cloudinary      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB Atlas\n');

  // Trouver tous les docs avec une URL locale
  const docs = await OfficialDocument.find({
    pdfUrl: { $regex: '^/uploads/', $options: 'i' }
  });

  if (docs.length === 0) {
    console.log('✅ Aucun document avec URL locale. Migration non nécessaire.\n');
    await mongoose.disconnect();
    return;
  }

  console.log(`🔴 ${docs.length} document(s) avec URL locale à migrer:\n`);

  let migrated = 0;
  let failed   = 0;
  const failedIds = [];

  for (const doc of docs) {
    console.log(`─────────────────────────────────────────────────────────────`);
    console.log(`Document: "${doc.title}" [${doc._id}]`);
    console.log(`URL actuelle: ${doc.pdfUrl}`);

    const localPath = path.join(__dirname, doc.pdfUrl);
    console.log(`Chemin local: ${localPath}`);

    if (fs.existsSync(localPath)) {
      // Fichier disponible localement — uploader directement
      console.log('Fichier trouvé localement. Upload vers Cloudinary...');
      try {
        const buffer = fs.readFileSync(localPath);
        const publicId = `official-${Date.now()}-${path.basename(localPath, '.pdf')}`;
        const result = await uploadBufferToCloudinary(buffer, publicId);

        console.log('✅ Cloudinary Upload Success');
        console.log('Cloudinary URL:', result.secure_url);

        // Mettre à jour MongoDB (bypass validator via update direct)
        await OfficialDocument.updateOne(
          { _id: doc._id },
          { $set: { pdfUrl: result.secure_url } },
          { runValidators: false }
        );

        console.log('PDF URL saved in MongoDB:', result.secure_url);
        migrated++;
      } catch (err) {
        console.error('❌ Erreur upload Cloudinary:', err.message);
        failed++;
        failedIds.push({ id: doc._id, title: doc.title, error: err.message });
      }
    } else {
      // Fichier local absent (Render a déjà effacé le disque éphémère)
      // → Marquer le document comme invalide ou le supprimer
      console.log('⚠️  Fichier local introuvable (disque Render effacé).');
      console.log('   → Action: suppression du document orphelin de MongoDB.');

      try {
        await OfficialDocument.deleteOne({ _id: doc._id });
        console.log(`✅ Document orphelin supprimé: [${doc._id}] "${doc.title}"`);
        migrated++;
      } catch (err) {
        console.error('❌ Erreur suppression:', err.message);
        failed++;
        failedIds.push({ id: doc._id, title: doc.title, error: err.message });
      }
    }
    console.log();
  }

  // Récapitulatif
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                   RÉCAPITULATIF MIGRATION                    ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Total traités : ${String(docs.length).padEnd(44)}║`);
  console.log(`║  ✅ Migrés/Nettoyés : ${String(migrated).padEnd(40)}║`);
  console.log(`║  ❌ Échecs : ${String(failed).padEnd(48)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  if (failedIds.length > 0) {
    console.log('IDs en échec:');
    failedIds.forEach(f => console.log(' ', JSON.stringify(f)));
  }

  await mongoose.disconnect();
  console.log('Déconnecté de MongoDB.\n');
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
