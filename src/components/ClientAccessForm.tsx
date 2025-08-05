import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { Contact } from '../types/data';
import { useData } from '../context/DataContext';

interface ClientAccessFormProps {
  contact: Contact;
  onClose: () => void;
}

const ClientAccessForm: React.FC<ClientAccessFormProps> = ({ contact, onClose }) => {
  const { editContact } = useData();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      const updatedContact = {
        ...contact,
        portalAccess: {
          password,
          lastLogin: null
        }
      };

      editContact(updatedContact);
      setSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue lors de la création de l\'accès client');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {success ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Accès client créé avec succès
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Le client peut maintenant se connecter avec :
              <br />
              Email : {contact.email}
            </p>
            <Link 
              to="/client/login" 
              target="_blank"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 mb-4"
            >
              Accéder à l'espace client
            </Link>
            <p className="text-xs text-gray-400">
              Cette fenêtre se fermera automatiquement...
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-medium mb-6">
              Créer un accès client
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email de connexion
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  {contact.email}
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Créer l'accès
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientAccessForm;