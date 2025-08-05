import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import Button from '../components/Button';
import { Plus } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import ContactDetails from '../components/ContactDetails';
import ContactList from '../components/ContactList';
import { useSort } from '../hooks/useSort';
import type { Contact } from '../types/data';
import { useLocation, useNavigate } from 'react-router-dom';
import ContactsContainer from '../components/ContactsContainer';

interface ContactsProps {
  initialFilter?: 'client' | 'prospect';
}

const Contacts: React.FC<ContactsProps> = ({ initialFilter }) => {
  const { contacts, editContact, deleteContact, addContact, updateContactTypes } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    statut: initialFilter || ''
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    updateContactTypes();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const contactId = searchParams.get('id');
    const commentId = searchParams.get('commentId');

    if (contactId) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
        setShowDetails(true);

        if (commentId) {
          setTimeout(() => {
            const commentElement = document.getElementById(`comment-${commentId}`);
            if (commentElement) {
              commentElement.scrollIntoView({ behavior: 'smooth' });
              commentElement.classList.add('bg-yellow-50');
              setTimeout(() => {
                commentElement.classList.remove('bg-yellow-50');
              }, 2000);
            }
          }, 100);
        }
      }
    }
  }, [location.search, contacts]);

  const getContactTypeForFilter = (contact: Contact) => {
    if (!contact.types) return '';
    if (contact.types.particulier && contact.types.professionnel) {
      return 'mixte';
    }
    if (contact.types.professionnel) {
      return 'professionnel';
    }
    if (contact.types.particulier) {
      return 'particulier';
    }
    return '';
  };

  const hasUnreadComments = (contact: Contact) => {
    if (!user?.readNotifications) return contact.commentaires.length > 0;
    if (!user.readNotifications[contact.id]) return contact.commentaires.length > 0;
    
    return contact.commentaires.some(
      comment => !user.readNotifications[contact.id]?.includes(comment.id)
    );
  };

  const getUnreadCount = (contact: Contact) => {
    if (!user?.readNotifications) return contact.commentaires.length;
    if (!user.readNotifications[contact.id]) return contact.commentaires.length;
    
    return contact.commentaires.filter(
      comment => !user.readNotifications[contact.id]?.includes(comment.id)
    ).length;
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = (
      `${contact.prenom} ${contact.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesType = !filters.type || getContactTypeForFilter(contact) === filters.type;
    const matchesStatut = !filters.statut || contact.statut === filters.statut;

    return matchesSearch && matchesType && matchesStatut;
  });

  const { items: sortedContacts, sortConfig, requestSort } = useSort(
    filteredContacts,
    { key: 'dateCreation', direction: 'desc' }
  );

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setShowForm(true);
  };

  const handleDelete = (contactId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      deleteContact(contactId);
    }
  };

  const handleSubmit = (contactData: Omit<Contact, 'id' | 'dateCreation' | 'historique' | 'commentaires'>) => {
    if (selectedContact) {
      editContact({
        ...selectedContact,
        ...contactData
      });
    } else {
      addContact(contactData);
    }
    setShowForm(false);
    setSelectedContact(null);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedContact(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    url.searchParams.delete('commentId');
    window.history.replaceState({}, '', url.pathname);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {initialFilter === 'client' ? 'Clients' : 
           initialFilter === 'prospect' ? 'Prospects' : 
           'Contacts'}
        </h1>
        <Button 
          variant="primary" 
          icon={Plus}
          onClick={() => {
            setSelectedContact(null);
            setShowForm(true);
          }}
        >
          Nouveau {initialFilter === 'client' ? 'client' : 
                   initialFilter === 'prospect' ? 'prospect' : 
                   'contact'}
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Rechercher un ${
                initialFilter === 'client' ? 'client' : 
                initialFilter === 'prospect' ? 'prospect' : 
                'contact'
              }...`}
            />
            <FilterBar
              filters={[
                {
                  name: 'type',
                  label: 'Type',
                  options: [
                    { value: 'particulier', label: 'Particulier' },
                    { value: 'professionnel', label: 'Professionnel' },
                    { value: 'mixte', label: 'Mixte (Pro & Part)' }
                  ],
                  value: filters.type
                },
                ...(!initialFilter ? [{
                  name: 'statut',
                  label: 'Statut',
                  options: [
                    { value: 'prospect', label: 'Prospect' },
                    { value: 'client', label: 'Client' }
                  ],
                  value: filters.statut
                }] : [])
              ]}
              onChange={(name, value) => setFilters(prev => ({ ...prev, [name]: value }))}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <ContactList
            contacts={sortedContacts}
            sortConfig={sortConfig}
            requestSort={requestSort}
            selectedContact={selectedContact}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={(contact) => {
              setSelectedContact(contact);
              setShowDetails(true);
            }}
            showStatusColumn={!initialFilter}
            getUnreadCount={getUnreadCount}
            hasUnreadComments={hasUnreadComments}
          />
        </div>
      </div>

      {showForm && (
        <ContactForm
          contact={selectedContact}
          onClose={() => {
            setShowForm(false);
            setSelectedContact(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {showDetails && selectedContact && (
        <ContactDetails
          contact={selectedContact}
          onClose={handleCloseDetails}
          onSubmit={editContact}
        />
      )}
    </div>
  );
};

export default Contacts;