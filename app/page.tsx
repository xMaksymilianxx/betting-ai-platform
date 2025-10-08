'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // FILTRY WYŁĄCZONE DOMYŚLNIE (wszystko na 0/false)
  const [filters, setFilters] = useState({
    minConfidence: 0,  // ZMIENIONE Z 60 NA 0
    showAllLeagues: true,
    sports: ['football', 'basketball', 'tennis'],
    matchStatus: ['live', 'scheduled'],
    betTypes: ['1X2', 'Over/Under', 'BTTS', 'Handicap', 'Corners', 'Cards'],
    minOdds: 1.01,
    maxOdds: 100,
    minROI: -100,
    minAccuracy: 0,
    minSampleSize: 0,
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

  // Manual fetch
  const fetchMatches = async () => {
    setLoading(true);
    console.log('🔍 Fetching with filters:', filters);
    
    try {
      const params = new URLSearchParams({
        minConfidence: filters.minConfidence.toString(),
        showAllLeagues: filters.showAllLeagues.toString(),
        sports: filters.sports.join(','),
        matchStatus: filters.matchStatus.join(','),
        betTypes: filters.betTypes.join(','),
        minOdds: filters.minOdds.toString(),
        maxOdds: filters.maxOdds.toString(),
        minROI: filters.minROI.toString(),
        minAccuracy: filters.minAccuracy.toString(),
        minSampleSize: filters.minSampleSize.toString(),
        matchTime: filters.matchTime.join(','),
        onlyValueBets: filters.onlyValueBets.toString(),
        minValuePercentage: filters.minValuePercentage.toString()
      });

      const response = await fetch(`/api/matches?${params}`);
      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
        
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

  // Reset filters to default (show all)
  const resetFilters = () => {
    setFilters({
      minConfidence: 0,
      showAllLeagues: true,
      sports: ['football', 'basketball', 'tennis'],
      matchStatus: ['live', 'scheduled'],
      betTypes: ['1X2', 'Over/Under', 'BTTS', 'Handicap', 'Corners', 'Cards'],
      minOdds: 1.01,
      maxOdds: 100,
      minROI: -100,
      minAccuracy: 0,
      minSampleSize: 0,
      matchTime: ['prematch', 'live'],
      onlyValueBets: false,
      minValuePercentage: 0
    });
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
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
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

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">⚙️ Ustawienia i Filtry</h3>
              <button
                onClick={resetFilters}
                className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Reset
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Min Confidence */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Min. pewność: <span className="text-white font-bold">{filters.minConfidence}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minConfidence}
                  onChange={(e) => setFilters({...filters, minConfidence: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Sports */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sporty</label>
                <div className="flex gap-2 flex-wrap">
                  {['football', 'basketball', 'tennis'].map(sport => (
                    <button
                      key={sport}
                      onClick={() => {
                        const newSports = filters.sports.includes(sport)
                          ? filters.sports.filter(s => s !== sport)
                          : [...filters.sports, sport];
                        setFilters({...filters, sports: newSports});
                      }}
                      className={`px-3 py-2 rounded font-medium ${
                        filters.sports.includes(sport)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {sport === 'football' ? '⚽' : sport === 'basketball' ? '🏀' : '🎾'} {sport}
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Status */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status meczu</label>
                <div className="flex gap-2">
                  {['live', 'scheduled'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        const newStatus = filters.matchStatus.includes(status)
                          ? filters.matchStatus.filter(s => s !== status)
                          : [...filters.matchStatus, status];
                        setFilters({...filters, matchStatus: newStatus});
                      }}
                      className={`px-4 py-2 rounded font-medium ${
                        filters.matchStatus.includes(status)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {status === 'live' ? '🔴 Live' : '📅 Scheduled'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bet Types */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Typy zakładów</label>
                <div className="flex gap-2 flex-wrap">
                  {['1X2', 'Over/Under', 'BTTS', 'Handicap', 'Corners', 'Cards'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTypes = filters.betTypes.includes(type)
                          ? filters.betTypes.filter(t => t !== type)
                          : [...filters.betTypes, type];
                        setFilters({...filters, betTypes: newTypes});
                      }}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        filters.betTypes.includes(type)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value Bets Only */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={filters.onlyValueBets}
                    onChange={(e) => setFilters({...filters, onlyValueBets: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">💎 Tylko Value Bets</span>
                </label>
                {filters.onlyValueBets && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Min. value: <span className="text-yellow-400 font-bold">{filters.minValuePercentage}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={filters.minValuePercentage}
                      onChange={(e) => setFilters({...filters, minValuePercentage: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* All Leagues */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showAllLeagues}
                    onChange={(e) => setFilters({...filters, showAllLeagues: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">🏆 Wszystkie ligi (nie tylko TOP)</span>
                </label>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-600">
              <div className="text-xs text-gray-400">
                <span className="font-bold text-white">Aktywne filtry:</span> 
                <span className="ml-2">Pewność ≥{filters.minConfidence}%</span>
                {filters.onlyValueBets && <span className="ml-2">• Value ≥{filters.minValuePercentage}%</span>}
                <span className="ml-2">• {filters.sports.length} sport(y)</span>
                <span className="ml-2">• {filters.betTypes.length} typ(ów)</span>
              </div>
            </div>
          </div>
        )}

        {/* Matches List */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">📋 Znalezione mecze ({stats.count})</h2>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                ⚙️ {showSettings ? 'Ukryj' : 'Filtry'}
              </button>
              <button
                onClick={fetchMatches}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition font-medium"
              >
                <span className={loading ? 'animate-spin' : ''}>🔄</span>
                <span>{loading ? 'Ładowanie...' : 'Odśwież'}</span>
              </button>
            </div>
          </div>

          {matches.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg mb-2 font-medium">Kliknij "Odśwież" aby załadować mecze</p>
              <p className="text-sm">Oszczędzaj limity API używając ręcznego odświeżania</p>
              <p className="text-xs text-gray-500 mt-2">Filtry domyślnie wyłączone - zobaczysz wszystkie mecze</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Pobieranie meczów z API...</p>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      match.status === 'live' ? 'bg-red-500' : 'bg-gray-600'
                    }`}>
                      {match.status === 'live' ? `LIVE ${match.minute}'` : 'Scheduled'}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{match.league}</span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{match.home}</span>
                      {match.homeScore !== undefined && (
                        <span className="text-2xl font-bold text-blue-400 ml-2">{match.homeScore}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{match.away}</span>
                      {match.awayScore !== undefined && (
                        <span className="text-2xl font-bold text-blue-400 ml-2">{match.awayScore}</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <div className="text-xs text-gray-400 mb-1">{match.betType}</div>
                    <div className="text-base font-bold text-blue-300 mb-2">{match.prediction}</div>
                    
                    <div className="text-right mb-2">
                      <div className="text-3xl font-bold text-green-400">{match.confidence}%</div>
                      <div className="text-xs text-gray-400">Pewność AI</div>
                    </div>

                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-yellow-400">Kurs: {match.odds}</span>
                      <span className={match.roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ROI: {match.roi >= 0 ? '+' : ''}{match.roi}%
                      </span>
                    </div>

                    {match.valuePercentage >= 10 && (
                      <div className="mt-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-300 font-bold text-center">
                        💎 Value +{match.valuePercentage}%
                      </div>
                    )}

                    {match.reasoning && (
                      <div className="mt-2 text-xs text-gray-500 italic truncate">
                        {match.reasoning}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Filtry są domyślnie wyłączone - zobaczysz wszystkie mecze</p>
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
