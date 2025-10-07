export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">AI Predictions</h1>

      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-400">Premier League</p>
                <h3 className="text-xl font-bold text-white">Man United vs Liverpool</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold">
                STRONG BET
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">1</p>
                <p className="text-2xl font-bold text-blue-400">2.10</p>
                <p className="text-xs text-green-400 mt-1">+12% value</p>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">X</p>
                <p className="text-2xl font-bold text-slate-400">3.40</p>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">2</p>
                <p className="text-2xl font-bold text-slate-400">3.60</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400">AI Confidence</p>
                <p className="text-lg font-bold text-white">78%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Recommended Stake</p>
                <p className="text-lg font-bold text-green-400">4% bankroll</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Expected Value</p>
                <p className="text-lg font-bold text-purple-400">+12.3%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
