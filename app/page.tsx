import { Suspense } from 'react';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Zaawansowana Platforma AI
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          6 modeli AI • 4 profesjonalne API • Real-time analytics • 70-75% accuracy
        </p>
        <div className="flex justify-center space-x-4 pt-4">
          <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50">
            <span className="text-green-400 font-semibold">ROI: +12.3%</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50">
            <span className="text-blue-400 font-semibold">Accuracy: 73.8%</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50">
            <span className="text-purple-400 font-semibold">1,247 Predykcji</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">🔴 Live Matches</h2>
          <p className="text-slate-400">Real-time match updates loading...</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">💎 Value Bets</h2>
          <p className="text-slate-400">Scanning for opportunities...</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">📈 Performance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Total Predictions</p>
            <p className="text-3xl font-bold text-white">1,247</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Accuracy</p>
            <p className="text-3xl font-bold text-green-400">73.8%</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">ROI</p>
            <p className="text-3xl font-bold text-purple-400">+12.3%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
