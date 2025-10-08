import { NextRequest, NextResponse } from 'next/server';
import { matchArchiver } from '@/lib/db/match-archiver';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      league: searchParams.get('league') || undefined,
      team: searchParams.get('team') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      limit: parseInt(searchParams.get('limit') || '100')
    };

    const matches = await matchArchiver.getHistoricalMatches(filters);
    const stats = await matchArchiver.getDatabaseStats();

    return NextResponse.json({
      success: true,
      count: matches.length,
      matches,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API] Archive error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { match, finalResult } = body;

    if (!match || !finalResult) {
      return NextResponse.json({
        success: false,
        error: 'Missing match or finalResult data'
      }, { status: 400 });
    }

    await matchArchiver.archiveMatch(match, finalResult);

    return NextResponse.json({
      success: true,
      message: 'Match archived successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API] Archive POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
