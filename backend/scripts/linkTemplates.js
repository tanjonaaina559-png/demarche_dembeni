require('dotenv').config();
const mongoose = require('mongoose');
const Procedure = require('../models/Procedure');

const updateTemplates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const mapping = {
      'Acte de naissance': '/templates/acte-naissance.pdf',
      'Certificat de résidence': '/templates/certificat-residence.pdf',
      'Mariage': '/templates/mariage.pdf',
      'Décès': '/templates/deces.pdf',
      'Crèche': '/templates/creche.pdf',
      'Pré-inscription Crèche': '/templates/creche.pdf'
    };

    const procedures = await Procedure.find({});
    for (const p of procedures) {
      const match = Object.keys(mapping).find(k => p.title.toLowerCase().includes(k.toLowerCase()));
      if (match) {
        p.pdfTemplate = mapping[match];
        await p.save();
        console.log(`Updated ${p.title} -> ${p.pdfTemplate}`);
      }
    }
    console.log('Done updating procedures.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

updateTemplates();
