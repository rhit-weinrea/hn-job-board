'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { terminateSession } from '@/lib/api';

export default function NavigationBeam() {
  const activePath = usePathname();

  const executeLogout = () => {
    terminateSession();
    window.location.href = '/';
  };

  const linkRegistry = [
    { path: '/dashboard', text: '🎯 Listings', emoji: '🎯' },
    { path: '/dashboard/pinned', text: '⭐ Pinned', emoji: '⭐' },
    { path: '/dashboard/profile', text: '⚙️ Profile', emoji: '⚙️' },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-gray-900 border-b-4 border-hn-orange shadow-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🔶</span>
            <h1 className="text-2xl font-black text-white">
              HN Career Hub
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {linkRegistry.map((entry) => {
              const isCurrentRoute = activePath === entry.path;
              return (
                <Link
                  key={entry.path}
                  href={entry.path}
                  className={`px-4 py-2 rounded-lg font-bold transition-all transform hover:scale-105 ${
                    isCurrentRoute
                      ? 'bg-hn-orange text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {entry.text}
                </Link>
              );
            })}

            <button
              onClick={executeLogout}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
