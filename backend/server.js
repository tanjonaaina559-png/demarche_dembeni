const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const { seedAdmin } = require('./config/seedAdmin');

dotenv.config();
connectDB().then(() => {
  seedAdmin();
});

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false
}));
// app.use(mongoSanitize()); // Disabled: Incompatible with Express 5 (req.query is getter only)
// app.use(xss()); // Disabled: Incompatible with Express 5

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

app.use(cors({
  origin: true,
  credentials: true
}));
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
