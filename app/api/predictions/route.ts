import { NextResponse } from 'next/server';
import { MetaLearner } from '@/lib/ml-models/meta-learner';
import { UnifiedDataAggregator } from '@/lib/api-clients/unified-aggregator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const type = searchParams.get('type') || 'all';

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'matchId is required' },
        { status: 400 }
      );
    }

    const aggregator = new UnifiedDataAggregator();
    const metaLearner = new MetaLearner();

    const matchData = await aggregator.fetchMatchData(matchId);
    const predictions = await aggregator.getPredictions(matchId);
    
    const modelPredictions = new Map([
      ['Gradient Boosting', predictions?.sportmonks],
      ['API Football', predictions?.apiFootball],
    ]);

    const finalPrediction = await metaLearner.synthesizePrediction(
      matchData,
      modelPredictions
    );

    return NextResponse.json({
      success: true,
      prediction: finalPrediction,
      matchId,
    });
  } catch (error) {
    console.error('Predictions API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
