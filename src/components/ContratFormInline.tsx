import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Button from './Button';

interface ContratFormInlineProps {
  clientId: number;
  onAdd: (contrat: any) => void;
}


const ContratFormInline: React.FC<ContratFormInlineProps> = ({ onAdd, clientId }) => {
  const { partners } = useData();

  const [contratData, setContratData] = useState({
    type: 'auto',
    categorie: 'particulier',
    statut: 'actif',
    montantAnnuel: 0,
    dateDebut: '',
    dateFin: '',
    partenaireId: '',
    commissionPremiereAnnee: 0,
    commissionAnneesSuivantes: 0,
    fraisDossier: 0,
    fraisDossierRecurrent: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setContratData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contratData.dateDebut || !contratData.dateFin || !contratData.partenaireId) return;

    try {
      const response = await fetch('http://localhost:3000/api/contrats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contratData,
          clientId // nécessaire pour le back-end
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l’ajout du contrat');
      }

      const createdContrat = await response.json();
      onAdd(createdContrat); // On retourne le contrat avec l'ID généré, etc.
      setContratData({
        reference: '',
        type: 'auto',
        categorie: 'particulier',
        statut: 'actif',
        montantAnnuel: 0,
        dateDebut: '',
        dateFin: '',
        partenaireId: '',
        commissionPremiereAnnee: 0,
        commissionAnneesSuivantes: 0,
        fraisDossier: 0,
        fraisDossierRecurrent: false,
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de l’ajout du contrat.');
    }
  };


  return (
    <div className="space-y-4 border p-4 rounded-md bg-gray-50 mt-4">
      <h4 className="font-medium text-sm mb-2">Ajouter un contrat</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <select name="type" value={contratData.type} onChange={handleChange} className="w-full border rounded p-1 text-sm">
            <option value="auto">Auto</option>
            <option value="habitation">Habitation</option>
            <option value="sante">Sante</option>
            <option value="vie">Vie</option>
            <option value="prevoyance">Prévoyance</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Catégorie</label>
          <select name="categorie" value={contratData.categorie} onChange={handleChange} className="w-full border rounded p-1 text-sm">
            <option value="particulier">Particulier</option>
            <option value="professionnel">Professionnel</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Montant annuel (€)</label>
          <input type="number" name="montantAnnuel" value={contratData.montantAnnuel} onChange={handleChange} className="w-full border rounded p-1 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Partenaire</label>
          <select name="partenaireId" value={contratData.partenaireId} onChange={handleChange} className="w-full border rounded p-1 text-sm">
            <option value="">-- Sélectionner --</option>
            {partners
              .filter(p => p.statut === 'actif')
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Date de début</label>
          <input type="date" name="dateDebut" value={contratData.dateDebut} onChange={handleChange} className="w-full border rounded p-1 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Date de fin</label>
          <input type="date" name="dateFin" value={contratData.dateFin} onChange={handleChange} className="w-full border rounded p-1 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Commission 1ère annéess (%)</label>
          <input type="number" name="commissionPremiereAnnee" value={contratData.commissionPremiereAnnee} onChange={handleChange} className="w-full border rounded p-1 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Commission suivantes (%)</label>
          <input type="number" name="commissionAnneesSuivantes" value={contratData.commissionAnneesSuivantes} onChange={handleChange} className="w-full border rounded p-1 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Frais de dossier (€)</label>
          <input type="number" name="fraisDossier" value={contratData.fraisDossier} onChange={handleChange} className="w-full border rounded p-1 text-sm" />
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <input type="checkbox" name="fraisDossierRecurrent" checked={contratData.fraisDossierRecurrent} onChange={handleChange} />
          <label className="text-sm">Frais récurrents</label>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          onClick={handleSubmit}
          variant="primary"
          disabled={!contratData.dateDebut || !contratData.dateFin || !contratData.partenaireId}
        >
          Ajouter le contrat
        </Button>


      </div>
    </div>
  );
};

export default ContratFormInline;
