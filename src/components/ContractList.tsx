import React from 'react';
import { useData } from '../context/DataContext';
import { Contract } from '../types/data';
import { PencilLine, Trash2, Plus } from 'lucide-react';
import Button from './Button';
import ContractForm from './ContractForm';
import ContractDetails from './ContractDetails';

const ContractList = () => {
  const { contracts, editContract, deleteContract, addContract } = useData();
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetails(true);
  };

  const handleDelete = (contractId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      deleteContract(contractId);
    }
  };

  const handleSubmit = async (contractData: Omit<Contract, 'id'> | Contract) => {
    try {
      if ('id' in contractData) {
        editContract(contractData);
      } else {
        await addContract(contractData);
      }
      setShowForm(false);
      setSelectedContract(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du contrat:', err);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: Contract['statut']) => {
    switch (status) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'en_cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'à_renouveler':
        return 'bg-orange-100 text-orange-800';
      case 'résilié':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Contrats</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setSelectedContract(null);
            setShowForm(true);
          }}
        >
          Nouveau contrat
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partenaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedContract?.id === contract.id ? 'bg-indigo-50' : ''}`}
                  onClick={() => handleView(contract)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contract.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contract.partenaire && typeof contract.partenaire === 'object'
                    ? contract.partenaire.nom
                    : typeof contract.partenaire === 'string'
                      ? contract.partenaire
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatMoney(contract.montantAnnuel)}/an
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contract.statut)}`}>
                      {contract.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(contract);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contract.id);
                      }}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ContractForm
          contract={selectedContract}
          onClose={() => {
            setShowForm(false);
            setSelectedContract(null);
          }}
          onSubmit={handleSubmit}
          isEdit={!!selectedContract}
        />
      )}

      {showDetails && selectedContract && (
        <ContractDetails
          contract={selectedContract}
          onClose={() => {
            setShowDetails(false);
            setSelectedContract(null);
          }}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default ContractList;
