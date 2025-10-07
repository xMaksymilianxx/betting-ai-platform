import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <p className="text-slate-400">Total Predictions</p>
          <p className="text-4xl font-bold text-white mt-2">1,247</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <p className="text-slate-400">Accuracy</p>
          <p className="text-4xl font-bold text-green-400 mt-2">73.8%</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <p className="text-slate-400">ROI</p>
          <p className="text-4xl font-bold text-purple-400 mt-2">+12.3%</p>
        </div>
      </div>
    </div>
  );
}
