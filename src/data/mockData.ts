import { Contact, Partner, Contract } from '../types/data';

// Photos de profil aléatoires depuis UI Faces
const photoUrls = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop'
];

// Logos des partenaires
const logoUrls = [
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1599305446868-59e861c19d1e?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=150&fit=crop'
];

// Génération de données aléatoires
const generatePhone = () => {
  return `0${Math.floor(Math.random() * 5) + 1}${Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}`;
};

const generateEmail = (prenom: string, nom: string, pro = false) => {
  const domain = pro ? 'entreprise.fr' : ['gmail.com', 'yahoo.fr', 'orange.fr', 'free.fr'][Math.floor(Math.random() * 4)];
  return `${prenom.toLowerCase()}.${nom.toLowerCase()}@${domain}`;
};

const generateDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const generateBirthDate = () => {
  // Répartition des âges:
  // - 20% entre 18-30 ans (jeunes adultes)
  // - 40% entre 31-50 ans (adultes actifs)
  // - 30% entre 51-70 ans (seniors actifs)
  // - 10% 71+ ans (retraités)
  
  const rand = Math.random();
  const now = new Date();
  let start: Date, end: Date;

  if (rand < 0.2) {
    // 18-30 ans
    start = new Date(now.getFullYear() - 30, 0, 1);
    end = new Date(now.getFullYear() - 18, 11, 31);
  } else if (rand < 0.6) {
    // 31-50 ans
    start = new Date(now.getFullYear() - 50, 0, 1);
    end = new Date(now.getFullYear() - 31, 11, 31);
  } else if (rand < 0.9) {
    // 51-70 ans
    start = new Date(now.getFullYear() - 70, 0, 1);
    end = new Date(now.getFullYear() - 51, 11, 31);
  } else {
    // 71+ ans (jusqu'à 90 ans)
    start = new Date(now.getFullYear() - 90, 0, 1);
    end = new Date(now.getFullYear() - 71, 11, 31);
  }

  return generateDate(start, end).split('T')[0];
};

// Génération des contacts
export const mockContacts: Contact[] = [
  // 20 Prospects
  ...Array(20).fill(null).map((_, index) => {
    const dateCreation = generateDate(new Date('2024-01-01'), new Date());
    const prenom = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas'][Math.floor(Math.random() * 5)];
    const nom = ['Dupont', 'Martin', 'Bernard', 'Robert', 'Richard'][Math.floor(Math.random() * 5)];

    return {
      id: `prospect-${index + 1}`,
      nom,
      prenom,
      email: generateEmail(prenom, nom),
      telephone: generatePhone(),
      types: { particulier: true, professionnel: false },
      statut: 'prospect',
      dateCreation: dateCreation.split('T')[0],
      dateNaissance: generateBirthDate(),
      photoUrl: photoUrls[Math.floor(Math.random() * photoUrls.length)],
      historique: [
        {
          id: `hist-${index}-1`,
          date: dateCreation,
          type: 'creation',
          description: 'Création du contact',
          utilisateurId: 'system'
        }
      ],
      commentaires: []
    };
  }),

  // 10 Clients Particuliers
  ...Array(10).fill(null).map((_, index) => {
    const dateCreation = generateDate(new Date('2019-01-01'), new Date('2019-12-31'));
    const prenom = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas'][Math.floor(Math.random() * 5)];
    const nom = ['Dupont', 'Martin', 'Bernard', 'Robert', 'Richard'][Math.floor(Math.random() * 5)];

    return {
      id: `client-part-${index + 1}`,
      nom,
      prenom,
      email: generateEmail(prenom, nom),
      telephone: generatePhone(),
      types: { particulier: true, professionnel: false },
      statut: 'client',
      dateCreation: dateCreation.split('T')[0],
      dateNaissance: generateBirthDate(),
      photoUrl: photoUrls[Math.floor(Math.random() * photoUrls.length)],
      historique: [
        {
          id: `hist-part-${index}-1`,
          date: dateCreation,
          type: 'creation',
          description: 'Création du contact',
          utilisateurId: 'system'
        }
      ],
      commentaires: []
    };
  }),

  // 5 Clients Professionnels
  ...Array(5).fill(null).map((_, index) => {
    const dateCreation = generateDate(new Date('2019-01-01'), new Date('2019-12-31'));
    const prenom = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas'][Math.floor(Math.random() * 5)];
    const nom = ['Dupont', 'Martin', 'Bernard', 'Robert', 'Richard'][Math.floor(Math.random() * 5)];
    const entreprise = ['Auto École Express', 'Boulangerie du Centre', 'Cabinet Medical St-Michel'][Math.floor(Math.random() * 3)];
    const professionalType = Math.random() > 0.5 ? 'TNS' : 'Mandataire social';

    return {
      id: `client-pro-${index + 1}`,
      nom,
      prenom,
      email: generateEmail(prenom, nom, true),
      telephone: generatePhone(),
      types: { 
        particulier: false, 
        professionnel: true,
        professionalType
      },
      statut: 'client',
      entreprise,
      siret: Array(14).fill(0).map(() => Math.floor(Math.random() * 10)).join(''),
      dateCreation: dateCreation.split('T')[0],
      dateNaissance: generateBirthDate(),
      photoUrl: photoUrls[Math.floor(Math.random() * photoUrls.length)],
      historique: [
        {
          id: `hist-pro-${index}-1`,
          date: dateCreation,
          type: 'creation',
          description: 'Création du contact',
          utilisateurId: 'system'
        }
      ],
      commentaires: []
    };
  }),

  // 5 Clients Hybrides
  ...Array(5).fill(null).map((_, index) => {
    const dateCreation = generateDate(new Date('2019-01-01'), new Date('2019-12-31'));
    const prenom = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas'][Math.floor(Math.random() * 5)];
    const nom = ['Dupont', 'Martin', 'Bernard', 'Robert', 'Richard'][Math.floor(Math.random() * 5)];
    const entreprise = ['Auto École Express', 'Boulangerie du Centre', 'Cabinet Medical St-Michel'][Math.floor(Math.random() * 3)];
    const professionalType = Math.random() > 0.5 ? 'TNS' : 'Mandataire social';

    return {
      id: `client-hybrid-${index + 1}`,
      nom,
      prenom,
      email: generateEmail(prenom, nom, true),
      telephone: generatePhone(),
      types: { 
        particulier: true, 
        professionnel: true,
        professionalType
      },
      statut: 'client',
      entreprise,
      siret: Array(14).fill(0).map(() => Math.floor(Math.random() * 10)).join(''),
      dateCreation: dateCreation.split('T')[0],
      dateNaissance: generateBirthDate(),
      photoUrl: photoUrls[Math.floor(Math.random() * photoUrls.length)],
      historique: [
        {
          id: `hist-hybrid-${index}-1`,
          date: dateCreation,
          type: 'creation',
          description: 'Création du contact',
          utilisateurId: 'system'
        }
      ],
      commentaires: []
    };
  })
];

