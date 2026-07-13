const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { seedAdmin } = require('./config/seedAdmin');

dotenv.config();

const app = express();

// ─── 1. CORS — MUST come first, before helmet and everything else ────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://demarche-dembeni.vercel.app',
  // Pull from env if set (e.g. staging / preview deployments)
  process.env.CLIENT_URL,
].filter(Boolean); // remove undefined

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`[CORS] Origine refusée : ${origin}`);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));
// Handle ALL pre-flight OPTIONS requests
app.options('*', cors(corsOptions));

// ─── 2. Security headers ─────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false
}));

// ─── 3. Rate limiting (after CORS so OPTIONS responses are not throttled) ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// ─── 4. Body parsers + static files ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// ─── 5. Health-check route (always responds, even if DB is still connecting) ───
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Mairie de Dembéni API' }));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── 6. API routes ─────────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/cms', require('./routes/cmsRoutes'));
app.use('/api/content', require('./routes/publicCmsRoutes'));
app.use('/api/procedures', require('./routes/procedureRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/citizen-documents', require('./routes/citizenDocumentRoutes'));
app.use('/api', require('./routes/demarches.routes'));
app.use('/api/pdf', require('./routes/pdfRoutes'));
app.use('/api/home', require('./routes/homeRoutes'));
app.use('/api/official-documents', require('./routes/officialDocumentRoutes'));
app.use('/api/pdf-templates', require('./routes/officialPdfTemplateRoutes'));

// ─── 7. Global error handler ────────────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  // Ensure CORS headers are always present on error responses
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur', error: err.message });
});

// ─── 8. Start: connect DB then seed, then listen ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  // Connect to DB after server is listening so health-check works immediately
  connectDB().then(() => {
    seedAdmin();
  }).catch(err => {
    console.error('[DB] Erreur de connexion critique:', err.message);
  });
});
