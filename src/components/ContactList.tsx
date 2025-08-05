import React from 'react';
import { PencilLine, Trash2 } from 'lucide-react';
import type { Contact } from '../types/data';
import type { SortConfig } from '../hooks/useSort';
import SortableHeader from './SortableHeader';
import ContactForm from './ContactForm';
import ContactDetails from './ContactDetails';

interface ContactListProps {
  contacts: Contact[];
  sortConfig: SortConfig;
  requestSort: (key: string) => void;
  selectedContact: Contact | null;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onSelect: (contact: Contact) => void;
  showStatusColumn?: boolean;
  getUnreadCount: (contact: Contact) => number;
  hasUnreadComments: (contact: Contact) => boolean;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  sortConfig,
  requestSort,
  selectedContact,
  onEdit,
  onDelete,
  onSelect,
  showStatusColumn = true,
  getUnreadCount,
  hasUnreadComments
}) => {
  const [showEditForm, setShowEditForm] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const [contactToEdit, setContactToEdit] = React.useState<Contact | null>(null);

  // Garantit que contact.commentaires est toujours défini
  const contactsWithComments = contacts.map(contact => ({
    ...contact,
    commentaires: contact.commentaires ?? []
  }));

  const handleEditClick = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setContactToEdit(contact);
    setShowDetails(true);
    onSelect(contact);
  };

  const handleEditSubmit = (updatedContact: Contact) => {
    onEdit(updatedContact);
    setShowDetails(false);
    setContactToEdit(null);
  };

  const handleRowClick = (contact: Contact) => {
    setContactToEdit(contact);
    setShowDetails(true);
    onSelect(contact);
  };

  const getContactTypeDisplay = (contact: Contact) => {
    const types = contact.types;

    if (!types) return 'Non défini';

    if (types.particulier && types.professionnel) {
      return (
        <div className="space-y-1">
          <div>Mixte (Pro & Part)</div>
          {types.professionalType && (
            <div className="text-xs text-gray-500">
              Pro ({types.professionalType})
            </div>
          )}
        </div>
      );
    }

    if (types.professionnel) {
      return (
        <div className="space-y-1">
          <div>Pro ({types.professionalType || 'TNS'})</div>
        </div>
      );
    }

    if (types.particulier) {
      return 'Particulier';
    }

    return 'Non défini';
  };

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left">
              <SortableHeader
                label="Contact"
                sortKey="nom"
                currentSort={sortConfig}
                onSort={requestSort}
              />
            </th>
            <th className="px-6 py-3 text-left">
              <SortableHeader
                label="Email"
                sortKey="email"
                currentSort={sortConfig}
                onSort={requestSort}
              />
            </th>
            <th className="px-6 py-3 text-left">
              <SortableHeader
                label="Téléphone"
                sortKey="telephone"
                currentSort={sortConfig}
                onSort={requestSort}
              />
            </th>
            <th className="px-6 py-3 text-left">
              <SortableHeader
                label="Type"
                sortKey="type"
                currentSort={sortConfig}
                onSort={requestSort}
              />
            </th>
            {showStatusColumn && (
              <th className="px-6 py-3 text-left">
                <SortableHeader
                  label="Statut"
                  sortKey="statut"
                  currentSort={sortConfig}
                  onSort={requestSort}
                />
              </th>
            )}
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {contactsWithComments.map((contact) => (
            <tr
              key={contact.id}
              className={`hover:bg-gray-50 cursor-pointer ${selectedContact?.id === contact.id ? 'bg-indigo-50' : ''}`}
              onClick={() => handleRowClick(contact)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 relative">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={contact.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.prenom + ' ' + contact.nom)}`}
                      alt={`${contact.prenom} ${contact.nom}`}
                    />
                    {hasUnreadComments(contact) && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                        {getUnreadCount(contact)}
                      </span>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.prenom} {contact.nom}
                    </div>
                    {contact.types?.professionnel && contact.entreprise && (
                      <div className="text-sm text-gray-500">
                        {contact.entreprise}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.telephone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getContactTypeDisplay(contact)}</td>
              {showStatusColumn && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    contact.statut === 'client' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contact.statut}
                  </span>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={(e) => handleEditClick(contact, e)}
                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors duration-200"
                >
                  <PencilLine className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(contact.id); }}
                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showEditForm && contactToEdit && (
        <ContactForm
          contact={contactToEdit}
          onClose={() => { setShowEditForm(false); setContactToEdit(null); }}
          onSubmit={handleEditSubmit}
        />
      )}

      {showDetails && contactToEdit && (
        <ContactDetails
          contact={contactToEdit}
          onClose={() => { setShowDetails(false); setContactToEdit(null); }}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
};

export default ContactList;
