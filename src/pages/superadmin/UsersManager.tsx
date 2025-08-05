import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAgency } from '../../context/AgencyContext';
import { Trash2, PencilLine, Plus } from 'lucide-react';
import Button from '../../components/Button';
import UserForm from '../../components/UserForm';
import type { User } from '../../types/auth';

const UsersManager = () => {
  const { users, updateUsers } = useAuth();
  const { agencies } = useAgency();
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUserSubmit = (userData: User) => {
    try {
      const updatedUsers = [...users];
      const existingUserIndex = updatedUsers.findIndex(u => u.id === userData.id);

      if (existingUserIndex !== -1) {
        updatedUsers[existingUserIndex] = userData;
      } else {
        updatedUsers.push(userData);
      }

      updateUsers(updatedUsers);
      setShowUserForm(false);
      setSelectedUser(null);
      setSuccess('Utilisateur enregistré avec succès');
    } catch (err) {
      setError('Erreur lors de l\'enregistrement de l\'utilisateur');
    }
  };

  const handleUserDelete = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const updatedUsers = users.filter(u => u.id !== userId);
        updateUsers(updatedUsers);
        setSuccess('Utilisateur supprimé avec succès');
      } catch (err) {
        setError('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="mt-2 text-sm text-gray-600">Gérez les managers et employés</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowUserForm(true)}
        >
          Nouvel utilisateur
        </Button>
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
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agence
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users
                  .filter(user => user.role !== 'superadmin')
                  .map((user) => {
                    const userAgency = agencies.find(a => a.id === user.agencyId);
                    return (
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
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'manager'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'manager' ? 'Manager' : 'Employé'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userAgency?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <PencilLine className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleUserDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(showUserForm || selectedUser) && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowUserForm(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUserSubmit}
          agencies={agencies}
        />
      )}
    </div>
  );
};

export default UsersManager;