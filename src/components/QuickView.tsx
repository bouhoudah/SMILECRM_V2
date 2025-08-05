import React from 'react';
import { X } from 'lucide-react';
import { Contact, Contract, Partner } from '../types/data';

interface QuickViewProps {
  data: Contact | Contract | Partner;
  type: 'contact' | 'contract' | 'partner';
  onClose: () => void;
}

const QuickView: React.FC<QuickViewProps> = ({ data, type, onClose }) => {
  const renderContent = () => {
    switch (type) {
      case 'contact':
        const contact = data as Contact;
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={contact.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.prenom + ' ' + contact.nom)}`}
                alt={`${contact.prenom} ${contact.nom}`}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{contact.prenom} {contact.nom}</h3>
                <p className="text-sm text-gray-500">{contact.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="text-sm text-gray-900">{contact.telephone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  contact.statut === 'client' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {contact.statut}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <div className="flex space-x-2">
                  {contact.types?.particulier && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Particulier
                    </span>
                  )}
                  {contact.types?.professionnel && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      Professionnel
                    </span>
                  )}
                </div>
              </div>
              {contact.entreprise && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Entreprise</p>
                  <p className="text-sm text-gray-900">{contact.entreprise}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'contract':
        const contract = data as Contract;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Contrat {contract.reference}</h3>
              <p className="text-sm text-gray-500">{contract.type}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Montant annuel</p>
                <p className="text-sm text-gray-900">
                  {contract.montantAnnuel.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  contract.statut === 'actif'
                    ? 'bg-green-100 text-green-800'
                    : contract.statut === 'en_cours'
                    ? 'bg-yellow-100 text-yellow-800'
                    : contract.statut === 'à_renouveler'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {contract.statut}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Partenaire</p>
                <p className="text-sm text-gray-900">{contract.partenaire}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dates</p>
                <p className="text-sm text-gray-900">
                  Du {new Date(contract.dateDebut).toLocaleDateString('fr-FR')}
                  <br />
                  Au {new Date(contract.dateFin).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        );

      case 'partner':
        const partner = data as Partner;
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={partner.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.nom)}&background=random`}
                alt={partner.nom}
                className="h-12 w-12 rounded-lg object-contain"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">{partner.nom}</h3>
                <p className="text-sm text-gray-500">{partner.type}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Contact principal</p>
                <p className="text-sm text-gray-900">{partner.contactPrincipal}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  partner.statut === 'actif'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {partner.statut}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{partner.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                <p className="text-sm text-gray-900">{partner.telephone}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};

export default QuickView;