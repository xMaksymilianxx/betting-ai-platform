'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    count: 0,
    avgConfidence: 0,
    avgROI: 0,
    valueBets: 0
  });

  // Manual fetch function
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches?minConfidence=0&showAllLeagues=true');
      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
        
        // Calculate stats
        const avgConf = data.matches.reduce((acc: number, m: any) => acc + m.confidence, 0) / (data.matches.length || 1);
        const avgRoi = data.matches.reduce((acc: number, m: any) => acc + m.roi, 0) / (data.matches.length || 1);
        const valueBets = data.matches.filter((m: any) => m.valuePercentage >= 10).length;
        
        setStats({
          count: data.matches.length,
          avgConfidence: Math.round(avgConf),
          avgROI: Math.round(avgRoi),
          valueBets
        });
        
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Betting AI</h1>
                <p className="text-sm text-gray-400">Zaawansowana platforma AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <span className="text-xs text-gray-400">
                  {lastUpdate.toLocaleTimeString('pl-PL')}
                </span>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
              <Link href="/ml-stats" className="p-2 hover:bg-gray-700 rounded-lg transition">
                🧠
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Mecze</div>
            <div className="text-3xl font-bold text-blue-400">{stats.count}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Śr. pewność</div>
            <div className="text-3xl font-bold text-green-400">{stats.avgConfidence}%</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Śr. ROI</div>
            <div className="text-3xl font-bold text-purple-400">+{stats.avgROI}%</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Value Bets</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.valueBets}</div>
          </div>
        </div>

        {/* Matches */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">📋 Znalezione mecze ({stats.count})</h2>
            
            {/* REFRESH BUTTON */}
            <button
              onClick={fetchMatches}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span>{loading ? 'Ładowanie...' : 'Odśwież'}</span>
            </button>
          </div>

          {/* Empty State */}
          {matches.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg mb-2">Kliknij "Odśwież" aby załadować mecze</p>
              <p className="text-sm">Oszczędzaj limity API używając ręcznego odświeżania</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Pobieranie meczów...</p>
            </div>
          )}

          {/* Matches Grid */}
          {!loading && matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      match.status === 'live' ? 'bg-red-500' : 'bg-gray-600'
                    }`}>
                      {match.status === 'live' ? `LIVE ${match.minute}'` : 'Scheduled'}
                    </span>
                    <span className="text-xs text-gray-400">{match.league}</span>
                  </div>

                  {/* Teams */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{match.home}</span>
                      {match.homeScore !== undefined && (
                        <span className="text-2xl font-bold text-blue-400">{match.homeScore}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{match.away}</span>
                      {match.awayScore !== undefined && (
                        <span className="text-2xl font-bold text-blue-400">{match.awayScore}</span>
                      )}
                    </div>
                  </div>

                  {/* Prediction */}
                  <div className="border-t border-gray-700 pt-3">
                    <div className="text-sm text-gray-400 mb-1">Typ: {match.betType}</div>
                    <div className="text-lg font-bold text-blue-300 mb-2">{match.prediction}</div>
                    
                    {/* Confidence */}
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400 mb-1">{match.confidence}%</div>
                      <div className="text-xs text-gray-400">Pewność AI</div>
                    </div>

                    {/* Odds & ROI */}
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-400">Kurs: {match.odds}</span>
                      <span className="text-green-400">ROI: +{match.roi}%</span>
                    </div>

                    {/* Value Badge */}
                    {match.valuePercentage >= 10 && (
                      <div className="mt-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-300">
                        💎 Value +{match.valuePercentage}%
                      </div>
                    )}

                    {/* Reasoning */}
                    {match.reasoning && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        {match.reasoning}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Kliknij "Odśwież" aby zaktualizować dane</p>
          <p className="mt-1">
            <Link href="/ml-stats" className="text-blue-400 hover:underline">
              Zobacz statystyki ML 🧠
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
