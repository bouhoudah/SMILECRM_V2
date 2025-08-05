import { Contact, Partner, Contract } from '../types/data';
import { Agency } from '../types/agency';

interface BackupData {
  contacts: Contact[];
  partners: Partner[];
  contracts: Contract[];
  agency?: Agency;
  timestamp: string;
  version: string;
}

// Vérifier si une URL est valide
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Vérifier si une chaîne est une URL ou une donnée base64
const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/');
};

// Convertir une image en base64
const imageToBase64 = async (url: string): Promise<string> => {
  // Si c'est déjà une image base64 ou une URL invalide, retourner telle quelle
  if (isBase64Image(url) || !isValidUrl(url)) {
    return url;
  }

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Impossible de convertir l'image: ${url}`, error);
    return url; // Retourner l'URL originale en cas d'échec
  }
};

// Traiter les images dans les données de manière sécurisée
const processImages = async (data: any) => {
  const processed = { ...data };
  
  try {
    if (processed.photoUrl) {
      processed.photoUrl = await imageToBase64(processed.photoUrl);
    }
    if (processed.logoUrl) {
      processed.logoUrl = await imageToBase64(processed.logoUrl);
    }
    if (processed.avatar) {
      processed.avatar = await imageToBase64(processed.avatar);
    }
    if (processed.logo) {
      processed.logo = await imageToBase64(processed.logo);
    }
  } catch (error) {
    console.warn('Erreur lors du traitement des images:', error);
  }
  
  return processed;
};

export const createBackup = async (
  contacts: Contact[], 
  partners: Partner[], 
  contracts: Contract[],
  agency?: Agency
): Promise<string> => {
  try {
    // Traiter toutes les images en parallèle avec gestion d'erreur
    const [processedContacts, processedPartners, processedAgency] = await Promise.all([
      Promise.all(contacts.map(contact => 
        processImages({...contact}).catch(err => {
          console.warn('Erreur lors du traitement d\'un contact:', err);
          return contact;
        })
      )),
      Promise.all(partners.map(partner => 
        processImages({...partner}).catch(err => {
          console.warn('Erreur lors du traitement d\'un partenaire:', err);
          return partner;
        })
      )),
      agency ? processImages({...agency}).catch(err => {
        console.warn('Erreur lors du traitement des données de l\'agence:', err);
        return agency;
      }) : undefined
    ]);

    const backup: BackupData = {
      contacts: processedContacts,
      partners: processedPartners,
      contracts,
      agency: processedAgency,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(backup);
  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error);
    throw new Error('Impossible de créer la sauvegarde');
  }
};

export const downloadBackup = (backupData: string, filename: string = 'smile-assurance-backup.json') => {
  try {
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur lors du téléchargement de la sauvegarde:', error);
    throw new Error('Impossible de télécharger la sauvegarde');
  }
};

export const restoreFromBackup = async (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Fichier de sauvegarde vide');
        }

        const backup = JSON.parse(event.target.result as string);
        
        // Validation approfondie de la structure
        if (!backup || typeof backup !== 'object') {
          throw new Error('Format de sauvegarde invalide');
        }

        const requiredFields = ['contacts', 'partners', 'contracts', 'timestamp', 'version'];
        const missingFields = requiredFields.filter(field => !(field in backup));
        
        if (missingFields.length > 0) {
          throw new Error(`Champs manquants dans la sauvegarde: ${missingFields.join(', ')}`);
        }

        // Validation des types
        if (!Array.isArray(backup.contacts) || 
            !Array.isArray(backup.partners) || 
            !Array.isArray(backup.contracts)) {
          throw new Error('Format des données invalide');
        }

        resolve(backup);
      } catch (error) {
        console.error('Erreur lors de la restauration:', error);
        reject(new Error('Impossible de restaurer la sauvegarde'));
      }
    };
    
    reader.onerror = () => {
      console.error('Erreur lors de la lecture du fichier');
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsText(file);
  });
};