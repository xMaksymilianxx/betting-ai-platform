import { NextResponse } from 'next/server';
import { MetaLearner } from '@/lib/ml-models/meta-learner';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Mock value bets
    const valueBets = [
      {
        recommendation: 'STRONG_BET',
        confidence: 78,
        expectedValue: 0.12,
        stakeRecommendation: 4,
      },
      {
        recommendation: 'MODERATE_BET',
        confidence: 68,
        expectedValue: 0.08,
        stakeRecommendation: 2,
      },
    ];

    return NextResponse.json({ success: true, bets: valueBets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get predictions' }, { status: 500 });
  }
}

export const runtime = 'edge';
