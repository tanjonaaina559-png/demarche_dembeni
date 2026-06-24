/**
 * seedProcedures.js – Insère les démarches administratives exactes requises.
 * Usage : node seedProcedures.js
 */
const mongoose = require('mongoose');
const Procedure = require('./models/Procedure');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dembeni';

const procedures = [
  // ==================================================
  // CATEGORY 1 : ETAT CIVIL ET FAMILLE
  // ==================================================
  {
    title: 'Se marier',
    category: 'civil',
    description: 'Demande de célébration de mariage à la mairie de Dembéni.',
    icon: 'fas fa-ring',
    isActive: true,
    requiredFields: [
      { name: 'nomEpoux', label: 'Nom futur époux', type: 'text', required: true },
      { name: 'prenomEpoux', label: 'Prénom futur époux', type: 'text', required: true },
      { name: 'dateNaissanceEpoux', label: 'Date de naissance futur époux', type: 'date', required: true },
      { name: 'adresseEpoux', label: 'Adresse futur époux', type: 'text', required: true },
      { name: 'nomEpouse', label: 'Nom future épouse', type: 'text', required: true },
      { name: 'prenomEpouse', label: 'Prénom future épouse', type: 'text', required: true },
      { name: 'dateNaissanceEpouse', label: 'Date de naissance future épouse', type: 'date', required: true },
      { name: 'adresseEpouse', label: 'Adresse future épouse', type: 'text', required: true },
      { name: 'dateMariage', label: 'Date souhaitée du mariage', type: 'date', required: true },
      { name: 'lieuMariage', label: 'Lieu du mariage', type: 'text', required: true },
      { name: 'telephone', label: 'Téléphone', type: 'tel', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true }
    ],
    documents: [
      { name: 'CIN époux', required: true },
      { name: 'CIN épouse', required: true },
      { name: 'Acte de naissance époux', required: true },
      { name: 'Acte de naissance épouse', required: true },
      { name: 'Justificatif de domicile', required: true }
    ]
  },
  {
    title: 'Demande d\'acte de naissance',
    category: 'civil',
    description: 'Obtenir une copie intégrale ou un extrait d\'acte de naissance.',
    icon: 'fas fa-baby',
    isActive: true,
    requiredFields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true },
      { name: 'prenom', label: 'Prénom', type: 'text', required: true },
      { name: 'dateNaissance', label: 'Date de naissance', type: 'date', required: true },
      { name: 'lieuNaissance', label: 'Lieu de naissance', type: 'text', required: true },
      { name: 'nomPere', label: 'Nom du père', type: 'text', required: true },
      { name: 'nomMere', label: 'Nom de la mère', type: 'text', required: true },
      { name: 'adresse', label: 'Adresse', type: 'text', required: true },
      { name: 'telephone', label: 'Téléphone', type: 'tel', required: true }
    ],
    documents: [
      { name: 'CIN', required: true },
      { name: 'Livret de famille', required: true }
    ]
  },
  {
    title: 'Demande de livret de famille',
    category: 'civil',
    description: 'Demande d\'un premier livret ou d\'un duplicata.',
    icon: 'fas fa-book',
    isActive: true,
    requiredFields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true },
      { name: 'prenom', label: 'Prénom', type: 'text', required: true },
      { name: 'adresse', label: 'Adresse', type: 'text', required: true },
      { name: 'telephone', label: 'Téléphone', type: 'tel', required: true },
      { name: 'motif', label: 'Motif', type: 'textarea', required: true }
    ],
    documents: [
      { name: 'CIN', required: true },
      { name: 'Acte de mariage', required: true },
      { name: 'Déclaration de perte (si duplicata)', required: false } // Only required if duplicate
    ]
  },

  // ==================================================
  // CATEGORY 2 : DOCUMENTS OFFICIELS
  // ==================================================
  {
    title: 'Carte Nationale d\'Identité',
    category: 'documents',
    description: 'Première demande ou renouvellement de votre CNI.',
    icon: 'fas fa-id-card',
    isActive: true,
    requiredFields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true },
      { name: 'prenom', label: 'Prénom', type: 'text', required: true },
      { name: 'dateNaissance', label: 'Date de naissance', type: 'date', required: true },
      { name: 'adresse', label: 'Adresse', type: 'text', required: true },
      { name: 'profession', label: 'Profession', type: 'text', required: true },
      { name: 'telephone', label: 'Téléphone', type: 'tel', required: true }
    ],
    documents: [
      { name: 'Acte de naissance', required: true },
      { name: 'Photo identité', required: true },
      { name: 'Justificatif domicile', required: true }
    ]
  },
  {
    title: 'Passeport',
    category: 'documents',
    description: 'Demande de passeport biométrique.',
    icon: 'fas fa-passport',
    isActive: true,
    requiredFields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true },
      { name: 'prenom', label: 'Prénom', type: 'text', required: true },
      { name: 'dateNaissance', label: 'Date de naissance', type: 'date', required: true },
      { name: 'nationalite', label: 'Nationalité', type: 'text', required: true },
      { name: 'profession', label: 'Profession', type: 'text', required: true },
      { name: 'adresse', label: 'Adresse', type: 'text', required: true },
      { name: 'taille', label: 'Taille', type: 'text', required: true },
      { name: 'couleurYeux', label: 'Couleur des yeux', type: 'text', required: true }
    ],
    documents: [
      { name: 'CIN', required: true },
      { name: 'Photo identité', required: true },
      { name: 'Justificatif domicile', required: true }
    ]
  },
  {
    title: 'Identité Numérique',
    category: 'documents',
    description: 'Création de votre identité numérique certifiée.',
    icon: 'fas fa-fingerprint',
    isActive: true,
    requiredFields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true },
      { name: 'prenom', label: 'Prénom', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'telephone', label: 'Téléphone', type: 'tel', required: true }
    ],
    documents: [
      { name: 'CIN', required: true }
    ]
  },
  {
    title: 'Acte de décès',
    category: 'documents',
    description: 'Demande de copie intégrale d\'acte de décès.',
    icon: 'fas fa-cross',
    isActive: true,
    requiredFields: [
      { name: 'nomDefunt', label: 'Nom du défunt', type: 'text', required: true },
      { name: 'prenomDefunt', label: 'Prénom du défunt', type: 'text', required: true },
      { name: 'dateDeces', label: 'Date décès', type: 'date', required: true },
      { name: 'lieuDeces', label: 'Lieu décès', type: 'text', required: true },
      { name: 'demandeur', label: 'Demandeur (Nom et prénom)', type: 'text', required: true }
    ],
    documents: [
      { name: 'CIN demandeur', required: true }
    ]
  },

  // ==================================================
  // CATEGORY 3 : COLLECTE DES ENCOMBRANTS
  // ==================================================
  {
    title: 'Collecte des encombrants',
    category: 'ecologie',
    description: 'Demande d\'enlèvement d\'objets volumineux à domicile.',
    icon: 'fas fa-truck-pickup',
    isActive: true,
    requiredFields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true },
      { name: 'prenom', label: 'Prénom', type: 'text', required: true },
      { name: 'adresse', label: 'Adresse', type: 'text', required: true },
      { name: 'telephone', label: 'Téléphone', type: 'tel', required: true },
      { name: 'typeEncombrants', label: 'Type d\'encombrants', type: 'text', required: true },
      { name: 'quantite', label: 'Quantité', type: 'number', required: true },
      { name: 'dateSouhaitee', label: 'Date souhaitée', type: 'date', required: true }
    ],
    documents: [
      { name: 'Photo des encombrants', required: true }
    ]
  },

  // ==================================================
  // CATEGORY 4 : CRECHE
  // ==================================================
  {
    title: 'Inscription en crèche',
    category: 'enfance',
    description: 'Demande de place en structure d\'accueil petite enfance.',
    icon: 'fas fa-baby-carriage',
    isActive: true,
    requiredFields: [
      { name: 'nomEnfant', label: 'Nom enfant', type: 'text', required: true },
      { name: 'prenomEnfant', label: 'Prénom enfant', type: 'text', required: true },
      { name: 'dateNaissance', label: 'Date naissance', type: 'date', required: true },
      { name: 'nomParent', label: 'Nom parent', type: 'text', required: true },
      { name: 'adresse', label: 'Adresse', type: 'text', required: true },
      { name: 'telephone', label: 'Téléphone', type: 'tel', required: true }
    ],
    documents: [
      { name: 'Acte naissance', required: true },
      { name: 'Carnet vaccination', required: true }
    ]
  },

  // ==================================================
  // CATEGORY 5 : CENTRE DE LOISIRS
  // ==================================================
  {
    title: 'Centre de loisirs',
    category: 'enfance',
    description: 'Inscription aux activités périscolaires et extrascolaires.',
    icon: 'fas fa-palette',
    isActive: true,
    requiredFields: [
      { name: 'nomEnfant', label: 'Nom enfant', type: 'text', required: true },
      { name: 'prenomEnfant', label: 'Prénom enfant', type: 'text', required: true },
      { name: 'age', label: 'Age', type: 'number', required: true },
      { name: 'ecole', label: 'Ecole', type: 'text', required: true },
      { name: 'classe', label: 'Classe', type: 'text', required: true },
      { name: 'parentResponsable', label: 'Parent responsable', type: 'text', required: true }
    ],
    documents: [
      { name: 'Acte naissance', required: true },
      { name: 'Certificat scolaire', required: true }
    ]
  },

  // ==================================================
  // CATEGORY 6 : URBANISME ET HABITAT
  // ==================================================
  {
    title: 'Permis de construire',
    category: 'urbanisme',
    description: 'Demande d\'autorisation d\'urbanisme pour une construction.',
    icon: 'fas fa-home',
    isActive: true,
    requiredFields: [
      { name: 'nomProprietaire', label: 'Nom propriétaire', type: 'text', required: true },
      { name: 'adresseTerrain', label: 'Adresse terrain', type: 'text', required: true },
      { name: 'referenceParcelle', label: 'Référence parcelle', type: 'text', required: true },
      { name: 'surface', label: 'Surface', type: 'text', required: true },
      { name: 'descriptionProjet', label: 'Description projet', type: 'textarea', required: true }
    ],
    documents: [
      { name: 'Plan terrain', required: true },
      { name: 'Titre foncier', required: true },
      { name: 'Photos terrain', required: true }
    ]
  },
  {
    title: 'Déclaration de travaux',
    category: 'urbanisme',
    description: 'Déclaration préalable pour des travaux d\'aménagement.',
    icon: 'fas fa-hammer',
    isActive: true,
    requiredFields: [
      { name: 'nomProprietaire', label: 'Nom propriétaire', type: 'text', required: true },
      { name: 'adresseTravaux', label: 'Adresse travaux', type: 'text', required: true },
      { name: 'typeTravaux', label: 'Type travaux', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true }
    ],
    documents: [
      { name: 'Plan', required: true },
      { name: 'Photos', required: true }
    ]
  },
  {
    title: 'Renseignements cadastraux',
    category: 'urbanisme',
    description: 'Demande d\'extrait de plan ou matrice cadastrale.',
    icon: 'fas fa-map-marked-alt',
    isActive: true,
    requiredFields: [
      { name: 'nomDemandeur', label: 'Nom demandeur', type: 'text', required: true },
      { name: 'referenceParcelle', label: 'Référence parcelle', type: 'text', required: true },
      { name: 'adresseTerrain', label: 'Adresse terrain', type: 'text', required: true }
    ],
    documents: [
      { name: 'CIN', required: true }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB:', MONGODB_URI);

    console.log('🗑️  Suppression des anciennes procédures...');
    await Procedure.deleteMany({});
    console.log('✅ Anciennes procédures supprimées.');

    let inserted = 0;
    for (const proc of procedures) {
      await Procedure.create(proc);
      console.log(`  ✅ Créée: ${proc.title}`);
      inserted++;
    }

    console.log(`\n🎉 Terminé! ${inserted} nouvelles procédures dynamiques insérées.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

seed();
