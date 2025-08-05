import React, { useState } from 'react';
import { useAgency } from '../context/AgencyContext';
import { useAuth } from '../context/AuthContext';
import { Agency } from '../types/agency';
import { Building2, Users, Trash2, PencilLine, Plus } from 'lucide-react';
import Button from '../components/Button';
import AgencyForm from '../components/AgencyForm';
import UserForm from '../components/UserForm';

const SuperAdmin = () => {
  const { user } = useAuth();
  const { agencies, addAgency, updateAgency, deleteAgency } = useAgency();
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (user?.role !== 'superadmin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Accès non autorisé</p>
      </div>
    );
  }

  const handleAgencySubmit = async (agencyData: Omit<Agency, 'id' | 'createdAt'>) => {
    try {
      await addAgency(agencyData);
      setShowAgencyForm(false);
      setSuccess('Agence créée avec succès');
    } catch (err) {
      setError('Erreur lors de la création de l\'agence');
    }
  };

  const handleAgencyUpdate = async (agency: Agency) => {
    try {
      await updateAgency(agency);
      setSelectedAgency(null);
      setSuccess('Agence mise à jour avec succès');
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'agence');
    }
  };

  const handleAgencyDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
      try {
        await deleteAgency(id);
        setSuccess('Agence supprimée avec succès');
      } catch (err) {
        setError('Erreur lors de la suppression de l\'agence');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Administration</h1>
        <div className="space-x-4">
          <Button
            variant="primary"
            icon={Building2}
            onClick={() => setShowAgencyForm(true)}
          >
            Nouvelle agence
          </Button>
          <Button
            variant="secondary"
            icon={Users}
            onClick={() => setShowUserForm(true)}
          >
            Nouveau manager
          </Button>
        </div>
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

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Agences
          </h3>
          <div className="mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SIREN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agencies.map((agency) => (
                  <tr key={agency.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-lg object-contain"
                            src={agency.logo}
                            alt={agency.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {agency.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {agency.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agency.siren}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agency.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {agency.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(agency.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedAgency(agency)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilLine className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleAgencyDelete(agency.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAgencyForm && (
        <AgencyForm
          onClose={() => setShowAgencyForm(false)}
          onSubmit={handleAgencySubmit}
        />
      )}

      {selectedAgency && (
        <AgencyForm
          agency={selectedAgency}
          onClose={() => setSelectedAgency(null)}
          onSubmit={handleAgencyUpdate}
          isEdit
        />
      )}

      {showUserForm && (
        <UserForm
          onClose={() => setShowUserForm(false)}
          agencies={agencies}
          role="manager"
        />
      )}
    </div>
  );
};

export default SuperAdmin;