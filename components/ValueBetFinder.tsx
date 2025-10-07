export default function ValueBetFinder() {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">💎 Value Bets</h2>
      
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 rounded-lg p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Real Madrid vs Barcelona</span>
            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
              +15% EV
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Over 2.5 Goals</span>
            <span className="text-green-400 font-semibold">Odds: 1.85</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg p-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Bayern vs Dortmund</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
              +8% EV
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">BTTS Yes</span>
            <span className="text-blue-400 font-semibold">Odds: 1.70</span>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm pt-2">
          Scanning 1,100+ leagues for value...
        </p>
      </div>
    </div>
  );
}
