private predict1X2(features: any, odds: any, isLive: boolean): AdvancedPrediction | null {
  const { h2h, form, stats, live, liveAdjustment } = features;
  
  // Calculate base probabilities from odds (implied probability)
  const impliedProbHome = (1 / odds.home) * 100;
  const impliedProbDraw = (1 / odds.draw) * 100;
  const impliedProbAway = (1 / odds.away) * 100;
  const totalImplied = impliedProbHome + impliedProbDraw + impliedProbAway;
  
  // Remove bookmaker margin (normalize)
  let homeProb = (impliedProbHome / totalImplied) * 100;
  let drawProb = (impliedProbDraw / totalImplied) * 100;
  let awayProb = (impliedProbAway / totalImplied) * 100;

  console.log(`📊 [1X2] Implied odds: H:${impliedProbHome.toFixed(1)}% D:${impliedProbDraw.toFixed(1)}% A:${impliedProbAway.toFixed(1)}%`);

  // H2H DEEP ANALYSIS (40% weight)
  if (h2h.totalMatches >= 3) {
    const h2hHomeRate = (h2h.homeWins / h2h.totalMatches) * 100;
    const h2hDrawRate = (h2h.draws / h2h.totalMatches) * 100;
    const h2hAwayRate = (h2h.awayWins / h2h.totalMatches) * 100;
    
    homeProb = homeProb * 0.6 + h2hHomeRate * 0.4;
    drawProb = drawProb * 0.6 + h2hDrawRate * 0.4;
    awayProb = awayProb * 0.6 + h2hAwayRate * 0.4;
  }

  // FORM ANALYSIS (30% weight)
  const formDiff = form.home - form.away;
  const formAdjustment = formDiff * 0.3; // Max ±30%
  
  homeProb += formAdjustment;
  awayProb -= formAdjustment;

  // STATISTICS (15% weight)
  if (stats.home && stats.away) {
    const homeWinRate = (stats.home.wins / stats.home.matches_played || 0) * 100;
    const awayWinRate = (stats.away.wins / stats.away.matches_played || 0) * 100;
    
    homeProb = homeProb * 0.85 + homeWinRate * 0.15;
    awayProb = awayProb * 0.85 + awayWinRate * 0.15;
  }

  // LIVE ADJUSTMENT (15% weight if live)
  if (isLive && live) {
    const liveWeight = 0.15;
    homeProb += liveAdjustment * liveWeight;
    awayProb -= liveAdjustment * liveWeight;
    
    // If home is leading - increase home prob
    if (live.score && live.score.home > live.score.away) {
      const scoreDiff = live.score.home - live.score.away;
      homeProb += scoreDiff * 10; // +10% per goal difference
      awayProb -= scoreDiff * 8;
    } else if (live.score && live.score.away > live.score.home) {
      const scoreDiff = live.score.away - live.score.home;
      awayProb += scoreDiff * 10;
      homeProb -= scoreDiff * 8;
    }
  }

  // Normalize to 100%
  const total = homeProb + drawProb + awayProb;
  homeProb = (homeProb / total) * 100;
  drawProb = (drawProb / total) * 100;
  awayProb = (awayProb / total) * 100;

  console.log(`🎯 [1X2] Calculated: H:${homeProb.toFixed(1)}% D:${drawProb.toFixed(1)}% A:${awayProb.toFixed(1)}%`);

  // Determine best prediction
  const predictions = [
    { type: '1 (Home Win)', prob: homeProb, odds: odds.home, impliedProb: impliedProbHome },
    { type: 'X (Draw)', prob: drawProb, odds: odds.draw, impliedProb: impliedProbDraw },
    { type: '2 (Away Win)', prob: awayProb, odds: odds.away, impliedProb: impliedProbAway }
  ];

  // Find best value bet
  let bestPrediction = predictions[0];
  let bestValue = -999;

  predictions.forEach(pred => {
    const expectedValue = ((pred.prob / 100) * pred.odds - 1) * 100;
    if (expectedValue > bestValue) {
      bestValue = expectedValue;
      bestPrediction = pred;
    }
  });

  const confidence = bestPrediction.prob;
  const expectedValue = ((confidence / 100) * bestPrediction.odds - 1) * 100;
  const valuePercentage = ((bestPrediction.odds - (100 / confidence)) / (100 / confidence)) * 100;

  // MINIMUM THRESHOLD: Confidence >= 40% AND ExpectedValue >= -5%
  if (confidence < 40 || expectedValue < -5) {
    console.log(`⚠️ [1X2] Below threshold: conf=${confidence.toFixed(1)}% EV=${expectedValue.toFixed(1)}%`);
    return null;
  }

  // Build detailed reasoning
  const reasoning: string[] = [];
  
  // H2H
  if (h2h.totalMatches >= 3) {
    reasoning.push(
      `📊 H2H (${h2h.totalMatches} games): ${h2h.homeWins}W-${h2h.draws}D-${h2h.awayWins}L` +
      ` (${((h2h.homeWins/h2h.totalMatches)*100).toFixed(0)}%-${((h2h.draws/h2h.totalMatches)*100).toFixed(0)}%-${((h2h.awayWins/h2h.totalMatches)*100).toFixed(0)}%)`
    );
  } else {
    reasoning.push(`⚠️ Limited H2H data (${h2h.totalMatches} games)`);
  }

  // Form
  reasoning.push(
    `🔥 Form: Home ${form.home.toFixed(0)}% vs Away ${form.away.toFixed(0)}% (Δ ${formDiff > 0 ? '+' : ''}${formDiff.toFixed(0)}%)`
  );

  // Statistics
  if (stats.home && stats.away) {
    reasoning.push(
      `📈 Season: Home ${((stats.home.wins/stats.home.matches_played)*100).toFixed(0)}% win rate | ` +
      `Away ${((stats.away.wins/stats.away.matches_played)*100).toFixed(0)}% win rate`
    );
  }

  // Live info
  if (isLive && live?.score) {
    reasoning.push(
      `🔴 LIVE: Score ${live.score.home}-${live.score.away} | ` +
      `Min ${live.minute || '?'}' | ` +
      `Momentum: ${liveAdjustment > 0 ? 'Home' : liveAdjustment < 0 ? 'Away' : 'Neutral'}`
    );
    
    if (live.possession) {
      reasoning.push(`⚽ Possession: ${live.possession.home}%-${live.possession.away}%`);
    }
  }

  // Probability analysis
  reasoning.push(
    `🎲 Implied Probability: ${bestPrediction.impliedProb.toFixed(1)}% (from odds ${bestPrediction.odds})`
  );
  reasoning.push(
    `🧠 Real Probability: ${confidence.toFixed(1)}% (AI calculated)`
  );
  reasoning.push(
    `💎 Value: ${valuePercentage > 0 ? '+' : ''}${valuePercentage.toFixed(1)}% | ` +
    `EV: ${expectedValue > 0 ? '+' : ''}${expectedValue.toFixed(1)}%`
  );

  // CURRENT LIVE ODDS (if available)
  if (isLive) {
    reasoning.push(
      `💰 Current Odds: 1=${odds.home} X=${odds.draw} 2=${odds.away} ` +
      `(Recommended: ${bestPrediction.odds})`
    );
  }

  return {
    market: '1X2',
    prediction: bestPrediction.type,
    confidence: Math.round(confidence),
    recommendedOdds: bestPrediction.odds,
    expectedValue: Math.round(expectedValue * 10) / 10,
    valuePercentage: Math.round(valuePercentage * 10) / 10,
    stakeSize: this.calculateStake(confidence, expectedValue),
    reasoning,
    features: {
      impliedProbability: Math.round(bestPrediction.impliedProb * 10) / 10,
      realProbability: Math.round(confidence * 10) / 10,
      h2hSupport: h2h.totalMatches >= 3,
      formDiff: Math.round(formDiff),
      liveAdjustment: isLive ? Math.round(liveAdjustment * 10) / 10 : 0
    },
    risk: confidence >= 65 ? 'low' : confidence >= 50 ? 'medium' : 'high',
    timing: isLive ? 'live' : 'prematch'
  };
}
