'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FilterSettings {
  // Podstawowe
  minConfidence: number;
  showAllLeagues: boolean;
  sports: string[];
  requireFullStats: boolean;
  matchStatus: string[];
  
  // Typy zakładów
  betTypes: string[];
  
  // Kursy
  minOdds: number;
  maxOdds: number;
  
  // ROI i statystyki
  minROI: number;
  minAccuracy: number;
  minSampleSize: number;
  
  // Zaawansowane
  showArchive: boolean;
  daysBack: number;
  matchTime: string[];
  
  // Specjalne
  onlyValueBets: boolean;
  minValuePercentage: number;
}

const DEFAULT_SETTINGS: FilterSettings = {
  minConfidence: 0,
  showAllLeagues: true,
  sports: ['football', 'basketball', 'tennis', 'hockey', 'esports', 'handball', 'volleyball', 'baseball'],
  requireFullStats: false,
  matchStatus: ['live', 'scheduled', 'finished'],
  betTypes: ['1X2', 'BTTS', 'Over/Under', 'Handicap', 'Corners', 'Cards', 'Both_Score', 'Clean_Sheet', 'Half_Time', 'First_Goal', 'Correct_Score'],
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('filterSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('filterSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    window.dispatchEvent(new Event('settingsChanged'));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('filterSettings');
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
            ← Powrót
          </Link>
          <h1 className="text-2xl font-bold">⚙️ Zaawansowane Ustawienia</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-600/20 border border-green-500 rounded-lg text-green-400 animate-pulse flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-bold">Ustawienia zapisane!</div>
              <div className="text-sm">Przeładuj stronę główną aby zobaczyć zmiany</div>
            </div>
          </div>
        )}

        {/* SEKCJA 1: PODSTAWOWE */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">📊 Podstawowe filtry</h2>
          
          {/* Confidence */}
          <div className="mb-6">
            <label className="block text-lg mb-3">
              🎯 Minimalny poziom pewności: <span className="text-blue-400 font-bold">{settings.minConfidence}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.minConfidence}
              onChange={(e) => setSettings({...settings, minConfidence: parseInt(e.target.value)})}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>0% (wszystkie)</span>
              <span>50% (średnie)</span>
              <span>100% (pewniaki)</span>
            </div>
          </div>

          {/* Leagues */}
          <div className="mb-6">
            <label className="flex items-center text-lg cursor-pointer hover:bg-gray-700/30 p-3 rounded-lg transition">
              <input
                type="checkbox"
                checked={settings.showAllLeagues}
                onChange={(e) => setSettings({...settings, showAllLeagues: e.target.checked})}
                className="mr-4 w-6 h-6 accent-blue-500"
              />
              <div>
                <div className="font-semibold">🏆 Wszystkie ligi i rozgrywki</div>
                <div className="text-sm text-gray-400">
                  {settings.showAllLeagues 
                    ? 'Pokazuj mecze ze wszystkich lig (włącznie z 2., 3. ligą itp.)'
                    : 'Tylko top ligi (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League)'}
                </div>
              </div>
            </label>
          </div>

          {/* Match Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">🔴 Status meczów:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'live', name: 'Live', desc: 'Trwające teraz', icon: '🔴' },
                { id: 'scheduled', name: 'Nadchodzące', desc: 'Jeszcze się nie rozpoczęły', icon: '📅' },
                { id: 'finished', name: 'Zakończone', desc: 'Archiwalne wyniki', icon: '✅' },
              ].map(status => (
                <label 
                  key={status.id} 
                  className="flex items-center cursor-pointer hover:bg-gray-700/30 p-3 rounded-lg transition border border-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={settings.matchStatus.includes(status.id)}
                    onChange={() => setSettings({...settings, matchStatus: toggleArrayItem(settings.matchStatus, status.id)})}
                    className="mr-3 w-5 h-5 accent-blue-500"
                  />
                  <span className="mr-2 text-xl">{status.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{status.name}</div>
                    <div className="text-xs text-gray-400">{status.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Match Time */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">⏰ Czas meczu:</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'prematch', name: 'Pre-match', desc: 'Przed rozpoczęciem', icon: '📋' },
                { id: 'live', name: 'Live', desc: 'W trakcie gry', icon: '🔴' },
              ].map(time => (
                <label 
                  key={time.id} 
                  className="flex items-center cursor-pointer hover:bg-gray-700/30 p-3 rounded-lg transition border border-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={settings.matchTime.includes(time.id)}
                    onChange={() => setSettings({...settings, matchTime: toggleArrayItem(settings.matchTime, time.id)})}
                    className="mr-3 w-5 h-5 accent-blue-500"
                  />
                  <span className="mr-2 text-xl">{time.icon}</span>
                  <div>
                    <div className="font-semibold">{time.name}</div>
                    <div className="text-xs text-gray-400">{time.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SEKCJA 2: SPORTY */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-green-400">⚽ Sporty</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'football', name: 'Piłka nożna', icon: '⚽' },
              { id: 'basketball', name: 'Koszykówka', icon: '🏀' },
              { id: 'tennis', name: 'Tenis', icon: '🎾' },
              { id: 'hockey', name: 'Hokej', icon: '🏒' },
              { id: 'esports', name: 'E-sports', icon: '🎮' },
              { id: 'handball', name: 'Piłka ręczna', icon: '🤾' },
              { id: 'volleyball', name: 'Siatkówka', icon: '🏐' },
              { id: 'baseball', name: 'Baseball', icon: '⚾' },
            ].map(sport => (
              <label 
                key={sport.id} 
                className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/30 p-4 rounded-lg transition border border-gray-700 text-center"
              >
                <input
                  type="checkbox"
                  checked={settings.sports.includes(sport.id)}
                  onChange={() => setSettings({...settings, sports: toggleArrayItem(settings.sports, sport.id)})}
                  className="mb-2 w-5 h-5 accent-green-500"
                />
                <span className="text-3xl mb-1">{sport.icon}</span>
                <span className="text-sm font-semibold">{sport.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SEKCJA 3: TYPY ZAKŁADÓW */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-purple-400">🎲 Typy zakładów</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { id: '1X2', name: '1X2', desc: 'Wynik końcowy', icon: '🎯' },
              { id: 'BTTS', name: 'BTTS', desc: 'Obie strzelą', icon: '⚽' },
              { id: 'Over/Under', name: 'Over/Under', desc: 'Powyżej/Poniżej', icon: '📊' },
              { id: 'Handicap', name: 'Handicap', desc: 'Z handicapem', icon: '⚖️' },
              { id: 'Corners', name: 'Rzuty rożne', desc: 'Liczba kornerów', icon: '🚩' },
              { id: 'Cards', name: 'Kartki', desc: 'Żółte/Czerwone', icon: '🟨' },
              { id: 'Both_Score', name: 'Obie strzelą', desc: 'Both to score', icon: '⚽⚽' },
              { id: 'Clean_Sheet', name: 'Czyste konto', desc: 'Bez strat', icon: '🛡️' },
              { id: 'Half_Time', name: 'Połowa', desc: 'Wynik w HT', icon: '⏱️' },
              { id: 'First_Goal', name: 'Pierwsza bramka', desc: 'Kto strzeli', icon: '1️⃣' },
              { id: 'Correct_Score', name: 'Dokładny wynik', desc: 'Exact score', icon: '🎯' },
            ].map(bet => (
              <label 
                key={bet.id} 
                className="flex flex-col cursor-pointer hover:bg-gray-700/30 p-3 rounded-lg transition border border-gray-700"
              >
                <div className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={settings.betTypes.includes(bet.id)}
                    onChange={() => setSettings({...settings, betTypes: toggleArrayItem(settings.betTypes, bet.id)})}
                    className="mr-2 w-4 h-4 accent-purple-500"
                  />
                  <span className="mr-1 text-lg">{bet.icon}</span>
                  <span className="font-semibold text-sm">{bet.name}</span>
                </div>
                <span className="text-xs text-gray-400 ml-6">{bet.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SEKCJA 4: KURSY */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">💰 Zakres kursów</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Min Odds */}
            <div>
              <label className="block text-lg mb-3">
                📉 Minimalny kurs: <span className="text-yellow-400 font-bold">{settings.minOdds.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="1.01"
                max="10"
                step="0.1"
                value={settings.minOdds}
                onChange={(e) => setSettings({...settings, minOdds: parseFloat(e.target.value)})}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>1.01</span>
                <span>10.0</span>
              </div>
            </div>

            {/* Max Odds */}
            <div>
              <label className="block text-lg mb-3">
                📈 Maksymalny kurs: <span className="text-yellow-400 font-bold">{settings.maxOdds}</span>
              </label>
              <input
                type="range"
                min="1.5"
                max="100"
                step="0.5"
                value={settings.maxOdds}
                onChange={(e) => setSettings({...settings, maxOdds: parseFloat(e.target.value)})}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>1.5</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEKCJA 5: ROI I STATYSTYKI */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-red-400">📈 ROI i Statystyki</h2>
          
          <div className="space-y-6">
            {/* Min ROI */}
            <div>
              <label className="block text-lg mb-3">
                💹 Minimalny ROI: <span className="text-red-400 font-bold">{settings.minROI}%</span>
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={settings.minROI}
                onChange={(e) => setSettings({...settings, minROI: parseInt(e.target.value)})}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>-100% (straty)</span>
                <span>0% (break-even)</span>
                <span>+100% (zysk)</span>
              </div>
            </div>

            {/* Min Accuracy */}
            <div>
              <label className="block text-lg mb-3">
                🎯 Minimalna celność: <span className="text-red-400 font-bold">{settings.minAccuracy}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.minAccuracy}
                onChange={(e) => setSettings({...settings, minAccuracy: parseInt(e.target.value)})}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>0% (wszystkie)</span>
                <span>50%</span>
                <span>100% (idealne)</span>
              </div>
            </div>

            {/* Sample Size */}
            <div>
              <label className="block text-lg mb-3">
                📊 Minimalna próbka: <span className="text-red-400 font-bold">{settings.minSampleSize} meczów</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.minSampleSize}
                onChange={(e) => setSettings({...settings, minSampleSize: parseInt(e.target.value)})}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>0 (wszystkie)</span>
                <span>50</span>
                <span>100+</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Im więcej meczów w próbce, tym bardziej wiarygodne statystyki
              </p>
            </div>
          </div>
        </div>

        {/* SEKCJA 6: VALUE BETS */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">💎 Value Bets</h2>
          
          <label className="flex items-center text-lg cursor-pointer hover:bg-gray-700/30 p-3 rounded-lg transition mb-4">
            <input
              type="checkbox"
              checked={settings.onlyValueBets}
              onChange={(e) => setSettings({...settings, onlyValueBets: e.target.checked})}
              className="mr-4 w-6 h-6 accent-cyan-500"
            />
            <div>
              <div className="font-semibold">Tylko zakłady wartościowe (Value Bets)</div>
              <div className="text-sm text-gray-400">
                Pokazuj tylko mecze gdzie kurs bukmachera jest wyższy niż prawdziwe prawdopodobieństwo
              </div>
            </div>
          </label>

          <div>
            <label className="block text-lg mb-3">
              💰 Minimalny procent wartości: <span className="text-cyan-400 font-bold">{settings.minValuePercentage}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={settings.minValuePercentage}
              onChange={(e) => setSettings({...settings, minValuePercentage: parseInt(e.target.value)})}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              disabled={!settings.onlyValueBets}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>0% (wszystkie)</span>
              <span>25%</span>
              <span>50% (bardzo wartościowe)</span>
            </div>
          </div>
        </div>

        {/* SEKCJA 7: ARCHIWUM */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-orange-400">📚 Archiwum</h2>
          
          <label className="flex items-center text-lg cursor-pointer hover:bg-gray-700/30 p-3 rounded-lg transition mb-4">
            <input
              type="checkbox"
              checked={settings.showArchive}
              onChange={(e) => setSettings({...settings, showArchive: e.target.checked})}
              className="mr-4 w-6 h-6 accent-orange-500"
            />
            <div>
              <div className="font-semibold">Włącz archiwum historyczne</div>
              <div className="text-sm text-gray-400">
                Pokazuj również mecze z przeszłości do analizy
              </div>
            </div>
          </label>

          <div>
            <label className="block text-lg mb-3">
              📅 Cofnij się o: <span className="text-orange-400 font-bold">{settings.daysBack} dni</span>
            </label>
            <input
              type="range"
              min="1"
              max="90"
              step="1"
              value={settings.daysBack}
              onChange={(e) => setSettings({...settings, daysBack: parseInt(e.target.value)})}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              disabled={!settings.showArchive}
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>1 dzień</span>
              <span>30 dni</span>
              <span>90 dni</span>
            </div>
          </div>
        </div>

        {/* SEKCJA 8: DODATKOWE */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-pink-400">⚡ Dodatkowe opcje</h2>
          
          <label className="flex items-center text-lg cursor-pointer hover:bg-gray-700/30 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={settings.requireFullStats}
              onChange={(e) => setSettings({...settings, requireFullStats: e.target.checked})}
              className="mr-4 w-6 h-6 accent-pink-500"
            />
            <div>
              <div className="font-semibold">Wymagaj pełnych statystyk</div>
              <div className="text-sm text-gray-400">
                Pokazuj tylko mecze z kompletnymi danymi (forma, H2H, składy, itp.)
              </div>
            </div>
          </label>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={saveSettings}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span className="text-2xl">💾</span>
            <span>Zapisz wszystkie ustawienia</span>
          </button>
          <button
            onClick={resetSettings}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🔄</span>
            <span>Przywróć domyślne</span>
          </button>
        </div>

        {/* SUMMARY */}
        <div className="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl">
          <h3 className="text-xl font-bold mb-3">📋 Podsumowanie aktywnych filtrów:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-300">🎯 Confidence: <span className="text-blue-400 font-bold">{settings.minConfidence}%+</span></p>
              <p className="text-gray-300">⚽ Sporty: <span className="text-green-400 font-bold">{settings.sports.length}</span></p>
              <p className="text-gray-300">🎲 Typy: <span className="text-purple-400 font-bold">{settings.betTypes.length}</span></p>
              <p className="text-gray-300">💰 Kursy: <span className="text-yellow-400 font-bold">{settings.minOdds.toFixed(2)} - {settings.maxOdds}</span></p>
            </div>
            <div>
              <p className="text-gray-300">💹 ROI: <span className="text-red-400 font-bold">{settings.minROI}%+</span></p>
              <p className="text-gray-300">🎯 Celność: <span className="text-red-400 font-bold">{settings.minAccuracy}%+</span></p>
              <p className="text-gray-300">💎 Value Bets: <span className={settings.onlyValueBets ? "text-cyan-400 font-bold" : "text-gray-500"}>
                {settings.onlyValueBets ? `${settings.minValuePercentage}%+` : 'Wyłączone'}
              </span></p>
              <p className="text-gray-300">📚 Archiwum: <span className={settings.showArchive ? "text-orange-400 font-bold" : "text-gray-500"}>
                {settings.showArchive ? `${settings.daysBack} dni` : 'Wyłączone'}
              </span></p>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg text-blue-300 text-sm">
          💡 <strong>Wskazówka:</strong> Po zapisaniu ustawień wróć na stronę główną i odśwież ją aby załadować wyniki z nowymi filtrami.
          Ustawienia są przechowywane lokalnie w przeglądarce.
        </div>
      </div>
    </div>
  );
}
