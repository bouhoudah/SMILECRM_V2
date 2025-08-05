import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Button from '../components/Button';
import SortableHeader from '../components/SortableHeader';
import { useSort } from '../hooks/useSort';
import { PencilLine, Trash2, Plus } from 'lucide-react';
import ContractForm from '../components/ContractForm';
import ContractDetails from '../components/ContractDetails';
import type { Contract } from '../types/data';
import { useAuth } from '../context/AuthContext';

const Contracts = () => {
  const { contracts, contacts, editContract, deleteContract, addContract } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    statut: ''
  });
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getClientName = (clientId: string) => {
    const client = contacts.find(c => c.id === clientId);
    return client ? `${client.prenom} ${client.nom}` : 'Client inconnu';
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = (
      contract.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(contract.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesType = !filters.type || contract.type === filters.type;
    const matchesStatut = !filters.statut || contract.statut === filters.statut;

    return matchesSearch && matchesType && matchesStatut;
  });

  const { items: sortedContracts, sortConfig, requestSort } = useSort(
    filteredContracts,
    { key: 'dateDebut', direction: 'desc' }
  );

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

  const handleRenew = async (contract: Contract, newAmount: number) => {
    try {
      // Add current contract to history
      const historicalEntry = {
        id: `hist-${Date.now()}`,
        contratId: contract.id,
        montantAnnuel: contract.montantAnnuel,
        dateDebut: contract.dateDebut,
        dateFin: contract.dateFin,
        commissionPremiereAnnee: contract.commissionPremiereAnnee,
        commissionAnneesSuivantes: contract.commissionAnneesSuivantes,
        fraisDossier: contract.fraisDossier,
        fraisDossierRecurrent: contract.fraisDossierRecurrent,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'system'
      };

      // Update contract with new dates and amount
      const currentDate = new Date();
      const nextYear = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
      
      const updatedContract: Contract = {
        ...contract,
        montantAnnuel: newAmount,
        dateDebut: new Date().toISOString().split('T')[0],
        dateFin: nextYear.toISOString().split('T')[0],
        notificationSent: false,
        historique: [...(contract.historique || []), historicalEntry]
      };

      editContract(updatedContract);
      setShowDetails(false);
      setSelectedContract(null);
    } catch (err) {
      console.error('Erreur lors du renouvellement du contrat:', err);
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
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher un contrat..."
            />
            <FilterBar
              filters={[
                {
                  name: 'type',
                  label: 'Type',
                  options: [
                    { value: 'auto', label: 'Auto' },
                    { value: 'habitation', label: 'Habitation' },
                    { value: 'santé', label: 'Santé' },
                    { value: 'prévoyance', label: 'Prévoyance' },
                    { value: 'multirisque', label: 'Multirisque' },
                    { value: 'responsabilité civile', label: 'Responsabilité civile' }
                  ],
                  value: filters.type
                },
                {
                  name: 'statut',
                  label: 'Statut',
                  options: [
                    { value: 'actif', label: 'Actif' },
                    { value: 'en_cours', label: 'En cours' },
                    { value: 'résilié', label: 'Résilié' },
                    { value: 'à_renouveler', label: 'À renouveler' }
                  ],
                  value: filters.statut
                }
              ]}
              onChange={(name, value) => setFilters(prev => ({ ...prev, [name]: value }))}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Référence"
                    sortKey="reference"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Date d'expiration"
                    sortKey="dateFin"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Client"
                    sortKey="clientId"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Type"
                    sortKey="type"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Partenaire"
                    sortKey="partenaire"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Montant"
                    sortKey="montantAnnuel"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Statut"
                    sortKey="statut"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedContracts.map((contract) => (
                <tr 
                  key={contract.id}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedContract?.id === contract.id ? 'bg-indigo-50' : ''}`}
                  onClick={() => handleView(contract)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contract.dateFin).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getClientName(contract.clientId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contract.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof contract.partenaire === 'object' && contract.partenaire !== null
                        ? contract.partenaire.nom
                        : String(contract.partenaire)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contract.montantAnnuel.toLocaleString('fr-FR')} €/an
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
          onRenew={handleRenew}
        />
      )}
    </div>
  );
};

export default Contracts;