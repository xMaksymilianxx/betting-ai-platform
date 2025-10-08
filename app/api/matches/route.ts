import { NextRequest, NextResponse } from 'next/server';
import { liveScoreClient } from '@/lib/api-clients/liveScoreClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const dateFrom = p.get('dateFrom') || new Date().toISOString().split('T')[0];
    const dateTo = p.get('dateTo') || dateFrom;
    const status = p.get('live') === '1' ? 'live' : p.get('status') === 'FT' ? 'finished' : 'scheduled';

    console.log('🔍 LiveScore params:', { dateFrom, dateTo, status }); // [attached_file:2]

    const fixtures = await liveScoreClient.fetchMatches(dateFrom, dateTo, status);
    const matches = fixtures.map((f: any) => ({
      id: f.fixture_id.toString(),
      home: f.home.team_name,
      away: f.away.team_name,
      league: f.league.name,
      country: f.league.country,
      time: f.fixture_date,
      status: f.status.short, // live, scheduled, finished
      score: f.goals ? { home: f.goals.home, away: f.goals.away } : null,
      odds: f.odds || {},
      statistics: f.statistics || null,
      venue: f.venue.name
    }));

    return NextResponse.json({ success: true, matches, count: matches.length });
  } catch (err: any) {
    console.error('❌ LiveScore error:', err.message); // [attached_file:2]
    return NextResponse.json({ success: false, error: err.message, matches: [] }, { status: 500 });
  }
}
