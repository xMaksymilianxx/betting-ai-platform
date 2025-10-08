'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [stats, setStats] = useState({
    count: 0,
    liveCount: 0,
    avgQuality: 0
  });

  // Fetch matches from /api/matches
  const fetchMatches = async () => {
    setLoading(true);
    console.log('🔍 Fetching matches...');
    
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();

      console.log('📦 Response:', data);

      if (data.success && data.matches) {
        setMatches(data.matches);
        
        const liveCount = data.matches.filter((m: any) => m.status === 'live').length;
        const avgQuality = data.matches.length > 0
          ? data.matches.reduce((sum: number, m: any) => sum + (m.dataQuality || 0), 0) / data.matches.length
          : 0;
        
        setStats({
          count: data.matches.length,
          liveCount: liveCount,
          avgQuality: Math.round(avgQuality)
        });
        
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('❌ Error:', error);
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
                <h1 className="text-2xl font-bold">Betting AI Platform</h1>
                <p className="text-sm text-gray-400">Intelligent API Manager v2.0</p>
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
                <span className="text-sm text-green-400">API Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Wszystkie mecze</div>
            <div className="text-3xl font-bold text-blue-400">{stats.count}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">🔴 Live</div>
            <div className="text-3xl font-bold text-red-400">{stats.liveCount}</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Jakość danych</div>
            <div className="text-3xl font-bold text-green-400">{stats.avgQuality}%</div>
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">⚽ Mecze Live ({stats.liveCount})</h2>
            
            <button
              onClick={fetchMatches}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition font-medium"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span>{loading ? 'Ładowanie...' : 'Odśwież mecze'}</span>
            </button>
          </div>

          {matches.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg mb-2 font-medium">Kliknij "Odśwież mecze" aby załadować dane</p>
              <p className="text-sm">Multi-API system z automatycznym fallback</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Pobieranie z API-Football, Football-Data, LiveScore...</p>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      match.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
                    }`}>
                      {match.status === 'live' ? `🔴 LIVE ${match.minute}'` : match.status}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{match.league}</span>
                  </div>

                  {/* Teams & Score */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{match.home}</span>
                      <span className="text-2xl font-bold text-blue-400 ml-2">{match.homeScore ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{match.away}</span>
                      <span className="text-2xl font-bold text-blue-400 ml-2">{match.awayScore ?? '-'}</span>
                    </div>
                  </div>

                  {/* Odds */}
                  {match.odds && (
                    <div className="border-t border-gray-700 pt-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Kursy:</div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-xs text-gray-500">1</div>
                          <div className="font-bold text-green-400">{match.odds.home}</div>
                        </div>
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-xs text-gray-500">X</div>
                          <div className="font-bold text-yellow-400">{match.odds.draw}</div>
                        </div>
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-xs text-gray-500">2</div>
                          <div className="font-bold text-blue-400">{match.odds.away}</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-gray-500">Over 2.5: <span className="text-white font-semibold">{match.odds.over25}</span></span>
                        <span className="text-gray-500">BTTS: <span className="text-white font-semibold">{match.odds.bttsYes}</span></span>
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  {match.statistics && (
                    <div className="border-t border-gray-700 pt-3 mt-3">
                      <div className="text-xs text-gray-400 mb-2">Statystyki:</div>
                      <div className="space-y-1 text-xs">
                        {match.statistics.possession && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Posiadanie:</span>
                            <span className="text-white font-semibold">
                              {match.statistics.possession.home}% - {match.statistics.possession.away}%
                            </span>
                          </div>
                        )}
                        {match.statistics.shots && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Strzały:</span>
                            <span className="text-white font-semibold">
                              {match.statistics.shots.home} - {match.statistics.shots.away}
                            </span>
                          </div>
                        )}
                        {match.statistics.corners && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Rożne:</span>
                            <span className="text-white font-semibold">
                              {match.statistics.corners.home} - {match.statistics.corners.away}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data Quality Badge */}
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Źródła: {match.dataSources?.join(', ')}</span>
                      <span className={`px-2 py-1 rounded font-semibold ${
                        match.dataQuality >= 80 ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {match.dataQuality}% Quality
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔥 Powered by Intelligent API Manager</p>
          <p className="mt-1">Auto-fallback: API-Football → Football-Data → LiveScore-API</p>
          <p className="mt-2">
            <Link href="/predictions" className="text-blue-400 hover:underline">
              Zobacz predykcje AI →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
