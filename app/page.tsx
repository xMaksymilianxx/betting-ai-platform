'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  
  const [filters, setFilters] = useState({
    country: '',
    league: '',
    dateRange: 'today', // today, tomorrow, week
    status: 'all', // all, live, prematch, finished
    minConfidence: 0,
    minValue: 0
  });
  
  const [aiPredictions, setAIPredictions] = useState<any>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build query params
      const params = new URLSearchParams();
      
      // Date range
      if (filters.dateRange === 'today') {
        params.set('date', new Date().toISOString().split('T')[0]);
      } else if (filters.dateRange === 'tomorrow') {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        params.set('date', tomorrow);
      } else if (filters.dateRange === 'week') {
        params.set('days', '7');
      }
      
      // Status filter
      if (filters.status !== 'all') {
        params.set('status', filters.status);
      }
      
      const response = await fetch(`/api/matches?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.matches);
        setLastUpdate(new Date().toLocaleTimeString('pl-PL'));
        setApiCallsUsed(prev => prev + 1);
      } else {
        setError(data.error || 'Błąd pobierania danych');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPredictions = async (match: any) => {
    setLoadingAI(match.id);
    try {
      const response = await fetch('/api/predictions/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeam: match.home,
          awayTeam: match.away,
          league: match.league,
          matchId: match.id,
          matchDate: match.time,
          isLive: match.status === 'live',
          currentOdds: {
            home: match.odds?.home,
            draw: match.odds?.draw,
            away: match.odds?.away,
            over05: match.odds?.over05,
            over15: match.odds?.over15,
            over25: match.odds?.over25,
            over35: match.odds?.over35,
            over45: match.odds?.over45,
            under05: match.odds?.under05,
            under15: match.odds?.under15,
            under25: match.odds?.under25,
            under35: match.odds?.under35,
            under45: match.odds?.under45,
            bttsYes: match.odds?.bttsYes,
            bttsNo: match.odds?.bttsNo,
          },
          liveStats: match.statistics
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAIPredictions(prev => ({
          ...prev,
          [match.id]: data.predictions
        }));
        setApiCallsUsed(prev => prev + 1);
      } else {
        alert(`❌ Błąd: ${data.error}`);
      }
    } catch (error) {
      console.error('AI Error:', error);
      alert('❌ Błąd generowania predykcji');
    } finally {
      setLoadingAI(null);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filters.country && !match.country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.league && !match.league?.toLowerCase().includes(filters.league.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ⚽ AI Betting Platform Pro
                </h1>
                <p className="text-sm text-gray-400">
                  Real-time + Prematch predictions • All markets
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* API Calls Counter */}
              <div className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-sm">
                <span className="text-gray-400">API Calls:</span>
                <span className="ml-2 font-bold text-blue-400">{apiCallsUsed}</span>
                <span className="text-gray-500 ml-1">/ 100</span>
              </div>
              
              {lastUpdate && (
                <div className="text-xs text-gray-500">
                  Last update: {lastUpdate}
                </div>
              )}
              
              <Link
                href="/archive"
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm font-medium"
              >
                📚 Archiwum
              </Link>
              
              <Link
                href="/dashboard"
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm font-medium"
              >
                📊 Dashboard
              </Link>
              
              <button
                onClick={fetchMatches}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition font-medium"
              >
                {loading ? '🔄 Ładowanie...' : '🔄 Odśwież Mecze'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-4 mb-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-3">🔍 Filtry i Opcje</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kraj</label>
              <input
                type="text"
                placeholder="np. England"
                value={filters.country}
                onChange={(e) => setFilters({...filters, country: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Liga</label>
              <input
                type="text"
                placeholder="np. Premier League"
                value={filters.league}
                onChange={(e) => setFilters({...filters, league: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Zakres Dat</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              >
                <option value="today">📅 Dzisiaj</option>
                <option value="tomorrow">📅 Jutro</option>
                <option value="week">📅 Najbliższy Tydzień</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Status Meczu</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white"
              >
                <option value="all">🌐 Wszystkie</option>
                <option value="live">🔴 Na Żywo</option>
                <option value="prematch">⏰ Przedmeczowe</option>
                <option value="finished">✅ Zakończone</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ 
                country: '', 
                league: '', 
                dateRange: 'today',
                status: 'all',
                minConfidence: 0, 
                minValue: 0 
              })}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              ❌ Wyczyść filtry
            </button>
            <div className="text-sm text-gray-400 flex items-center">
              Znaleziono: <span className="font-bold ml-1 text-blue-400">{filteredMatches.length}</span> meczów
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Pobieranie meczów...</p>
          </div>
        )}

        {/* Empty State - First Load */}
        {!loading && matches.length === 0 && !lastUpdate && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">⚽</div>
            <p className="text-lg mb-2">Kliknij "Odśwież Mecze" aby załadować dane</p>
            <p className="text-sm">Ręczne odświeżanie oszczędza limity API</p>
          </div>
        )}

        {/* Empty State - No Matches */}
        {!loading && filteredMatches.length === 0 && lastUpdate && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg">Brak meczów spełniających kryteria</p>
            <p className="text-sm">Zmień filtry lub zakres dat</p>
          </div>
        )}

        {/* Matches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-400">
                  {match.country} • {match.league}
                </div>
                <div className="flex items-center gap-2">
                  {match.status === 'live' && (
                    <span className="px-2 py-0.5 bg-red-600 text-xs font-bold rounded animate-pulse">
                      🔴 LIVE
                    </span>
                  )}
                  <div className="text-xs font-bold text-blue-400">
                    {new Date(match.time).toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Teams */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">{match.home}</div>
                  {match.score && (
                    <div className="text-2xl font-bold text-blue-400">{match.score.home}</div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">{match.away}</div>
                  {match.score && (
                    <div className="text-2xl font-bold text-blue-400">{match.score.away}</div>
                  )}
                </div>
              </div>

              {/* Odds */}
              {match.odds && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-700/50 rounded p-2 text-center">
                    <div className="text-xs text-gray-400">1</div>
                    <div className="font-bold">{match.odds.home}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded p-2 text-center">
                    <div className="text-xs text-gray-400">X</div>
                    <div className="font-bold">{match.odds.draw}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded p-2 text-center">
                    <div className="text-xs text-gray-400">2</div>
                    <div className="font-bold">{match.odds.away}</div>
                  </div>
                </div>
              )}

              {/* AI Predictions */}
              {aiPredictions[match.id] && aiPredictions[match.id].length > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30 max-h-96 overflow-y-auto">
                  <div className="text-sm font-bold mb-2 flex items-center gap-2">
                    🧠 AI Predictions ({aiPredictions[match.id].length} markets)
                  </div>
                  
                  <div className="space-y-2">
                    {aiPredictions[match.id].map((pred: any, idx: number) => (
                      <div key={idx} className="bg-black/30 p-2 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs">{pred.market}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              pred.confidence >= 70 ? 'bg-green-600' :
                              pred.confidence >= 55 ? 'bg-yellow-600' : 'bg-gray-600'
                            }`}>
                              {pred.confidence}%
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              pred.risk === 'low' ? 'bg-green-700' :
                              pred.risk === 'medium' ? 'bg-yellow-700' : 'bg-red-700'
                            }`}>
                              {pred.risk.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm font-bold text-blue-400 mb-1">
                          {pred.prediction} @ {pred.recommendedOdds} • Stake: {pred.stakeSize}u
                        </div>
                        
                        {pred.expectedValue > 0 && (
                          <div className="text-xs font-bold text-green-400 mb-1">
                            💎 Value: +{pred.expectedValue}% • {pred.timing}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-400">
                          {pred.reasoning[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Button */}
              <button
                onClick={() => generateAIPredictions(match)}
                disabled={loadingAI === match.id}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg transition font-medium"
              >
                {loadingAI === match.id ? '🔄 Analizuję wszystkie rynki...' : '🧠 Generuj Predykcje AI (Wszystkie Rynki)'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
