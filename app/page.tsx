'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Match {
  id: string;
  home: string;
  away: string;
  league: string;
  sport: string;
  betType: string;
  confidence: number;
  odds: string;
  status: string;
  time: string;
  roi: number;
  accuracy: number;
  valuePercentage: number;
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    avgConfidence: 0,
    avgROI: 0,
    valueBets: 0
  });

  const loadMatches = async () => {
    setLoading(true);
    try {
      // Load filter settings from localStorage
      const savedSettings = localStorage.getItem('filterSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {
        minConfidence: 0,
        showAllLeagues: true,
        sports: ['football', 'basketball', 'tennis', 'hockey'],
        requireFullStats: false,
        matchStatus: ['live', 'scheduled'],
        betTypes: ['1X2', 'BTTS', 'Over/Under', 'Handicap', 'Corners', 'Cards'],
        minOdds: 1.01,
        maxOdds: 100,
        minROI: -100,
        minAccuracy: 0,
        minSampleSize: 0,
        showArchive: false,
        daysBack: 7,
        matchTime: ['prematch', 'live'],
        onlyValueBets: false,
        minValuePercentage: 0,
      };

      // Build query params
      const params = new URLSearchParams({
        minConfidence: settings.minConfidence.toString(),
        showAllLeagues: settings.showAllLeagues.toString(),
        sports: settings.sports.join(','),
        requireFullStats: settings.requireFullStats.toString(),
        matchStatus: settings.matchStatus.join(','),
        betTypes: settings.betTypes.join(','),
        minOdds: settings.minOdds.toString(),
        maxOdds: settings.maxOdds.toString(),
        minROI: settings.minROI.toString(),
        minAccuracy: settings.minAccuracy.toString(),
        minSampleSize: settings.minSampleSize.toString(),
        showArchive: settings.showArchive.toString(),
        daysBack: settings.daysBack.toString(),
        matchTime: settings.matchTime.join(','),
        onlyValueBets: settings.onlyValueBets.toString(),
        minValuePercentage: settings.minValuePercentage.toString(),
      });

      const response = await fetch(`/api/matches?${params}`);
      const data = await response.json();

      console.log('✅ Loaded data:', data);
      
      if (data.success) {
        setMatches(data.matches || []);
        
        // Calculate stats
        const avgConf = data.matches.length > 0
          ? data.matches.reduce((sum: number, m: Match) => sum + m.confidence, 0) / data.matches.length
          : 0;
        const avgRoi = data.matches.length > 0
          ? data.matches.reduce((sum: number, m: Match) => sum + m.roi, 0) / data.matches.length
          : 0;
        const valueBetsCount = data.matches.filter((m: Match) => m.valuePercentage > 10).length;

        setStats({
          totalMatches: data.count,
          avgConfidence: Math.round(avgConf),
          avgROI: Math.round(avgRoi),
          valueBets: valueBetsCount
        });
      }
    } catch (error) {
      console.error('❌ Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
    
    // Reload when settings change
    const handleSettingsChange = () => {
      console.log('⚙️ Settings changed, reloading...');
      loadMatches();
    };
    window.addEventListener('settingsChanged', handleSettingsChange);
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadMatches, 60000);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'scheduled': return 'bg-blue-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    if (confidence >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Betting AI
                </h1>
                <p className="text-xs text-gray-400">Zaawansowana platforma AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-400">Live</span>
              </div>
              <Link 
                href="/settings" 
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition flex items-center gap-2 font-semibold"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Ustawienia</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-xl border border-blue-700/50">
            <div className="text-sm text-blue-300 mb-1">Wszystkie mecze</div>
            <div className="text-3xl font-bold text-blue-400">{stats.totalMatches}</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-xl border border-green-700/50">
            <div className="text-sm text-green-300 mb-1">Śr. pewność</div>
            <div className="text-3xl font-bold text-green-400">{stats.avgConfidence}%</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-xl border border-purple-700/50">
            <div className="text-sm text-purple-300 mb-1">Śr. ROI</div>
            <div className={`text-3xl font-bold ${stats.avgROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.avgROI > 0 ? '+' : ''}{stats.avgROI}%
            </div>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 p-4 rounded-xl border border-cyan-700/50">
            <div className="text-sm text-cyan-300 mb-1">Value Bets</div>
            <div className="text-3xl font-bold text-cyan-400">{stats.valueBets}</div>
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Ładowanie meczów...</p>
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">Brak meczów</h3>
            <p className="text-gray-400 mb-6">
              Nie znaleziono meczów spełniających wybrane filtry.
            </p>
            <Link 
              href="/settings"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              ⚙️ Zmień ustawienia filtrów
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📋 Znalezione mecze ({matches.length})</h2>
              <button 
                onClick={loadMatches}
                className="text-sm text-gray-400 hover:text-white transition flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Odśwież</span>
              </button>
            </div>

            {matches.map((match) => (
              <div 
                key={match.id}
                className="bg-gray-800/50 hover:bg-gray-800/70 rounded-xl border border-gray-700 p-4 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Match Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(match.status)}`}>
                        {match.status === 'live' ? '🔴 LIVE' : match.status === 'scheduled' ? '📅 Nadchodzi' : '✅ Zakończony'}
                      </span>
                      <span className="text-sm text-gray-400">{match.league}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{match.sport}</span>
                    </div>

                    {/* Teams */}
                    <div className="font-bold text-lg mb-2">
                      {match.home} <span className="text-gray-500">vs</span> {match.away}
                    </div>

                    {/* Bet Info */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Typ:</span>
                        <span className="font-semibold text-purple-400">{match.betType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Kurs:</span>
                        <span className="font-semibold text-yellow-400">{match.odds}</span>
                      </div>
                      {match.valuePercentage > 10 && (
                        <div className="bg-cyan-500/20 px-2 py-1 rounded text-cyan-400 font-semibold">
                          💎 Value +{match.valuePercentage}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-3xl font-bold ${getConfidenceColor(match.confidence)}`}>
                      {match.confidence}%
                    </div>
                    <div className="text-xs text-gray-400">Pewność</div>
                    {match.roi >= 0 ? (
                      <div className="text-sm font-semibold text-green-400">
                        ROI: +{match.roi}%
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-red-400">
                        ROI: {match.roi}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>Ostatnia aktualizacja: {new Date().toLocaleTimeString('pl-PL')}</p>
        <p className="mt-2">
          💡 Dane odświeżają się automatycznie co minutę. 
          <Link href="/settings" className="text-blue-400 hover:underline ml-2">
            Zmień filtry →
          </Link>
        </p>
      </div>
    </div>
  );
}
