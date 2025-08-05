// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, role, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Erreur lors de l’inscription');
        return;
      }

      navigate('/login');
    } catch (err) {
      setError('Erreur serveur');
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto p-6 bg-white shadow rounded mt-10">
      <h2 className="text-xl font-bold mb-4">Créer un utilisateur</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        placeholder="Nom"
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      >
        <option value="employee">Employé</option>
        <option value="manager">Manager</option>
        <option value="superadmin">Super Admin</option>
      </select>
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full mb-3 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">
        Créer le compte
      </button>
    </form>
  );
};

export default Register;
