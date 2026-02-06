'use client';

import { useState, ChangeEvent } from 'react';

type QueryRefineryProps = {
  onCriteriaUpdate: (criteria: {
    phraseQuery?: string;
    territoryFilter?: string;
    distantWorkFlag?: boolean;
  }) => void;
};

export default function QueryRefinery({ onCriteriaUpdate }: QueryRefineryProps) {
  const [phraseInput, setPhraseInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [distantBox, setDistantBox] = useState(false);

  const deployFilters = () => {
    onCriteriaUpdate({
      phraseQuery: phraseInput || undefined,
      territoryFilter: areaInput || undefined,
      distantWorkFlag: distantBox ? true : undefined,
    });
  };

  const clearFilters = () => {
    setPhraseInput('');
    setAreaInput('');
    setDistantBox(false);
    onCriteriaUpdate({});
  };

  return (
    <div className="bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl p-6 shadow-lg border-2 border-slate-200 mb-8">
      <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
        🔍 Query Refinery
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="phrase-input" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Search Phrases
          </label>
          <input
            id="phrase-input"
            type="text"
            value={phraseInput}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setPhraseInput(evt.target.value)}
            placeholder="TypeScript, DevOps, ML..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all bg-white"
          />
        </div>

        <div>
          <label htmlFor="area-input" className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Geographic Area
          </label>
          <input
            id="area-input"
            type="text"
            value={areaInput}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => setAreaInput(evt.target.value)}
            placeholder="NYC, Berlin, Anywhere..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-orange-200 focus:border-hn-orange outline-none transition-all bg-white"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-hn-orange transition-all w-full">
            <input
              type="checkbox"
              checked={distantBox}
              onChange={(evt: ChangeEvent<HTMLInputElement>) => setDistantBox(evt.target.checked)}
              className="w-5 h-5 text-hn-orange focus:ring-2 focus:ring-orange-200 rounded"
            />
            <span className="text-sm font-bold text-gray-700">🌐 Distant Work</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={deployFilters}
          className="flex-1 bg-gradient-to-r from-hn-orange to-orange-600 text-white py-2 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🚀 Deploy Criteria
        </button>
        <button
          onClick={clearFilters}
          className="bg-white text-gray-700 py-2 px-6 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all font-bold shadow hover:shadow-lg"
        >
          ↺ Clear All
        </button>
      </div>
    </div>
  );
}
