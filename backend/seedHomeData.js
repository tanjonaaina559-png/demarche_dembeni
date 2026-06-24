require('dotenv').config();
const mongoose = require('mongoose');
const HomeContent = require('./models/HomeContent');
const HomeCard = require('./models/HomeCard');

mongoose.connect(process.env.MONGODB_URI);

const cards = [
  {
    image: '',
    title: 'État civil & Famille',
    description: 'Naissance, mariage, livret... Le service État civil vous accompagne dans les moments importants de la vie : naissance, mariage, décès, reconnaissance, livret de famille.',
    statistics: [
      { value: '1 mois', label: 'Délai mariage' },
      { value: '48h', label: 'Acte naissance' },
      { value: 'Gratuit', label: 'Livret' }
    ],
    actions: [
      { icon: 'fa-ring', text: 'Se marier' },
      { icon: 'fa-file-signature', text: 'Acte naissance' },
      { icon: 'fa-book', text: 'Livret famille' }
    ],
    buttonText: "Accéder à l'état civil",
    buttonLink: '/demarches?category=civil',
    slug: '/demarches?category=civil',
    icon: 'fa-users',
    isActive: true,
    order: 0,
    type: 'card'
  },
  {
    image: '',
    title: 'Documents officiels',
    description: 'CNI, passeport, identité numérique... Carte nationale d’identité, passeport, identité numérique et acte de décès. Démarches sur rendez-vous.',
    statistics: [
      { value: '15j', label: 'Délai CNI' },
      { value: '86€', label: 'Passeport' },
      { value: 'Gratuit', label: 'CNI' }
    ],
    actions: [
      { icon: 'fa-id-card', text: 'CNI & Passeport' },
      { icon: 'fa-fingerprint', text: 'Identité numérique' },
      { icon: 'fa-file-medical-alt', text: 'Acte de décès' }
    ],
    buttonText: "Accéder aux documents",
    buttonLink: '/documents',
    slug: '/documents',
    icon: 'fa-file-alt',
    isActive: true,
    order: 1,
    type: 'card'
  },
  {
    image: '',
    title: "Collecte d'encombrants",
    description: "Préservons notre environnement... Service de collecte des objets volumineux pour préserver la propreté et le cadre de vie de la commune.",
    statistics: [
      { value: '2/mois', label: 'Collectes' },
      { value: '5', label: 'Déchetteries' },
      { value: 'Gratuit', label: 'Service' }
    ],
    actions: [
      { icon: 'fa-calendar-alt', text: 'Calendrier' },
      { icon: 'fa-edit', text: 'Inscription' },
      { icon: 'fa-exclamation-triangle', text: 'Consignes' }
    ],
    buttonText: "Voir les collectes",
    buttonLink: '/collecte',
    slug: '/collecte',
    icon: 'fa-trash-alt',
    isActive: true,
    order: 2,
    type: 'card'
  },
  {
    image: '',
    title: 'Inscription en crèche',
    description: "Accueil des jeunes enfants... L’inscription en crèche permet l’accueil des jeunes enfants de la commune. Accompagnement personnalisé.",
    statistics: [
      { value: '120', label: 'Places' },
      { value: '3', label: 'Crèches' },
      { value: '2-8€', label: 'Tarif/h' }
    ],
    actions: [
      { icon: 'fa-folder-open', text: 'Documents' },
      { icon: 'fa-euro-sign', text: 'Tarifs' },
      { icon: 'fa-clipboard-list', text: 'Pré-inscription' }
    ],
    buttonText: "Inscrire mon enfant",
    buttonLink: '/demarches?category=enfance',
    slug: '/demarches?category=enfance',
    icon: 'fa-baby',
    isActive: true,
    order: 3,
    type: 'card'
  },
  {
    image: '',
    title: 'Centre de loisirs',
    description: "Activités pour enfants 3-12 ans... Accueil pendant les vacances scolaires et les mercredis. Activités variées et encadrement professionnel.",
    statistics: [
      { value: '30+', label: 'Places' },
      { value: '12', label: 'Animateurs' },
      { value: '5-12€', label: 'Tarif/jour' }
    ],
    actions: [
      { icon: 'fa-futbol', text: 'Activités' },
      { icon: 'fa-calendar-day', text: 'Calendrier' },
      { icon: 'fa-user-plus', text: 'Inscription' }
    ],
    buttonText: "Voir les activités",
    buttonLink: '/services',
    slug: '/services',
    icon: 'fa-gamepad',
    isActive: true,
    order: 4,
    type: 'card'
  },
  {
    image: '',
    title: 'Urbanisme & habitat',
    description: "Permis, travaux, cadastre... Permis de construire, déclaration préalable de travaux, renseignements cadastraux. Instruction et suivi des dossiers.",
    statistics: [
      { value: '2 mois', label: 'Permis' },
      { value: '1 mois', label: 'Travaux' },
      { value: '24h', label: 'Cadastre' }
    ],
    actions: [
      { icon: 'fa-clipboard-check', text: 'Permis' },
      { icon: 'fa-tools', text: 'Travaux' },
      { icon: 'fa-map', text: 'Cadastre' }
    ],
    buttonText: "Consulter urbanisme",
    buttonLink: '/demarches?category=urbanisme',
    slug: '/demarches?category=urbanisme',
    icon: 'fa-city',
    isActive: true,
    order: 5,
    type: 'card'
  }
];

