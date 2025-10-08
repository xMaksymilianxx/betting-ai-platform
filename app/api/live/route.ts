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

    // Convert to legacy format for predictions
    const matches = enrichedMatches.map(match => ({
      id: match.id,
      home: match.home,
      away: match.away,
      league: match.league,
      country: match.country || '',
      sport: 'football',
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      minute: match.minute,
      score: match.score,
      time: match.time,
      odds: match.odds || {},
      statistics: match.statistics || {},
      form: match.form,
      h2h: match.h2h,
      dataSources: match.dataSources,
      dataQuality: match.dataQuality
    }));

    // Import prediction engine
    const { predictionEngine } = await import('@/lib/ml/prediction-engine');

    const startTime = Date.now();
    const predictions = await predictionEngine.generatePredictions(matches);
    const duration = Date.now() - startTime;

    console.log(`✅ Processed ${predictions.length}/${matches.length} matches in ${duration}ms`);

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
