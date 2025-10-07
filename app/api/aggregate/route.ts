import { NextResponse } from 'next/server';
import { UnifiedDataAggregator } from '@/lib/api-clients/unified-aggregator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: 'matchId is required' },
        { status: 400 }
      );
    }

    const aggregator = new UnifiedDataAggregator();
    const matchData = await aggregator.fetchMatchData(matchId);

    return NextResponse.json({
      success: true,
      data: matchData,
      matchId,
    });
  } catch (error) {
    console.error('Aggregate API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to aggregate match data' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
