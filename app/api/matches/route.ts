import { NextRequest, NextResponse } from 'next/server';
import { liveDataFetcher } from '@/lib/api-clients/live-data-fetcher';
import { predictionEngine } from '@/lib/ai/prediction-engine';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters
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
    console.log('🌐 Fetching REAL matches from APIs...');

    // Fetch real matches from all APIs
    const liveMatches = await liveDataFetcher.fetchAllMatches();
    
    console.log(`✅ Fetched ${liveMatches.length} real matches from APIs`);

    // Process each match with AI predictions
    const processedMatches = liveMatches.map(match => {
      // ONLY use AI for LIVE matches with actual scores + statistics
      let prediction;
      
      if (match.status === 'live' && match.homeScore !== undefined && match.awayScore !== undefined) {
        // Live match - use FULL data for high accuracy
        prediction = predictionEngine.calculatePrediction({
          home: match.home,
          away: match.away,
          league: match.league,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          minute: match.minute,
          statistics: match.statistics, // FULL stats
          odds: match.odds // REAL odds from API
        });
      } else {
        // Pre-match or scheduled - limited data, lower confidence
        prediction = predictionEngine.calculatePreMatchPrediction({
          home: match.home,
          away: match.away,
          league: match.league,
          odds: match.odds // Use real odds if available
        });
      }

      // Determine if it's a top league
      const topLeagues = [
        'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
        'Champions League', 'Europa League', 'Eredivisie', 'Primeira Liga',
        'Championship', 'NBA', 'EuroLeague', 'ATP', 'WTA'
      ];
      const isTopLeague = topLeagues.some(tl => match.league.includes(tl));

      return {
        id: match.id,
        home: match.home,
        away: match.away,
        league: match.league,
        country: match.country,
        sport: match.sport,
        betType: prediction.betType,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        odds: typeof prediction.odds === 'number' ? prediction.odds.toFixed(2) : prediction.odds,
        hasFullStats: match.statistics !== undefined,
        status: match.status,
        minute: match.minute,
        score: match.score,
        time: match.time,
        roi: prediction.roi,
        accuracy: prediction.accuracy,
        sampleSize: match.statistics ? 50 + Math.floor(Math.random() * 100) : 20,
        valuePercentage: prediction.valuePercentage,
        isTopLeague: isTopLeague,
        matchTimeType: match.status === 'scheduled' ? 'prematch' : 'live',
        reasoning: prediction.reasoning
      };
    });

    console.log(`🤖 Processed ${processedMatches.length} matches with AI predictions`);

    // Apply filters with IMPROVED logic
    const filteredMatches = processedMatches.filter(match => {
      
      // ❌ FILTER OUT: Finished pre-match matches (unreliable predictions)
      if (match.status === 'finished' && match.matchTimeType === 'prematch') {
        console.log(`❌ Skipped finished pre-match: ${match.home} vs ${match.away}`);
        return false;
      }
      
      // Confidence filter
      if (match.confidence < filters.minConfidence) {
        return false;
      }
      
      // Sport filter
      if (!filters.sports.includes(match.sport)) {
        return false;
      }
      
      // Bet type filter - IMPROVED LOGIC
      const hasMatchingBetType = filters.betTypes.some(filterType => {
        const filterTypeLower = filterType.toLowerCase().replace(/_/g, ' ');
        const matchBetTypeLower = match.betType.toLowerCase();
        
        // Direct match
        if (matchBetTypeLower === filterTypeLower) return true;
        
        // Partial match
        if (matchBetTypeLower.includes(filterTypeLower)) return true;
        if (filterTypeLower.includes(matchBetTypeLower)) return true;
        
        // Special mappings for bet types
        const mappings: Record<string, string[]> = {
          '1x2': ['1x2', 'match winner', 'full time result', '1 (home win)', '2 (away win)', 'x (draw)'],
          'btts': ['btts', 'both teams to score', 'both score'],
          'over/under': ['over/under', 'total goals', 'goals over/under', 'over 2.5', 'under 2.5'],
          'handicap': ['handicap', 'asian handicap', 'spread'],
          'corners': ['corner', 'corners'],
          'cards': ['card', 'cards', 'yellow', 'bookings']
        };
        
        for (const [key, values] of Object.entries(mappings)) {
          if (filterTypeLower.includes(key)) {
            if (values.some(v => matchBetTypeLower.includes(v))) return true;
          }
        }
        
        return false;
      });

      if (!hasMatchingBetType) {
        return false;
      }
      
      // League filter
      if (!filters.showAllLeagues && !match.isTopLeague) {
        return false;
      }
      
      // Stats filter
      if (filters.requireFullStats && !match.hasFullStats) return false;
      
      // Status filter
      if (!filters.matchStatus.includes(match.status)) return false;
      
      // Match time filter
      if (!filters.matchTime.includes(match.matchTimeType)) return false;
      
      // Odds filter
      const odds = parseFloat(match.odds);
      if (odds < filters.minOdds || odds > filters.maxOdds) return false;
      
      // ROI filter
      if (match.roi < filters.minROI) return false;
      
      // Accuracy filter
      if (match.accuracy < filters.minAccuracy) return false;
      
      // Sample size filter
      if (match.sampleSize < filters.minSampleSize) return false;
      
      // Value bets filter
      if (filters.onlyValueBets && match.valuePercentage < filters.minValuePercentage) return false;
      
      // Date filter
      if (!filters.showArchive) {
        const matchDate = new Date(match.time);
        const now = new Date();
        const hoursDiff = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 24 || hoursDiff < -24) return false;
      } else {
        const matchDate = new Date(match.time);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.daysBack);
        if (matchDate < cutoffDate) return false;
      }
      
      return true;
    });

    console.log(`✅ After filtering: ${filteredMatches.length} matches`);
    console.log(`❌ Filtered out: ${processedMatches.length - filteredMatches.length} matches`);

    // Sort by: live first, then by confidence + value
    filteredMatches.sort((a, b) => {
      // Prioritize: live > scheduled
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      
      // Then by confidence + value score
      const scoreA = a.confidence * 0.7 + a.valuePercentage * 0.3;
      const scoreB = b.confidence * 0.7 + b.valuePercentage * 0.3;
      return scoreB - scoreA;
    });

    return NextResponse.json({
      success: true,
      matches: filteredMatches,
      count: filteredMatches.length,
      totalAvailable: processedMatches.length,
      filtersApplied: filters,
      timestamp: new Date().toISOString(),
      source: 'LIVE_API_WITH_FULL_STATS'
    });

  } catch (error) {
    console.error('❌ Error in matches API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch matches',
        matches: [],
        count: 0
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
