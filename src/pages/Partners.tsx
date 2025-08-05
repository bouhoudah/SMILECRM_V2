import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Button from '../components/Button';
import SortableHeader from '../components/SortableHeader';
import { useSort } from '../hooks/useSort';
import { PencilLine, Trash2, Plus, ExternalLink } from 'lucide-react';
import PartnerForm from '../components/PartnerForm';
import type { Partner } from '../types/data';

const Partners = () => {
  const { partners, editPartner, deletePartner, addPartner } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    statut: ''
  });
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filters.type || partner.type === filters.type;
    const matchesStatut = !filters.statut || partner.statut === filters.statut;

    return matchesSearch && matchesType && matchesStatut;
  });

  const { items: sortedPartners, sortConfig, requestSort } = useSort(
    filteredPartners,
    { key: 'nom', direction: 'asc' }
  );

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowForm(true);
  };

  const handleDelete = (partnerId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      deletePartner(partnerId);
    }
  };

  const handleSubmit = (partnerData: Omit<Partner, 'id'> | Partner) => {
    if ('id' in partnerData) {
      editPartner(partnerData);
    } else {
      addPartner(partnerData);
    }
    setShowForm(false);
    setSelectedPartner(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Partenaires</h1>
        <Button 
          variant="primary" 
          icon={Plus}
          onClick={() => {
            setSelectedPartner(null);
            setShowForm(true);
          }}
        >
          Nouveau partenaire
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher un partenaire..."
            />
            <FilterBar
              filters={[
                {
                  name: 'type',
                  label: 'Type',
                  options: [
                    { value: 'assureur', label: 'Assureur' },
                    { value: 'courtier grossiste', label: 'Courtier grossiste' }
                  ],
                  value: filters.type
                },
                {
                  name: 'statut',
                  label: 'Statut',
                  options: [
                    { value: 'actif', label: 'Actif' },
                    { value: 'inactif', label: 'Inactif' }
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
                    label="Partenaire"
                    sortKey="nom"
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
                    label="Contact"
                    sortKey="contactPrincipal"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <SortableHeader
                    label="Liens Extranet"
                    sortKey="siteWeb"
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
              {sortedPartners.map((partner) => (
                <tr 
                  key={partner.id}
                  className={`hover:bg-gray-50 ${selectedPartner?.id === partner.id ? 'bg-indigo-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-contain"
                          src={partner.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.nom)}&background=random`}
                          alt={partner.nom}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {partner.nom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{partner.contactPrincipal}</div>
                    <div className="text-sm text-gray-500">{partner.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      
                      {partner.intranetUrl && (
                        <a
                          href={partner.intranetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      partner.statut === 'actif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {partner.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(partner)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
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
        <PartnerForm
          partner={selectedPartner || undefined}
          onClose={() => {
            setShowForm(false);
            setSelectedPartner(null);
          }}
          onSubmit={handleSubmit}
          isEdit={!!selectedPartner}
        />
      )}
    </div>
  );
};

export default Partners;