'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    league: '',
    minConfidence: 0,
    minValue: 0
  });
  const [aiPredictions, setAIPredictions] = useState<any>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.matches);
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
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeam: match.home,
          awayTeam: match.away,
          league: match.league,
          matchId: match.id,
          currentOdds: {
            home: match.odds?.home || 2.0,
            draw: match.odds?.draw || 3.0,
            away: match.odds?.away || 2.5,
            over25: match.odds?.over25 || 2.0,
            bttsYes: match.odds?.bttsYes || 1.8
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
        alert(`✅ Wygenerowano ${data.predictions.length} predykcji AI!`);
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

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredMatches = matches.filter(match => {
    if (filters.country && !match.country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.league && !match.league?.toLowerCase().includes(filters.league.toLowerCase())) return false;
    if (match.confidence < filters.minConfidence) return false;
    if (match.valuePercentage < filters.minValue) return false;
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
                  ⚽ AI Betting Platform
                </h1>
                <p className="text-sm text-gray-400">Real-time predictions powered by AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/archive"
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm font-medium"
              >
                📚 Archiwum
              </Link>
              
              <button
                onClick={fetchMatches}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition font-medium"
              >
                {loading ? '🔄 Ładowanie...' : '🔄 Odśwież'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-4 mb-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-3">🔍 Filtry</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
              <label className="block text-xs text-gray-400 mb-1">Min. Confidence: {filters.minConfidence}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minConfidence}
                onChange={(e) => setFilters({...filters, minConfidence: parseInt(e.target.value)})}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Min. Value: {filters.minValue}%</label>
              <input
                type="range"
                min="0"
                max="50"
                value={filters.minValue}
                onChange={(e) => setFilters({...filters, minValue: parseInt(e.target.value)})}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setFilters({ country: '', league: '', minConfidence: 0, minValue: 0 })}
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

        {/* Matches Grid */}
        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">⚽</div>
            <p className="text-lg">Brak meczów spełniających kryteria</p>
            <p className="text-sm">Zmień filtry lub poczekaj na nowe dane</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition"
            >
              {/* League & Time */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-gray-400">
                  {match.country} • {match.league}
                </div>
                <div className="text-xs font-bold text-blue-400">
                  {new Date(match.time).toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
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

              {/* Statistics */}
              {match.statistics && (
                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                  {match.statistics.possession && (
                    <div className="text-center">
                      <div className="text-gray-400">Posiadanie</div>
                      <div className="font-bold">{match.statistics.possession.home}% - {match.statistics.possession.away}%</div>
                    </div>
                  )}
                  {match.statistics.shots && (
                    <div className="text-center">
                      <div className="text-gray-400">Strzały</div>
                      <div className="font-bold">{match.statistics.shots.home} - {match.statistics.shots.away}</div>
                    </div>
                  )}
                  {match.statistics.corners && (
                    <div className="text-center">
                      <div className="text-gray-400">Rożne</div>
                      <div className="font-bold">{match.statistics.corners.home} - {match.statistics.corners.away}</div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Predictions */}
              {aiPredictions[match.id] && aiPredictions[match.id].length > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
                  <div className="text-sm font-bold mb-2 flex items-center gap-2">
                    🧠 AI Predictions
                  </div>
                  
                  <div className="space-y-2">
                    {aiPredictions[match.id].map((pred: any, idx: number) => (
                      <div key={idx} className="bg-black/30 p-2 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{pred.type}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            pred.confidence >= 70 ? 'bg-green-600' :
                            pred.confidence >= 50 ? 'bg-yellow-600' : 'bg-gray-600'
                          }`}>
                            {pred.confidence}%
                          </span>
                        </div>
                        
                        <div className="text-lg font-bold text-blue-400 mb-1">
                          {pred.prediction} @ {pred.recommendedOdds}
                        </div>
                        
                        <div className="text-xs text-gray-400 space-y-0.5">
                          {pred.reasoning.map((reason: string, i: number) => (
                            <div key={i}>• {reason}</div>
                          ))}
                        </div>
                        
                        {pred.expectedValue > 0 && (
                          <div className="mt-1 text-xs font-bold text-green-400">
                            💎 Value Bet: +{pred.expectedValue}%
                          </div>
                        )}
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
                {loadingAI === match.id ? '🔄 Analizuję...' : '🧠 Generuj Predykcje AI'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
