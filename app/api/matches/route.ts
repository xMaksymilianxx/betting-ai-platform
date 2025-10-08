import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get('dateFrom') || new Date().toISOString().split('T')[0];
    const dateTo = searchParams.get('dateTo') || dateFrom;
    const status = searchParams.get('status'); // 'NS', 'FT' or null
    const live = searchParams.get('live');     // '1' or null

    console.log('🎯 [API /matches] MOCK params:', { dateFrom, dateTo, status, live });

    // Mockowe dane
    const mockMatches = [
      {
        id: '1',
        home: 'Manchester United',
        away: 'Liverpool',
        league: 'Premier League',
        country: 'England',
        time: new Date().toISOString(),
        status: live === '1' ? 'live' : status === 'FT' ? 'finished' : 'scheduled',
        score: live === '1' ? { home: 1, away: 1 } : null,
        odds: {
          home: 2.10, draw: 3.40, away: 3.50,
          over15: 1.30, under15: 3.50,
          over25: 1.85, under25: 2.00,
          over35: 2.60, under35: 1.50,
          bttsYes: 1.90, bttsNo: 1.90
        },
        venue: 'Old Trafford'
      },
      {
        id: '2',
        home: 'Arsenal',
        away: 'Chelsea',
        league: 'Premier League',
        country: 'England',
        time: new Date().toISOString(),
        status: live === '1' ? 'live' : status === 'FT' ? 'finished' : 'scheduled',
        score: live === '1' ? { home: 2, away: 0 } : null,
        odds: {
          home: 1.95, draw: 3.60, away: 3.80,
          over15: 1.25, under15: 3.80,
          over25: 1.75, under25: 2.10,
          over35: 2.80, under35: 1.45,
          bttsYes: 1.85, bttsNo: 1.95
        },
        venue: 'Emirates Stadium'
      },
      {
        id: '3',
        home: 'Barcelona',
        away: 'Real Madrid',
        league: 'La Liga',
        country: 'Spain',
        time: new Date().toISOString(),
        status: live === '1' ? 'live' : status === 'FT' ? 'finished' : 'scheduled',
        score: live === '1' ? { home: 3, away: 2 } : null,
        odds: {
          home: 2.20, draw: 3.30, away: 3.20,
          over15: 1.20, under15: 4.00,
          over25: 1.65, under25: 2.25,
          over35: 2.40, under35: 1.60,
          bttsYes: 1.75, bttsNo: 2.05
        },
        venue: 'Camp Nou'
      }
    ];

    console.log(`✅ [API /matches] Returning ${mockMatches.length} mock matches`);

    return NextResponse.json({
      success: true,
      matches: mockMatches,
      count: mockMatches.length,
      timestamp: new Date().toISOString(),
      note: 'MOCK DATA — replace with real client when ready'
    });
  } catch (error: any) {
    console.error('❌ [API /matches] Mock error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      matches: [],
      count: 0
    }, { status: 500 });
  }
}
