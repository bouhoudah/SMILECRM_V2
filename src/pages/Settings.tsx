import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Building2, Users, Trash2, PencilLine, Save, Palette, Database } from 'lucide-react';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import BackupModal from '../components/BackupModal';
import ColorPicker from '../components/ColorPicker';
import { Agency } from '../types/agency';
import { User } from '../types/auth';

interface UserFormState {
  id?: string;
  email: string;
  name: string;
  role: 'manager' | 'employee';
  avatar?: string;
  password?: string;
}

const Settings = () => {
  const { user, updateUser, agencySettings, updateAgencySettings, users, updateUsers } = useAuth();
  const { contacts, partners, contracts, updateContacts, updatePartners, updateContracts } = useData();
  const { colors, updateColors } = useTheme();
  const [activeTab, setActiveTab] = useState<'agency' | 'users' | 'theme'>('agency');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isInserting, setIsInserting] = useState(false);

  const [userForm, setUserForm] = useState<UserFormState>({
    email: '',
    name: '',
    role: 'employee',
    password: ''
  });

  const [agency, setAgency] = useState<Agency>({
    ...agencySettings,
    logo: agencySettings.logo || '/logo.svg',
    squareLogo: agencySettings.squareLogo || '/logo-square.svg'
  });

  const [themeColors, setThemeColors] = useState({
    primary: colors.primary,
    secondary: colors.secondary
  });

  useEffect(() => {
 const fetchUsersFromAPI = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/users');
    if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
    const data = await res.json();

    const formattedUsers = data.map((user: any) => ({
      ...user,
      name: user.nom, // conversion nom → name
    }));

    updateUsers(formattedUsers);
  } catch (err) {
    console.error('Erreur chargement utilisateurs:', err);
    setError('Impossible de charger les utilisateurs depuis la base de données');
  }
};


  fetchUsersFromAPI();
}, []);

  const handleColorChange = (type: 'primary' | 'secondary', value: string) => {
    setThemeColors(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleThemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateColors(themeColors);
    setSuccess('Thème mis à jour avec succès');
  };

  const handleLogoChange = (type: 'main' | 'square', url: string) => {
    setAgency(prev => ({
      ...prev,
      [type === 'main' ? 'logo' : 'squareLogo']: url
    }));
  };

  const handleAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await updateAgencySettings(agency);
      setSuccess('Paramètres de l\'agence enregistrés avec succès');
    } catch (err) {
      setError('Une erreur est survenue lors de l\'enregistrement des paramètres');
      console.error('Erreur:', err);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  try {
    const url = editingUser
      ? `http://localhost:3000/api/auth/users/${editingUser.id}`
      : `http://localhost:3000/api/auth/register`;

    const method = editingUser ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: userForm.name, // ✅ attention : backend attend 'nom'
        email: userForm.email,
        role: userForm.role,
        avatar: userForm.avatar
      }),
    });

    if (!res.ok) {
      const raw = await res.text();
      throw new Error(`Erreur ${res.status} - ${raw}`);
    }

    const newUser = await res.json();
const formattedUser = { ...newUser, name: newUser.nom };

