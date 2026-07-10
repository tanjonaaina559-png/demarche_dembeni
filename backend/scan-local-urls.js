/**
 * scan-local-urls.js
 * Scanne MongoDB Atlas pour détecter toutes les URLs locales /uploads/
 * dans les collections PDF-critiques.
 * Usage: node scan-local-urls.js
 */

const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://dembeniadmin:dembeni123@cluster0.7qzjcfb.mongodb.net/?appName=Cluster0';

// ─── Schemas légers (lecture seule) ──────────────────────────────────────────
const OfficialDocument = mongoose.models.OfficialDocument ||
  mongoose.model('OfficialDocument', new mongoose.Schema({
    title: String,
    pdfUrl: String,
    fileName: String,
    category: String,
    active: Boolean,
  }, { timestamps: true }));

const OfficialPdfTemplate = mongoose.models.OfficialPdfTemplate ||
  mongoose.model('OfficialPdfTemplate', new mongoose.Schema({
    title: String,
    templateFile: String,
    fileName: String,
    status: String,
  }, { timestamps: true }));

const GeneratedDocument = mongoose.models.GeneratedDocument ||
  mongoose.model('GeneratedDocument', new mongoose.Schema({
    pdfUrl: String,
    referenceNumber: String,
    documentType: String,
    citizenId: mongoose.Schema.Types.ObjectId,
  }, { timestamps: true }));

const Request = mongoose.models.Request ||
  mongoose.model('Request', new mongoose.Schema({
    referenceNumber: String,
    finalDocument: String,
    generatedPdf: String,
    status: String,
    citizenId: mongoose.Schema.Types.ObjectId,
  }, { timestamps: true }));

const CitizenDocument = mongoose.models.CitizenDocument ||
  mongoose.model('CitizenDocument', new mongoose.Schema({
    pdfUrl: String,
    documentType: String,
    referenceNumber: String,
    citizenId: mongoose.Schema.Types.ObjectId,
  }, { timestamps: true }));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const LOCAL_PATTERN = /^\/uploads\//;
const CLOUDINARY_PATTERN = /^https:\/\/res\.cloudinary\.com\//;

function checkUrl(url) {
  if (!url || url === '') return 'EMPTY';
  if (CLOUDINARY_PATTERN.test(url)) return 'CLOUDINARY_OK';
  if (LOCAL_PATTERN.test(url)) return 'LOCAL_BUG';
  return 'UNKNOWN';
}

