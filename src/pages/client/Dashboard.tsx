import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Contact } from '../../types/data';
import { User, FileText, FileCheck } from 'lucide-react';
import Button from '../../components/Button';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { contacts } = useData();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const clientId = sessionStorage.getItem('clientId');
    if (!clientId) {
      navigate('/client/login');
      return;
    }

    const clientContact = contacts.find(c => c.id === clientId);
    if (!clientContact) {
      navigate('/client/login');
      return;
    }

    setContact(clientContact);
  }, [contacts, navigate]);

  if (!contact) {
    return null;
  }

  const pendingDocuments = contact.documents?.filter(doc => doc.status === 'pending').length || 0;
  const hasFicheConseil = contact.ficheConseil?.status === 'signed';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Bienvenue {contact.prenom} {contact.nom}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez vos informations et documents
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profil */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 rounded-full p-2">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Mon profil</h3>
              </div>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">{contact.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Téléphone</dt>
                  <dd className="font-medium text-gray-900">{contact.telephone}</dd>
                </div>
                {contact.entreprise && (
                  <div>
                    <dt className="text-gray-500">Entreprise</dt>
                    <dd className="font-medium text-gray-900">{contact.entreprise}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Documents */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 rounded-full p-2">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                </div>
                {pendingDocuments > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {pendingDocuments} en attente
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Gérez vos documents d'identité et autres justificatifs
              </p>
              <Button
                variant="secondary"
                onClick={() => navigate('/client/documents')}
              >
                Voir mes documents
              </Button>
            </div>

            {/* Fiche conseil */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 rounded-full p-2">
                    <FileCheck className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Fiche conseil</h3>
                </div>
                {hasFicheConseil ? (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Complétée
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    À compléter
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {hasFicheConseil
                  ? 'Votre fiche conseil a été complétée et signée'
                  : 'Complétez votre fiche conseil pour une meilleure analyse de vos besoins'}
              </p>
              <Button
                variant={hasFicheConseil ? 'secondary' : 'primary'}
                onClick={() => navigate('/client/fiche-conseil')}
              >
                {hasFicheConseil ? 'Voir ma fiche conseil' : 'Compléter ma fiche conseil'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;