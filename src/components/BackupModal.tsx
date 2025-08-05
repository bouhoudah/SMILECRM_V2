import React, { useRef, useState } from 'react';
import { Download, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { createBackup, downloadBackup, restoreFromBackup } from '../utils/backup';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackupCreated: () => void;
  onBackupRestored: (data: any) => void;
  data: {
    contacts: any[];
    partners: any[];
    contracts: any[];
  };
}

const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onBackupCreated,
  onBackupRestored,
  data
}) => {
  const { agencySettings } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCreateBackup = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress('Préparation de la sauvegarde...');
    
    try {
      setProgress('Traitement des images...');
      const backupData = await createBackup(
        data.contacts, 
        data.partners, 
        data.contracts,
        agencySettings
      );

      setProgress('Création du fichier de sauvegarde...');
      const filename = `smile-assurance-backup-${new Date().toISOString().split('T')[0]}.json`;
      downloadBackup(backupData, filename);
      
      setSuccess('Sauvegarde créée avec succès');
      onBackupCreated();
    } catch (err) {
      setError('Erreur lors de la création de la sauvegarde. Veuillez réessayer.');
      console.error('Erreur de sauvegarde:', err);
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress('Lecture du fichier de sauvegarde...');

    try {
      setProgress('Validation des données...');
      const backupData = await restoreFromBackup(file);
      
      setProgress('Restauration des données...');
      onBackupRestored(backupData);
      
      setSuccess('Restauration effectuée avec succès');
    } catch (err) {
      setError('Erreur lors de la restauration. Vérifiez que le fichier est valide.');
      console.error('Erreur de restauration:', err);
    } finally {
      setIsProcessing(false);
      setProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Sauvegarde des données</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {progress && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm text-blue-700">{progress}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Button
              variant="primary"
              onClick={handleCreateBackup}
              icon={Download}
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Traitement en cours...' : 'Créer une sauvegarde'}
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              Téléchargez une copie de toutes vos données (y compris les images)
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              ref={fileInputRef}
              className="hidden"
              id="backup-file"
              disabled={isProcessing}
            />
            <Button
              variant="secondary"
              onClick={() => document.getElementById('backup-file')?.click()}
              icon={Upload}
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Traitement en cours...' : 'Restaurer une sauvegarde'}
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              Restaurez vos données à partir d'une sauvegarde précédente
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            La sauvegarde inclut vos contacts, contrats, partenaires et toutes les images associées.
            Assurez-vous de conserver vos sauvegardes dans un endroit sûr.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;