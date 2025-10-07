'use client';

import { useEffect, useState } from 'react';
import { Match } from '@/lib/utils/types';

export default function LiveMatchCenter() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 30000); // 30s updates
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const response = await fetch('/api/live');
      const data = await response.json();
      setLiveMatches(data.matches || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live matches:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></span>
          Live Matches
        </h2>
        <span className="text-slate-400 text-sm">{liveMatches.length} mecze na żywo</span>
      </div>

      <div className="space-y-4">
        {liveMatches.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">Brak meczów na żywo</p>
            <p className="text-sm mt-2">Sprawdź zakładkę "Mecze" dla nadchodzących spotkań</p>
          </div>
        ) : (
          liveMatches.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-900/70 transition-all cursor-pointer border border-slate-700/50 hover:border-blue-500/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400">{match.competition.name}</span>
        <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400">
          {match.status === 'LIVE' ? '⚡ LIVE' : match.status}
        </span>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-white">{match.homeTeam.name}</p>
          <p className="text-xs text-slate-400 mt-1">{match.homeTeam.form}</p>
        </div>

        <div className="text-center">
          {match.score ? (
            <div className="text-3xl font-bold text-white">
              {match.score.home} - {match.score.away}
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              {match.date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        <div className="text-left">
          <p className="font-semibold text-white">{match.awayTeam.name}</p>
          <p className="text-xs text-slate-400 mt-1">{match.awayTeam.form}</p>
        </div>
      </div>

      {match.odds && (
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">1</p>
            <p className="font-semibold text-blue-400">{match.odds.home.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">X</p>
            <p className="font-semibold text-blue-400">{match.odds.draw.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">2</p>
            <p className="font-semibold text-blue-400">{match.odds.away.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 animate-pulse">
      <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900/50 rounded-lg p-4 h-32"></div>
        ))}
      </div>
    </div>
  );
}
