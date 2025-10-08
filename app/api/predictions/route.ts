import { NextRequest, NextResponse } from 'next/server';
import { predictionEngine } from '@/lib/ai/prediction-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { homeTeam, awayTeam, league, currentOdds, liveStats, matchId } = body;

    if (!homeTeam || !awayTeam || !league || !currentOdds) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: homeTeam, awayTeam, league, currentOdds'
      }, { status: 400 });
    }

    console.log(`🧠 [API] Generating predictions for ${homeTeam} vs ${awayTeam}`);

    const predictions = await predictionEngine.generatePredictions({
      homeTeam,
      awayTeam,
      league,
      currentOdds,
      liveStats
    });

    // Save predictions to database
    if (matchId) {
      for (const prediction of predictions) {
        await predictionEngine.savePrediction(matchId, prediction);
      }
    }

    return NextResponse.json({
      success: true,
      predictions,
      count: predictions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API] Prediction error:', error);
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
      .order('created_at', { ascending: false });

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
