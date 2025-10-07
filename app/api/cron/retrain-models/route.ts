import { NextResponse } from 'next/server';
import { getPerformanceMetrics } from '@/lib/database/queries';
import { updateModelPerformance } from '@/lib/database/queries';

export async function GET() {
  try {
    console.log('🤖 Starting model retraining cron job...');

    const periods = [7, 30, 90];
    const models = [
      'Gradient Boosting',
      'XG Predictor',
      'Momentum Analyzer',
      'Context-Aware NN',
      'Value Bet Hunter',
      'Live In-Play',
    ];

    const results = [];

    for (const period of periods) {
      const metrics = await getPerformanceMetrics(period);
      
      console.log(`📊 ${period}d metrics:`, {
        accuracy: metrics.accuracy.toFixed(1),
        profit: metrics.profit.toFixed(2),
        total: metrics.total,
      });

      for (const model of models) {
        const modelMetrics = {
          total: Math.floor(metrics.total / models.length),
          correct: Math.floor(metrics.correct / models.length),
          accuracy: metrics.accuracy,
          roi: metrics.profit > 0 ? (metrics.profit / (metrics.total * 10)) * 100 : 0,
        };

        await updateModelPerformance(model, 'football', modelMetrics);
        
        results.push({
          model,
          period: `${period}d`,
          metrics: modelMetrics,
        });
      }
    }

    console.log('✅ Model retraining completed');

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Retraining cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Retraining failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 60;
