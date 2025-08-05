  import React, { useState, useCallback, useRef, useEffect } from 'react';
  import { X, User, FileText, Check, PencilLine, Plus, Key, MessageSquare, Upload } from 'lucide-react';
  import { Contact, Contract, CommentaireContact } from '../types/data';
  import { useAuth } from '../context/AuthContext';
  import { useData } from '../context/DataContext';
  import Button from './Button';
  import ImageUpload from './ImageUpload';
  import CommentForm from './CommentForm';
  import CommentItem from './CommentItem';
  import ContractCard from './ContractCard';
  import ContractDetails from './ContractDetails';
  import ContractForm from './ContractForm';
  import ClientAccessForm from './ClientAccessForm';
  import ClientAccessButton from './ClientAccessButton';
  import DocumentUpload from './DocumentUpload';
  import DocumentList from './DocumentList';
  

  interface ContactDetailsProps {
    contact: Contact;
    onClose: () => void;
    onSubmit?: (contact: Contact) => void;
  }

  type TabType = 'profile' | 'contracts' | 'documents' | 'comments' | 'access';

  const ContactDetails: React.FC<ContactDetailsProps> = ({ 
    contact: initialContact, 
    onClose, 
    onSubmit 
  }) => {
    const calculateAge = (dateOfBirth: string): number => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const month = today.getMonth() - birthDate.getMonth();
      if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const modalRef = useRef<HTMLDivElement>(null);
    const [contact, setContact] = useState<Contact>(initialContact);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [showClientAccessForm, setShowClientAccessForm] = useState(false);
    const [showCommentForm, setShowCommentForm] = useState(true);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [showContractDetails, setShowContractDetails] = useState(false);
    const [showContractForm, setShowContractForm] = useState(false);
    const [showNewContractForm, setShowNewContractForm] = useState(false);
    const [documents, setDocuments] = useState([]);

    const [editForm, setEditForm] = useState({
      nom: contact.nom,
      prenom: contact.prenom,
      email: contact.email,
      telephone: contact.telephone,
      dateNaissance: contact.dateNaissance
        ? new Date(contact.dateNaissance).toISOString().split('T')[0]
        : '',
      types: {
        particulier: contact.types?.particulier || false,
        professionnel: contact.types?.professionnel || false,
        professionalType: contact.types?.professionalType || 'TNS',
        role: contact.types?.role || ''
      },
      entreprise: contact.entreprise || '',
      siret: contact.siret || '',
      photoUrl: contact.photoUrl || ''
    });

    const [newComment, setNewComment] = useState('');
    const [commentType, setCommentType] = useState<CommentaireContact['type']>('autre');
    const [commentSujet, setCommentSujet] = useState<CommentaireContact['sujet']>('autre');

    const { user, users, toggleCommentRead } = useAuth();
    const { addCommentaire, contracts, editContract, addContract, editContact } = useData();

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, []);

    useEffect(() => {
      if (contact?.id) {
        fetchDocumentsForContact(contact.id);
      }
    }, [contact?.id]);


    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
      if (e.target === modalRef.current) {
        onClose();
      }
    }, [onClose]);

    const handleNewContract = () => {
      setSelectedContract(null);
      setShowContractForm(true);
      setShowNewContractForm(true);
    };

    const handleContractSubmit = async (contractData: Omit<Contract, 'id'> | Contract) => {
      try {
        if ('id' in contractData) {
          await editContract(contractData);
        } else {
          await addContract(contractData);
        }
        setShowContractForm(false);
        setSelectedContract(null);
        setShowNewContractForm(false);
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du contrat:', err);
      }
    };

    const handleViewContract = (contract: Contract) => {
      setSelectedContract(contract);
      setShowContractDetails(true);
    };

    const handleEditContract = (contract: Contract) => {
      setSelectedContract(contract);
      setShowContractForm(true);
      setShowContractDetails(false);
    };

    const handleTypeChange = (type: 'particulier' | 'professionnel') => {
      setEditForm(prev => ({
        ...prev,
        types: {
          ...prev.types,
          [type]: !prev.types[type]
        }
      }));
    };

    const handleProfessionalTypeChange = (value: 'TNS' | 'Mandataire social') => {
      setEditForm(prev => ({
        ...prev,
        types: {
          ...prev.types,
          professionalType: value
        }
      }));
    };

    const handleEditSubmit = () => {
      const updatedContact = {
        ...contact,
        nom: editForm.nom,
        prenom: editForm.prenom,
        email: editForm.email,
        telephone: editForm.telephone,
        dateNaissance: editForm.dateNaissance,
        types: editForm.types,
        entreprise: editForm.entreprise,
        siret: editForm.siret,
        photoUrl: editForm.photoUrl
      };

      editContact(updatedContact);
      setContact(updatedContact);
      setIsEditing(false);
      if (onSubmit) {
        onSubmit(updatedContact);
      }
    };

    const handleDocumentUpload = async (file: File, metadata?: any) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image'); // ou autre type
      formData.append('statut', 'actif');
      formData.append('contactId', contact.id.toString());
      if (user?.id) {
        formData.append('utilisateurId', user.id.toString());
      } else {
        console.error("Utilisateur non trouvé");
        return;
      }

      if (metadata) {
        formData.append('metadonnees', JSON.stringify(metadata)); // <-- ce nom est important
      }

      console.log('👤 user.id envoyé =', user?.id);
      console.log('📇 contact.id envoyé =', contact.id);


      try {
        const res = await fetch('http://localhost:3000/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        console.log("📡 Réponse de l'upload :", res);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("🔍 Contenu de l'erreur :", errorText);
          throw new Error('Erreur upload');
        }


        const result = await res.json();
        console.log('✅ Document envoyé', result);
      } catch (error) {
        console.error('❌ Erreur enregistrement document :', error);
      }
    };

    const handleDocumentDelete = (documentId: string) => {
      const updatedContact = {
        ...contact,
        documents: (contact.documents || []).filter(doc => doc.id !== documentId)
      };
      editContact(updatedContact);
      setContact(updatedContact);
    };

    const handleDocumentDownload = (document: Document) => {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const BASE_URL = "http://localhost:3000"; // ou ton URL réelle de back

    const fetchDocumentsForContact = async (contactId: number) => {
      try {
        const res = await fetch(`${BASE_URL}/api/documents`);
        const allDocuments = await res.json();
        const filtered = allDocuments
          .filter((doc: any) => doc.contactId === contactId)
          .map((doc: any) => ({
            ...doc,
            url: doc.url // on garde juste le chemin Supabase, pour le passer à la route `/signed-url`
          }));
        setDocuments(filtered);
      } catch (err) {
        console.error('Erreur chargement documents :', err);
      }
    };

    const isCommentUnread = (commentId: string) => {
      if (!user?.readNotifications) return true;
      if (!user.readNotifications[contact.id]) return true;
      return !user.readNotifications[contact.id].includes(commentId);
    };

    const handleToggleCommentRead = (commentId: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) return;
      toggleCommentRead(contact.id, commentId);
    };

    const handleSubmitComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !user) return;

      const comment: CommentaireContact = {
        id: `comment-${Date.now()}`,
        date: new Date().toISOString(),
        type: commentType,
        sujet: commentSujet,
        contenu: newComment.trim(),
        utilisateurId: user.id
      };

      addCommentaire(contact.id, comment);
      setContact(prev => ({
        ...prev,
        commentaires: [...prev.commentaires, comment]
      }));
      setNewComment('');
      setCommentType('autre');
      setCommentSujet('autre');
    };

    const contactContracts = contracts.filter(
      contract => contract.clientId === contact.id
    );

    const activeContracts = contactContracts.filter(c => c.statut === 'actif');
    const otherContracts = contactContracts.filter(c => c.statut !== 'actif');

    const canManageClientAccess = user?.role === 'manager';
    const hasClientAccess = !!contact.portalAccess;

    return (
      <div 
        ref={modalRef}
        className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div 
          className="bg-white rounded-lg max-w-4xl w-full relative flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header fixe */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10 rounded-t-lg">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {contact.prenom} {contact.nom}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contact.statut === 'client' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {contact.statut}
                </span>
                <div className="flex space-x-2">
                  {contact.types?.particulier && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Particulier
                    </span>
                  )}
                  {contact.types?.professionnel && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      Professionnel
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-red-300 hover:text-red-400 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="border-b border-gray-200">
            <nav className="px-6 flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-1 py-4 border-b-2 font-medium text-sm`}
              >
                <User className="h-5 w-5 mr-2" />
                Fiche contact
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`${
                  activeTab === 'documents'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-1 py-4 border-b-2 font-medium text-sm`}
              >
                <FileText className="h-5 w-5 mr-2" />
                Documents
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`${
                  activeTab === 'contracts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-1 py-4 border-b-2 font-medium text-sm`}
              >
                <FileText className="h-5 w-5 mr-2" />
                Contrats
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`${
                  activeTab === 'comments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center px-1 py-4 border-b-2 font-medium text-sm`}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Commentaires
              </button>
              {canManageClientAccess && (
                <button
                  onClick={() => setActiveTab('access')}
                  className={`${
                    activeTab === 'access'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center px-1 py-4 border-b-2 font-medium text-sm`}
                >
                  <Key className="h-5 w-5 mr-2" />
                  Accès client
                </button>
              )}
            </nav>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col items-center">
                    {isEditing ? (
                      <div className="mb-4">
                        <ImageUpload
                          currentImage={editForm.photoUrl}
                          onImageChange={(url) => setEditForm(prev => ({ ...prev, photoUrl: url }))}
                          label="Photo"
                          id="contact-photo"
                        />
                      </div>
                    ) : (
                      <img
                        src={contact.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.prenom + ' ' + contact.nom)}`}
                        alt={`${contact.prenom} ${contact.nom}`}
                        className="h-24 w-24 rounded-full mb-4"
                      />
                    )}
                  </div>
                  {!isEditing && (
                    <Button
                      variant="secondary"
                      icon={PencilLine}
                      onClick={() => setIsEditing(true)}
                    >
                      Modifier
                    </Button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{contact.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <p className="mt-1 text-sm text-gray-900">{contact.telephone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {contact.dateNaissance ? (
                            <>
                              {new Date(contact.dateNaissance).toLocaleDateString('fr-FR')}
                              <span className="ml-2 text-gray-500">
                                ({calculateAge(contact.dateNaissance)} ans)
                              </span>
                            </>
                          ) : (
                            'Non renseignée'
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contact.types.particulier ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              Particulier
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contact.types.professionnel ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              Professionnel
                            </span>
                          </div>
                          {contact.types.professionnel && contact.types.professionalType && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {contact.types.professionalType}
                            </span>
                          )}
                        </div>
                      </div>
                      {contact.entreprise && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Entreprise</label>
                          <p className="mt-1 text-sm text-gray-900">{contact.entreprise}</p>
                        </div>
                      )}
                      {contact.siret && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">SIRET</label>
                          <p className="mt-1 text-sm text-gray-900">{contact.siret}</p>
                        </div>
                      )}
                      {contact.types.professionnel && contact.types.role && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Rôle dans l'entreprise</label>
                          <p className="mt-1 text-sm text-gray-900">{contact.types.role}</p>
                        </div>
                      )}
                      {contact.comptableNom && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nom du comptable</label>
                          <p className="mt-1 text-sm text-gray-900">{contact.comptableNom}</p>
                        </div>
                      )}
                      {contact.comptablePrenom && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Prénom du comptable</label>
                          <p className="mt-1 text-sm text-gray-900">{contact.comptablePrenom}</p>
                        </div>
                      )}
                      {contact.comptableEmail && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email du comptable</label>
                          <p className="mt-1 text-sm text-gray-900">{contact.comptableEmail}</p>
                        </div>
                      )}
                      {contact.comptableTelephone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Téléphone du comptable</label>
                          <p className="mt-1 text-sm text-gray-900">{contact.comptableTelephone}</p>
                        </div>
                      )}


                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={editForm.prenom}
                          onChange={(e) => setEditForm(prev => ({ ...prev, prenom: e.target.value }))}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                          placeholder="Prénom"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={editForm.nom}
                          onChange={(e) => setEditForm(prev => ({ ...prev, nom: e.target.value }))}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                          placeholder="Nom"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                        placeholder="Email"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={editForm.telephone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, telephone: e.target.value }))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                        placeholder="Téléphone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        value={editForm.dateNaissance}
                        onChange={(e) => setEditForm(prev => ({ ...prev, dateNaissance: e.target.value }))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Types</label>
                      <div className="space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.types.particulier}
                            onChange={() => handleTypeChange('particulier')}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">Particulier</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.types.professionnel}
                            onChange={() => handleTypeChange('professionnel')}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">Professionnel</span>
                        </label>
                      </div>

                      {editForm.types.professionnel && (
                        <div className="ml-4 mt-2 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Type de professionnel
                            </label>
                            <div className="space-x-4">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  value="TNS"
                                  checked={editForm.types.professionalType === 'TNS'}
                                  onChange={(e) => handleProfessionalTypeChange(e.target.value as 'TNS' | 'Mandataire social')}
                                  className="border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">TNS</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  value="Mandataire social"
                                  checked={editForm.types.professionalType === 'Mandataire social'}
                                  onChange={(e) => handleProfessionalTypeChange(e.target.value as 'TNS' | 'Mandataire social')}
                                  className="border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Mandataire social</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                              Rôle dans l'entreprise
                            </label>
                            <input
                              type="text"
                              id="role"
                              value={editForm.types.role}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                types: {
                                  ...prev.types,
                                  role: e.target.value
                                }
                              }))}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Ex: Directeur Commercial, Gérant, etc."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {editForm.types.professionnel && (
                      <>
                        <div>
                          <input
                            type="text"
                            value={editForm.entreprise}
                            onChange={(e) => setEditForm(prev => ({ ...prev, entreprise: e.target.value }))}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            placeholder="Entreprise"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={editForm.siret}
                            onChange={(e) => setEditForm(prev => ({ ...prev, siret: e.target.value }))}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
                            placeholder="SIRET"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pièces d'identité</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Carte d'identité</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <DocumentUpload
                            onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'identity', side: 'front' })}
                            type="identity-front"
                            label="Recto"
                          />
                          <DocumentUpload
                            onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'identity', side: 'back' })}
                            type="identity-back"
                            label="Verso"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Permis de conduire</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <DocumentUpload
                            onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'driving_license', side: 'front' })}
                            type="driving-license-front"
                            label="Recto"
                          />
                          <DocumentUpload
                            onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'driving_license', side: 'back' })}
                            type="driving-license-back"
                            label="Verso"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {contact.types.professionnel && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Documents professionnels</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">K-bis</h4>
                          <DocumentUpload
                            onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'kbis' })}
                            type="kbis"
                            label="Ajouter"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Justificatif d'expérience</h4>
                          <DocumentUpload
                            onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'experience' })}
                            type="experience"
                            label="Ajouter"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tampon commercial</h4>
                          <DocumentUpload
                            onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'commercial_stamp' })}
                            type="commercial-stamp"
                            label="Ajouter"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Autres documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Relevé de sinistralité</h4>
                      
                      <DocumentUpload
                        onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'claims_history' })}
                        type="claims-history"
                        label="Ajouter"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Autre document</h4>
                      <DocumentUpload
                        onUpload={(file, metadata) => handleDocumentUpload(file, { ...metadata, type: 'other' })}
                        type="other"
                        label="Ajouter"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents enregistrés</h3>
                  <DocumentList
                    documents={documents} // <-- ici
                    onDelete={handleDocumentDelete}
                    onDownload={handleDocumentDownload}
                  />
                </div>
              </div>
            )}

            {activeTab === 'contracts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Contrats ({contactContracts.length})
                  </h3>
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={handleNewContract}
                    className="text-xs"
                  >
                    Nouveau contrat
                  </Button>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
                  {activeContracts.length > 0 && (
                    <div className="mb-6">
                      <details open>
                        <summary className="text-xs font-medium text-gray-500 mb-2 cursor-pointer hover:text-gray-700">
                          Contrats actifs ({activeContracts.length})
                        </summary>
                        <div className="space-y-2 mt-2 pl-4">
                          {activeContracts.map(contract => (
                            <ContractCard
                              key={contract.id}
                              contract={contract}
                              onView={handleViewContract}
                              onEdit={handleEditContract}
                            />
                          ))}
                        </div>
                      </details>
                    </div>
                  )}

                  {otherContracts.length > 0 && (
                    <div>
                      <details>
                        <summary className="text-xs font-medium text-gray-500 mb-2 cursor-pointer hover:text-gray-700">
                          Autres contrats ({otherContracts.length})
                        </summary>
                        <div className="space-y-2 mt-2 pl-4">
                          {otherContracts.map(contract => (
                            <ContractCard
                              key={contract.id}
                              contract={contract}
                              onView={handleViewContract}
                              onEdit={handleEditContract}
                            />
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Commentaires</h3>

                <CommentForm
                  contactId={contact.id}
                  onClose={() => setShowCommentForm(false)}
                  onCommentAdded={async () => {
                    const updatedContact = await fetch(`http://localhost:3000/api/contacts/${contact.id}`);
                    const updatedData = await updatedContact.json();
                    setContact(updatedData); // ← met à jour les commentaires affichés
                  }}
                />

                <div className="space-y-4">
                  {[...contact.commentaires].reverse().map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      user={user}
                      allUsers={users}
                      isUnread={isCommentUnread(comment.id)}
                      onToggleRead={handleToggleCommentRead(comment.id)}
                    />
                  ))}
                </div>
              </div>
            )}


            {activeTab === 'access' && canManageClientAccess && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Accès client</h3>
                  {!hasClientAccess && (
                    <Button
                      variant="primary"
                      onClick={() => setShowClientAccessForm(true)}
                    >
                      Créer un accès
                    </Button>
                  )}
                </div>

                {hasClientAccess ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Accès activé
                        </span>
                      </div>
                      <ClientAccessButton contact={contact} />
                    </div>
                    
                    <dl className="grid grid-cols-1 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email de connexion</dt>
                        <dd className="mt-1 text-sm text-gray-900">{contact.email}</dd>
                      </div>
                      {contact.portalAccess?.lastLogin && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Dernière connexion</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(contact.portalAccess.lastLogin).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                    <p className="text-gray-500">
                      Aucun accès client n'a été créé pour ce contact.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer fixe */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end space-x-4 rounded-b-lg">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleEditSubmit}
                  icon={Check}
                >
                  Enregistrer
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Fermer
              </Button>
            )}
          </div>
        </div>

        {showContractDetails && selectedContract && (
          <ContractDetails
            contract={selectedContract}
            onClose={() => {
              setShowContractDetails(false);
              setSelectedContract(null);
            }}
            onEdit={handleEditContract}
          />
        )}

        {(showContractForm || showNewContractForm) && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative animate-zoom-in">
              <ContractForm
                contract={selectedContract}
                initialClientId={contact.id}
                onClose={() => {
                  setShowContractForm(false);
                  setSelectedContract(null);
                  setShowNewContractForm(false);
                }}
                onSubmit={handleContractSubmit}
                isEdit={!!selectedContract}
              />
            </div>
          </div>
        )}


        {showClientAccessForm && (
          <ClientAccessForm
            contact={contact}
            onClose={() => setShowClientAccessForm(false)}
          />
        )}
      </div>
    );
  };

  export default ContactDetails;
  