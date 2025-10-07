{matches.map((match) => (
  <div 
    key={match.id}
    className="bg-gray-800/50 hover:bg-gray-800/70 rounded-xl border border-gray-700 p-4 transition cursor-pointer"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        {/* Match Header */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(match.status)}`}>
            {match.status === 'live' && match.minute ? (
              <>🔴 LIVE {match.minute}'</>
            ) : match.status === 'live' ? (
              '🔴 LIVE'
            ) : match.status === 'scheduled' ? (
              '📅 Nadchodzi'
            ) : (
              '✅ Zakończony'
            )}
          </span>
          <span className="text-sm text-gray-400">{match.league}</span>
          {match.country && (
            <>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{match.country}</span>
            </>
          )}
          <span className="text-xs text-gray-500">•</span>
          <span className="text-sm text-gray-500">{match.sport}</span>
        </div>

        {/* Teams and Score */}
        <div className="font-bold text-lg mb-2 flex items-center gap-3">
          <span>{match.home}</span>
          {match.score ? (
            <span className="text-blue-400 font-bold text-xl px-3 py-1 bg-blue-900/30 rounded">
              {match.score}
            </span>
          ) : (
            <span className="text-gray-500">vs</span>
          )}
          <span>{match.away}</span>
        </div>

        {/* Bet Info */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Typ:</span>
            <span className="font-semibold text-purple-400">{match.betType}</span>
          </div>
          {match.prediction && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Predykcja:</span>
              <span className="font-semibold text-cyan-400">{match.prediction}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Kurs:</span>
            <span className="font-semibold text-yellow-400">{match.odds}</span>
          </div>
          {match.valuePercentage > 10 && (
            <div className="bg-cyan-500/20 px-2 py-1 rounded text-cyan-400 font-semibold">
              💎 Value +{match.valuePercentage}%
            </div>
          )}
        </div>

        {/* AI Reasoning */}
        {match.reasoning && (
          <div className="mt-2 text-xs text-gray-400 italic">
            🤖 {match.reasoning}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-2">
        <div className={`text-3xl font-bold ${getConfidenceColor(match.confidence)}`}>
          {match.confidence}%
        </div>
        <div className="text-xs text-gray-400">Pewność AI</div>
        {match.roi >= 0 ? (
          <div className="text-sm font-semibold text-green-400">
            ROI: +{match.roi}%
          </div>
        ) : (
          <div className="text-sm font-semibold text-red-400">
            ROI: {match.roi}%
          </div>
        )}
        <div className="text-xs text-gray-500">
          Accuracy: {match.accuracy}%
        </div>
      </div>
    </div>
  </div>
))}
