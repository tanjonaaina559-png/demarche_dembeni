const User = require('../models/User');
const Procedure = require('../models/Procedure');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'dembenimairie@gmail.com' });
    if (!adminExists) {
      await User.create({
        firstname: 'Admin',
        lastname: 'Dembéni',
        email: 'dembenimairie@gmail.com',
        password: 'dembeni123',
        status: 'active',
        role: 'admin'
      });
      console.log('Compte Administrateur par défaut créé.');
    } else {
      console.log('Compte Administrateur déjà existant.');
    }

    const procedureExists = await Procedure.findOne();
    if (!procedureExists) {
      await Procedure.create({
        title: 'Request d\'acte de naissance',
        category: 'etat-civil',
        description: 'Request d\'une copie intégrale d\'acte de naissance ou d\'un extrait avec filiation.',
        requiredDocuments: [{ name: 'Pièce d\'identité', description: 'CNI ou passeport' }],
        processingTime: '5 jours ouvrables'
      });
      console.log('Procédure par défaut créée.');
    }
  } catch (error) {
    console.error('Erreur lors du seed Admin/Procédure:', error);
  }
};

module.exports = { seedAdmin };
