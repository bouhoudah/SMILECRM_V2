import React from 'react';
import { FileText, CheckCircle, XCircle, Clock, Download, Trash2 } from 'lucide-react';
import type { Document } from '../types/documents';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
  onDownload: (document: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  onDownload
}) => {
  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'validated':
        return 'Validé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'En attente';
    }
  };

  const getDocumentTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'identity':
        return 'Carte d\'identité';
      case 'driving_license':
        return 'Permis de conduire';
      case 'kbis':
        return 'Extrait K-bis';
      case 'experience':
        return 'Justificatif d\'expérience';
      case 'commercial_stamp':
        return 'Tampon commercial';
      case 'claims_history':
        return 'Relevé de sinistralité';
      case 'quote':
        return 'Devis';
      case 'contract':
        return 'Contrat';
      default:
        return 'Autre document';
    }
  };

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="border p-4 rounded shadow">
          <p className="font-medium">{doc.name}</p>

          {/* Si c'est une image, affiche la preview comme un lien */}
          {doc.url && doc.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
            <a
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const encodedPath = encodeURIComponent(doc.url);
                  const response = await fetch(`http://localhost:3000/api/documents/signed-url/${encodedPath}`);
                  const data = await response.json();
                  if (data?.url) {
                    window.open(data.url, '_blank');
                  } else {
                    alert("Impossible d'ouvrir le document.");
                  }
                } catch (error) {
                  console.error("Erreur lors de l'ouverture de l'image :", error);
                  alert("Erreur serveur : impossible d'ouvrir le document.");
                }
              }}
              className="text-blue-600 underline mt-2 block"
            >
              Voir l’image
            </a>
          ) : (
            <a
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const encodedPath = encodeURIComponent(doc.url);
                  const response = await fetch(`http://localhost:3000/api/documents/signed-url/${encodedPath}`);
                  const data = await response.json();
                  if (data?.url) {
                    window.open(data.url, '_blank');
                  } else {
                    alert("Impossible d'ouvrir le document.");
                  }
                } catch (error) {
                  console.error("Erreur lors de l'ouverture du fichier :", error);
                  alert("Erreur serveur : impossible d'ouvrir le document.");
                }
              }}
              className="text-blue-600 underline mt-2 block"
            >
              Ouvrir le document
            </a>
          )}

          <div className="mt-2 flex gap-2">
            <button onClick={() => onDownload(doc)} className="text-blue-600">Télécharger</button>
            <button onClick={() => onDelete(doc.id)} className="text-red-600">Supprimer</button>
          </div>
        </div>
      ))}


      {documents.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Aucun document
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentList;