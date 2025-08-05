import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import ImageUpload from './ImageUpload';
import type { User } from '../types/auth';
import type { Agency } from '../types/agency';
import { v4 as uuidv4 } from 'uuid';

interface UserFormProps {
  user?: User;
  onClose: () => void;
  onSubmit: (data: User) => void;
  agencies: Agency[];
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onClose,
  onSubmit,
  agencies
}) => {
  const [formData, setFormData] = useState({
    id: user?.id || uuidv4(),
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'employee',
    agencyId: user?.agencyId || '',
    avatar: user?.avatar || '',
    readNotifications: user?.readNotifications || {},
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      readNotifications: formData.readNotifications
    } as User);
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
          {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            currentImage={formData.avatar}
            onImageChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
            label="Photo de profil"
            id="user-avatar-upload"
          />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          {!user && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rôle
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as User['role'] }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="manager">Manager</option>
              <option value="employee">Employé</option>
            </select>
          </div>

          <div>
            <label htmlFor="agencyId" className="block text-sm font-medium text-gray-700">
              Agence
            </label>
            <select
              id="agencyId"
              value={formData.agencyId}
              onChange={(e) => setFormData(prev => ({ ...prev, agencyId: e.target.value }))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Sélectionner une agence</option>
              {agencies.map(agency => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
            >
              {user ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;