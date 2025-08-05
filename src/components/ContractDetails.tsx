import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, PencilLine } from 'lucide-react';
import type { Contract, ContractHistory } from '../types/data';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

interface ContractDetailsProps {
  contract: Contract;
  onClose: () => void;
  onEdit: (contract: Contract) => void;
  onRenew?: (contract: Contract, newAmount: number) => void;
}

interface HistoryEditFormProps {
  period: {
    dateDebut: string;
    dateFin: string;
    montantAnnuel: number;
  };
  onSave: (updatedPeriod: { dateDebut: string; dateFin: string; montantAnnuel: number }) => void;
  onCancel: () => void;
}

const HistoryEditForm: React.FC<HistoryEditFormProps> = ({ period, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    dateDebut: period.dateDebut,
    dateFin: period.dateFin,
    montantAnnuel: period.montantAnnuel
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de début</label>
          <input
            type="date"
            value={formData.dateDebut}
            onChange={(e) => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de fin</label>
          <input
            type="date"
            value={formData.dateFin}
            onChange={(e) => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Montant annuel (€)</label>
        <input
          type="number"
          value={formData.montantAnnuel}
          onChange={(e) => setFormData(prev => ({ ...prev, montantAnnuel: Number(e.target.value) }))}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
          min="0"
          step="0.01"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={onCancel} type="button">
          Annuler
        </Button>
        <Button variant="primary" type="submit">
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

const ContractDetails: React.FC<ContractDetailsProps> = ({
  contract,
  onClose,
  onEdit,
  onRenew
}) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [newAmount, setNewAmount] = useState(contract.montantAnnuel);
  const [editingPeriodIndex, setEditingPeriodIndex] = useState<number | null>(null);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const daysUntilRenewal = Math.ceil(
    (new Date(contract.dateFin).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  const needsRenewal = daysUntilRenewal <= 30 && daysUntilRenewal > 0;

  const allPeriods = [
    {
      dateDebut: contract.dateDebut,
      dateFin: contract.dateFin,
      montantAnnuel: contract.montantAnnuel,
      current: true
    },
    ...(contract.historique || []).map(history => ({
      dateDebut: history.dateDebut,
      dateFin: history.dateFin,
      montantAnnuel: history.montantAnnuel,
      current: false
    }))
  ].sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());

  const handleSavePeriod = (index: number, updatedPeriod: { dateDebut: string; dateFin: string; montantAnnuel: number }) => {
    const updatedContract = { ...contract };
    
    if (index === 0) {
      updatedContract.dateDebut = updatedPeriod.dateDebut;
      updatedContract.dateFin = updatedPeriod.dateFin;
      updatedContract.montantAnnuel = updatedPeriod.montantAnnuel;
    } else {
      const historicalIndex = index - 1;
      if (updatedContract.historique && updatedContract.historique[historicalIndex]) {
        updatedContract.historique[historicalIndex] = {
          ...updatedContract.historique[historicalIndex],
          dateDebut: updatedPeriod.dateDebut,
          dateFin: updatedPeriod.dateFin,
          montantAnnuel: updatedPeriod.montantAnnuel
        };
      }
    }

    onEdit(updatedContract);
    setEditingPeriodIndex(null);
    setSuccess('Période mise à jour avec succès');
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Contrat {contract.type}
              </h2>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(contract.statut)}`}>
                {contract.statut}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Référence: {contract.reference}
          </p>
          
          {needsRenewal && (
            <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <div className="ml-3">
                  <p className="text-sm text-orange-700">
                    Ce contrat arrive à échéance dans {daysUntilRenewal} jours
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Informations générales</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Partenaire</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {contract.partenaire?.nom || '—'}
                  </dd>
                </div>

                {contract.partenaire?.intranetUrl && (
                  <div className="flex justify-start">
                    <a
                      href={contract.partenaire.intranetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Accéder à l'intranet partenaire
                    </a>
                  </div>
                )}

                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Montant actuel</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatMoney(contract.montantAnnuel)}/an</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Période actuelle</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(contract.dateDebut)} au {formatDate(contract.dateFin)}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Commissions</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">1ère année</dt>
                  <dd className="text-sm font-medium text-gray-900">{contract.commissionPremiereAnnee}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Années suivantes</dt>
                  <dd className="text-sm font-medium text-gray-900">{contract.nAnneesSuivantes}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Frais de dossier</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatMoney(contract.fraisDossier)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Frais récurrents</dt>
                  <dd className="text-sm font-medium text-gray-900">{contract.fraisDossierRecurrent ? 'Oui' : 'Non'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-4">Historique des montants</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {allPeriods.map((period, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg ${
                    period.current 
                      ? 'bg-indigo-50 border border-indigo-100'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  {editingPeriodIndex === index ? (
                    <HistoryEditForm
                      period={period}
                      onSave={(updatedPeriod) => handleSavePeriod(index, updatedPeriod)}
                      onCancel={() => setEditingPeriodIndex(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(period.dateDebut)} au {formatDate(period.dateFin)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {period.current ? 'Période actuelle' : 'Période passée'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatMoney(period.montantAnnuel)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">par an</p>
                        </div>
                        <button
                          onClick={() => setEditingPeriodIndex(index)}
                          className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        >
                          <PencilLine className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {needsRenewal && !showRenewalForm && (
            <div className="pt-4">
              <Button
                variant="primary"
                onClick={() => setShowRenewalForm(true)}
                className="w-full"
              >
                Renouveler le contrat
              </Button>
            </div>
          )}

          {showRenewalForm && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Renouvellement du contrat
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (onRenew) onRenew(contract, newAmount);
                setShowRenewalForm(false);
              }} className="space-y-4">
                <div>
                  <label htmlFor="newAmount" className="block text-sm font-medium text-gray-700">
                    Nouveau montant annuel
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="newAmount"
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowRenewalForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                  >
                    Confirmer le renouvellement
                  </Button>
                </div>
              </form>
            </div>
          )}

          {!showRenewalForm && (
            <div className="pt-6 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={() => onEdit(contract)}
                className="w-full"
              >
                Modifier le contrat
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContractDetails;