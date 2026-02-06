'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBeam from '@/components/NavigationBeam';
import EmploymentCard from '@/components/EmploymentCard';
import { recallPinnedListings, unpinListing } from '@/lib/api';

type PinnedRecord = {
  id: number;
  job_id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  posted_at: string;
  url?: string;
  remote?: boolean;
  salary?: string;
};

export default function PinnedCollection() {
  const [pinnedRecords, setPinnedRecords] = useState<PinnedRecord[]>([]);
  const [isRetrieving, setIsRetrieving] = useState(true);
  const [faultMessage, setFaultMessage] = useState('');
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

    await retrievePinned();
  };

  const retrievePinned = async () => {
    try {
      setIsRetrieving(true);
      setFaultMessage('');
      const fetchedRecords = await recallPinnedListings();
      setPinnedRecords(fetchedRecords);
    } catch (fault) {
      setFaultMessage('Retrieval of pinned items failed');
      console.error(fault);
    } finally {
      setIsRetrieving(false);
    }
  };

  const executeUnpin = async (jobIdentifier: number) => {
    try {
      await unpinListing(jobIdentifier);
      setPinnedRecords(previous => previous.filter(record => record.job_id !== jobIdentifier));
    } catch (fault) {
      console.error('Unpin operation failed:', fault);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <NavigationBeam />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-900 mb-2">
            ⭐ Pinned Collection
          </h2>
          <p className="text-gray-600">
            Your preserved listings for reference
          </p>
        </div>

        {faultMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-800">
            ⚠️ {faultMessage}
          </div>
        )}

        {isRetrieving ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">⏳</div>
              <p className="text-gray-600 font-bold">Retrieving pins...</p>
            </div>
          </div>
        ) : pinnedRecords.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border-2 border-gray-200">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-gray-600 font-bold">Collection empty</p>
            <p className="text-gray-500 mt-2">Pin listings from the browser</p>
            <button
              onClick={() => routeController.push('/dashboard')}
              className="mt-6 bg-gradient-to-r from-hn-orange to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎯 Browse Listings
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-gray-600 font-semibold">
              {pinnedRecords.length} {pinnedRecords.length === 1 ? 'item' : 'items'} pinned
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pinnedRecords.map((record) => (
                <EmploymentCard
                  key={record.id}
                  listing={{
                    id: record.job_id,
                    title: record.title,
                    company: record.company,
                    location: record.location,
                    description: record.description,
                    posted_at: record.posted_at,
                    url: record.url,
                    remote: record.remote,
                    salary: record.salary,
                  }}
                  onPinToggle={executeUnpin}
                  isPinned={true}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
