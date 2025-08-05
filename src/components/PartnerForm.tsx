import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import Button from './Button';
import ImageUpload from './ImageUpload';
import type { Partner } from '../types/data';

interface PartnerFormProps {
  partner?: Partner;
  onClose: () => void;
  onSubmit: (data: Omit<Partner, 'id'> | Partner) => void;
  isEdit?: boolean;
}

const PartnerForm: React.FC<PartnerFormProps> = ({
  partner,
  onClose,
  onSubmit,
  isEdit
}) => {
  const [formData, setFormData] = useState({
    nom: partner?.nom || '',
    type: partner?.type || 'assureur',
    produits: partner?.produits || [],
    statut: partner?.statut || 'actif',
    contactPrincipal: partner?.contactPrincipal || '',
    email: partner?.email || '',
    telephone: partner?.telephone || '',
    siteWeb: partner?.siteWeb || '',
    intranetUrl: partner?.intranetUrl || '',
    logoUrl: partner?.logoUrl || '',
    porteurDeRisque: partner?.porteurDeRisque || '',
    typeProduit: partner?.typeProduit || ''

  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tryFetchLogo = async (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handleFetchLogo = async () => {
    if (!formData.siteWeb) {
      setError('Veuillez d\'abord saisir l\'URL du site web');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(formData.siteWeb);
      const domain = `${url.protocol}//${url.hostname}`;

      const possiblePaths = [
        '/favicon.ico',
        '/favicon.png',
        '/favicon-32x32.png',
        '/apple-touch-icon.png',
        '/apple-touch-icon-precomposed.png'
      ];

      for (const path of possiblePaths) {
        const logoUrl = await tryFetchLogo(`${domain}${path}`);
        if (logoUrl) {
          setFormData(prev => ({ ...prev, logoUrl }));
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await fetch(formData.siteWeb);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const iconLinks = doc.querySelectorAll('link[rel*="icon"]');
        for (const link of Array.from(iconLinks)) {
          const href = link.getAttribute('href');
          if (href) {
            const fullUrl = href.startsWith('http') ? href : `${domain}${href.startsWith('/') ? '' : '/'}${href}`;
            const logoUrl = await tryFetchLogo(fullUrl);
            if (logoUrl) {
              setFormData(prev => ({ ...prev, logoUrl }));
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Erreur lors de la recherche du logo dans le HTML:', err);
      }

      setError('Aucun logo trouvé sur le site');
      setIsLoading(false);
    } catch (err) {
      setError('URL invalide');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && partner) {
      onSubmit({ ...formData, id: partner.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-300 hover:text-red-400 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-medium mb-6">
          {isEdit ? 'Modifier le partenaire' : 'Nouveau partenaire'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <ImageUpload
              currentImage={formData.logoUrl}
              onImageChange={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
              label="Logo"
              id="partner-logo"
            />
          </div>

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="assureur">Assureur</option>
              <option value="courtier grossiste">Courtier grossiste</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="produits" className="block text-sm font-medium text-gray-700">Produits proposés</label>
            <select
              id="produits"
              name="produits"
              value={formData.produits[0] || ''}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  produits: [e.target.value]
                }))
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">-- Sélectionnez un produit --</option>
              <option value="auto">Auto</option>
              <option value="habitation">Habitation</option>
              <option value="santé">Santé</option>
              <option value="prévoyance">Prévoyance</option>
              <option value="multirisque">Multirisque</option>
              <option value="responsabilité civile">Responsabilité civile</option>
            </select>

          </div>

          <div>
            <label htmlFor="intranetUrl" className="block text-sm font-medium text-gray-700">URL Extranet</label>
            <input
              type="url"
              id="intranetUrl"
              name="intranetUrl"
              value={formData.intranetUrl}
              onChange={handleInputChange}
              placeholder="https://intranet.example.com"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div>
            <label htmlFor="contactPrincipal" className="block text-sm font-medium text-gray-700">Contact principal</label>
            <input
              type="text"
              id="contactPrincipal"
              name="contactPrincipal"
              value={formData.contactPrincipal}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>


          <div>
            <label htmlFor="typeProduit" className="block text-sm font-medium text-gray-700">Type de produit</label>
            <input
              type="text"
              id="typeProduit"
              name="typeProduit"
              value={formData.typeProduit}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              id="statut"
              name="statut"
              value={formData.statut}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-6">
            <Button type="submit" variant="primary" className="w-full">
              {isEdit ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PartnerForm;
