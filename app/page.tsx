'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MatchCard from '@/components/MatchCard';
import FilterPanel from '@/components/FilterPanel';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    minConfidence: 0,
    showAllLeagues: true,
    sports: ['football'],
    matchStatus: ['live', 'scheduled'],
    betTypes: ['1X2', 'Over/Under', 'BTTS'],
    minOdds: 1.01,
    maxOdds: 100,
    matchTime: ['prematch', 'live'],
    onlyValueBets: false,
    minValuePercentage: 0
  });
  const [stats, setStats] = useState({
    count: 0,
    avgConfidence: 0,
    avgROI: 0,
    valueBets: 0
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Manual fetch function
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        minConfidence: filters.minConfidence.toString(),
        showAllLeagues: filters.showAllLeagues.toString(),
        sports: filters.sports.join(','),
        matchStatus: filters.matchStatus.join(','),
        betTypes: filters.betTypes.join(','),
        minOdds: filters.minOdds.toString(),
        maxOdds: filters.maxOdds.toString(),
        matchTime: filters.matchTime.join(','),
        onlyValueBets: filters.onlyValueBets.toString(),
        minValuePercentage: filters.minValuePercentage.toString()
      });

      const response = await fetch(`/api/matches?${params}`);
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
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load (empty - user must click refresh)
  useEffect(() => {
    // Don't auto-load to save API calls
  }, []);

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
                  Ostatnia aktualizacja: {lastUpdate.toLocaleTimeString('pl-PL')}
                </span>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
              <Link href="/ml-stats" className="p-2 hover:bg-gray-700 rounded-lg transition">
                🧠
              </Link>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition">
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Wszystkie mecze</div>
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

        {/* Filters */}
        <FilterPanel filters={filters} setFilters={setFilters} />

        {/* Matches List */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📋</span>
              <span>Znalezione mecze ({stats.count})</span>
            </h2>
            
            {/* MANUAL REFRESH BUTTON */}
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

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Pobieranie meczów z API...</p>
            </div>
          )}

          {/* Matches Grid */}
          {!loading && matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Dane odświeżają się manualnie. Kliknij "Odśwież" aby zaktualizować.</p>
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
