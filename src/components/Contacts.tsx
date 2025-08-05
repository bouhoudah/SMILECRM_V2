import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Button from '../components/Button';
import { Plus, Bell } from 'lucide-react';
import ContactList from '../components/ContactList';
import { useSort } from '../hooks/useSort';
import type { Contact } from '../types/data';
import { useLocation, useNavigate } from 'react-router-dom';

interface ContactsProps {
  initialFilter?: 'client' | 'prospect';
}

const Contacts: React.FC<ContactsProps> = ({ initialFilter }) => {
  const { contacts, editContact, deleteContact, addContact, updateContactTypes } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ type: '', statut: initialFilter || '' });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    updateContactTypes();
  }, [contacts]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contactId = params.get('id');
    const commentId = params.get('commentId');

    if (contactId) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
        setShowDetails(true);
        if (commentId) {
          setTimeout(() => {
            const el = document.getElementById(`comment-${commentId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              el.classList.add('bg-yellow-50');
              setTimeout(() => el.classList.remove('bg-yellow-50'), 2000);
            }
          }, 100);
        }
      }
    }
  }, [location.search, contacts]);

  // Protège contre commentaires undefined
  const hasUnreadComments = (contact: Contact) => {
    const commentaires = contact.commentaires ?? [];
    const readMap = user?.readNotifications || {};
    const readList = readMap[contact.id] || [];
    return commentaires.some(comment => !readList.includes(comment.id));
  };

  const getUnreadCount = (contact: Contact) => {
    const commentaires = contact.commentaires ?? [];
    const readList = user?.readNotifications?.[contact.id] || [];
    return commentaires.filter(comment => !readList.includes(comment.id)).length;
  };

  const filtered = contacts.filter(contact => {
    const matchesSearch = (`${contact.prenom} ${contact.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !filters.type || (() => {
      if (!contact.types) return false;
      const { particulier, professionnel } = contact.types;
      if (filters.type === 'mixte') return particulier && professionnel;
      return filters.type === 'professionnel' ? professionnel : particulier;
    })();
    const matchesStatut = !filters.statut || contact.statut === filters.statut;
    return matchesSearch && matchesType && matchesStatut;
  });

  const { items: sortedContacts, sortConfig, requestSort } = useSort(filtered, { key: 'dateCreation', direction: 'desc' });

  const handleSubmit = (savedContact: Contact) => {
    // 🔒 Vérifie si on a déjà ce contact dans le state (évite doublon)
    setSelectedContact(null);
    setShowForm(false);

    // Si le contact existait, on le met à jour
    const exists = contacts.some(c => c.id === savedContact.id);
    if (exists) {
      editContact(savedContact);
    } else {
      addContact(savedContact);
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {initialFilter === 'client' ? 'Clients' : initialFilter === 'prospect' ? 'Prospects' : 'Contacts'}
        </h1>
        <Button variant="primary" icon={Plus} onClick={() => { setSelectedContact(null); setShowForm(true); }}>
          Nouveau {initialFilter || 'contact'}
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between gap-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Rechercher un contact..." />
          <FilterBar
            filters={[
              { name: 'type', label: 'Type', options: [
                { value: 'particulier', label: 'Particulier' },
                { value: 'professionnel', label: 'Professionnel' },
                { value: 'mixte', label: 'Mixte' }
              ], value: filters.type },
              ...(!initialFilter ? [{ name: 'statut', label: 'Statut', options: [
                { value: 'prospect', label: 'Prospect' },
                { value: 'client', label: 'Client' }
              ], value: filters.statut }] : [])
            ]}
            onChange={(name, value) => setFilters(prev => ({ ...prev, [name]: value }))}
          />
        </div>

        <ContactList
          contacts={sortedContacts}
          sortConfig={sortConfig}
          requestSort={requestSort}
          selectedContact={selectedContact}
          onEdit={c => { setSelectedContact(c); setShowForm(true); }}
          onDelete={id => { if (confirm('Supprimer ?')) deleteContact(id); }}
          onSelect={c => { setSelectedContact(c); setShowDetails(true); }}
          showStatusColumn={!initialFilter}
          getUnreadCount={getUnreadCount}
          hasUnreadComments={hasUnreadComments}
        />
      </div>

      {showForm && (
        <ContactForm contact={selectedContact} onClose={() => setShowForm(false)} onSubmit={handleSubmit} />
      )}
      {showDetails && selectedContact && (
        <ContactDetails contact={selectedContact} onClose={() => setShowDetails(false)} onSubmit={editContact} />
      )}
    </div>
  );
};

export default Contacts;
