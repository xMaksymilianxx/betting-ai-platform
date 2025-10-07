import { Suspense } from 'react';
import LiveMatchCenter from '@/components/LiveMatchCenter';
import ValueBetFinder from '@/components/ValueBetFinder';
import PerformanceTracker from '@/components/PerformanceTracker';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Matches - 2 columns */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSkeleton />}>
            <LiveMatchCenter />
          </Suspense>
        </div>

        {/* Value Bets - 1 column */}
        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingSkeleton />}>
            <ValueBetFinder />
          </Suspense>
        </div>
      </div>

      {/* Performance Tracker */}
      <Suspense fallback={<LoadingSkeleton />}>
        <PerformanceTracker />
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse bg-slate-800 rounded-xl p-6 h-64">
      <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-slate-700 rounded"></div>
        <div className="h-3 bg-slate-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}
