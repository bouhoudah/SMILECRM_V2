import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Contact } from '../../types/data';
import { Document } from '../../types/documents';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Button from '../../components/Button';

const ClientDocuments = () => {
  const navigate = useNavigate();
  const { contacts, refetchContacts } = useData(); // ✅ Assure-toi que fetchContacts est bien dispo dans le DataContext
  const [contact, setContact] = useState<Contact | null>(null);
  const [uploadingType, setUploadingType] = useState<'identity' | 'driving_license' | 'other' | null>(null);

  useEffect(() => {
    const clientId = sessionStorage.getItem('clientId');
    if (!clientId) {
      navigate('/client/login');
      return;
    }

    const clientContact = contacts.find(c => String(c.id) === clientId);
    if (!clientContact) {
      navigate('/client/login');
      return;
    }

    setContact(clientContact);
  }, [contacts, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!contact || !uploadingType || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();

    formData.append('document', file);
    formData.append('type', uploadingType);
    formData.append('statut', 'pending');
    formData.append('contactId', String(contact.id));
    formData.append('metadonnees', JSON.stringify({ source: 'client' }));

    try {
      const res = await fetch('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Erreur lors de l’upload');

      const data = await res.json();
      console.log('✅ Document enregistré :', data);

      // 🔁 Recharge les contacts pour afficher les nouveaux documents
      await refetchContacts();

      // 🔄 Met à jour le contact actuel avec les nouvelles données
      const updated = contacts.find(c => c.id === contact.id);
      if (updated) setContact(updated);

      setUploadingType(null);
    } catch (err) {
      console.error('❌ Erreur upload :', err);
    }
  };

  if (!contact) return null;

  const documentsByType = {
    identity: contact.documents?.filter(doc => doc.type === 'identity') || [],
    driving_license: contact.documents?.filter(doc => doc.type === 'driving_license') || [],
    other: contact.documents?.filter(doc => doc.type === 'other') || []
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Mes documents</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez vos documents d'identité et autres justificatifs
        </p>
      </div>

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {/* Carte d'identité */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Carte d'identité</h3>
              <p className="text-sm text-gray-500">Carte d'identité recto-verso</p>
            </div>
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => {
                setUploadingType('identity');
                document.getElementById('upload-identity')?.click();
              }}
            >
              Ajouter
            </Button>
            <input
              type="file"
              id="upload-identity"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentsByType.identity.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {doc.status === 'pending' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : doc.status === 'validated' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permis de conduire */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Permis de conduire</h3>
              <p className="text-sm text-gray-500">Permis de conduire recto-verso</p>
            </div>
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => {
                setUploadingType('driving_license');
                document.getElementById('upload-driving-license')?.click();
              }}
            >
              Ajouter
            </Button>
            <input
              type="file"
              id="upload-driving-license"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentsByType.driving_license.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {doc.status === 'pending' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : doc.status === 'validated' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Autres documents */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Autres documents</h3>
              <p className="text-sm text-gray-500">Justificatifs de domicile, etc.</p>
            </div>
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => {
                setUploadingType('other');
                document.getElementById('upload-other')?.click();
              }}
            >
              Ajouter
            </Button>
            <input
              type="file"
              id="upload-other"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentsByType.other.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {doc.status === 'pending' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : doc.status === 'validated' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDocuments;
