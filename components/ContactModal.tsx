import React, { useState } from 'react';
import { X, Send, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alumni } from '../types';

interface Props {
  alumni: Alumni | null;
  onClose: () => void;
}

// Configurazione URL Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwskvlFfMB2wSzBdL5f2NmsR4SCPUpY_gVqnaJZkONVb3BSbSdr1C-jrk6o6mg4BgQlJw/exec';

// Costanti per il limite email
const DAILY_LIMIT = 10;
const STORAGE_KEY = 'adalc_daily_email_stats';

interface EmailStats {
  count: number;
  startTime: number;
}

export const ContactModal: React.FC<Props> = ({ alumni, onClose }) => {
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!alumni) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!GOOGLE_SCRIPT_URL) {
      setErrorMessage("Errore configurazione: URL Script mancante.");
      setStatus('error');
      return;
    }

    // --- LOGICA LIMITE GIORNALIERO ---
    const now = Date.now();
    const storedStats = localStorage.getItem(STORAGE_KEY);
    let stats: EmailStats = { count: 0, startTime: now };

    if (storedStats) {
      try {
        const parsed = JSON.parse(storedStats);
        // Se è passato meno di un giorno (24h * 60m * 60s * 1000ms)
        if (now - parsed.startTime < 24 * 60 * 60 * 1000) {
          stats = parsed;
        } else {
          // Reset se sono passate più di 24 ore
          stats = { count: 0, startTime: now };
        }
      } catch (e) {
        // Se il JSON è corrotto, resettiamo
        stats = { count: 0, startTime: now };
      }
    }

    if (stats.count >= DAILY_LIMIT) {
      setStatus('error');
      setErrorMessage(`Hai raggiunto il limite giornaliero di ${DAILY_LIMIT} email. Per favore riprova dopo 24 ore.`);
      return;
    }
    // ---------------------------------

    setStatus('sending');
    setErrorMessage('');

    try {
      // Utilizziamo 'no-cors' perché Google Apps Script effettua dei redirect
      // che i browser bloccano per sicurezza (CORS).
      // Con 'no-cors' possiamo inviare i dati (fire and forget), ma non possiamo
      // leggere la risposta JSON di ritorno (status 200/ok).
      // Assumiamo che se la fetch non fallisce (network error), l'invio è riuscito.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain', // Importante: text/plain evita il "preflight" CORS option request
        },
        body: JSON.stringify({
          senderName: formData.senderName,
          senderEmail: formData.senderEmail,
          message: formData.message,
          alumniName: `${alumni.nom} ${alumni.prenom}`,
          alumniBac: alumni.bac || 'N/A'
        })
      });

      // Se siamo qui, la richiesta è partita senza errori di rete.
      // Incrementiamo il contatore e salviamo.
      stats.count += 1;
      // Se era il primo invio dopo un reset, assicuriamoci di avere lo startTime corretto
      if (stats.count === 1) {
          stats.startTime = Date.now();
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));

      setStatus('success');
      
    } catch (error) {
      console.error("Errore invio:", error);
      setStatus('error');
      setErrorMessage("Si è verificato un errore di connessione. Riprova più tardi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-50 to-white px-4 py-4 sm:px-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center">
               <Mail className="h-5 w-5 text-adalc-orange mr-2" />
               Contacter un ancien élève
            </h3>
            <button
              type="button"
              className="bg-transparent rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 py-5 sm:p-6">
            
            {/* IDLE STATE: Form */}
            {status === 'idle' && (
              <div>
                <div className="mb-5 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                  <span className="font-semibold block mb-1">Information</span>
                  Vous écrivez à <strong>{alumni.prenom} {alumni.nom ? `${alumni.nom.charAt(0)}.` : ''}</strong>. 
                  Pour des raisons de confidentialité, votre message sera d'abord reçu par le secrétariat de l'ADALC (info@adalc.net) qui le transmettra.
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Votre Nom Complet</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Jean Dupont"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-adalc-orange focus:border-transparent sm:text-sm transition-shadow"
                      value={formData.senderName}
                      onChange={e => setFormData({...formData, senderName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Votre Email</label>
                    <input
                      required
                      type="email"
                      placeholder="Ex: jean.dupont@email.com"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-adalc-orange focus:border-transparent sm:text-sm transition-shadow"
                      value={formData.senderEmail}
                      onChange={e => setFormData({...formData, senderEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Écrivez votre message ici..."
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-adalc-orange focus:border-transparent sm:text-sm transition-shadow"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-adalc-orange text-base font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-adalc-orange transition-all transform hover:scale-[1.02]"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le message
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SENDING STATE */}
            {status === 'sending' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 text-adalc-orange animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Envoi en cours...</h3>
                <p className="text-gray-500 mt-2">Veuillez patienter quelques instants.</p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {status === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 animate-fadeIn">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                <p className="text-gray-600 max-w-xs mx-auto mb-6">
                  Votre demande a été transmise avec succès à l'ADALC. Vous recevrez une réponse prochainement.
                </p>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Fermer
                </button>
              </div>
            )}

            {/* ERROR STATE */}
            {status === 'error' && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Erreur lors de l'envoi</h3>
                <p className="text-red-600 max-w-xs mx-auto mb-6">
                  {errorMessage || "Une erreur inattendue s'est produite."}
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-white hover:bg-slate-900 focus:outline-none sm:text-sm"
                    onClick={() => setStatus('idle')}
                  >
                    Réessayer
                  </button>
                   <button
                    type="button"
                    className="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                    onClick={onClose}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};