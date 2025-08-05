import React from 'react';
import { Building2, Users, TrendingUp } from 'lucide-react';
import Card from '../../components/Card';
import { useAgency } from '../../context/AgencyContext';
import { useAuth } from '../../context/AuthContext';

const SuperAdminDashboard = () => {
  const { agencies } = useAgency();
  const { users } = useAuth();

  const activeAgencies = agencies.filter(a => a.status === 'active').length;
  const totalManagers = users.filter(u => u.role === 'manager').length;
  const totalEmployees = users.filter(u => u.role === 'employee').length;

  const stats = [
    {
      title: 'Agences actives',
      value: activeAgencies.toString(),
      icon: Building2,
      trend: { value: `${agencies.length} au total`, isPositive: true }
    },
    {
      title: 'Managers',
      value: totalManagers.toString(),
      icon: Users,
      trend: { value: 'Directeurs d\'agence', isPositive: true }
    },
    {
      title: 'Employés',
      value: totalEmployees.toString(),
      icon: TrendingUp,
      trend: { value: 'Conseillers', isPositive: true }
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Administration Générale</h1>
        <p className="mt-2 text-sm text-gray-600">Vue d'ensemble du réseau d'agences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Dernières agences créées</h2>
          <div className="space-y-4">
            {agencies.slice(0, 5).map((agency) => (
              <div key={agency.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={agency.logo}
                    alt={agency.name}
                    className="h-10 w-10 rounded-lg object-contain"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{agency.name}</p>
                    <p className="text-sm text-gray-500">{agency.address}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  agency.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {agency.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Derniers managers</h2>
          <div className="space-y-4">
            {users
              .filter(user => user.role === 'manager')
              .slice(0, 5)
              .map((manager) => (
                <div key={manager.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={manager.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}`}
                      alt={manager.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{manager.name}</p>
                      <p className="text-sm text-gray-500">{manager.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    Manager
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;