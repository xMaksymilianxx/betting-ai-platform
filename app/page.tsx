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
    dateRange: 'today',
    status: 'all'
  });
  
  const [aiPredictions, setAIPredictions] = useState<any>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      
      let dateFrom = '';
      let dateTo = '';
      
      if (filters.dateRange === 'today') {
        dateFrom = new Date().toISOString().split('T')[0];
        dateTo = dateFrom;
      } else if (filters.dateRange === 'tomorrow') {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        dateFrom = tomorrow.toISOString().split('T')[0];
        dateTo = dateFrom;
      } else if (filters.dateRange === 'week') {
        dateFrom = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        dateTo = nextWeek.toISOString().split('T')[0];
      }
      
      params.set('dateFrom', dateFrom);
      params.set('dateTo', dateTo);
      
      if (filters.status === 'live') {
        params.set('live', '1');
      } else if (filters.status === 'prematch') {
        params.set('status', 'NS');
      } else if (filters.status === 'finished') {
        params.set('status', 'FT');
      }
      
      console.log(`🔍 Fetching:`, Object.fromEntries(params));
      
      const response = await fetch(`/api/matches?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Got ${data.matches?.length || 0} matches`);
        setMatches(data.matches || []);
        setLastUpdate(new Date().toLocaleTimeString('pl-PL'));
        setApiCallsUsed(prev => prev + 1);
      } else {
        setError(data.error || 'Błąd pobierania');
        setMatches([]);
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(`Błąd: ${err.message || 'Unknown'}`);
      setMatches([]);
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
            home: match.odds?.home || 2.0,
            draw: match.odds?.draw || 3.5,
            away: match.odds?.away || 3.5,
            over15: match.odds?.over15 || 1.3,
            under15: match.odds?.under15 || 3.5,
            over25: match.odds?.over25 || 1.8,
            under25: match.odds?.under25 || 2.0,
            over35: match.odds?.over35 || 2.5,
            under35: match.odds?.under35 || 1.5,
            bttsYes: match.odds?.bttsYes || 1.9,
            bttsNo: match.odds?.bttsNo || 1.9,
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
      alert('❌ Błąd AI');
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
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ⚽ AI Betting Pro
              </h1>
              <p className="text-sm text-gray-400">Prematch + Live • All Markets</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-gray-700/50 rounded-lg text-sm">
                <span className="text-gray-400">API:</span>
                <span className="ml-2 font-bold text-blue-400">{apiCallsUsed}</span>
                <span className="text-gray-500">/100</span>
              </div>
              
              {lastUpdate && (
                <div className="text-xs text-gray-500">{lastUpdate}</div>
              )}
              
              <Link href="/archive" className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">📚</Link>
              <Link href="/dashboard" className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">📊</Link>
              
              <button
                onClick={fetchMatches}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium"
              >
                {loading ? '🔄 Loading...' : '🔄 Odśwież'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-800/30 rounded-xl p-4 mb-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-3">🔍 Filtry</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Kraj</label>
              <input
                type="text"
                placeholder="England"
                value={filters.country}
                onChange={(e) => setFilters({...filters, country: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Liga</label>
              <input
                type="text"
                placeholder="Premier League"
                value={filters.league}
                onChange={(e) => setFilters({...filters, league: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Data</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              >
                <option value="today">📅 Dzisiaj</option>
                <option value="tomorrow">📅 Jutro</option>
                <option value="week">📅 Tydzień</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              >
                <option value="all">🌐 Wszystkie</option>
                <option value="live">🔴 Live</option>
                <option value="prematch">⏰ Prematch</option>
                <option value="finished">✅ Finished</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilters({ country: '', league: '', dateRange: 'today', status: 'all' })}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              ❌ Reset
            </button>
            <div className="text-sm text-gray-400 flex items-center">
              Znaleziono: <span className="font-bold ml-1 text-blue-400">{filteredMatches.length}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Pobieranie...</p>
          </div>
        )}

        {!loading && matches.length === 0 && !lastUpdate && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">⚽</div>
            <p className="text-lg">Kliknij "Odśwież" aby załadować mecze</p>
          </div>
        )}

        {!loading && filteredMatches.length === 0 && lastUpdate && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg">Brak meczów</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMatches.map((match) => (
            <div key={match.id} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-400">
                  {match.country} • {match.league}
                </div>
                <div className="flex items-center gap-2">
                  {match.status === 'live' && (
                    <span className="px-2 py-0.5 bg-red-600 text-xs font-bold rounded animate-pulse">🔴 LIVE</span>
                  )}
                  <div className="text-xs font-bold text-blue-400">
                    {new Date(match.time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">{match.home}</div>
                  {match.score && <div className="text-2xl font-bold text-blue-400">{match.score.home}</div>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">{match.away}</div>
                  {match.score && <div className="text-2xl font-bold text-blue-400">{match.score.away}</div>}
                </div>
              </div>

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

              {aiPredictions[match.id] && aiPredictions[match.id].length > 0 && (
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                  {aiPredictions[match.id].map((pred: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg border border-purple-500/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{pred.market}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            pred.risk === 'low' ? 'bg-green-600' : pred.risk === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {pred.risk.toUpperCase()}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          pred.confidence >= 70 ? 'bg-green-600' : pred.confidence >= 55 ? 'bg-yellow-600' : 'bg-gray-600'
                        }`}>
                          {pred.confidence}%
                        </span>
                      </div>

                      <div className="mb-3 p-3 bg-black/30 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">💡 Typ:</div>
                        <div className="text-xl font-bold text-blue-400">{pred.prediction}</div>
                        <div className="text-sm text-gray-400 mt-1">@ {pred.recommendedOdds} • Stawka: {pred.stakeSize}u</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2 bg-black/20 rounded">
                          <div className="text-xs text-gray-400">Implied</div>
                          <div className="text-sm font-bold">{pred.features?.impliedProbability || 'N/A'}%</div>
                        </div>
                        <div className="p-2 bg-black/20 rounded">
                          <div className="text-xs text-gray-400">Real</div>
                          <div className="text-sm font-bold text-green-400">{pred.features?.realProbability || pred.confidence}%</div>
                        </div>
                        <div className="p-2 bg-black/20 rounded">
                          <div className="text-xs text-gray-400">EV</div>
                          <div className={`text-sm font-bold ${pred.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pred.expectedValue > 0 ? '+' : ''}{pred.expectedValue}%
                          </div>
                        </div>
                        <div className="p-2 bg-black/20 rounded">
                          <div className="text-xs text-gray-400">Value</div>
                          <div className={`text-sm font-bold ${pred.valuePercentage > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                            {pred.valuePercentage > 0 ? '+' : ''}{pred.valuePercentage}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-300 mb-1">📋 Analiza:</div>
                        {pred.reasoning.map((reason: string, i: number) => (
                          <div key={i} className="text-xs text-gray-400 bg-black/20 p-2 rounded">{reason}</div>
                        ))}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          pred.timing === 'live' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
                        }`}>
                          {pred.timing === 'live' ? '🔴 LIVE' : '⏰ PREMATCH'}
                        </span>
                        {pred.expectedValue > 5 && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-gradient-to-r from-yellow-600 to-orange-600 animate-pulse">
                            💎 VALUE
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => generateAIPredictions(match)}
                disabled={loadingAI === match.id}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-medium"
              >
                {loadingAI === match.id ? '🔄 Analizuję...' : '🧠 Generuj AI'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
