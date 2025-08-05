import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import ImageUpload from './ImageUpload';
import type { Agency } from '../types/agency';

interface AgencyFormProps {
  agency?: Agency;
  onClose: () => void;
  onSubmit: (data: Omit<Agency, 'id' | 'createdAt'> | Agency) => void;
  isEdit?: boolean;
}

const AgencyForm: React.FC<AgencyFormProps> = ({
  agency,
  onClose,
  onSubmit,
  isEdit
}) => {
  const [formData, setFormData] = useState({
    name: agency?.name || '',
    address: agency?.address || '',
    siren: agency?.siren || '',
    status: agency?.status || 'active',
    logo: agency?.logo || '',
    squareLogo: agency?.squareLogo || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && agency) {
      onSubmit({ ...formData, id: agency.id, createdAt: agency.createdAt, createdBy: agency.createdBy });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-medium mb-6">
          {isEdit ? 'Modifier l\'agence' : 'Nouvelle agence'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload
              currentImage={formData.logo}
              onImageChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
              label="Logo principal"
              id="main-logo"
            />
            <ImageUpload
              currentImage={formData.squareLogo}
              onImageChange={(url) => setFormData(prev => ({ ...prev, squareLogo: url }))}
              label="Logo carré"
              id="square-logo"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom de l'agence
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="siren" className="block text-sm font-medium text-gray-700">
              SIREN
            </label>
            <input
              type="text"
              id="siren"
              name="siren"
              value={formData.siren}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              pattern="[0-9]{9}"
              title="Le SIREN doit contenir 9 chiffres"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
      </div>
    </div>
  );
};

export default AgencyForm;