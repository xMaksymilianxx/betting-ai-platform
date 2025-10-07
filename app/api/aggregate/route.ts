import { NextResponse } from 'next/server';
import { UnifiedDataAggregator } from '@/lib/api-clients/unified-aggregator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json({ error: 'matchId required' }, { status: 400 });
    }

    const aggregator = new UnifiedDataAggregator();
    const data = await aggregator.fetchMatchData(matchId);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to aggregate data' }, { status: 500 });
  }
}

export const runtime = 'edge';
