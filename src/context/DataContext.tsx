import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contact, Partner, Contract } from '../types/data';
import { createClient } from '@supabase/supabase-js';

// Initialise le client Supabase pour la subscription realtime
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface DataContextType {
  contacts: Contact[];
  partners: Partner[];
  contracts: Contract[];
  updateContactTypes: () => void;
  addContact: (contact: Partial<Contact>) => Promise<void>;
  editContact: (contact: Contact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  refetchContacts: () => Promise<void>;
  addContract: (contract: Omit<Contract, 'id'>) => Promise<void>;
  editContract: (contract: Contract) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  refetchContracts: () => Promise<void>;
  addPartner: (partner: Omit<Partner, 'id'>) => Promise<void>;
  editPartner: (partner: Partner) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  refetchPartners: () => Promise<void>;
  /** Calcule localement le prochain ID en se basant sur les contacts existants */
  getNextContactId: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  // Helper pour calculer le prochain ID local d'après les contacts chargés
  const getNextContactId = () => {
    if (contacts.length === 0) return 1;
    return Math.max(...contacts.map(c => c.id)) + 1;
  };

  // Fetchers
  const refetchContacts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/contacts');
      const data: Contact[] = await res.json();
      setContacts(data);
    } catch (err) {
      console.error('Erreur chargement contacts :', err);
    }
  };

  const refetchPartners = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/partenaires');
      const data: Partner[] = await res.json();
      setPartners(data);
    } catch (err) {
      console.error('Erreur chargement partenaires :', err);
    }
  };

  const refetchContracts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/contrats');
      const data: Contract[] = await res.json();
      setContracts(data);
    } catch (err) {
      console.error('Erreur chargement contrats :', err);
    }
  };

  // Subscription Realtime + fetch initial
  useEffect(() => {
    refetchContacts();
    refetchPartners();
    refetchContracts();

    const channel = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        refetchContacts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

    // CRUD Contacts
  const addContact = async (contactData: Partial<Contact>) => {
  // Ajoute directement le contact reçu (depuis ContactForm) au state local
  setContacts(prev => [contactData as Contact, ...prev]);
  };


  const editContact = async (contact: Contact) => {
    try {
      const res = await fetch(`http://localhost:3000/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await refetchContacts();
    } catch (err) {
      console.error('Erreur modification contact :', err);
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur suppression contact :', err);
    }
  };

  // CRUD Contrats
  const addContract = async (contract: Omit<Contract, 'id'>) => {
    try {
      const res = await fetch('http://localhost:3000/api/contrats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contract)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await refetchContracts();
    } catch (err) {
      console.error('Erreur ajout contrat :', err);
    }
  };

  const editContract = async (contract: Contract) => {
    try {
      const res = await fetch(`http://localhost:3000/api/contrats/${contract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contract)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await refetchContracts();
    } catch (err) {
      console.error('Erreur modification contrat :', err);
    }
  };

  const deleteContract = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/contrats/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message);
      await refetchContracts();
    } catch (err) {
      console.error('Erreur suppression contrat :', err);
    }
  };

  // CRUD Partenaires
  const addPartner = async (partner: Omit<Partner, 'id'>) => {
    try {
      const res = await fetch('http://localhost:3000/api/partenaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partner)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await refetchPartners();
    } catch (err) {
      console.error('Erreur ajout partenaire :', err);
    }
  };

  const editPartner = async (partner: Partner) => {
    try {
      const res = await fetch(`http://localhost:3000/api/partenaires/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partner)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await refetchPartners();
    } catch (err) {
      console.error('Erreur modification partenaire :', err);
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/partenaires/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message);
      await refetchPartners();
    } catch (err) {
      console.error('Erreur suppression partenaire :', err);
    }
  };

  const updateContactTypes = () => {
    setContacts(prev =>
      prev.map(contact => {
        const contactContracts = contracts.filter(c => c.clientId === contact.id);
        const hasPart = contactContracts.some(c => c.categorie === 'particulier');
        const hasPro = contactContracts.some(c => c.categorie === 'professionnel');
        const isPro = Boolean(contact.entreprise || contact.siret);
        return {
          ...contact,
          types: {
            particulier: hasPart || (!isPro && !hasPro),
            professionnel: hasPro || isPro
          }
        };
      })
    );
  };

  const value: DataContextType = {
    contacts,
    partners,
    contracts,
    updateContactTypes,
    addContact,
    editContact,
    deleteContact,
    refetchContacts,
    addContract,
    editContract,
    deleteContract,
    refetchContracts,
    addPartner,
    editPartner,
    deletePartner,
    refetchPartners,
    getNextContactId
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
