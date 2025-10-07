export default function LiveMatchCenter() {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></span>
          Live Matches
        </h2>
        <span className="text-slate-400 text-sm">Updating...</span>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Premier League</span>
            <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400">
              ⚡ LIVE 67'
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4 text-center">
            <div>
              <p className="font-semibold text-white">Man United</p>
              <p className="text-3xl font-bold text-white mt-2">2</p>
            </div>
            <div className="text-slate-400">-</div>
            <div>
              <p className="font-semibold text-white">Liverpool</p>
              <p className="text-3xl font-bold text-white mt-2">1</p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm py-4">
          Connect to API for real-time updates
        </p>
      </div>
    </div>
  );
}
