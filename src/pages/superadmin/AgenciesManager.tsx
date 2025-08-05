import React, { useState } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { Building2, Trash2, PencilLine, Plus } from 'lucide-react';
import Button from '../../components/Button';
import AgencyForm from '../../components/AgencyForm';
import type { Agency } from '../../types/agency';

const AgenciesManager = () => {
  const { agencies, addAgency, updateAgency, deleteAgency } = useAgency();
  const [showAgencyForm, setShowAgencyForm] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Agences</h1>
          <p className="mt-2 text-sm text-gray-600">Gérez votre réseau d'agences</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowAgencyForm(true)}
        >
          Nouvelle agence
        </Button>
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
          <div className="overflow-x-auto">
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
    </div>
  );
};

export default AgenciesManager;