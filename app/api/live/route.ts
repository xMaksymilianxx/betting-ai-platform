import { NextRequest } from 'next/server';
import { intelligentAPIManager } from '@/lib/api-clients/intelligent-api-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('⚡ [API /live] Live matches request');

  try {
    const searchParams = request.nextUrl.searchParams;
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0');
    const sportsParam = searchParams.get('sports');
    const betTypesParam = searchParams.get('betTypes');

    const sports = sportsParam ? sportsParam.split(',') : ['football'];
    const betTypes = betTypesParam ? betTypesParam.split(',') : ['1X2', 'Over/Under', 'BTTS'];

    console.log(`🎯 API Request with filters:`, {
      minConfidence,
      sports,
      betTypes
    });

    // Fetch all enriched matches
    const enrichedMatches = await intelligentAPIManager.fetchEnrichedMatches();

    console.log(`✅ Fetched ${enrichedMatches.length} matches with full statistics`);

    // Calculate data quality stats
    const withStats = enrichedMatches.filter(m => m.statistics).length;
    const withOdds = enrichedMatches.filter(m => m.odds).length;
    const withForm = enrichedMatches.filter(m => m.form).length;

    console.log(`📊 Data quality: ${withStats} with stats, ${withOdds} with odds, ${withForm} with form`);

    // Generate simple predictions without ML engine
    const startTime = Date.now();
    
    const predictions = enrichedMatches.map(match => {
      const confidence = match.dataQuality || 50;
      
      let prediction = 'Draw';
      let betType = '1X2';
      let recommendedOdds = 3.5;
      let value = 1.0;
      
      if (match.odds) {
        if (match.odds.home < 2.0) {
          prediction = `${match.home} Win`;
          betType = 'Home Win';
          recommendedOdds = match.odds.home;
          value = match.odds.home > 1.5 ? 1.1 : 1.0;
        } else if (match.odds.away < 2.0) {
          prediction = `${match.away} Win`;
          betType = 'Away Win';
          recommendedOdds = match.odds.away;
          value = match.odds.away > 1.5 ? 1.1 : 1.0;
        } else if (match.odds.over25 < 2.0) {
          prediction = 'Over 2.5 Goals';
          betType = 'Over/Under';
          recommendedOdds = match.odds.over25;
          value = match.odds.over25 > 1.5 ? 1.08 : 1.0;
        } else if (match.odds.bttsYes < 2.0) {
          prediction = 'Both Teams To Score';
          betType = 'BTTS';
          recommendedOdds = match.odds.bttsYes;
          value = match.odds.bttsYes > 1.5 ? 1.08 : 1.0;
        }
      }

      return {
        id: match.id,
        matchId: match.id,
        home: match.home,
        away: match.away,
        league: match.league,
        country: match.country || '',
        prediction: prediction,
        betType: betType,
        confidence: confidence,
        odds: recommendedOdds,
        value: value,
        reasoning: `Analysis based on: ${match.dataSources.join(', ')}. Current score: ${match.score} (${match.minute}')`,
        statistics: match.statistics,
        score: match.score,
        minute: match.minute,
        status: match.status,
        dataSources: match.dataSources,
        dataQuality: match.dataQuality
      };
    });
    
    const duration = Date.now() - startTime;

    console.log(`✅ Processed ${predictions.length}/${enrichedMatches.length} matches in ${duration}ms`);

    // Calculate confidence stats
    const avgConfidence = predictions.length > 0
      ? (predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)
      : 0;

    const valueBets = predictions.filter(p => p.value && p.value > 1.05).length;

    console.log(`📊 Avg confidence: ${avgConfidence.toFixed(1)}%`);
    console.log(`💎 Value bets: ${valueBets}`);

    return Response.json({
      success: true,
      predictions: predictions,
      metadata: {
        total: predictions.length,
        avgConfidence: parseFloat(avgConfidence.toFixed(1)),
        valueBets: valueBets,
        dataQuality: {
          withStats: withStats,
          withOdds: withOdds,
          withForm: withForm
        },
        processingTime: duration,
        timestamp: new Date().toISOString()
      },
      apiStatus: intelligentAPIManager.getAPIStatus()
    });

  } catch (error) {
    console.error('❌ [API /live] Error:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to fetch live predictions',
      details: error instanceof Error ? error.message : 'Unknown error',
      predictions: [],
      metadata: {
        total: 0,
        avgConfidence: 0,
        valueBets: 0
      }
    }, { status: 500 });
  }
}
