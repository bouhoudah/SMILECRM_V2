import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { X, History, PencilLine } from 'lucide-react';
import Button from './Button';
import type { Contract } from '../types/data';



interface ContractFormProps {
  contract?: Contract;
  initialClientId?: string;
  onClose: () => void;
  onSubmit: (data: Omit<Contract, 'id'> | Contract) => void;
  isEdit?: boolean;
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

const ContractForm: React.FC<ContractFormProps> = ({ 
  contract, 
  initialClientId,
  onClose, 
  onSubmit,
  isEdit 
}) => {
  const { contacts, partners } = useData();
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [editingPeriodIndex, setEditingPeriodIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReference = (startDate: string) => {
    const date = new Date(startDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `CONT-${year}_${month}_${sequence}`;
  };

  const [formData, setFormData] = useState({
    reference: contract?.reference || generateReference(new Date().toISOString().split('T')[0]),
    clientId: contract?.clientId || initialClientId || '',
    type: contract?.type || 'auto',
    categorie: contract?.categorie || 'particulier',
    montantAnnuel: contract?.montantAnnuel || 0,
    dateDebut: contract?.dateDebut || new Date().toISOString().split('T')[0],
    dateFin: contract?.dateFin || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    partenaire: typeof contract?.partenaire === 'object' ? contract.partenaire.id : contract?.partenaire || '',
    statut: contract?.statut || 'actif',
    commissionPremiereAnnee: contract?.commissionPremiereAnnee || 30,
    commissionAnneesSuivantes: contract?.commissionAnneesSuivantes || 10,
    fraisDossier: contract?.fraisDossier,
    fraisDossierRecurrent: contract?.fraisDossierRecurrent || false,
    historique: contract?.historique || [],
    typeRisque: contract?.typeRisque || '',
    formuleProduit: contract?.formuleProduit || '',
    dateResiliation: contract?.dateResiliation || '',
    raisonResiliation: contract?.raisonResiliation || '',
    porteurDeRisque: contract?.porteurDeRisque || '',
    fraisDeCourtage: contract?.fraisDeCourtage || 0,
  });

  const allPeriods = [
    {
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      montantAnnuel: formData.montantAnnuel,
      current: true
    },
    ...(formData.historique || []).map(history => ({
      dateDebut: history.dateDebut,
      dateFin: history.dateFin,
      montantAnnuel: history.montantAnnuel,
      current: false
    }))
  ].sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setError(null);

    if (name === 'clientId') {
      const selectedContact = contacts.find(c => c.id === value);
      if (selectedContact) {
        const newCategorie = selectedContact.types.professionnel ? 'professionnel' : 'particulier';
        setFormData(prev => ({
          ...prev,
          [name]: value,
          categorie: newCategorie
        }));
        return;
      }
    }

    if (name === 'dateDebut') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        reference: generateReference(value)
      }));
      return;
    }

    if (name === 'dateDebut' || name === 'dateFin') {
      const dateDebut = name === 'dateDebut' ? new Date(value) : new Date(formData.dateDebut);
      const dateFin = name === 'dateFin' ? new Date(value) : new Date(formData.dateFin);

      if (dateFin <= dateDebut) {
        setError('La date de fin doit être postérieure à la date de début');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              value
    }));
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  if (isEdit && contract) {
    const updatedContract = {
      ...formData,
      id: contract.id,
      historique: [
        ...(contract.historique || []),
        {
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
          createdBy: 'system'
        }
      ]
    };
    console.log("🔁 Données envoyées (update):", updatedContract);
    onSubmit(updatedContract);
  } else {
    const payload = {
      reference: formData.reference,
      clientId: formData.clientId,
      type: formData.type,
      categorie: formData.categorie,
      montantAnnuel: formData.montantAnnuel,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      partenaireId: parseInt(formData.partenaire as string, 10),
      statut: formData.statut,
      commissionPremiereAnnee: formData.commissionPremiereAnnee,
      commissionAnneesSuivantes: formData.commissionAnneesSuivantes,
      fraisDossier: formData.fraisDossier,
      fraisDossierRecurrent: formData.fraisDossierRecurrent,
      typeRisque: formData.typeRisque,
      formuleProduit: formData.formuleProduit,
      porteurDeRisque: formData.porteurDeRisque,
      dateResiliation: formData.dateResiliation,
      raisonResiliation: formData.raisonResiliation,
      fraisDeCourtage: formData.fraisDeCourtage
    };

    if (!formData.clientId) {
      delete payload.clientId;
    }

    console.log("🆕 Données envoyées (create):", payload);
    onSubmit(payload);
    onClose();
  }
};


  const validateForm = (): boolean => {
    if (!formData.clientId) {
      setError('Veuillez sélectionner un client');
      return false;
    }

    const selectedContact = contacts.find(c => c.id === parseInt(formData.clientId as string, 10));
    if (!selectedContact) {
      setError('Client invalide');
      return false;
    }

    if (!formData.partenaire) {
      setError('Veuillez sélectionner un partenaire');
      return false;
    }

    if (formData.montantAnnuel <= 0) {
      setError('Le montant annuel doit être supérieur à 0');
      return false;
    }

    const dateDebut = new Date(formData.dateDebut);
    const dateFin = new Date(formData.dateFin);

    if (dateFin <= dateDebut) {
      setError('La date de fin doit être postérieure à la date de début');
      return false;
    }

    return true;
  };

  const handleSavePeriod = (index: number, updatedPeriod: { dateDebut: string; dateFin: string; montantAnnuel: number }) => {
    if (index === 0) {
      setFormData(prev => ({
        ...prev,
        dateDebut: updatedPeriod.dateDebut,
        dateFin: updatedPeriod.dateFin,
        montantAnnuel: updatedPeriod.montantAnnuel
      }));
    } else {
      const historicalIndex = index - 1;
      const updatedHistory = [...formData.historique];
      if (updatedHistory[historicalIndex]) {
        updatedHistory[historicalIndex] = {
          ...updatedHistory[historicalIndex],
          dateDebut: updatedPeriod.dateDebut,
          dateFin: updatedPeriod.dateFin,
          montantAnnuel: updatedPeriod.montantAnnuel
        };
        setFormData(prev => ({
          ...prev,
          historique: updatedHistory
        }));
      }
    }
    setEditingPeriodIndex(null);
  };

  const activePartners = partners
    .filter(p => p.statut === 'actif')
    .sort((a, b) => a.nom.localeCompare(b.nom));

  const sortedContacts = contacts
    .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`));


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start justify-center p-4 z-[999] overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 relative my-8">
        <div className="sticky top-0 right-0 flex justify-end -mt-2 -mr-2 z-[999]">
          <button
            onClick={onClose}
            className="p-2 text-red-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-lg font-medium mb-6">
          {isEdit ? 'Modifier le contrat' : 'Nouveau contrat'}
        </h2>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Détails
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <History className="h-4 w-4 mr-2" />
              Historique
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                Référence
              </label>
              <input
                type="text"
                name="reference"
                id="reference"
                value={formData.reference}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                readOnly
              />
            </div>

            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                Contact
              </label>
              <select
                name="clientId"
                id="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                disabled={!!initialClientId}
              >
                <option value="">Sélectionner un contact</option>
                {sortedContacts.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom}
                    {' '}
                    {client.types.particulier && client.types.professionnel
                      ? '(Part. & Pro)'
                      : client.types.particulier
                        ? '(Particulier)'
                        : client.types.professionnel
                          ? '(Professionnel)'
                          : '(Prospect)'}
                    {' '}
                    - {client.statut === 'client' ? 'Client' : 'Prospect'}
                  </option>
                ))}

              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type de contrat <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="auto">Auto</option>
                <option value="habitation">Habitation</option>
                <option value="sante">Sante</option>
                <option value="prevoyance">Prevoyance</option>
                <option value="multirisque">Multirisque</option>
                <option value="responsabilite_civile">Responsabilite_civile</option>
              </select>
            </div>
            <div>
              <label htmlFor="typeRisque" className="block text-sm font-medium text-gray-700">
                Type de risque <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="typeRisque"
                id="typeRisque"
                value={formData.typeRisque}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="formuleProduit" className="block text-sm font-medium text-gray-700">
                Formule produit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="formuleProduit"
                id="formuleProduit"
                value={formData.formuleProduit}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="porteurDeRisque" className="block text-sm font-medium text-gray-700">Porteur de risque <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="porteurDeRisque"
                name="porteurDeRisque"
                value={formData.porteurDeRisque}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
          </div>

            <div>
              <label htmlFor="montantAnnuel" className="block text-sm font-medium text-gray-700">
                Montant annuel (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="montantAnnuel"
                id="montantAnnuel"
                value={formData.montantAnnuel}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                min="0"
                step="0.01"
              />
            </div>

            
              <div>
                <label htmlFor="commissionPremiereAnnee" className="block text-sm font-medium text-gray-700">
                  Commission 1ère année (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="commissionPremiereAnnee"
                  id="commissionPremiereAnnee"
                  value={formData.commissionPremiereAnnee}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              

              <div>
                <label htmlFor="commissionAnneesSuivantes" className="block text-sm font-medium text-gray-700">
                  Commission années suivantes (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="commissionAnneesSuivantes"
                  id="commissionAnneesSuivantes"
                  value={formData.commissionAnneesSuivantes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="fraisDossier" className="block text-sm font-medium text-gray-700">
                Frais de dossier Smile (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fraisDossier"
                id="fraisDossier"
                value={formData.fraisDossier}
                placeholder='0'
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="fraisDossierRecurrent"
                id="fraisDossierRecurrent"
                checked={formData.fraisDossierRecurrent}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="fraisDossierRecurrent" className="ml-2 block text-sm text-gray-700">
                Frais de dossier récurrents (chaque année) 
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700">
                  Date de prise d'effet <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  id="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700">
                  Date de renouvellement <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateFin"
                  id="dateFin"
                  value={formData.dateFin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="dateResiliation" className="block text-sm font-medium text-gray-700">
                  Date de résiliation <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateResiliation"
                  id="dateResiliation"
                  value={formData.dateResiliation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="raisonResiliation" className="block text-sm font-medium text-gray-700">
                  Raison de résiliation <span className="text-red-500">*</span>
                </label>
                <select
                  name="raisonResiliation"
                  id="raisonResiliation"
                  value={formData.raisonResiliation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                >
                  <option value="">Sélectionner une raison</option>
                  <option value="changement_assureur">Changement d’assureur</option>
                  <option value="non_paiement">Non-paiement</option>
                  <option value="fin_contrat">Fin de contrat</option>
                  <option value="client_demande">Demande du client</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="partenaire" className="block text-sm font-medium text-gray-700">
                Partenaire <span className="text-red-500">*</span>
              </label>
              <select
                name="partenaire"
                id="partenaire"
                value={formData.partenaire}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Sélectionner un partenaire</option>
                {activePartners.map(partner => (
                  <option key={partner.id} value={partner.id}>{partner.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                name="statut"
                id="statut"
                value={formData.statut}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="actif">Actif</option>
                <option value="en_cours">En cours</option>
                <option value="résilié">Résilié</option>
                <option value="à_renouveler">À renouveler</option>
              </select>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                {isEdit ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
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
        )}
      </div>
    </div>
  );
};

export default ContractForm;