export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Nadchodzące Mecze</h1>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">Premier League • 19:00</span>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                AI: 78% confident
              </span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-white text-lg">Manchester United</p>
                <p className="text-xs text-slate-400 mt-1">WWDLW</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-400">VS</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Liverpool</p>
                <p className="text-xs text-slate-400 mt-1">LWWDW</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between">
              <span className="text-sm text-slate-400">Prediction: HOME WIN</span>
              <span className="text-sm text-green-400 font-semibold">Value: +12%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
