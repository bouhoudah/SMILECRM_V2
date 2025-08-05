import { Contact, Partner, Contract } from '../types/data';

export const contactTemplate = {
  columns: [
    { key: 'prenom', label: 'Prénom', required: true },
    { key: 'nom', label: 'Nom', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'telephone', label: 'Téléphone', required: true },
    { key: 'type', label: 'Type (particulier/professionnel)', required: true },
    { key: 'statut', label: 'Statut (prospect/client)', required: true },
    { key: 'entreprise', label: 'Entreprise (si professionnel)', required: false },
    { key: 'siret', label: 'SIRET (si professionnel)', required: false },
    { key: 'dateCreation', label: 'Date de création (AAAA-MM-JJ)', required: true }
  ]
};

export const partnerTemplate = {
  columns: [
    { key: 'nom', label: 'Nom', required: true },
    { key: 'type', label: 'Type (assureur/courtier grossiste)', required: true },
    { key: 'produits', label: 'Produits (séparés par des virgules)', required: true },
    { key: 'statut', label: 'Statut (actif/inactif)', required: true },
    { key: 'contactPrincipal', label: 'Contact Principal', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'telephone', label: 'Téléphone', required: true }
  ]
};

export const contractTemplate = {
  columns: [
    { key: 'reference', label: 'Référence', required: true },
    { key: 'clientId', label: 'ID Client', required: true },
    { key: 'type', label: 'Type (auto/habitation/santé/prévoyance/multirisque/responsabilité civile)', required: true },
    { key: 'statut', label: 'Statut (actif/en_cours/résilié/à_renouveler)', required: true },
    { key: 'montantAnnuel', label: 'Montant Annuel (€)', required: true },
    { key: 'dateDebut', label: 'Date de début (AAAA-MM-JJ)', required: true },
    { key: 'dateFin', label: 'Date de fin (AAAA-MM-JJ)', required: true },
    { key: 'partenaire', label: 'Nom du Partenaire', required: true },
    { key: 'commissionPremiereAnnee', label: 'Commission 1ère année (%)', required: true },
    { key: 'commissionAnneesSuivantes', label: 'Commission années suivantes (%)', required: true },
    { key: 'fraisDossier', label: 'Frais de dossier (€)', required: true },
    { key: 'fraisDossierRecurrent', label: 'Frais récurrents (true/false)', required: true }
  ]
};

// Exemple de format pour chaque type de données
export const exampleData = {
  contact: {
    prenom: "Jean",
    nom: "Dupont",
    email: "jean.dupont@email.com",
    telephone: "0612345678",
    type: "particulier",
    statut: "client",
    entreprise: "",
    siret: "",
    dateCreation: "2024-03-20"
  },
  
  partner: {
    nom: "AXA Assurances",
    type: "assureur",
    produits: "auto, habitation, santé",
    statut: "actif",
    contactPrincipal: "Marie Martin",
    email: "marie.martin@axa.fr",
    telephone: "0123456789"
  },
  
  contract: {
    reference: "CONT-2024-001",
    clientId: "contact-1",
    type: "auto",
    statut: "actif",
    montantAnnuel: 1200,
    dateDebut: "2024-01-01",
    dateFin: "2024-12-31",
    partenaire: "AXA Assurances",
    commissionPremiereAnnee: 30,
    commissionAnneesSuivantes: 10,
    fraisDossier: 50,
    fraisDossierRecurrent: false
  }
};