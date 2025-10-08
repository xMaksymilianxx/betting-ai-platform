'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    // AI Settings
    minConfidence: 50,
    minExpectedValue: 0,
    enabledMarkets: {
      '1X2': true,
      'OverUnder05': false,
      'OverUnder15': true,
      'OverUnder25': true,
      'OverUnder35': true,
      'OverUnder45': false,
      'BTTS': true,
      'BTTSAndWin': false,
      'HalfTime': false,
      'FullTime': false,
      'DoubleChance': false,
      'Corners': false,
      'Cards': false
    },
    
    // API Settings
    preferredLiveAPI: 'api-football',
    preferredPrematchAPI: 'api-football',
    fallbackEnabled: true,
    
    // Display Settings
    autoRefresh: false,
    refreshInterval: 60,
    showOnlyValueBets: false,
    defaultDateRange: 'today',
    defaultStatus: 'all',
    
    // Risk Management
    maxStakePerBet: 10,
    kellyFraction: 0.25,
    maxDailyStake: 100
  });

  const [saved, setSaved] = useState(false);

  const saveConfig = () => {
    localStorage.setItem('ai-betting-config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-betting-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">⚙️ Ustawienia</h1>
              <p className="text-sm text-gray-400">Konfiguracja AI i API</p>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                ← Powrót
              </Link>
              <button
                onClick={saveConfig}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
              >
                {saved ? '✅ Zapisano!' : '💾 Zapisz Ustawienia'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AI Settings */}
          <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">🧠 Ustawienia AI</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Minimalna Confidence: {config.minConfidence}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.minConfidence}
                  onChange={(e) => setConfig({...config, minConfidence: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Minimalna Expected Value: {config.minExpectedValue}%
                </label>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={config.minExpectedValue}
                  onChange={(e) => setConfig({...config, minExpectedValue: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Włączone Rynki:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(config.enabledMarkets).map(([market, enabled]) => (
                    <label key={market} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setConfig({
                          ...config,
                          enabledMarkets: {
                            ...config.enabledMarkets,
                            [market]: e.target.checked
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <span>{market.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">📡 Ustawienia API</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Preferowane API (Live)
                </label>
                <select
                  value={config.preferredLiveAPI}
                  onChange={(e) => setConfig({...config, preferredLiveAPI: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="api-football">API-Football</option>
                  <option value="odds-api">Odds-API (Coming Soon)</option>
                  <option value="the-odds">The-Odds-API (Coming Soon)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Preferowane API (Prematch)
                </label>
                <select
                  value={config.preferredPrematchAPI}
                  onChange={(e) => setConfig({...config, preferredPrematchAPI: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="api-football">API-Football</option>
                  <option value="odds-api">Odds-API (Coming Soon)</option>
                  <option value="the-odds">The-Odds-API (Coming Soon)</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.fallbackEnabled}
                  onChange={(e) => setConfig({...config, fallbackEnabled: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Włącz Fallback API (jeśli primary zawiedzie)</span>
              </label>
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">🖥️ Ustawienia Wyświetlania</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.autoRefresh}
                  onChange={(e) => setConfig({...config, autoRefresh: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Auto-refresh (zużywa limity API!)</span>
              </label>

              {config.autoRefresh && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Interwał odświeżania: {config.refreshInterval}s
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="30"
                    value={config.refreshInterval}
                    onChange={(e) => setConfig({...config, refreshInterval: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showOnlyValueBets}
                  onChange={(e) => setConfig({...config, showOnlyValueBets: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Pokaż tylko Value Bets (EV > 0%)</span>
              </label>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Domyślny zakres dat
                </label>
                <select
                  value={config.defaultDateRange}
                  onChange={(e) => setConfig({...config, defaultDateRange: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="today">Dzisiaj</option>
                  <option value="tomorrow">Jutro</option>
                  <option value="week">Tydzień</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Domyślny status
                </label>
                <select
                  value={config.defaultStatus}
                  onChange={(e) => setConfig({...config, defaultStatus: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="all">Wszystkie</option>
                  <option value="live">Live</option>
                  <option value="prematch">Prematch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">💰 Zarządzanie Ryzykiem</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Maksymalna stawka na zakład: {config.maxStakePerBet} jednostek
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.maxStakePerBet}
                  onChange={(e) => setConfig({...config, maxStakePerBet: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Kelly Fraction: {config.kellyFraction}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.kellyFraction}
                  onChange={(e) => setConfig({...config, kellyFraction: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Frakcja Kelly Criterion (0.25 = Quarter Kelly)
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Maksymalna dzienna stawka: {config.maxDailyStake} jednostek
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={config.maxDailyStake}
                  onChange={(e) => setConfig({...config, maxDailyStake: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button (mobile) */}
        <div className="mt-6 lg:hidden">
          <button
            onClick={saveConfig}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
          >
            {saved ? '✅ Zapisano!' : '💾 Zapisz Ustawienia'}
          </button>
        </div>
      </div>
    </div>
  );
}
