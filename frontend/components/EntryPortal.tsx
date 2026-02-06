'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { authenticateViaCredentials } from '@/lib/api';

type EntryPortalProps = {
  onAuthenticated: () => void;
  toggleMode: () => void;
};

export default function EntryPortal({ onAuthenticated, toggleMode }: EntryPortalProps) {
  const [mailField, setMailField] = useState('');
  const [secretField, setSecretField] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const processAuthentication = async (evt: FormEvent) => {
    evt.preventDefault();
    setAlertMessage('');
    setIsVerifying(true);

    try {
      await authenticateViaCredentials(mailField, secretField);
      onAuthenticated();
    } catch (fault) {
      setAlertMessage(fault instanceof Error ? fault.message : 'Authentication rejected');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-2xl border-2 border-slate-200">
      <div className="mb-6">
        <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-hn-orange to-orange-600 bg-clip-text text-transparent">
          Access Portal
        </h2>
        <p className="text-sm text-gray-600">Enter credentials to proceed</p>
      </div>
      
      {alertMessage && (
        <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-r text-red-800 text-sm font-medium">
          ⚠️ {alertMessage}
        </div>
      )}

      <form onSubmit={processAuthentication} className="space-y-5">
        <div className="relative">
          <label htmlFor="mail-entry" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Electronic Mail
          </label>
          <input
            id="mail-entry"
            type="email"
            value={mailField}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setMailField(evt.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all bg-white"
            placeholder="name@domain.example"
          />
        </div>

        <div className="relative">
          <label htmlFor="secret-entry" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Secret Code
          </label>
          <input
            id="secret-entry"
            type="password"
            value={secretField}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setSecretField(evt.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all bg-white"
            placeholder="Your secret passphrase"
          />
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full bg-gradient-to-r from-hn-orange to-orange-600 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        >
          {isVerifying ? '⏳ Verifying Identity...' : '🚀 Launch Dashboard'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t-2 border-gray-200">
        <button
          onClick={toggleMode}
          className="w-full text-center text-hn-orange hover:text-orange-600 text-sm font-bold transition-colors underline decoration-2 underline-offset-4"
        >
          First visit? Forge account →
        </button>
      </div>
    </div>
  );
}
