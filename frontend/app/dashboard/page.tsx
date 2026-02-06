'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBeam from '@/components/NavigationBeam';
import EmploymentCard from '@/components/EmploymentCard';
import QueryRefinery from '@/components/QueryRefinery';
import { queryEmploymentListings, pinListing, unpinListing, recallPinnedListings } from '@/lib/api';

type EmploymentListing = {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  posted_at: string;
  url?: string;
  remote?: boolean;
  salary?: string;
};

export default function ListingBrowser() {
  const [listings, setListings] = useState<EmploymentListing[]>([]);
  const [pinnedSet, setPinnedSet] = useState<Set<number>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [faultMessage, setFaultMessage] = useState('');
  const routeController = useRouter();

  useEffect(() => {
    verifySessionAndLoad();
  }, []);

  const verifySessionAndLoad = async () => {
    const sessionTicket = typeof window !== 'undefined' ? localStorage.getItem('hn_session_vault') : null;
    
    if (!sessionTicket) {
      routeController.push('/');
      return;
    }

    await loadListingsData();
    await loadPinnedData();
  };

  const loadListingsData = async (criteria?: any) => {
    try {
      setIsLoadingData(true);
      setFaultMessage('');
      const fetchedData = await queryEmploymentListings(criteria);
      setListings(fetchedData);
    } catch (fault) {
      setFaultMessage('Data retrieval fault. Retry suggested.');
      console.error(fault);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadPinnedData = async () => {
    try {
      const pinnedData = await recallPinnedListings();
      const identifiers = new Set<number>(pinnedData.map((record: any) => record.job_id || record.id));
      setPinnedSet(identifiers);
    } catch (fault) {
      console.error('Pinned data load fault:', fault);
    }
  };

  const executePinToggle = async (listingId: number) => {
    try {
      if (pinnedSet.has(listingId)) {
        await unpinListing(listingId);
        setPinnedSet(previousSet => {
          const modifiedSet = new Set(previousSet);
          modifiedSet.delete(listingId);
          return modifiedSet;
        });
      } else {
        await pinListing(listingId);
        setPinnedSet(previousSet => new Set(previousSet).add(listingId));
      }
    } catch (fault) {
      console.error('Pin toggle fault:', fault);
    }
  };

  const applyCriteria = (criteria: any) => {
    loadListingsData(criteria);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <NavigationBeam />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-900 mb-2">
            🎯 Browse Listings
          </h2>
          <p className="text-gray-600">
            Discover opportunities from Hacker News community
          </p>
        </div>

        <QueryRefinery onCriteriaUpdate={applyCriteria} />

        {faultMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r text-red-800">
            ⚠️ {faultMessage}
          </div>
        )}

        {isLoadingData ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">⏳</div>
              <p className="text-gray-600 font-bold">Loading listings...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 font-bold">Zero matches found</p>
            <p className="text-gray-500 mt-2">Adjust your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {listings.map((listing) => (
              <EmploymentCard
                key={listing.id}
                listing={listing}
                onPinToggle={executePinToggle}
                isPinned={pinnedSet.has(listing.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
