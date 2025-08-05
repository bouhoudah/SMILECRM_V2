import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CommentFormProps {
  contactId: number;
  onClose: () => void;
  onCommentAdded?: () => void; // Callback pour rafraîchir les commentaires
}

const CommentForm: React.FC<CommentFormProps> = ({ contactId, onClose, onCommentAdded }) => {
  const [commentType, setCommentType] = useState<'appel_entrant' | 'appel_sortant' | 'email_recu' | 'email_envoye' | 'autre'>('appel_entrant');
  const [commentSujet, setCommentSujet] = useState<'demande_info' | 'sinistre' | 'reclamation' | 'commercial' | 'autre'>('demande_info');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // ✅ récupère l'utilisateur connecté

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Débogage
    console.log("DEBUG → user:", user, "user.id:", user?.id, "contactId:", contactId);

    // ✅ Vérification stricte
    if (!newComment.trim() || !user || !user.id || !contactId) {
      alert("Tous les champs sont requis.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/commentaire/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: commentType,
          sujet: commentSujet,
          contenu: newComment,
          contactId,
          utilisateurId: user.id || 1 // ✅ fallback temporaire si user.id absent
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l’ajout du commentaire');

      setNewComment('');
      if (onCommentAdded) onCommentAdded(); // Callback pour recharger les commentaires
      onClose(); // Ferme le formulaire
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l’envoi du commentaire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white p-4 rounded-md shadow">
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 p-1 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors duration-200"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as any)}
              className="block w-full border border-gray-300 rounded-md py-2 px-3"
            >
              <option value="appel_entrant">Appel entrant</option>
              <option value="appel_sortant">Appel sortant</option>
              <option value="email_recu">Email reçu</option>
              <option value="email_envoye">Email envoyé</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
            <select
              value={commentSujet}
              onChange={(e) => setCommentSujet(e.target.value as any)}
              className="block w-full border border-gray-300 rounded-md py-2 px-3"
            >
              <option value="demande_info">Demande d'information</option>
              <option value="sinistre">Sinistre</option>
              <option value="reclamation">Réclamation</option>
              <option value="commercial">Commercial</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 border border-gray-300 rounded-md py-2 px-3"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
