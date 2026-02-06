'use client';

type EmploymentCardProps = {
  listing: {
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
  onPinToggle?: (identifier: number) => void;
  isPinned?: boolean;
};

export default function EmploymentCard({ listing, onPinToggle, isPinned }: EmploymentCardProps) {
  const computeTimeElapsed = (timestamp: string) => {
    const postedMoment = new Date(timestamp);
    const currentMoment = new Date();
    const millisecondGap = currentMoment.getTime() - postedMoment.getTime();
    const hourGap = Math.floor(millisecondGap / (1000 * 60 * 60));
    const dayGap = Math.floor(hourGap / 24);

    if (dayGap > 7) {
      return `${Math.floor(dayGap / 7)}w past`;
    } else if (dayGap > 0) {
      return `${dayGap}d past`;
    } else if (hourGap > 0) {
      return `${hourGap}h past`;
    } else {
      return 'moments ago';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-hn-orange group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-hn-orange transition-colors mb-2">
            {listing.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-semibold flex items-center gap-1">
              🏢 {listing.company}
            </span>
            <span className="flex items-center gap-1">
              📍 {listing.location}
            </span>
            {listing.remote && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                🌐 Distant OK
              </span>
            )}
          </div>
        </div>
        
        {onPinToggle && (
          <button
            onClick={() => onPinToggle(listing.id)}
            className="ml-4 text-2xl hover:scale-125 transition-transform"
            aria-label={isPinned ? 'Unpin listing' : 'Pin listing'}
          >
            {isPinned ? '⭐' : '☆'}
          </button>
        )}
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
        {listing.description}
      </p>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            ⏰ {computeTimeElapsed(listing.posted_at)}
          </span>
          {listing.salary && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">
              💰 {listing.salary}
            </span>
          )}
        </div>

        {listing.url && (
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-hn-orange to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow hover:shadow-lg transform hover:scale-105"
          >
            Examine →
          </a>
        )}
      </div>
    </div>
  );
}