function colorStatus(status) {
  const map = {
    'CLOUDINARY_OK': '✅ CLOUDINARY',
    'LOCAL_BUG':     '🔴 LOCAL /uploads/',
    'EMPTY':         '⚠️  VIDE',
    'UNKNOWN':       '❓ INCONNU',
  };
  return map[status] || status;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  SCAN MONGODB — Vérification URLs Cloudinary vs Local      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connecté à MongoDB Atlas\n');

  const report = {
    OfficialDocument:    { total: 0, ok: 0, bug: 0, ids: [] },
    OfficialPdfTemplate: { total: 0, ok: 0, bug: 0, ids: [] },
    GeneratedDocument:   { total: 0, ok: 0, bug: 0, ids: [] },
    Request:             { total: 0, ok: 0, bug: 0, ids: [] },
    CitizenDocument:     { total: 0, ok: 0, bug: 0, ids: [] },
  };

  // ── 1. OfficialDocument ───────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log('📁 Collection: OfficialDocument (champ: pdfUrl)');
  console.log('─'.repeat(60));
  const officialDocs = await OfficialDocument.find({});
  report.OfficialDocument.total = officialDocs.length;
  for (const doc of officialDocs) {
    const status = checkUrl(doc.pdfUrl);
    console.log(`  [${doc._id}] "${doc.title}"`);
    console.log(`     pdfUrl: ${colorStatus(status)}`);
    console.log(`     ${doc.pdfUrl || '(vide)'}`);
    if (status === 'LOCAL_BUG') {
      report.OfficialDocument.bug++;
      report.OfficialDocument.ids.push({ id: doc._id, url: doc.pdfUrl, title: doc.title });
    } else if (status === 'CLOUDINARY_OK') {
      report.OfficialDocument.ok++;
    }
  }
  if (officialDocs.length === 0) console.log('  (collection vide)');
  console.log();

  // ── 2. OfficialPdfTemplate ────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log('📁 Collection: OfficialPdfTemplate (champ: templateFile)');
  console.log('─'.repeat(60));
  const templates = await OfficialPdfTemplate.find({});
  report.OfficialPdfTemplate.total = templates.length;
  for (const tmpl of templates) {
    const status = checkUrl(tmpl.templateFile);
    console.log(`  [${tmpl._id}] "${tmpl.title}"`);
    console.log(`     templateFile: ${colorStatus(status)}`);
    console.log(`     ${tmpl.templateFile || '(vide)'}`);
    if (status === 'LOCAL_BUG') {
      report.OfficialPdfTemplate.bug++;
      report.OfficialPdfTemplate.ids.push({ id: tmpl._id, url: tmpl.templateFile, title: tmpl.title });
    } else if (status === 'CLOUDINARY_OK') {
      report.OfficialPdfTemplate.ok++;
    }
  }
  if (templates.length === 0) console.log('  (collection vide)');
  console.log();

  // ── 3. GeneratedDocument ──────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log('📁 Collection: GeneratedDocument (champ: pdfUrl)');
  console.log('─'.repeat(60));
  const genDocs = await GeneratedDocument.find({});
  report.GeneratedDocument.total = genDocs.length;
  for (const doc of genDocs) {
    const status = checkUrl(doc.pdfUrl);
    console.log(`  [${doc._id}] ref="${doc.referenceNumber}" type=${doc.documentType}`);
    console.log(`     pdfUrl: ${colorStatus(status)}`);
    console.log(`     ${doc.pdfUrl || '(vide)'}`);
    if (status === 'LOCAL_BUG') {
      report.GeneratedDocument.bug++;
      report.GeneratedDocument.ids.push({ id: doc._id, url: doc.pdfUrl, ref: doc.referenceNumber });
    } else if (status === 'CLOUDINARY_OK') {
      report.GeneratedDocument.ok++;
    }
  }
  if (genDocs.length === 0) console.log('  (collection vide)');
  console.log();

  // ── 4. Request (finalDocument + generatedPdf) ─────────────────────────────
  console.log('─'.repeat(60));
  console.log('📁 Collection: Request (champs: finalDocument, generatedPdf)');
  console.log('─'.repeat(60));
  const requests = await Request.find({ $or: [{ finalDocument: { $ne: '' } }, { generatedPdf: { $ne: '' } }] });
  report.Request.total = requests.length;
  for (const req of requests) {
    const s1 = checkUrl(req.finalDocument);
    const s2 = checkUrl(req.generatedPdf);
    const hasBug = s1 === 'LOCAL_BUG' || s2 === 'LOCAL_BUG';
    console.log(`  [${req._id}] ref="${req.referenceNumber}" status=${req.status}`);
    console.log(`     finalDocument:  ${colorStatus(s1)} — ${req.finalDocument || '(vide)'}`);
    console.log(`     generatedPdf:   ${colorStatus(s2)} — ${req.generatedPdf || '(vide)'}`);
    if (hasBug) {
      report.Request.bug++;
      report.Request.ids.push({
        id: req._id,
        ref: req.referenceNumber,
        finalDocument: req.finalDocument,
        generatedPdf: req.generatedPdf,
      });
    } else {
      report.Request.ok++;
    }
  }
  if (requests.length === 0) console.log('  (aucune Request avec document PDF)');
  console.log();

  // ── 5. CitizenDocument ────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log('📁 Collection: CitizenDocument (champ: pdfUrl)');
  console.log('─'.repeat(60));
  const citizenDocs = await CitizenDocument.find({});
  report.CitizenDocument.total = citizenDocs.length;
  for (const doc of citizenDocs) {
    const status = checkUrl(doc.pdfUrl);
    console.log(`  [${doc._id}] type=${doc.documentType} ref=${doc.referenceNumber}`);
    console.log(`     pdfUrl: ${colorStatus(status)}`);
    console.log(`     ${doc.pdfUrl || '(vide)'}`);
    if (status === 'LOCAL_BUG') {
      report.CitizenDocument.bug++;
      report.CitizenDocument.ids.push({ id: doc._id, url: doc.pdfUrl, type: doc.documentType });
    } else if (status === 'CLOUDINARY_OK') {
      report.CitizenDocument.ok++;
    }
  }
  if (citizenDocs.length === 0) console.log('  (collection vide)');
  console.log();

  // ── 6. Vérification Cloudinary dossier dembeni/documents ─────────────────
  console.log('─'.repeat(60));
  console.log('☁️  Vérification Cloudinary — dossier dembeni/documents (RAW)');
  console.log('─'.repeat(60));
  try {
    const cloudResult = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'dembeni/documents',
      max_results: 20,
    });
    console.log(`  Fichiers trouvés: ${cloudResult.resources.length}`);
    cloudResult.resources.forEach((r, i) => {
      console.log(`  [${i + 1}] ${r.public_id}`);
      console.log(`       URL: ${r.secure_url}`);
      console.log(`       Format: ${r.format || 'raw'} | Taille: ${(r.bytes / 1024).toFixed(1)} KB | Créé: ${r.created_at}`);
    });
    if (cloudResult.resources.length === 0) {
      console.log('  ⚠️  Aucun fichier RAW dans dembeni/documents');
    }
  } catch (e) {
    console.log('  ❌ Erreur API Cloudinary:', e.message);
  }
  console.log();

  // ── Récapitulatif ─────────────────────────────────────────────────────────
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    RÉCAPITULATIF FINAL                     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');

  let totalBugs = 0;
  for (const [col, stats] of Object.entries(report)) {
    const icon = stats.bug > 0 ? '❌' : '✅';
    console.log(`║ ${icon} ${col.padEnd(22)} Total:${String(stats.total).padStart(3)}  OK:${String(stats.ok).padStart(3)}  BUG:${String(stats.bug).padStart(3)}     ║`);
    totalBugs += stats.bug;
  }

  console.log('╠════════════════════════════════════════════════════════════╣');
  if (totalBugs === 0) {
    console.log('║ ✅ PASS — Aucune URL locale détectée. Cloudinary OK.       ║');
  } else {
    console.log(`║ ❌ FAIL — ${String(totalBugs).padEnd(3)} URLs locales détectées — voir IDs ci-dessus    ║`);
  }
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // IDs problématiques
  if (totalBugs > 0) {
    console.log('🔴 DOCUMENTS AVEC URL LOCALE À CORRIGER:');
    for (const [col, stats] of Object.entries(report)) {
      if (stats.ids.length > 0) {
        console.log(`\n  Collection: ${col}`);
        stats.ids.forEach(item => console.log('   ', JSON.stringify(item)));
      }
    }
    console.log();
  }

  await mongoose.disconnect();
  console.log('Déconnecté de MongoDB.\n');
  process.exit(totalBugs > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
