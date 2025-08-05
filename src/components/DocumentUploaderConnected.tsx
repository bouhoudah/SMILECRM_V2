// components/DocumentUploaderConnected.tsx
import React from 'react';
import DocumentUpload from './DocumentUpload'; // Ton composant déjà prêt

const DocumentUploaderConnected: React.FC = () => {
  const handleUpload = async (file: File, metadata?: any) => {
    console.log('📤 handleUpload appelé', file, metadata); // DEBUG

    const formData = new FormData();
    formData.append('file', file); // ✅ champ attendu par Multer; // champ attendu par Multer
    formData.append('type', 'pdf'); // ou 'image', à adapter
    formData.append('statut', 'actif'); // ou 'pending'
    formData.append('contactId', '1'); // à remplacer dynamiquement
    if (metadata) {
      formData.append('metadonnees', JSON.stringify(metadata));
    }

    try {
      const response = await fetch('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erreur lors de l’upload');

      const result = await response.json();
      console.log('✅ Document envoyé :', result);
    } catch (error) {
      console.error('❌ Erreur upload :', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Uploader un document</h2>
      <DocumentUpload
        type="pdf"
        label="Choisir un fichier"
        onUpload={handleUpload}
        metadata={{ source: 'admin', side: 'front' }}
      />
    </div>
  );
};

export default DocumentUploaderConnected;
