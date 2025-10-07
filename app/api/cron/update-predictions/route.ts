import { NextResponse } from 'next/server';
import { UnifiedDataAggregator } from '@/lib/api-clients/unified-aggregator';
import { MetaLearner } from '@/lib/ml-models/meta-learner';
import { savePrediction } from '@/lib/database/queries';

export async function GET() {
  try {
    console.log('🔄 Starting prediction update cron job...');

    const aggregator = new UnifiedDataAggregator();
    const metaLearner = new MetaLearner();

    const today = new Date().toISOString().split('T')[0];
    const fixtures = await aggregator.getFixtures(today);

    console.log(`📊 Found ${fixtures.length} fixtures for today`);

    let processed = 0;
    let errors = 0;

    for (const fixture of fixtures.slice(0, 50)) {
      try {
        const matchId = fixture.id || `${fixture.homeTeam}-${fixture.awayTeam}`;
        
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

        if (finalPrediction) {
          await savePrediction({
            matchId,
            type: 'Match Winner',
            prediction: finalPrediction.prediction,
            confidence: finalPrediction.confidence,
            odds: 2.0,
            expectedValue: finalPrediction.expectedValue,
            recommendation: finalPrediction.recommendation,
            matchDate: fixture.date || new Date(),
            features: matchData,
          });

          processed++;
        }

        await sleep(100);
      } catch (error) {
        console.error(`Error processing fixture:`, error);
        errors++;
      }
    }

    console.log(`✅ Cron completed: ${processed} processed, ${errors} errors`);

    return NextResponse.json({
      success: true,
      processed,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const runtime = 'edge';
export const maxDuration = 60;
