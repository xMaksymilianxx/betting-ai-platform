export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <span className="text-sm text-slate-400">Last updated: just now</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30">
          <p className="text-slate-400 text-sm mb-2">Total Predictions</p>
          <p className="text-4xl font-bold text-white">1,247</p>
          <p className="text-green-400 text-sm mt-2">↑ 23 today</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30">
          <p className="text-slate-400 text-sm mb-2">Accuracy</p>
          <p className="text-4xl font-bold text-green-400">73.8%</p>
          <p className="text-green-400 text-sm mt-2">↑ 2.1% vs last week</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/30">
          <p className="text-slate-400 text-sm mb-2">ROI (30d)</p>
          <p className="text-4xl font-bold text-purple-400">+12.3%</p>
          <p className="text-purple-400 text-sm mt-2">$1,234 profit</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-6 border border-yellow-500/30">
          <p className="text-slate-400 text-sm mb-2">Win Streak</p>
          <p className="text-4xl font-bold text-yellow-400">7</p>
          <p className="text-yellow-400 text-sm mt-2">Current streak</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-white">Man United vs Liverpool - Prediction: HOME WIN</span>
              </div>
              <span className="text-slate-400 text-sm">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
