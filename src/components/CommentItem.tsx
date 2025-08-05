import React from 'react';
import { Bell } from 'lucide-react';
import { CommentaireContact } from '../types/data';
import { User } from '../types/auth';

interface CommentItemProps {
  comment: CommentaireContact;
  user: User | null;
  isUnread: boolean;
  onToggleRead: (e: React.MouseEvent) => void;
  allUsers: User[];
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  user,
  isUnread,
  onToggleRead,
  allUsers
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCommentUser = (userId: string) => {
    if (userId === 'system') {
      return { name: 'Système', avatar: null };
    }
    return allUsers.find(u => u.id === userId) || null;
  };

  const commentUser = getCommentUser(comment.utilisateurId);
  const formattedDate = formatDate(comment.date);
  const [date, time] = formattedDate.split(' à ');

  return (
    <div 
      id={`comment-${comment.id}`}
      className={`bg-gray-50 rounded-lg p-4 relative transition-colors duration-300 ${
        isUnread ? 'border-l-4 border-orange-500' : 'border-l-4 border-emerald-500'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {commentUser && (
            <img
              src={commentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(commentUser.name)}`}
              alt={commentUser.name}
              className="h-6 w-6 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-sm">{commentUser?.name || 'Utilisateur inconnu'}</span>
            <div className="text-xs text-gray-500">
              <span>{date}</span>
              <span className="mx-1">•</span>
              <span>{time}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isUnread && (
            <div className="flex items-center text-orange-600">
              <Bell className="h-4 w-4" />
              <span className="text-xs ml-1">Nouveau</span>
            </div>
          )}
          <button
            onClick={onToggleRead}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
              isUnread
                ? 'bg-orange-100 hover:bg-orange-200'
                : 'bg-emerald-100 hover:bg-emerald-200'
            }`}
            title={isUnread ? "Marquer comme lu" : "Marquer comme non lu"}
          >
            <div 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                isUnread
                  ? 'bg-orange-500 ml-0'
                  : 'bg-emerald-500 ml-6'
              }`}
            />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
          <span className="px-2 py-1 bg-gray-200 rounded-full">
            {comment?.type ? comment.type.replace('_', ' ') : 'Type inconnu'}
          </span>
          <span className="px-2 py-1 bg-gray-200 rounded-full">
            {comment?.sujet ? comment.sujet.replace('_', ' ') : 'Sujet inconnu'}
          </span>
        </div>

      </div>
      <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">{comment.contenu}</p>
    </div>
  );
};

export default CommentItem;