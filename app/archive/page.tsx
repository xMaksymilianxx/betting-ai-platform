'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ArchivePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalPredictions: 0,
    uniqueLeagues: 0
  });
  
  const [filters, setFilters] = useState({
    league: '',
    team: '',
    dateFrom: '',
    dateTo: '',
    limit: 50
  });

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.league) params.set('league', filters.league);
      if (filters.team) params.set('team', filters.team);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      params.set('limit', filters.limit.toString());

      const response = await fetch(`/api/archive?${params}`);
      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">📚 Archiwum Meczów</h1>
              <p className="text-sm text-gray-400">Historia zakończonych meczów</p>
            </div>
            <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
              ← Powrót
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Mecze w archiwum</div>
            <div className="text-3xl font-bold text-blue-400">{stats.totalMatches}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Predykcje AI</div>
            <div className="text-3xl font-bold text-green-400">{stats.totalPredictions}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Unikalne ligi</div>
            <div className="text-3xl font-bold text-purple-400">{stats.uniqueLeagues}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-bold mb-4">🔍 Filtry</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Liga</label>
              <input
                type="text"
                placeholder="np. Premier League"
                value={filters.league}
                onChange={(e) => setFilters({...filters, league: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Drużyna</label>
              <input
                type="text"
                placeholder="np. Manchester United"
                value={filters.team}
                onChange={(e) => setFilters({...filters, team: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Data od</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Data do</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={fetchArchive}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition font-medium"
            >
              {loading ? '🔄 Ładowanie...' : '🔍 Szukaj'}
            </button>
            <button
              onClick={() => {
                setFilters({ league: '', team: '', dateFrom: '', dateTo: '', limit: 50 });
                fetchArchive();
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
            >
              ❌ Wyczyść
            </button>
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">📋 Znalezione mecze ({matches.length})</h2>

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Pobieranie z archiwum...</p>
            </div>
          )}

          {!loading && matches.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg">Brak meczów w archiwum</p>
              <p className="text-sm">Zmień filtry lub poczekaj na zakończone mecze</p>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Liga</th>
                    <th className="text-left p-3">Gospodarz</th>
                    <th className="text-center p-3">Wynik</th>
                    <th className="text-left p-3">Gość</th>
                    <th className="text-center p-3">Kursy</th>
                    <th className="text-center p-3">Gole</th>
                    <th className="text-center p-3">BTTS</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                      <td className="p-3">
                        {new Date(match.match_date).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="p-3 text-gray-400">{match.league}</td>
                      <td className="p-3 font-semibold">{match.home_team}</td>
                      <td className="p-3 text-center">
                        <span className="text-xl font-bold text-blue-400">
                          {match.final_score_home} - {match.final_score_away}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">{match.away_team}</td>
                      <td className="p-3 text-center text-xs">
                        <div>{match.odds_home} / {match.odds_draw} / {match.odds_away}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          match.total_goals >= 3 ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {match.total_goals}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {match.btts ? '✅' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
