import React from 'react';
import { BarChart, Users, FileText, Wallet, TrendingUp, ChevronRight, Gift } from 'lucide-react';
import Card from '../components/Card';
import Charts from '../components/Charts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { contacts, contracts } = useData();
  const { users } = useAuth();
  
  const clientsActifs = contacts.filter(c => c.statut === 'client').length;
  const prospects = contacts.filter(c => c.statut === 'prospect').length;
  const contratsActifs = contracts.filter(c => c.statut === 'actif').length;

  // Calcul du CA mensuel (commissions + frais de dossier)
  const caMensuel = contracts
    .filter(c => c.statut === 'actif')
    .reduce((sum, contract) => {
      const dateDebut = new Date(contract.dateDebut);
      const maintenant = new Date();
      const anneesEcoulees = maintenant.getFullYear() - dateDebut.getFullYear();
      
      // Déterminer le taux de commission applicable
      const tauxCommission = anneesEcoulees === 0 
        ? contract.commissionPremiereAnnee 
        : contract.commissionAnneesSuivantes;
      
      // Calculer la commission mensuelle
      const commissionMensuelle = (contract.montantAnnuel * (tauxCommission / 100)) / 12;
      
      // Calculer les frais de dossier mensuels
      const fraisDossierMensuels = contract.fraisDossierRecurrent 
        ? contract.fraisDossier / 12 
        : contract.fraisDossier / (12 * Math.max(1, anneesEcoulees));
      
      return sum + commissionMensuelle + fraisDossierMensuels;
    }, 0);

  // Récupérer les anniversaires à venir (10 jours)
  const getUpcomingBirthdays = () => {
    const now = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    const upcomingBirthdays = [];

    // Anniversaires des clients
    contacts.forEach(contact => {
      if (contact.dateNaissance) {
        const birthDate = new Date(contact.dateNaissance);
        const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        if (nextBirthday < now) {
          nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }

        if (nextBirthday >= now && nextBirthday <= tenDaysFromNow) {
          upcomingBirthdays.push({
            type: 'client',
            name: `${contact.prenom} ${contact.nom}`,
            date: nextBirthday,
            age: nextBirthday.getFullYear() - birthDate.getFullYear(),
            id: contact.id
          });
        }
      }
    });

    // Anniversaires des utilisateurs
    users.forEach(user => {
      if (user.dateNaissance) {
        const birthDate = new Date(user.dateNaissance);
        const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        if (nextBirthday < now) {
          nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }

        if (nextBirthday >= now && nextBirthday <= tenDaysFromNow) {
          upcomingBirthdays.push({
            type: 'user',
            name: user.name,
            date: nextBirthday,
            age: nextBirthday.getFullYear() - birthDate.getFullYear(),
            id: user.id
          });
        }
      }
    });

    return upcomingBirthdays.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  const stats = [
    { 
      title: 'Clients actifs',
      value: clientsActifs.toString(),
      icon: Users,
      trend: { value: '+5%', isPositive: true }
    },
    { 
      title: 'Contrats actifs',
      value: contratsActifs.toString(),
      icon: FileText,
      trend: { value: '+12%', isPositive: true }
    },
    { 
      title: 'CA Mensuel',
      value: `${Math.round(caMensuel).toLocaleString('fr-FR')} €`,
      icon: Wallet,
      trend: { value: '+8.2%', isPositive: true }
    },
    { 
      title: 'Prospects',
      value: prospects.toString(),
      icon: TrendingUp,
      trend: { value: '+2.3%', isPositive: true }
    },
  ];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate top clients based on contract revenue
  const topClients = React.useMemo(() => {
    return contacts
      .filter(contact => contact.statut === 'client')
      .map(contact => {
        const clientContracts = contracts.filter(contract => 
          contract.contactId === contact.id && contract.statut === 'actif'
        );
        const revenue = clientContracts.reduce((total, contract) => {
          const dateDebut = new Date(contract.dateDebut);
          const maintenant = new Date();
          const anneesEcoulees = maintenant.getFullYear() - dateDebut.getFullYear();
          const tauxCommission = anneesEcoulees === 0 
            ? contract.commissionPremiereAnnee 
            : contract.commissionAnneesSuivantes;
          return total + (contract.montantAnnuel * (tauxCommission / 100));
        }, 0);
        return {
          id: contact.id,
          nom: `${contact.prenom} ${contact.nom}`,
          entreprise: contact.entreprise,
          photoUrl: contact.photoUrl,
          revenue,
          nbContrats: clientContracts.length
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [contacts, contracts]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-sm text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {upcomingBirthdays.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-indigo-50 p-2.5 rounded-xl">
              <Gift className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">
              Prochains anniversaires
            </h3>
          </div>
          <div className="space-y-3">
            {upcomingBirthdays.map((birthday, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${birthday.type === 'client' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{birthday.name}</p>
                    <p className="text-xs text-gray-500">
                      {birthday.type === 'client' ? 'Client' : 'Membre de l\'équipe'} • {birthday.age} ans
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {birthday.date.toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.ceil((birthday.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      <Charts contacts={contacts} contracts={contracts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Derniers contrats</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.slice(0, 5).map((contract) => {
                  const commission = contract.commissionPremiereAnnee;
                  const montantCommission = contract.montantAnnuel * (commission / 100);
                  
                  return (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contract.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {contract.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {montantCommission.toLocaleString('fr-FR')} €/an
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(contract.dateDebut).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top 10 clients</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {topClients.map((client, index) => (
              <Link
                key={client.id}
                to={`/contacts?id=${client.id}`}
                className="block hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={client.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.nom)}`}
                        alt={client.nom}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.nom}</p>
                      {client.entreprise && (
                        <p className="text-sm text-gray-500">{client.entreprise}</p>
                      )}
                      <p className="text-xs text-gray-500">{client.nbContrats} contrat{client.nbContrats > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatMoney(client.revenue)}</p>
                      <p className="text-xs text-gray-500">par an</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;