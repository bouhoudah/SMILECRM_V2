import { Document } from './documents';

export interface Contact {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  types: {
    particulier: boolean;
    professionnel: boolean;
    professionalType?: 'TNS' | 'Mandataire social';
  };
  statut: 'prospect' | 'client';
  entreprise?: string;
  siret?: string;
  dateCreation: string;
  dateNaissance?: string;
  photoUrl?: string;
  historique: HistoriqueContact[];
  commentaires: CommentaireContact[];
  portalAccess?: {
    password: string;
    lastLogin?: string;
  };
  documents?: Document[];
  ficheConseil?: FicheConseil;
}

export interface HistoriqueContact {
  id: string;
  date: string;
  type: 'creation' | 'modification' | 'ajout_type' | 'suppression_type' | 'modification_statut' | 'nouveau_contrat' | 'resiliation_contrat';
  description: string;
  utilisateurId: string;
}

export interface CommentaireContact {
  id: string;
  date: string;
  type: 'appel_entrant' | 'appel_sortant' | 'email_recu' | 'email_envoye' | 'autre';
  sujet: 'demande_info' | 'sinistre' | 'reclamation' | 'commercial' | 'autre';
  contenu: string;
  utilisateurId: string;
}

export interface Partner {
  id: string;
  nom: string;
  type: 'assureur' | 'courtier grossiste';
  produits: string[];
  statut: 'actif' | 'inactif';
  contactPrincipal: string;
  email: string;
  telephone: string;
  siteWeb?: string;
  intranetUrl?: string;
  logoUrl?: string;
  typeProduit?: string;
}

export interface Contract {
  id: string;
  reference: string;
  clientId: string;
  type: 'auto' | 'habitation' | 'santé' | 'prévoyance' | 'multirisque' | 'responsabilité civile';
  categorie: 'particulier' | 'professionnel';
  statut: 'actif' | 'en_cours' | 'résilié' | 'à_renouveler';
  montantAnnuel: number;
  dateDebut: string;
  dateFin: string;
 partenaire: Partner;
  commissionPremiereAnnee: number;
  commissionAnneesSuivantes: number;
  fraisDossier: number;
  fraisDossierRecurrent: boolean;
  fraisDeCourtage?: number;
  typeRisque?: string;
  formuleProduit?: string;
  dateResiliation?: string;
  raisonResiliation?: string;
  porteurDeRisque?: string; // issu du partenaire
  notificationSent?: boolean;
  historique?: ContractHistory[];
}

export interface ContractHistory {
  id: string;
  contratId: string;
  montantAnnuel: number;
  dateDebut: string;
  dateFin: string;
  commissionPremiereAnnee: number;
  commissionAnneesSuivantes: number;
  fraisDossier: number;
  fraisDossierRecurrent: boolean;
  createdAt: string;
  createdBy: string;
}

export interface FicheConseil {
  id: string;
  dateCreation: string;
  dateMiseAJour: string;
  status: 'draft' | 'completed' | 'signed';
  signature?: {
    date: string;
    signatureData: string;
  };
  informations: {
    situationFamiliale: string;
    situationProfessionnelle: string;
    revenus: number;
    patrimoine: string;
    objectifs: string[];
    commentaires: string;
  };
}