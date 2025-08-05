import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Contact, FicheConseil } from '../../types/data';
import { Save, Check } from 'lucide-react';
import Button from '../../components/Button';
import SignatureCanvas from 'react-signature-canvas';

const ClientFicheConseil = () => {
  const navigate = useNavigate();
  const { contacts, editContact } = useData();
  const [contact, setContact] = useState<Contact | null>(null);
  const [step, setStep] = useState(1);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [formData, setFormData] = useState<FicheConseil['informations']>({
    situationFamiliale: '',
    situationProfessionnelle: '',
    revenus: 0,
    patrimoine: '',
    objectifs: [],
    commentaires: ''
  });

  useEffect(() => {
    const clientId = sessionStorage.getItem('clientId');
    if (!clientId) {
      navigate('/client/login');
      return;
    }

    const clientContact = contacts.find(c => c.id === clientId);
    if (!clientContact) {
      navigate('/client/login');
      return;
    }

    setContact(clientContact);
    if (clientContact.ficheConseil?.informations) {
      setFormData(clientContact.ficheConseil.informations);
    }
  }, [contacts, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    const signatureData = signatureRef.current?.toDataURL();
    if (!signatureData) {
      alert('Veuillez signer le document');
      return;
    }

    const ficheConseil: FicheConseil = {
      id: contact.ficheConseil?.id || `fiche-${Date.now()}`,
      dateCreation: contact.ficheConseil?.dateCreation || new Date().toISOString(),
      dateMiseAJour: new Date().toISOString(),
      status: 'signed',
      signature: {
        date: new Date().toISOString(),
        signatureData
      },
      informations: formData
    };

    const updatedContact = {
      ...contact,
      ficheConseil
    };

    editContact(updatedContact);
    setContact(updatedContact);
    navigate('/client/dashboard');
  };

  if (!contact) {
    return null;
  }

  const objectifsOptions = [
    'Protection de la famille',
    'Préparation de la retraite',
    'Constitution d\'un patrimoine',
    'Optimisation fiscale',
    'Protection des biens',
    'Prévoyance'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Fiche conseil</h1>
        <p className="mt-2 text-sm text-gray-600">
          Complétez ce document pour nous permettre de mieux vous conseiller
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Situation familiale
                  </label>
                  <textarea
                    value={formData.situationFamiliale}
                    onChange={(e) => setFormData(prev => ({ ...prev, situationFamiliale: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Situation professionnelle
                  </label>
                  <textarea
                    value={formData.situationProfessionnelle}
                    onChange={(e) => setFormData(prev => ({ ...prev, situationProfessionnelle: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Revenus annuels (€)
                  </label>
                  <input
                    type="number"
                    value={formData.revenus}
                    onChange={(e) => setFormData(prev => ({ ...prev, revenus: parseInt(e.target.value) }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setStep(2)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Patrimoine
                  </label>
                  <textarea
                    value={formData.patrimoine}
                    onChange={(e) => setFormData(prev => ({ ...prev, patrimoine: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objectifs
                  </label>
                  <div className="space-y-2">
                    {objectifsOptions.map(objectif => (
                      <label key={objectif} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.objectifs.includes(objectif)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                objectifs: [...prev.objectifs, objectif]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                objectifs: prev.objectifs.filter(o => o !== objectif)
                              }));
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{objectif}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Commentaires additionnels
                  </label>
                  <textarea
                    value={formData.commentaires}
                    onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setStep(3)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Signature
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Veuillez signer ci-dessous pour valider votre fiche conseil
                  </p>
                  <div className="border rounded-lg p-4">
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        className: 'w-full h-64 border rounded',
                        style: { touchAction: 'none' }
                      }}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => signatureRef.current?.clear()}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Effacer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(2)}
                  >
                    Précédent
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Check}
                  >
                    Valider et signer
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientFicheConseil;