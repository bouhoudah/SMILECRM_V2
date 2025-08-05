import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md max-w-md text-center">
        <div className="flex justify-center mb-4">
          <ShieldOff className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Accès non autorisé</h1>
        <p className="text-gray-600 mb-6">
          Vous n’avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Retour à l’accueil
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
