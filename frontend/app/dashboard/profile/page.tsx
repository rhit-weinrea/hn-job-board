'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBeam from '@/components/NavigationBeam';
import { fetchProfileConfig, persistProfileConfig } from '@/lib/api';

type ProfileConfig = {
  keywords: string[];
  locations: string[];
  job_types: string[];
  remote_preference: boolean;
  salary_min: number;
  email_alerts: boolean;
};

export default function ProfileManager() {
  const [configuration, setConfiguration] = useState<ProfileConfig>({
    keywords: [],
    locations: [],
    job_types: [],
    remote_preference: false,
    salary_min: 0,
    email_alerts: false,
  });
  
  const [keywordBuffer, setKeywordBuffer] = useState('');
  const [locationBuffer, setLocationBuffer] = useState('');
  const [typeBuffer, setTypeBuffer] = useState('');
  const [isRetrieving, setIsRetrieving] = useState(true);
  const [isPersisting, setIsPersisting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const routeController = useRouter();

  useEffect(() => {
    verifyAndRetrieve();
  }, []);

  const verifyAndRetrieve = async () => {
    const sessionTicket = typeof window !== 'undefined' ? localStorage.getItem('hn_session_vault') : null;
    
    if (!sessionTicket) {
      routeController.push('/');
      return;
    }

    await retrieveConfiguration();
  };

  const retrieveConfiguration = async () => {
    try {
      setIsRetrieving(true);
      const fetchedConfig = await fetchProfileConfig();
      setConfiguration({
        keywords: fetchedConfig.keywords || [],
        locations: fetchedConfig.locations || [],
        job_types: fetchedConfig.job_types || [],
        remote_preference: fetchedConfig.remote_preference || false,
        salary_min: fetchedConfig.salary_min || 0,
        email_alerts: fetchedConfig.email_alerts || false,
      });
    } catch (fault) {
      console.error('Configuration retrieval fault:', fault);
    } finally {
      setIsRetrieving(false);
    }
  };

  const executeConfigSave = async () => {
    try {
      setIsPersisting(true);
      setStatusMessage('');
      await persistProfileConfig(configuration);
      setStatusMessage('✅ Configuration persisted!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (fault) {
      setStatusMessage('❌ Persistence operation failed');
      console.error(fault);
    } finally {
      setIsPersisting(false);
    }
  };

  const appendKeyword = () => {
    const trimmed = keywordBuffer.trim();
    if (trimmed && !configuration.keywords.includes(trimmed)) {
      setConfiguration({ ...configuration, keywords: [...configuration.keywords, trimmed] });
      setKeywordBuffer('');
    }
  };

  const purgeKeyword = (term: string) => {
    setConfiguration({ ...configuration, keywords: configuration.keywords.filter(k => k !== term) });
  };

  const appendLocation = () => {
    const trimmed = locationBuffer.trim();
    if (trimmed && !configuration.locations.includes(trimmed)) {
      setConfiguration({ ...configuration, locations: [...configuration.locations, trimmed] });
      setLocationBuffer('');
    }
  };

  const purgeLocation = (place: string) => {
    setConfiguration({ ...configuration, locations: configuration.locations.filter(l => l !== place) });
  };

  const appendJobType = () => {
    const trimmed = typeBuffer.trim();
    if (trimmed && !configuration.job_types.includes(trimmed)) {
      setConfiguration({ ...configuration, job_types: [...configuration.job_types, trimmed] });
      setTypeBuffer('');
    }
  };

  const purgeJobType = (category: string) => {
    setConfiguration({ ...configuration, job_types: configuration.job_types.filter(jt => jt !== category) });
  };

  const handleKeywordEnter = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') appendKeyword();
  };

  const handleLocationEnter = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') appendLocation();
  };

  const handleTypeEnter = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') appendJobType();
  };

  if (isRetrieving) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <NavigationBeam />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <p className="text-gray-600 font-bold">Retrieving profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <NavigationBeam />
      
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-900 mb-2">
            ⚙️ Profile Manager
          </h2>
          <p className="text-gray-600">
            Customize your experience
          </p>
        </div>

        {statusMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r text-green-800 font-medium">
            {statusMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Keywords Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🔑 Search Keywords
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={keywordBuffer}
                onChange={(evt) => setKeywordBuffer(evt.target.value)}
                onKeyPress={handleKeywordEnter}
                placeholder="JavaScript, Rust, Data..."
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all"
              />
              <button
                onClick={appendKeyword}
                className="bg-gradient-to-r from-hn-orange to-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
              >
                ➕ Append
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {configuration.keywords.map((term) => (
                <span
                  key={term}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                >
                  {term}
                  <button
                    onClick={() => purgeKeyword(term)}
                    className="text-orange-600 hover:text-orange-800 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {configuration.keywords.length === 0 && (
                <p className="text-gray-500 text-sm">No keywords configured</p>
              )}
            </div>
          </div>

          {/* Locations Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📍 Target Locations
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={locationBuffer}
                onChange={(evt) => setLocationBuffer(evt.target.value)}
                onKeyPress={handleLocationEnter}
                placeholder="Austin, London, Tokyo..."
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all"
              />
              <button
                onClick={appendLocation}
                className="bg-gradient-to-r from-hn-orange to-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
              >
                ➕ Append
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {configuration.locations.map((place) => (
                <span
                  key={place}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                >
                  {place}
                  <button
                    onClick={() => purgeLocation(place)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {configuration.locations.length === 0 && (
                <p className="text-gray-500 text-sm">No locations configured</p>
              )}
            </div>
          </div>

          {/* Job Types Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              💼 Employment Categories
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={typeBuffer}
                onChange={(evt) => setTypeBuffer(evt.target.value)}
                onKeyPress={handleTypeEnter}
                placeholder="Permanent, Freelance..."
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all"
              />
              <button
                onClick={appendJobType}
                className="bg-gradient-to-r from-hn-orange to-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
              >
                ➕ Append
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {configuration.job_types.map((category) => (
                <span
                  key={category}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                >
                  {category}
                  <button
                    onClick={() => purgeJobType(category)}
                    className="text-green-600 hover:text-green-800 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {configuration.job_types.length === 0 && (
                <p className="text-gray-500 text-sm">No categories configured</p>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🎛️ Extra Controls
            </h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={configuration.remote_preference}
                onChange={(evt) => setConfiguration({ ...configuration, remote_preference: evt.target.checked })}
                className="w-6 h-6 text-hn-orange focus:ring-2 focus:ring-orange-200 rounded"
              />
              <span className="font-semibold text-gray-700">🌐 Favor distant work</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={configuration.email_alerts}
                onChange={(evt) => setConfiguration({ ...configuration, email_alerts: evt.target.checked })}
                className="w-6 h-6 text-hn-orange focus:ring-2 focus:ring-orange-200 rounded"
              />
              <span className="font-semibold text-gray-700">📧 Activate alerts</span>
            </label>

            <div>
              <label htmlFor="wage-floor" className="block text-sm font-bold text-gray-700 mb-2">
                💰 Wage Floor (USD)
              </label>
              <input
                id="wage-floor"
                type="number"
                value={configuration.salary_min}
                onChange={(evt) => setConfiguration({ ...configuration, salary_min: parseInt(evt.target.value) || 0 })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all"
                placeholder="0"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={executeConfigSave}
            disabled={isPersisting}
            className="w-full bg-gradient-to-r from-hn-orange to-orange-600 text-white py-4 px-6 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-lg"
          >
            {isPersisting ? '💾 Persisting...' : '💾 Persist Configuration'}
          </button>
        </div>
      </main>
    </div>
  );
}
