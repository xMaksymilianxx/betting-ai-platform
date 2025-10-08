import { NextRequest, NextResponse } from 'next/server';
import { advancedPredictionEngine } from '@/lib/ai/advanced-prediction-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      homeTeam, 
      awayTeam, 
      league, 
      matchId,
      matchDate,
      isLive,
      currentOdds, 
      liveStats 
    } = body;

    if (!homeTeam || !awayTeam || !league || !currentOdds) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: homeTeam, awayTeam, league, currentOdds'
      }, { status: 400 });
    }

    console.log(`🧠 [API /predictions/advanced] Request for ${homeTeam} vs ${awayTeam}`);
    console.log(`📊 [API] Mode: ${isLive ? 'LIVE' : 'PREMATCH'}`);
    console.log(`📊 [API] Markets available: ${Object.keys(currentOdds).length}`);

    const predictions = await advancedPredictionEngine.generateAllPredictions({
      homeTeam,
      awayTeam,
      league,
      matchId: matchId || `${homeTeam}-${awayTeam}-${Date.now()}`,
      matchDate: matchDate || new Date().toISOString(),
      isLive: isLive || false,
      currentOdds,
      liveStats,
      historicalStats: null
    });

    // Save predictions to database
    if (matchId && predictions.length > 0) {
      await advancedPredictionEngine.savePredictions(matchId, predictions);
    }

    // Filter by confidence and value
    const highValuePredictions = predictions.filter(p => 
      p.confidence >= 45 && p.expectedValue >= -10
    );

    console.log(`✅ [API] Generated ${predictions.length} predictions`);
    console.log(`💎 [API] High value: ${highValuePredictions.length} predictions`);

    return NextResponse.json({
      success: true,
      predictions: highValuePredictions,
      total: predictions.length,
      filtered: highValuePredictions.length,
      summary: {
        totalMarkets: predictions.length,
        highConfidence: predictions.filter(p => p.confidence >= 65).length,
        mediumConfidence: predictions.filter(p => p.confidence >= 50 && p.confidence < 65).length,
        lowConfidence: predictions.filter(p => p.confidence < 50).length,
        positiveEV: predictions.filter(p => p.expectedValue > 0).length,
        avgConfidence: Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length),
        avgEV: Math.round((predictions.reduce((sum, p) => sum + p.expectedValue, 0) / predictions.length) * 10) / 10
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API] Advanced prediction error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Missing matchId parameter'
      }, { status: 400 });
    }

    // Fetch predictions from database
    const { supabase } = await import('@/lib/db/supabase');
    
    const { data, error } = await supabase
      .from('prediction_history')
      .select('*')
      .eq('match_id', matchId)
      .order('confidence', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      predictions: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API] Get predictions error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
