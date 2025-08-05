import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agency, AgencyData } from '../types/agency';
import { User } from '../types/auth';

interface AgencyContextType {
  agencies: Agency[];
  currentAgency: Agency | null;
  addAgency: (agency: Omit<Agency, 'id' | 'createdAt'>) => Promise<void>;
  updateAgency: (agency: Agency) => Promise<void>;
  deleteAgency: (id: string) => Promise<void>;
  switchAgency: (id: string) => Promise<void>;
  getAgencyData: (id: string) => Promise<AgencyData>;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agencies, setAgencies] = useState<Agency[]>(() => {
    const saved = localStorage.getItem('agencies');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentAgency, setCurrentAgency] = useState<Agency | null>(() => {
    const saved = localStorage.getItem('currentAgency');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('agencies', JSON.stringify(agencies));
  }, [agencies]);

  useEffect(() => {
    if (currentAgency) {
      localStorage.setItem('currentAgency', JSON.stringify(currentAgency));
    } else {
      localStorage.removeItem('currentAgency');
    }
  }, [currentAgency]);

  const addAgency = async (agencyData: Omit<Agency, 'id' | 'createdAt'>): Promise<void> => {
    const newAgency: Agency = {
      ...agencyData,
      id: `agency-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    };

    setAgencies(prev => [...prev, newAgency]);

    // Créer l'espace de stockage pour la nouvelle agence
    localStorage.setItem(`agency_${newAgency.id}_contacts`, '[]');
    localStorage.setItem(`agency_${newAgency.id}_partners`, '[]');
    localStorage.setItem(`agency_${newAgency.id}_contracts`, '[]');
    localStorage.setItem(`agency_${newAgency.id}_users`, '[]');
    localStorage.setItem(`agency_${newAgency.id}_settings`, JSON.stringify(newAgency));
  };

  const updateAgency = async (agency: Agency): Promise<void> => {
    setAgencies(prev => prev.map(a => a.id === agency.id ? agency : a));
    
    if (currentAgency?.id === agency.id) {
      setCurrentAgency(agency);
    }

    localStorage.setItem(`agency_${agency.id}_settings`, JSON.stringify(agency));
  };

  const deleteAgency = async (id: string): Promise<void> => {
    setAgencies(prev => prev.filter(a => a.id !== id));
    
    if (currentAgency?.id === id) {
      setCurrentAgency(null);
    }

    // Supprimer toutes les données de l'agence
    localStorage.removeItem(`agency_${id}_contacts`);
    localStorage.removeItem(`agency_${id}_partners`);
    localStorage.removeItem(`agency_${id}_contracts`);
    localStorage.removeItem(`agency_${id}_users`);
    localStorage.removeItem(`agency_${id}_settings`);
  };

  const switchAgency = async (id: string): Promise<void> => {
    const agency = agencies.find(a => a.id === id);
    if (agency) {
      setCurrentAgency(agency);
    }
  };

  const getAgencyData = async (id: string): Promise<AgencyData> => {
    const contacts = JSON.parse(localStorage.getItem(`agency_${id}_contacts`) || '[]');
    const partners = JSON.parse(localStorage.getItem(`agency_${id}_partners`) || '[]');
    const contracts = JSON.parse(localStorage.getItem(`agency_${id}_contracts`) || '[]');
    const users = JSON.parse(localStorage.getItem(`agency_${id}_users`) || '[]');
    const settings = JSON.parse(localStorage.getItem(`agency_${id}_settings`) || 'null');

    return { contacts, partners, contracts, users, settings };
  };

  const value = {
    agencies,
    currentAgency,
    addAgency,
    updateAgency,
    deleteAgency,
    switchAgency,
    getAgencyData
  };

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
};

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (context === undefined) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};