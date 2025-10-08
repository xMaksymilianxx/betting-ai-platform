import { NextRequest, NextResponse } from 'next/server';
import { apiFootballClient } from '@/lib/api-clients/api-football';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const dateFrom = searchParams.get('dateFrom') || new Date().toISOString().split('T')[0];
    const dateTo = searchParams.get('dateTo') || dateFrom;
    const status = searchParams.get('status'); // NS, LIVE, FT, etc.
    const live = searchParams.get('live'); // '1' for live matches
    const league = searchParams.get('league');

    console.log(`🎯 [API /matches] Request params:`, {
      dateFrom,
      dateTo,
      status,
      live,
      league
    });

    let matches = [];

    // LIVE MATCHES
    if (live === '1') {
      console.log('📡 [API /matches] Fetching LIVE matches');
      matches = await apiFootballClient.fetchLiveMatches({ dateFrom, dateTo });
    }
    // FINISHED MATCHES
    else if (status === 'FT') {
      console.log('📡 [API /matches] Fetching FINISHED matches');
      matches = await apiFootballClient.fetchMatches({
        dateFrom,
        dateTo,
        status: 'FT'
      });
    }
    // PREMATCH (Not Started)
    else if (status === 'NS') {
      console.log('📡 [API /matches] Fetching PREMATCH matches');
      matches = await apiFootballClient.fetchMatches({
        dateFrom,
        dateTo,
        status: 'NS'
      });
    }
    // ALL MATCHES
    else {
      console.log('📡 [API /matches] Fetching ALL matches');
      matches = await apiFootballClient.fetchMatches({
        dateFrom,
        dateTo
      });
    }

    // Filter by league if specified
    if (league) {
      matches = matches.filter((m: any) => 
        m.league?.toLowerCase().includes(league.toLowerCase())
      );
    }

    console.log(`✅ [API /matches] Returning ${matches.length} matches`);

    return NextResponse.json({
      success: true,
      matches,
      count: matches.length,
      filters: {
        dateFrom,
        dateTo,
        status: status || 'all',
        live: live === '1',
        league: league || 'all'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API /matches] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      matches: [],
      count: 0
    }, { status: 500 });
  }
}
