import { NextRequest, NextResponse } from 'next/server';

// Mock data generator for testing
function generateMockMatches() {
  const sports = ['football', 'basketball', 'tennis', 'hockey'];
  const betTypes = ['1X2', 'BTTS', 'Over/Under', 'Handicap', 'Corners', 'Cards'];
  const statuses = ['live', 'scheduled', 'finished'];
  const leagues = {
    football: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', '2. Bundesliga', 'League One'],
    basketball: ['NBA', 'EuroLeague', 'NCAA'],
    tennis: ['ATP Tour', 'WTA Tour', 'Grand Slam'],
    hockey: ['NHL', 'KHL', 'SHL']
  };

  const matches = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const sport = sports[Math.floor(Math.random() * sports.length)];
    const betType = betTypes[Math.floor(Math.random() * betTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const leagueList = leagues[sport as keyof typeof leagues];
    const league = leagueList[Math.floor(Math.random() * leagueList.length)];
    
    const matchTime = new Date(now);
    matchTime.setHours(matchTime.getHours() + Math.floor(Math.random() * 48) - 24);

    matches.push({
      id: `match-${i}`,
      home: `Team Home ${i}`,
      away: `Team Away ${i}`,
      league: league,
      sport: sport,
      betType: betType,
      confidence: Math.floor(Math.random() * 100),
      odds: (Math.random() * 9 + 1.1).toFixed(2),
      hasFullStats: Math.random() > 0.3,
      status: status,
      time: matchTime.toISOString(),
      roi: Math.floor(Math.random() * 200 - 100),
      accuracy: Math.floor(Math.random() * 100),
      sampleSize: Math.floor(Math.random() * 150),
      valuePercentage: Math.floor(Math.random() * 50),
      isTopLeague: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'NBA', 'NHL', 'ATP Tour'].includes(league),
      corners: Math.floor(Math.random() * 20),
      cards: Math.floor(Math.random() * 10),
      matchTimeType: status === 'scheduled' ? 'prematch' : 'live'
    });
  }

  return matches;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse all filter settings
    const filters = {
      minConfidence: parseInt(searchParams.get('minConfidence') || '0'),
      showAllLeagues: searchParams.get('showAllLeagues') !== 'false',
      sports: searchParams.get('sports')?.split(',') || ['football'],
      requireFullStats: searchParams.get('requireFullStats') === 'true',
      matchStatus: searchParams.get('matchStatus')?.split(',') || ['live', 'scheduled'],
      betTypes: searchParams.get('betTypes')?.split(',') || ['1X2'],
      minOdds: parseFloat(searchParams.get('minOdds') || '1.01'),
      maxOdds: parseFloat(searchParams.get('maxOdds') || '100'),
      minROI: parseInt(searchParams.get('minROI') || '-100'),
      minAccuracy: parseInt(searchParams.get('minAccuracy') || '0'),
      minSampleSize: parseInt(searchParams.get('minSampleSize') || '0'),
      showArchive: searchParams.get('showArchive') === 'true',
      daysBack: parseInt(searchParams.get('daysBack') || '7'),
      matchTime: searchParams.get('matchTime')?.split(',') || ['prematch', 'live'],
      onlyValueBets: searchParams.get('onlyValueBets') === 'true',
      minValuePercentage: parseInt(searchParams.get('minValuePercentage') || '0'),
    };

    console.log('🎛️ Applied filters:', filters);

    // Generate or fetch matches
    // TODO: Replace with actual API calls
    const allMatches = generateMockMatches();
    
    console.log(`📊 Total matches from API: ${allMatches.length}`);

    // Apply filters
    const filteredMatches = allMatches.filter(match => {
      // Confidence filter
      if (match.confidence < filters.minConfidence) {
        return false;
      }
      
      // Sport filter
      if (!filters.sports.includes(match.sport)) {
        return false;
      }
      
      // Bet type filter
      if (!filters.betTypes.includes(match.betType)) {
        return false;
      }
      
      // League filter
      if (!filters.showAllLeagues && !match.isTopLeague) {
        return false;
      }
      
      // Stats filter
      if (filters.requireFullStats && !match.hasFullStats) {
        return false;
      }
      
      // Status filter
      if (!filters.matchStatus.includes(match.status)) {
        return false;
      }
      
      // Match time filter (prematch vs live)
      if (!filters.matchTime.includes(match.matchTimeType)) {
        return false;
      }
      
      // Odds filter
      const odds = parseFloat(match.odds);
      if (odds < filters.minOdds || odds > filters.maxOdds) {
        return false;
      }
      
      // ROI filter
      if (match.roi < filters.minROI) {
        return false;
      }
      
      // Accuracy filter
      if (match.accuracy < filters.minAccuracy) {
        return false;
      }
      
      // Sample size filter
      if (match.sampleSize < filters.minSampleSize) {
        return false;
      }
      
      // Value bets filter
      if (filters.onlyValueBets) {
        if (match.valuePercentage < filters.minValuePercentage) {
          return false;
        }
      }
      
      // Archive/date filter
      if (!filters.showArchive) {
        const matchDate = new Date(match.time);
        const now = new Date();
        const daysDiff = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1) { // Only show matches from last 24h if archive disabled
          return false;
        }
      } else {
        const matchDate = new Date(match.time);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.daysBack);
        if (matchDate < cutoffDate) {
          return false;
        }
      }
      
      return true;
    });

    console.log(`✅ Matches after filtering: ${filteredMatches.length}`);
    console.log(`❌ Filtered out: ${allMatches.length - filteredMatches.length}`);

    // Sort by confidence descending
    filteredMatches.sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({
      success: true,
      matches: filteredMatches,
      count: filteredMatches.length,
      totalAvailable: allMatches.length,
      filtersApplied: filters,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in matches API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch matches',
        matches: [],
        count: 0
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
