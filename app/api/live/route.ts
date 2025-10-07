import { NextResponse } from 'next/server';
import { UnifiedDataAggregator } from '@/lib/api-clients/unified-aggregator';

export async function GET() {
  try {
    const aggregator = new UnifiedDataAggregator();
    const liveMatches = await aggregator.getLiveMatches();

    return NextResponse.json({
      success: true,
      matches: liveMatches,
      count: liveMatches.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Live API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live matches' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
