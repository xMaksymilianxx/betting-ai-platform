export default function AIInsights() {
  const insights = [
    {
      factor: 'Form Analysis',
      impact: 'HIGH' as const,
      description: 'Home team won 4 of last 5 matches',
    },
    {
      factor: 'Head-to-Head',
      impact: 'MEDIUM' as const,
      description: 'Teams split last 6 meetings 3-3',
    },
    {
      factor: 'Expected Goals',
      impact: 'HIGH' as const,
      description: 'Home team xG 2.3 vs Away 1.1',
    },
  ];

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">🧠 AI Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-900/50">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              insight.impact === 'HIGH' 
                ? 'bg-green-500/20 text-green-400' 
                : insight.impact === 'MEDIUM'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-slate-700 text-slate-300'
            }`}>
              {insight.impact}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{insight.factor}</p>
              <p className="text-slate-400 text-sm mt-1">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
