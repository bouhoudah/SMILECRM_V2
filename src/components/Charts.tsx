import React from 'react';
import {
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
  LineChart,
  Line
} from 'recharts';
import { Contact, Contract } from '../types/data';

interface ChartsProps {
  contacts: Contact[];
  contracts: Contract[];
}

const COLORS = ['#4F46E5', '#EC4899', '#F59E0B', '#10B981'];
const CHART_COLORS = {
  primary: '#4F46E5',
  secondary: '#EC4899',
  gradient: {
    start: '#4F46E580',
    end: '#4F46E500'
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold mt-1" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' 
              ? entry.value.toLocaleString('fr-FR')
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ContactTypePieChart: React.FC<{ contacts: Contact[] }> = ({ contacts }) => {
  const data = [
    {
      name: 'Particuliers',
      value: contacts.filter(c => c.types?.particulier && !c.types?.professionnel).length,
      color: COLORS[0]
    },
    {
      name: 'Professionnels',
      value: contacts.filter(c => !c.types?.particulier && c.types?.professionnel).length,
      color: COLORS[1]
    },
    {
      name: 'Mixte',
      value: contacts.filter(c => c.types?.particulier && c.types?.professionnel).length,
      color: COLORS[2]
    }
  ].filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-[300px] flex items-center justify-center relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl font-bold text-gray-900">{total}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">Total Contacts</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
          >
            {data.map((entry) => (
              <Cell 
                key={`cell-${entry.name}`} 
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-xs font-medium text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const RevenueChart: React.FC<{ contracts: Contract[] }> = ({ contracts }) => {
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    
    const monthlyRevenue = contracts
      .filter(contract => {
        const contractDate = new Date(contract.dateDebut);
        return contractDate.getMonth() === month.getMonth() &&
               contractDate.getFullYear() === month.getFullYear() &&
               contract.statut === 'actif';
      })
      .reduce((sum, contract) => {
        const dateDebut = new Date(contract.dateDebut);
        const maintenant = new Date();
        const anneesEcoulees = maintenant.getFullYear() - dateDebut.getFullYear();
        
        // Commission mensuelle
        const tauxCommission = anneesEcoulees === 0 
          ? contract.commissionPremiereAnnee 
          : contract.commissionAnneesSuivantes;
        const commissionMensuelle = (contract.montantAnnuel * (tauxCommission / 100)) / 12;
        
        // Frais de dossier mensuels
        const fraisDossierMensuels = contract.fraisDossierRecurrent 
          ? contract.fraisDossier / 12 
          : contract.fraisDossier / (12 * Math.max(1, anneesEcoulees));
        
        return sum + commissionMensuelle + fraisDossierMensuels;
      }, 0);

    return {
      month: month.toLocaleDateString('fr-FR', { month: 'short' }),
      revenue: Math.round(monthlyRevenue)
    };
  });

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlyData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.gradient.start}/>
              <stop offset="95%" stopColor={CHART_COLORS.gradient.end}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="CA Réalisé"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            unit="€"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const ContractsEvolutionChart: React.FC<{ contracts: Contract[] }> = ({ contracts }) => {
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    month.setDate(1); // Premier jour du mois
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0); // Dernier jour du mois
    
    // Filtrer les contrats actifs pour ce mois
    const activeContracts = contracts.filter(contract => {
      const contractStart = new Date(contract.dateDebut);
      const contractEnd = new Date(contract.dateFin);
      
      // Un contrat est considéré actif pour le mois si :
      // 1. Son statut est 'actif'
      // 2. Sa date de début est avant ou pendant le mois
      // 3. Sa date de fin est après ou pendant le mois
      return contract.statut === 'actif' && 
             contractStart <= monthEnd && 
             contractEnd >= month;
    });

    // Compter les contrats par catégorie
    const contractsByCategory = activeContracts.reduce((acc, contract) => {
      if (contract.categorie === 'professionnel') {
        acc.professionnel++;
      } else if (contract.categorie === 'particulier') {
        acc.particulier++;
      }
      return acc;
    }, { professionnel: 0, particulier: 0 });

    return {
      month: month.toLocaleDateString('fr-FR', { month: 'short' }, { month: 'short' }),
      particulier: contractsByCategory.particulier,
      professionnel: contractsByCategory.professionnel
    };
  });

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={monthlyData}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-xs font-medium text-gray-600">
                {value === 'professionnel' ? 'Contrats Pro' : 'Contrats Particuliers'}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="professionnel"
            name="professionnel"
            stroke={COLORS[1]}
            strokeWidth={2}
            dot={false}
            unit=" contrats"
          />
          <Line
            type="monotone"
            dataKey="particulier"
            name="particulier"
            stroke={COLORS[0]}
            strokeWidth={2}
            dot={false}
            unit=" contrats"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Charts: React.FC<ChartsProps> = ({ contacts, contracts }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                Répartition des contacts
              </h3>
              <p className="text-sm text-gray-500 mt-1">Vue d'ensemble des types de contacts</p>
            </div>
          </div>
          <ContactTypePieChart contacts={contacts} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                Évolution du CA
              </h3>
              <p className="text-sm text-gray-500 mt-1">Commissions et frais de dossier</p>
            </div>
          </div>
          <RevenueChart contracts={contracts} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Évolution des contrats actifs
            </h3>
            <p className="text-sm text-gray-500 mt-1">Par catégorie de contrat</p>
          </div>
        </div>
        <ContractsEvolutionChart contracts={contracts} />
      </div>
    </div>
  );
};

export default Charts;