const contents = [
  {
    section: 'hero',
    title: 'Toutes vos démarches',
    subtitle: 'en un seul endroit',
    description: "État civil, documents officiels, collecte d'encombrants, crèche, centre de loisirs, urbanisme... Simplifiez vos procédures depuis chez vous.",
    servicesHeading: 'Services disponibles',
    statistics: [
      { value: '12+', label: 'Démarches en ligne', icon: 'fa-file-alt' },
      { value: '24/7', label: 'Portail accessible', icon: 'fa-clock' },
      { value: '98%', label: 'Taux de satisfaction', icon: 'fa-check-double' },
      { value: '2500+', label: 'Citoyens inscrits', icon: 'fa-users' }
    ],
    buttons: [
      { text: 'Lancer une démarche', link: '/demarches' },
      { text: 'Nos services', link: '/service-public' }
    ],
    alertText: 'Mairie ouverte du lundi au vendredi de 8h à 16h30',
    showAlert: true,
    isActive: true
  },
  {
    section: 'collecte',
    instructions: "La commune organise deux collectes d'encombrants par mois pour maintenir la propreté et le cadre de vie de Dembéni. Service entièrement gratuit pour les habitants.",
    importantNotes: [
      "Meubles, électroménager, literie acceptés",
      "2 passages par mois, sur inscription",
      "Alternatives écologiques disponibles",
      "Gravats et déchets verts refusés"
    ],
    isActive: true
  },
  {
    section: 'services',
    tagText: 'Proximité',
    tagIcon: 'fa-landmark',
    title: 'Service public de proximité',
    description: 'Les services municipaux accompagnent les habitants de Dembéni dans toutes leurs démarches. État civil, vie scolaire, action sociale, urbanisme.',
    statistics: [
      { value: '98%', label: 'Satisfaction' },
      { value: '24/7', label: 'Portail en ligne' }
    ],
    buttonText: 'Voir tous les services',
    buttonLink: '/service-public',
    isActive: true
  },
  {
    section: 'enfance',
    tagText: 'Petite enfance',
    tagIcon: 'fa-child',
    title: 'Enfance & Loisirs',
    activitiesTitle: 'Activités du centre de loisirs',
    activities: [
      { icon: 'fa-palette', label: 'Arts' },
      { icon: 'fa-futbol', label: 'Sports' },
      { icon: 'fa-theater-masks', label: 'Théâtre' },
      { icon: 'fa-leaf', label: 'Nature' },
      { icon: 'fa-music', label: 'Musique' },
      { icon: 'fa-swimmer', label: 'Natation' }
    ],
    pricingTitle: 'Tarifs Crèche — Quotient Familial',
    pricingNote: 'Tarifs définis selon le quotient familial CAF. Sur dossier.',
    tarifs: [
      { label: 'QF faible', price: '1,50', unit: '€/h', isFeatured: false },
      { label: 'QF moyen', price: '3,20', unit: '€/h', isFeatured: true },
      { label: 'QF élevé', price: '5,00', unit: '€/h', isFeatured: false }
    ],
    buttonText: 'Inscrire mon enfant',
    buttonLink: '/inscription',
    isActive: true
  },
  {
    section: 'passeport',
    tagText: 'Documents',
    tagIcon: 'fa-passport',
    title: 'Passeport & CNI',
    steps: [
      { icon: 'fa-sign-in-alt', title: '1. Je me connecte', description: 'Sur le portail ou rendez-vous en mairie' },
      { icon: 'fa-edit', title: '2. Je remplis ma demande', description: 'Formulaire en ligne ou papier' },
      { icon: 'fa-file-upload', title: '3. Je fournis mes pièces', description: 'Photo, justificatifs, timbre fiscal' },
      { icon: 'fa-calendar-check', title: '4. Je suis convoqué', description: 'Rendez-vous pour retrait' }
    ],
    buttonText: 'Commencer ma demande de passeport',
    buttonLink: '/demarches',
    isActive: true
  },
  {
    section: 'footer',
    ctaTitle: "Besoin d'aide pour vos démarches ?",
    ctaDescription: "Notre équipe est disponible pour vous accompagner et répondre à toutes vos questions.",
    ctaButtons: [
      { text: 'Nous contacter', link: '/contact', icon: 'fa-envelope', variant: 'primary' },
      { text: 'Toutes les démarches', link: '/demarches', icon: 'fa-list', variant: 'secondary' }
    ],
    address: '1 Place de la Mairie, 97660 Dembéni',
    phone: '+262 XXX XXX XXX',
    email: 'dembenimairie@gmail.com',
    schedule: [
      'Lundi - Vendredi : 8h00 - 16h30',
      'Samedi - Dimanche : Fermé'
    ],
    isActive: true
  },
  {
    section: 'faq',
    question: 'Quels documents pour un mariage ?',
    answer: "Pièces d’identité, justificatifs de domicile, actes de naissance de moins de 3 mois, et la liste complète des témoins.",
    isActive: true
  },
  {
    section: 'faq',
    question: 'Comment obtenir un passeport ?',
    answer: "Sur rendez-vous en mairie : photo conforme, justificatif de domicile et timbre fiscal (86€ adulte). Délai ~15 jours.",
    isActive: true
  },
  {
    section: 'faq',
    question: 'Quels objets pour les encombrants ?',
    answer: "Acceptés : meubles, électroménager, literie, cartons. Refusés : gravats, déchets verts et produits chimiques.",
    isActive: true
  },
  {
    section: 'faq',
    question: 'Comment inscrire mon enfant en crèche ?',
    answer: "Pré-inscription en ligne puis dépôt d’un dossier complet. Places attribuées selon disponibilités et quotient familial.",
    isActive: true
  }
];

const seedHomeData = async () => {
  try {
    await HomeCard.deleteMany({});
    await HomeContent.deleteMany({});

    await HomeCard.insertMany(cards);
    await HomeContent.insertMany(contents);

    console.log('Home data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedHomeData();
