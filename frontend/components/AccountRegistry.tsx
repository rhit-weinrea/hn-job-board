'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { forgeNewAccount } from '@/lib/api';

type RegistryProps = {
  onAccountCreated: () => void;
  returnToEntry: () => void;
};

export default function AccountRegistry({ onAccountCreated, returnToEntry }: RegistryProps) {
  const [aliasField, setAliasField] = useState('');
  const [mailField, setMailField] = useState('');
  const [codeField, setCodeField] = useState('');
  const [verifyField, setVerifyField] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [isForging, setIsForging] = useState(false);

  const executeForge = async (evt: FormEvent) => {
    evt.preventDefault();
    setAlertMsg('');

    if (codeField !== verifyField) {
      setAlertMsg('Secret codes must be identical');
      return;
    }

    if (codeField.length < 6) {
      setAlertMsg('Secret code requires 6+ characters');
      return;
    }

    if (aliasField.length < 3) {
      setAlertMsg('Alias needs 3+ characters');
      return;
    }

    setIsForging(true);

    try {
      await forgeNewAccount(mailField, codeField, aliasField);
      onAccountCreated();
    } catch (fault) {
      setAlertMsg(fault instanceof Error ? fault.message : 'Account creation failed');
    } finally {
      setIsForging(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-2xl border-2 border-slate-200">
      <div className="mb-6">
        <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-hn-orange to-orange-600 bg-clip-text text-transparent">
          Account Registry
        </h2>
        <p className="text-sm text-gray-600">Craft your identity</p>
      </div>
      
      {alertMsg && (
        <div className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-yellow-100 border-l-4 border-yellow-500 rounded-r text-yellow-800 text-sm font-medium">
          ⚠️ {alertMsg}
        </div>
      )}

      <form onSubmit={executeForge} className="space-y-5">
        <div className="relative">
          <label htmlFor="alias-field" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Your Alias
          </label>
          <input
            id="alias-field"
            type="text"
            value={aliasField}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setAliasField(evt.target.value)}
            required
            minLength={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all bg-white"
            placeholder="cyberhacker99"
          />
        </div>

        <div className="relative">
          <label htmlFor="registry-mail" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Electronic Mail
          </label>
          <input
            id="registry-mail"
            type="email"
            value={mailField}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setMailField(evt.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all bg-white"
            placeholder="name@domain.example"
          />
        </div>

        <div className="relative">
          <label htmlFor="secret-code" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Secret Code
          </label>
          <input
            id="secret-code"
            type="password"
            value={codeField}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setCodeField(evt.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all bg-white"
            placeholder="Min 6 chars required"
          />
        </div>

        <div className="relative">
          <label htmlFor="verify-code" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Verify Code
          </label>
          <input
            id="verify-code"
            type="password"
            value={verifyField}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setVerifyField(evt.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all bg-white"
            placeholder="Repeat secret code"
          />
        </div>

        <button
          type="submit"
          disabled={isForging}
          className="w-full bg-gradient-to-r from-hn-orange to-orange-600 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        >
          {isForging ? '⚒️ Creating Account...' : '✨ Create Account'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t-2 border-gray-200">
        <button
          onClick={returnToEntry}
          className="w-full text-center text-hn-orange hover:text-orange-600 text-sm font-bold transition-colors underline decoration-2 underline-offset-4"
        >
          ← Return to portal
        </button>
      </div>
    </div>
  );
}
