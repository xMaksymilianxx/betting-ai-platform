export default function HistoryPage() {
  const historyData = [
    { date: '07/10/2025', match: 'Man Utd vs Liverpool', prediction: 'HOME WIN', result: 'WIN', confidence: 78, pl: '+21.00', correct: true },
    { date: '06/10/2025', match: 'Real Madrid vs Barcelona', prediction: 'OVER 2.5', result: 'WIN', confidence: 72, pl: '+18.50', correct: true },
    { date: '06/10/2025', match: 'Bayern vs Dortmund', prediction: 'HOME WIN', result: 'LOSS', confidence: 65, pl: '-10.00', correct: false },
    { date: '05/10/2025', match: 'PSG vs Marseille', prediction: 'BTTS YES', result: 'WIN', confidence: 81, pl: '+16.20', correct: true },
    { date: '05/10/2025', match: 'Arsenal vs Chelsea', prediction: 'DRAW', result: 'WIN', confidence: 58, pl: '+34.00', correct: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Historia Typów</h1>
        <div className="flex space-x-4">
          <div className="text-center px-4 py-2 bg-green-500/20 rounded-lg">
            <p className="text-2xl font-bold text-green-400">889</p>
            <p className="text-xs text-slate-400">Correct</p>
          </div>
          <div className="text-center px-4 py-2 bg-red-500/20 rounded-lg">
            <p className="text-2xl font-bold text-red-400">358</p>
            <p className="text-xs text-slate-400">Incorrect</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 text-slate-400 text-sm font-semibold">Date</th>
                <th className="text-left p-3 text-slate-400 text-sm font-semibold">Match</th>
                <th className="text-left p-3 text-slate-400 text-sm font-semibold">Prediction</th>
                <th className="text-center p-3 text-slate-400 text-sm font-semibold">Result</th>
                <th className="text-center p-3 text-slate-400 text-sm font-semibold">Confidence</th>
                <th className="text-right p-3 text-slate-400 text-sm font-semibold">P/L</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((item, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-900/50 transition">
                  <td className="p-3 text-slate-300 text-sm">{item.date}</td>
                  <td className="p-3 text-white font-medium">{item.match}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full bg-slate-700 text-slate-300 text-xs">
                      {item.prediction}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {item.correct ? (
                      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                        ✓ WIN
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                        ✗ LOSS
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center text-slate-300 text-sm">{item.confidence}%</td>
                  <td className={`p-3 text-right font-bold ${item.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {item.pl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
