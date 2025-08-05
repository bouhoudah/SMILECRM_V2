import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Contact } from '../types/data';

interface ClientAccessButtonProps {
  contact: Contact;
}

const ClientAccessButton: React.FC<ClientAccessButtonProps> = ({ contact }) => {
  if (!contact.portalAccess) {
    return null;
  }

  const handleAccessClick = () => {
    // Store client credentials temporarily for login
    sessionStorage.setItem('tempClientEmail', contact.email);
    // Open client portal in new tab
    window.open('/client/login', '_blank');
  };

  return (
    <button 
      onClick={handleAccessClick}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      Accéder à l'espace client
    </button>
  );
};

export default ClientAccessButton;