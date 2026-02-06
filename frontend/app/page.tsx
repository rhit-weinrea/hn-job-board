'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EntryPortal from '@/components/EntryPortal';
import AccountRegistry from '@/components/AccountRegistry';

export default function WelcomeZone() {
  const [viewMode, setViewMode] = useState<'authenticate' | 'register'>('authenticate');
  const routeController = useRouter();

  const proceedToDashboard = () => {
    routeController.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-white space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-6xl">🔶</span>
            <h1 className="text-5xl font-black leading-tight">
              HN Career Hub
            </h1>
          </div>
          
          <p className="text-xl text-gray-300 leading-relaxed">
            Discover exceptional career opportunities curated from Hacker News. 
            Connect with innovative companies seeking talented individuals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-bold mb-1">Curated Postings</h3>
              <p className="text-sm text-gray-400">Selected from HN</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold mb-1">Advanced Search</h3>
              <p className="text-sm text-gray-400">Refine precisely</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-bold mb-1">Pin Listings</h3>
              <p className="text-sm text-gray-400">Track progress</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl mb-2">🔔</div>
              <h3 className="font-bold mb-1">Custom Alerts</h3>
              <p className="text-sm text-gray-400">Stay updated</p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          {viewMode === 'authenticate' ? (
            <EntryPortal
              onAuthenticated={proceedToDashboard}
              toggleMode={() => setViewMode('register')}
            />
          ) : (
            <AccountRegistry
              onAccountCreated={proceedToDashboard}
              returnToEntry={() => setViewMode('authenticate')}
            />
          )}
        </div>
      </div>
    </main>
  );
}
