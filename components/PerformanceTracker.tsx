export default function PerformanceTracker() {
  const metrics = {
    accuracy7d: 73.5,
    accuracy30d: 71.2,
    roi7d: 8.3,
    roi30d: 12.1,
    totalPredictions: 1247,
    correctPredictions: 889,
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">📈 Performance Tracker</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Accuracy 7d</span>
            <span className="text-lg font-bold text-green-400">{metrics.accuracy7d}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all" 
              style={{ width: `${metrics.accuracy7d}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Accuracy 30d</span>
            <span className="text-lg font-bold text-green-400">{metrics.accuracy30d}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all" 
              style={{ width: `${metrics.accuracy30d}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">ROI 30d</span>
            <span className="text-lg font-bold text-purple-400">+{metrics.roi30d}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all" 
              style={{ width: `${metrics.roi30d * 5}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-700">
        <div className="text-center">
          <p className="text-3xl font-bold text-white">{metrics.totalPredictions}</p>
          <p className="text-sm text-slate-400 mt-1">Total Predictions</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400">{metrics.correctPredictions}</p>
          <p className="text-sm text-slate-400 mt-1">Correct</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-400">{metrics.totalPredictions - metrics.correctPredictions}</p>
          <p className="text-sm text-slate-400 mt-1">Incorrect</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-400">
            {((metrics.correctPredictions / metrics.totalPredictions) * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-slate-400 mt-1">Win Rate</p>
        </div>
      </div>
    </div>
  );
}
