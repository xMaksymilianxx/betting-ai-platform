'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    totalPredictions: 0,
    correctPredictions: 0,
    accuracy: 0,
    totalProfit: 0,
    roi: 0,
    byType: {},
    byLeague: {},
    recentPredictions: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">📊 Dashboard AI</h1>
              <p className="text-sm text-gray-400">Statystyki wydajności modelu</p>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                ← Powrót
              </Link>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition"
              >
                🔄 Odśwież
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Ładowanie statystyk...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur rounded-xl p-6 border border-blue-700/30">
                <div className="text-sm text-blue-400 mb-2">Wszystkie Predykcje</div>
                <div className="text-4xl font-bold">{stats.totalPredictions}</div>
                <div className="text-xs text-gray-400 mt-2">
                  Poprawne: {stats.correctPredictions}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur rounded-xl p-6 border border-green-700/30">
                <div className="text-sm text-green-400 mb-2">Accuracy</div>
                <div className="text-4xl font-bold">{stats.accuracy}%</div>
                <div className="text-xs text-gray-400 mt-2">
                  Celność predykcji
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur rounded-xl p-6 border border-purple-700/30">
                <div className="text-sm text-purple-400 mb-2">Zysk/Strata</div>
                <div className={`text-4xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}u
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Jednostki bankroll
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 backdrop-blur rounded-xl p-6 border border-yellow-700/30">
                <div className="text-sm text-yellow-400 mb-2">ROI</div>
                <div className={`text-4xl font-bold ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.roi >= 0 ? '+' : ''}{stats.roi}%
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Return on Investment
                </div>
              </div>
            </div>

            {/* By Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">📈 Według Typu</h3>
                
                {Object.keys(stats.byType).length === 0 && (
                  <p className="text-gray-400 text-center py-8">Brak danych</p>
                )}

                {Object.entries(stats.byType).map(([type, data]: [string, any]) => (
                  <div key={type} className="mb-4 p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{type}</span>
                      <span className="text-sm text-gray-400">{data.total} predykcji</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-gray-400 text-xs">Accuracy</div>
                        <div className="font-bold text-green-400">{data.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">ROI</div>
                        <div className={`font-bold ${data.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {data.roi >= 0 ? '+' : ''}{data.roi}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Profit</div>
                        <div className={`font-bold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {data.profit >= 0 ? '+' : ''}{data.profit.toFixed(1)}u
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* By League */}
              <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">🏆 Według Ligi</h3>
                
                {Object.keys(stats.byLeague).length === 0 && (
                  <p className="text-gray-400 text-center py-8">Brak danych</p>
                )}

                {Object.entries(stats.byLeague)
                  .sort(([, a]: [string, any], [, b]: [string, any]) => b.total - a.total)
                  .slice(0, 5)
                  .map(([league, data]: [string, any]) => (
                    <div key={league} className="mb-4 p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">{league}</span>
                        <span className="text-xs text-gray-400">{data.total} mecze</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-400">Accuracy</div>
                          <div className="font-bold text-green-400">{data.accuracy}%</div>
                        </div>
                        <div>
                          <div className="text-gray-400">ROI</div>
                          <div className={`font-bold ${data.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {data.roi >= 0 ? '+' : ''}{data.roi}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Predictions */}
            <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">🕐 Ostatnie Predykcje</h3>
              
              {stats.recentPredictions.length === 0 && (
                <p className="text-gray-400 text-center py-8">Brak ostatnich predykcji</p>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Mecz</th>
                      <th className="text-left p-3">Typ</th>
                      <th className="text-left p-3">Predykcja</th>
                      <th className="text-center p-3">Confidence</th>
                      <th className="text-center p-3">Status</th>
                      <th className="text-center p-3">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPredictions.slice(0, 10).map((pred: any) => (
                      <tr key={pred.id} className="border-b border-gray-800 hover:bg-gray-700/30">
                        <td className="p-3">
                          {new Date(pred.predicted_at).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="p-3 font-semibold text-xs">
                          {pred.match_id || 'N/A'}
                        </td>
                        <td className="p-3">{pred.prediction_type}</td>
                        <td className="p-3">
                          <span className="font-bold text-blue-400">
                            {pred.prediction} @ {pred.recommended_odds}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            pred.confidence >= 70 ? 'bg-green-600' :
                            pred.confidence >= 50 ? 'bg-yellow-600' : 'bg-gray-600'
                          }`}>
                            {pred.confidence}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {pred.outcome === 'won' && <span className="text-green-400">✅ Won</span>}
                          {pred.outcome === 'lost' && <span className="text-red-400">❌ Lost</span>}
                          {!pred.outcome && <span className="text-gray-400">⏳ Pending</span>}
                        </td>
                        <td className="p-3 text-center">
                          {pred.roi !== null && pred.roi !== undefined ? (
                            <span className={pred.roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {pred.roi >= 0 ? '+' : ''}{pred.roi}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
