'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mlLearningEngine } from '@/lib/ai/ml-learning-engine';

export default function MLStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    try {
      const statistics = mlLearningEngine.getStatistics();
      setStats(statistics);
      setLoading(false);
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const resetModel = () => {
    if (confirm('Czy na pewno chcesz zresetować model ML? Wszystkie dane treningowe zostaną utracone.')) {
      mlLearningEngine.reset();
      loadStats();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Ładowanie statystyk ML...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                ← Powrót
              </Link>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🧠</span>
              <span>Machine Learning Statistics</span>
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Current Model Card */}
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl border border-blue-700/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-2">
                🤖 Current Model v{stats.currentModel.version}
              </h2>
              <p className="text-sm text-gray-400">
                Active since: {new Date(stats.currentModel.timestamp).toLocaleString('pl-PL')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-400">
                {stats.currentModel.accuracy.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {stats.currentModel.totalPredictions}
              </div>
              <div className="text-sm text-gray-400">Total Predictions</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {stats.currentModel.correctPredictions}
              </div>
              <div className="text-sm text-gray-400">Correct</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-400">
                {stats.currentModel.totalPredictions - stats.currentModel.correctPredictions}
              </div>
              <div className="text-sm text-gray-400">Incorrect</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {stats.recentAccuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Last 20 matches</div>
            </div>
          </div>
        </div>

        {/* Best Model Card */}
        <div className="mb-8 p-6 bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl border border-green-700/50">
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            🏆 Best Model Ever v{stats.bestModel.version}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {stats.bestModel.accuracy.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">Best Accuracy</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {stats.bestModel.totalPredictions}
              </div>
              <div className="text-sm text-gray-400">Predictions</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Achieved</div>
              <div className="text-sm font-semibold text-green-400">
                {new Date(stats.bestModel.timestamp).toLocaleDateString('pl-PL')}
              </div>
            </div>
          </div>

          {stats.currentModel.accuracy >= stats.bestModel.accuracy && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 font-semibold">
              🎉 Current model equals or exceeds best performance!
            </div>
          )}
        </div>

        {/* Accuracy by Bet Type */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">📊 Accuracy by Bet Type (Last 100 predictions)</h2>
          
          <div className="space-y-4">
            {stats.byBetType.map((betType: any) => (
              <div key={betType.betType} className="bg-gray-700/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-lg">{betType.betType}</div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${
                      betType.accuracy >= 70 ? 'text-green-400' :
                      betType.accuracy >= 60 ? 'text-yellow-400' :
                      betType.accuracy >= 50 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {betType.accuracy.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-400 ml-2">({betType.count} predictions)</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      betType.accuracy >= 70 ? 'bg-green-500' :
                      betType.accuracy >= 60 ? 'bg-yellow-500' :
                      betType.accuracy >= 50 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${betType.accuracy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Parameters */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">⚙️ Current ML Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.currentModel.parameters).map(([key, value]) => (
              <div key={key} className="bg-gray-700/30 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-xl font-bold text-blue-400">
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg text-sm text-blue-300">
            💡 <strong>Info:</strong> Te parametry są automatycznie dostosowywane przez algorytm ML
            co 10 predykcji. System uczy się z każdego meczu i optymalizuje dokładność.
          </div>
        </div>

        {/* Learning Progress */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">📈 Learning Progress</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Learning Cycles</span>
                <span className="text-xl font-bold text-purple-400">
                  {Math.floor(stats.totalPredictions / 10)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Next learning cycle in {10 - (stats.totalPredictions % 10)} predictions
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Model Versions</span>
                <span className="text-xl font-bold text-cyan-400">
                  v{stats.currentModel.version}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {stats.currentModel.version > stats.bestModel.version 
                  ? `Exploring new parameters (${stats.currentModel.version - stats.bestModel.version} iterations ahead)`
                  : 'Using best known configuration'
                }
              </div>
            </div>

            <div className="bg-gray-700/30 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Improvement Rate</span>
                <span className="text-xl font-bold text-green-400">
                  {stats.currentModel.accuracy > 0 
                    ? `+${(stats.currentModel.accuracy - 50).toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="text-sm text-gray-500">
                vs. baseline (50% random)
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={loadStats}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Odśwież statystyki</span>
          </button>
          
          <button
            onClick={resetModel}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition flex items-center justify-center gap-2"
          >
            <span>⚠️</span>
            <span>Reset modelu</span>
          </button>
        </div>

        {/* Info Panel */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>🤖</span>
            <span>Jak działa Machine Learning?</span>
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• <strong>Uczenie automatyczne:</strong> System analizuje wyniki każdej predykcji i dostosowuje parametry</p>
            <p>• <strong>Cykl uczenia:</strong> Co 10 predykcji następuje optymalizacja parametrów</p>
            <p>• <strong>Rollback mechanism:</strong> Jeśli accuracy spadnie o 5%, system wraca do najlepszej wersji</p>
            <p>• <strong>Różne typy zakładów:</strong> Każdy typ (Over/Under, 1X2, BTTS) ma osobną optymalizację</p>
            <p>• <strong>Persistence:</strong> Model jest zapisywany w localStorage i przechowuje historię 200 ostatnich meczów</p>
          </div>
        </div>
      </div>
    </div>
  );
}