export const mockPartners: Partner[] = [
  {
    id: 'partner-1',
    nom: 'AXA Assurances',
    type: 'assureur',
    produits: ['auto', 'habitation', 'santé'],
    statut: 'actif',
    contactPrincipal: 'Sophie Martin',
    email: 'sophie.martin@axa.fr',
    telephone: '01 45 67 89 10',
    logoUrl: logoUrls[0]
  },
  {
    id: 'partner-2',
    nom: 'Allianz',
    type: 'assureur',
    produits: ['auto', 'habitation', 'prévoyance'],
    statut: 'actif',
    contactPrincipal: 'Pierre Dubois',
    email: 'pierre.dubois@allianz.fr',
    telephone: '01 46 78 90 12',
    logoUrl: logoUrls[1]
  },
  {
    id: 'partner-3',
    nom: 'MAAF Pro',
    type: 'assureur',
    produits: ['multirisque', 'responsabilité civile'],
    statut: 'actif',
    contactPrincipal: 'Thomas Bernard',
    email: 'thomas.bernard@maaf.fr',
    telephone: '01 48 90 12 34',
    logoUrl: logoUrls[2]
  }
];

// Fonction pour générer une référence de contrat
const generateContractReference = (date: Date, sequence: number) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `CONT-${year}_${month}_${String(sequence).padStart(4, '0')}`;
};

// Fonction pour générer l'historique d'un contrat
const generateContractHistory = (contract: Contract, startYear: number) => {
  const history = [];
  const baseAmount = contract.montantAnnuel;
  let sequence = 1;
  
  for (let year = startYear; year < 2024; year++) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    
    // Augmentation annuelle aléatoire entre 1% et 5%
    const increase = 1 + (Math.random() * 0.04 + 0.01);
    const historicalAmount = Math.round(baseAmount / Math.pow(increase, 2024 - year));
    
    if (year === startYear) {
      // Mettre à jour la référence du contrat avec l'année et le mois de démarrage
      contract.reference = generateContractReference(startDate, sequence);
    }
    
    history.push({
      id: `hist-${contract.id}-${year}`,
      contratId: contract.id,
      montantAnnuel: historicalAmount,
      dateDebut: startDate.toISOString().split('T')[0],
      dateFin: endDate.toISOString().split('T')[0],
      commissionPremiereAnnee: contract.commissionPremiereAnnee,
      commissionAnneesSuivantes: contract.commissionAnneesSuivantes,
      fraisDossier: contract.fraisDossier,
      fraisDossierRecurrent: contract.fraisDossierRecurrent,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    });
    
    sequence++;
  }

  return history;
};

// Génération des contrats
export const mockContracts: Contract[] = mockContacts
  .filter(contact => contact.statut === 'client')
  .flatMap((client, clientIndex) => {
    // 2 à 5 contrats par client
    const numContracts = Math.floor(Math.random() * 4) + 2;
    
    return Array(numContracts).fill(null).map((_, index) => {
      const startYear = 2019;
      const contract: Contract = {
        id: `contract-${client.id}-${index}`,
        reference: '', // Sera défini lors de la génération de l'historique
        clientId: client.id,
        type: ['auto', 'habitation', 'santé', 'prévoyance', 'multirisque', 'responsabilité civile'][Math.floor(Math.random() * 6)],
        categorie: client.types.professionnel ? 'professionnel' : 'particulier',
        statut: 'actif',
        montantAnnuel: Math.floor(Math.random() * 3000) + 500,
        dateDebut: new Date(startYear, 0, 1).toISOString().split('T')[0],
        dateFin: new Date(startYear + 1, 0, 1).toISOString().split('T')[0],
        partenaire: mockPartners[Math.floor(Math.random() * mockPartners.length)].nom,
        commissionPremiereAnnee: Math.floor(Math.random() * 15) + 25,
        commissionAnneesSuivantes: Math.floor(Math.random() * 10) + 5,
        fraisDossier: Math.floor(Math.random() * 150) + 50,
        fraisDossierRecurrent: Math.random() > 0.7,
        historique: []
      };

      // Générer l'historique depuis 2019 et mettre à jour la référence
      contract.historique = generateContractHistory(contract, startYear);

      return contract;
    });
  });