if (editingUser) {
  const updated = users.map((u) => (u.id === formattedUser.id ? formattedUser : u));
  updateUsers(updated);

      setSuccess('Utilisateur mis à jour avec succès');
    } else {
      updateUsers([...users, formattedUser]);

      setSuccess('Utilisateur créé avec succès');
    }

    setShowUserForm(false);
    setEditingUser(null);
    setUserForm({
      email: '',
      name: '',
      role: 'employee',
      password: '',
    });
  } catch (err: any) {
    console.error('Erreur:', err);
    setError(err.message || 'Erreur inconnue');
  }
};




  const handleEditUser = (editUser: User) => {
    setEditingUser(editUser);
    setUserForm({
      id: editUser.id,
      email: editUser.email,
      name: editUser.nom,
      role: editUser.role,
      avatar: editUser.avatar
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId: number) => {
  if (userId === user?.id) {
    setError('Vous ne pouvez pas supprimer votre propre compte');
    return;
  }

  if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/auth/users/${userId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la suppression');
    }

    const updatedUsers = users.filter((u) => u.id !== userId);
    updateUsers(updatedUsers);
    setSuccess('Utilisateur supprimé avec succès');
  } catch (err: any) {
    console.error('Erreur suppression utilisateur:', err);
    setError(err.message || 'Erreur inconnue');
  }
};


  const handleBackupRestored = (backupData: any) => {
    try {
      if (backupData.agency) {
        updateAgencySettings(backupData.agency);
      }
      updateContacts(backupData.contacts);
      updatePartners(backupData.partners);
      updateContracts(backupData.contracts);
      setSuccess('Données restaurées avec succès');
    } catch (err) {
      setError('Erreur lors de la restauration des données');
      console.error('Erreur:', err);
    }
  };

  const handleInsertTestData = async () => {
    if (!confirm('Cette action va supprimer toutes les données de test existantes et les remplacer par de nouvelles données de test. Êtes-vous sûr ?')) {
      return;
    }

    setIsInserting(true);
    setError(null);
    setSuccess(null);

    try {
      await insertTestData();
      setSuccess('Données de test insérées avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'insertion des données de test';
      setError(errorMessage);
      console.error('Erreur détaillée:', err);
    } finally {
      setIsInserting(false);
    }
  };

  if (user?.role !== 'manager') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Vous n'avez pas accès à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
        <div className="space-x-4">
          <Button
            variant="secondary"
            icon={Save}
            onClick={() => setShowBackupModal(true)}
          >
            Sauvegarde
          </Button>
          <Button
            variant="secondary"
            icon={Database}
            onClick={handleInsertTestData}
            disabled={isInserting}
          >
            {isInserting ? 'Insertion en cours...' : 'Insérer données test'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('agency')}
              className={`${
                activeTab === 'agency'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center px-6 py-4 border-b-2 font-medium text-sm`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Agence
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center px-6 py-4 border-b-2 font-medium text-sm`}
            >
              <Users className="h-5 w-5 mr-2" />
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`${
                activeTab === 'theme'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center px-6 py-4 border-b-2 font-medium text-sm`}
            >
              <Palette className="h-5 w-5 mr-2" />
              Thème
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'agency' && (
            <form onSubmit={handleAgencySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  currentImage={agency.logo}
                  onImageChange={(url) => handleLogoChange('main', url)}
                  label="Logo principal"
                  id="main-logo-upload"
                />
                <ImageUpload
                  currentImage={agency.squareLogo}
                  onImageChange={(url) => handleLogoChange('square', url)}
                  label="Logo carré (favicon)"
                  id="square-logo-upload"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom de l'agence
                </label>
                <input
                  type="text"
                  id="name"
                  value={agency.name}
                  onChange={(e) => setAgency(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={agency.address}
                  onChange={(e) => setAgency(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="siren" className="block text-sm font-medium text-gray-700">
                  SIREN
                </label>
                <input
                  type="text"
                  id="siren"
                  value={agency.siren}
                  onChange={(e) => setAgency(prev => ({ ...prev, siren: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-end mb-6">
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({
                      email: '',
                      name: '',
                      role: 'employee',
                      password: ''
                    });
                    setShowUserForm(true);
                  }}
                >
                  Ajouter un utilisateur
                </Button>
              </div>

              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'manager'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilLine className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'theme' && (
            <form onSubmit={handleThemeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Couleur principale"
                  value={themeColors.primary}
                  onChange={(value) => handleColorChange('primary', value)}
                />
                <ColorPicker
                  label="Couleur secondaire"
                  value={themeColors.secondary}
                  onChange={(value) => handleColorChange('secondary', value)}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Enregistrer le thème
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showUserForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium mb-6">
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h2>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <ImageUpload
                currentImage={userForm.avatar}
                onImageChange={(url) => setUserForm(prev => ({ ...prev, avatar: url }))}
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
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {!editingUser && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rôle
                </label>
                <select
                  id="role"
                  required
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as 'manager' | 'employee' }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="manager">Manager</option>
                  <option value="employee">Employé</option>
                </select>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onBackupCreated={() => setSuccess('Sauvegarde créée avec succès')}
        onBackupRestored={handleBackupRestored}
        data={{ contacts, partners, contracts }}
      />
    </div>
  );
};

export default Settings;