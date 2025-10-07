'use client';

import { useEffect, useState } from 'react';
import { BettingDecision } from '@/lib/utils/types';

export default function ValueBetFinder() {
  const [valueBets, setValueBets] = useState<any[]>([]);

  useEffect(() => {
    fetchValueBets();
    const interval = setInterval(fetchValueBets, 120000); // 2 min
    return () => clearInterval(interval);
  }, []);

  const fetchValueBets = async () => {
    try {
      const response = await fetch('/api/predictions?type=value');
      const data = await response.json();
      setValueBets(data.bets || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          💎 Value Bets
        </h2>
        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
          {valueBets.length} aktywnych
        </span>
      </div>

      <div className="space-y-3">
        {valueBets.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Skanowanie rynku...</p>
        ) : (
          valueBets.map((bet, idx) => <ValueBetCard key={idx} bet={bet} />)
        )}
      </div>
    </div>
  );
}

function ValueBetCard({ bet }: { bet: any }) {
  const getRecommendationColor = (rec: string) => {
    if (rec === 'STRONG_BET') return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (rec === 'MODERATE_BET') return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
  };

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-purple-500/50 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-white text-sm">Premier League</span>
        <span className={`px-2 py-1 rounded text-xs font-bold border ${getRecommendationColor(bet.recommendation)}`}>
          {bet.recommendation}
        </span>
      </div>
      
      <p className="text-slate-300 mb-3">Manchester United vs Liverpool</p>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-slate-400 mb-1">Confidence</p>
          <div className="flex items-center">
            <div className="flex-1 bg-slate-700 rounded-full h-2 mr-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${bet.confidence || 75}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-white">{bet.confidence || 75}%</span>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-slate-400 mb-1">Expected Value</p>
          <p className="text-lg font-bold text-green-400">+{((bet.expectedValue || 0.12) * 100).toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-400">Stake: <span className="text-white font-semibold">{bet.stakeRecommendation || 3}% bankroll</span></p>
      </div>
    </div>
  );
}
