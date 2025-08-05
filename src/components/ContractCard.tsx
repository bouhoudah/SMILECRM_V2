import React from 'react';
import { FileText, PencilLine, Eye } from 'lucide-react';
import type { Contract } from '../types/data';

interface ContractCardProps {
  contract: Contract;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  className?: string;
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onView,
  onEdit,
  className = ''
}) => {
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
    <div className={`bg-white rounded-lg p-3 shadow-sm group ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">{contract.type}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(contract.statut)}`}>
            {contract.statut}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <button
              onClick={() => onView(contract)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(contract)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              title="Modifier"
            >
              <PencilLine className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Réf:</span>
          <span className="font-medium">{contract.reference}</span>
        </div>
        <div className="flex justify-between">
          <span>Montant:</span>
          <span className="font-medium">{formatMoney(contract.montantAnnuel)}/an</span>
        </div>
        <div className="flex justify-between">
          <span>Partenaire:</span>
          <span className="font-medium">{contract.partenaire?.nom}</span>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;