import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Contact, CommentaireContact } from '../types/data';
import Button from './Button';
import ImageUpload from './ImageUpload';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import ContratFormInline from './ContratFormInline';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Modal from './Modal';

interface ContactFormProps {
  contact?: Contact;
  onClose: () => void;
  onSubmit: (contact: Contact) => void;
}

type TabType = 'details' | 'comments';

const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onClose,
  onSubmit
}) => {
  const [showContratModal, setShowContratModal] = useState(false);
  const { user, users, toggleCommentRead } = useAuth();
  const { addCommentaire, contacts } = useData();
  const clientContacts = contacts
    .filter(c => c.statut === 'client')
    .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`));
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [contrats, setContrats] = useState<any[]>([]);
  const [newlyCreatedContactId, setNewlyCreatedContactId] = useState<number | null>(null);
  const [createdContactData, setCreatedContactData] = useState<any | null>(null);


  const [formData, setFormData] = useState({
    prenom: contact?.prenom || '',
    nom: contact?.nom || '',
    email: contact?.email || '',
    telephone: contact?.telephone || '',
    dateNaissance: (contact?.dateNaissance as any) || '',
    types: {
      particulier: (contact as any)?.particulier ?? contact?.types?.particulier ?? false,
      professionnel: (contact as any)?.professionnel ?? contact?.types?.professionnel ?? false,
      professionalType:
        (contact as any)?.professionalType ?? contact?.types?.professionalType ?? ('TNS' as 'TNS' | 'Mandataire social'),
      role: contact?.types?.role || ''
    },
    entreprise: contact?.entreprise || '',
    siret: contact?.siret || '',
    photoUrl: contact?.photoUrl || '',
    statut: contact?.statut || 'prospect',

    // Comptable
    comptableNom: (contact as any)?.comptableNom || '',
    comptablePrenom: (contact as any)?.comptablePrenom || '',
    comptableEmail: (contact as any)?.comptableEmail || '',
    comptableTelephone: (contact as any)?.comptableTelephone || '',

    // Adresse détaillée
    numeroRue: (contact as any)?.numeroRue || '',
    rue: (contact as any)?.rue || '',
    complement: (contact as any)?.complement || '',
    codePostal: (contact as any)?.codePostal || '',
    ville: (contact as any)?.ville || '',
    pays: (contact as any)?.pays || '',

    // Parrainage
    parrainId: (contact as any)?.parrainId || null,
  });

  // État pour les commentaires
  const [commentType, setCommentType] = useState<CommentaireContact['type']>('autre');
  const [commentSujet, setCommentSujet] = useState<CommentaireContact['sujet']>('autre');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<CommentaireContact[]>(contact?.commentaires || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⚠️ On N'ENVOIE PAS "types" brut au backend
    const payload: any = {
      prenom: formData.prenom,
      nom: formData.nom,
      email: formData.email,
      telephone: formData.telephone,
      dateNaissance: formData.dateNaissance || null,
      entreprise: formData.entreprise,
      siret: formData.siret,
      statut: formData.statut,
      photoUrl: formData.photoUrl,

      // Champs attendus par le contrôleur
      particulier: formData.types.particulier,
      professionnel: formData.types.professionnel,
      professionalType: formData.types.professionalType,

      // Adresse
      numeroRue: formData.numeroRue,
      rue: formData.rue,
      complement: formData.complement,
      codePostal: formData.codePostal,
      ville: formData.ville,
      pays: formData.pays,

      // Parrainage
      parrainId: formData.parrainId,


      // Comptable
      comptableNom: formData.comptableNom,
      comptablePrenom: formData.comptablePrenom,
      comptableEmail: formData.comptableEmail,
      comptableTelephone: formData.comptableTelephone,
    };

    try {
      const response = await fetch(`http://localhost:3000/api/contacts${contact ? '/' + contact.id : ''}`, {
        method: contact ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ Erreur serveur :', errText);
        throw new Error('Erreur lors de la sauvegarde');
      }

      const savedContact = await response.json();

      if (onSubmit) {
        onSubmit(savedContact);
        setTimeout(() => {
          onClose();
        }, 0);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du contact :', error);
      alert('Erreur lors de la sauvegarde du contact.');
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !contact) return;

    const comment: CommentaireContact = {
      id: `comment-${Date.now()}`,
      date: new Date().toISOString(),
      type: commentType,
      sujet: commentSujet,
      contenu: newComment.trim(),
      utilisateurId: user.id
    };

    addCommentaire(contact.id, comment);
    setComments(prev => [...prev, comment]);
    setNewComment('');
    setCommentType('autre');
    setCommentSujet('autre');
  };

  const isCommentUnread = (commentId: string) => {
    if (!user?.readNotifications) return true;
    if (!contact) return false;
    if (!user.readNotifications[contact.id]) return true;
    return !user.readNotifications[contact.id].includes(commentId);
  };

  const handleToggleCommentRead = (commentId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !contact) return;
    toggleCommentRead(contact.id, commentId);
  };

  const handleTypeChange = (type: 'particulier' | 'professionnel') => {
    setFormData(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type],
      },
    }));
  };

  const isClient = formData.statut === 'client';
  const canSubmit =
    formData.prenom.trim() !== '' &&
    formData.nom.trim() !== '' &&
    formData.telephone.trim() !== '' &&
    (!isClient || contrats.length > 0); // ✅ corrigé

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-medium mb-6">
          {contact ? 'Modifier le contact' : 'Nouveau contact'}
        </h2>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Détails
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`${
                activeTab === 'comments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Commentaires
            </button>
          </nav>
        </div>

        {activeTab === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              currentImage={formData.photoUrl}
              onImageChange={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
              label="Photo de profil"
              id="contact-photo"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <select
                defaultValue=""
                onChange={() => {}}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="" disabled>Sélectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="female">Autre</option>
              </select>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => setFormData(prev => ({ ...prev, dateNaissance: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de contact
              </label>
              <div className="space-y-2">
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.types.particulier}
                      onChange={() => handleTypeChange('particulier')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Particulier</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.types.professionnel}
                      onChange={() => handleTypeChange('professionnel')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Professionnel</span>
                  </label>
                </div>

                {formData.types.professionnel && (
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
                            checked={formData.types.professionalType === 'TNS'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              types: {
                                ...prev.types,
                                professionalType: e.target.value as 'TNS' | 'Mandataire social'
                              }
                            }))}
                            className="border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">TNS</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="Mandataire social"
                            checked={formData.types.professionalType === 'Mandataire social'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              types: {
                                ...prev.types,
                                professionalType: e.target.value as 'TNS' | 'Mandataire social'
                              }
                            }))}
                            className="border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">Mandataire social</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rôle dans l'entreprise
                      </label>
                      <input
                        type="text"
                        value={formData.types.role}
                        onChange={(e) => setFormData(prev => ({
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
            </div>

            {formData.types.professionnel && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.entreprise}
                    onChange={(e) => setFormData(prev => ({ ...prev, entreprise: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => setFormData(prev => ({ ...prev, siret: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    pattern="[0-9]{14}"
                    title="Le SIRET doit contenir 14 chiffres"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du comptable</label>
                    <input
                      type="text"
                      value={formData.comptableNom}
                      onChange={(e) => setFormData(prev => ({ ...prev, comptableNom: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom du comptable</label>
                    <input
                      type="text"
                      value={formData.comptablePrenom}
                      onChange={(e) => setFormData(prev => ({ ...prev, comptablePrenom: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email du comptable</label>
                    <input
                      type="email"
                      value={formData.comptableEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, comptableEmail: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone du comptable</label>
                    <input
                      type="tel"
                      value={formData.comptableTelephone}
                      onChange={(e) => setFormData(prev => ({ ...prev, comptableTelephone: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

              </>
            )}
              <h3 className="text-md font-medium mt-6">Adresse complète</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">N° de rue</label>
                    <input
                      type="text"
                      value={formData.numeroRue}
                      onChange={(e) => setFormData(prev => ({ ...prev, numeroRue: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom de la rue</label>
                    <input
                      type="text"
                      value={formData.rue}
                      onChange={(e) => setFormData(prev => ({ ...prev, rue: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complément d'adresse</label>
                    <input
                      type="text"
                      value={formData.complement}
                      onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code postal</label>
                    <input
                      type="text"
                      value={formData.codePostal}
                      onChange={(e) => setFormData(prev => ({ ...prev, codePostal: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ville</label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pays</label>
                    <input
                      type="text"
                      value={formData.pays}
                      onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                    />
                  </div>
                </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => {
                  const newStatut = e.target.value as 'prospect' | 'client';
                  setFormData(prev => ({ ...prev, statut: newStatut }));
                  
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
              </select>

            </div>


            <div>
              <label htmlFor="parrainId" className="block text-sm font-medium text-gray-700">
                Parrain
              </label>
              <select
                name="parrainId"
                id="parrainId"
                value={formData.parrainId || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, parrainId: parseInt(e.target.value) || null }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Aucun parrain</option>
                {clientContacts.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom}
                    {' '}
                    {client.types.particulier && client.types.professionnel
                      ? '(Part. & Pro)'
                      : client.types.particulier
                        ? '(Particulier)'
                        : client.types.professionnel
                          ? '(Professionnel)'
                          : '(Prospect)'}
                  </option>
                ))}
              </select>
            </div>


            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit}
              >
                {contact ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6">
            <CommentForm
              commentType={commentType}
              commentSujet={commentSujet}
              newComment={newComment}
              onTypeChange={setCommentType}
              onSujetChange={setCommentSujet}
              onCommentChange={setNewComment}
              onSubmit={handleSubmitComment}
              onClose={() => {}}
            />

            <div className="space-y-4">
              {[...comments].reverse().map(comment => (
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
      </div>
        <Modal
          isOpen={showContratModal}
          onClose={() => {
            const confirm = window.confirm("Voulez-vous transformer ce client en prospect ?");
            if (confirm && createdContactData) {
              setShowContratModal(false);
              onSubmit({ ...createdContactData, statut: 'prospect', contrats: [] });
            }
          }}
        >
          {newlyCreatedContactId ? (
            <ContratFormInline
              clientId={newlyCreatedContactId}
              onAdd={(newContrat) => {
                setShowContratModal(false);
                onSubmit({
                  ...createdContactData,
                  contrats: [newContrat]
                });
              }}
            />
          ) : (
            <p>Chargement…</p>
          )}
        </Modal>






    </div>
  );
};

export default ContactForm;