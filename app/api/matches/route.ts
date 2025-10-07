import { NextRequest, NextResponse } from 'next/server';

// Real team names database
const TEAMS = {
  football: {
    'Premier League': [
      ['Manchester United', 'Liverpool'], ['Arsenal', 'Chelsea'], ['Manchester City', 'Tottenham'],
      ['Newcastle', 'Aston Villa'], ['Brighton', 'West Ham'], ['Everton', 'Fulham'],
      ['Brentford', 'Crystal Palace'], ['Wolves', 'Nottingham Forest'], ['Bournemouth', 'Luton Town']
    ],
    'La Liga': [
      ['Real Madrid', 'Barcelona'], ['Atletico Madrid', 'Sevilla'], ['Real Sociedad', 'Athletic Bilbao'],
      ['Valencia', 'Villarreal'], ['Real Betis', 'Osasuna'], ['Celta Vigo', 'Getafe']
    ],
    'Serie A': [
      ['Inter Milan', 'AC Milan'], ['Juventus', 'Napoli'], ['Roma', 'Lazio'],
      ['Atalanta', 'Fiorentina'], ['Bologna', 'Torino'], ['Sassuolo', 'Udinese']
    ],
    'Bundesliga': [
      ['Bayern Munich', 'Borussia Dortmund'], ['RB Leipzig', 'Bayer Leverkusen'], ['Eintracht Frankfurt', 'Union Berlin'],
      ['Freiburg', 'Wolfsburg'], ['Hoffenheim', 'Mainz'], ['Augsburg', 'Bochum']
    ],
    '2. Bundesliga': [
      ['Schalke 04', 'Hamburger SV'], ['St. Pauli', 'Hannover 96'], ['Fortuna Düsseldorf', 'Kaiserslautern']
    ],
    'League One': [
      ['Portsmouth', 'Derby County'], ['Bolton', 'Barnsley'], ['Charlton', 'Oxford United']
    ]
  },
  basketball: {
    'NBA': [
      ['Los Angeles Lakers', 'Golden State Warriors'], ['Boston Celtics', 'Miami Heat'], 
      ['Milwaukee Bucks', 'Philadelphia 76ers'], ['Denver Nuggets', 'Phoenix Suns'],
      ['Dallas Mavericks', 'LA Clippers'], ['Brooklyn Nets', 'New York Knicks']
    ],
    'EuroLeague': [
      ['Real Madrid', 'Barcelona'], ['Olympiacos', 'Panathinaikos'], ['Fenerbahce', 'Anadolu Efes']
    ],
    'NCAA': [
      ['Duke', 'North Carolina'], ['Kentucky', 'Kansas'], ['UCLA', 'Gonzaga']
    ]
  },
  tennis: {
    'ATP Tour': [
      ['Novak Djokovic', 'Carlos Alcaraz'], ['Jannik Sinner', 'Daniil Medvedev'],
      ['Alexander Zverev', 'Andrey Rublev'], ['Stefanos Tsitsipas', 'Holger Rune']
    ],
    'WTA Tour': [
      ['Iga Świątek', 'Aryna Sabalenka'], ['Coco Gauff', 'Elena Rybakina'],
      ['Jessica Pegula', 'Ons Jabeur'], ['Maria Sakkari', 'Barbora Krejcikova']
    ],
    'Grand Slam': [
      ['Rafael Nadal', 'Roger Federer'], ['Serena Williams', 'Simona Halep']
    ]
  },
  hockey: {
    'NHL': [
      ['Edmonton Oilers', 'Vegas Golden Knights'], ['Toronto Maple Leafs', 'Boston Bruins'],
      ['Colorado Avalanche', 'Dallas Stars'], ['New York Rangers', 'Carolina Hurricanes']
    ],
    'KHL': [
      ['CSKA Moscow', 'SKA St. Petersburg'], ['Ak Bars Kazan', 'Metallurg Magnitogorsk']
    ],
    'SHL': [
      ['Frölunda HC', 'Färjestad BK'], ['Djurgårdens IF', 'Malmö Redhawks']
    ]
  }
};

// Realistic bet type configurations per sport
const BET_TYPES_CONFIG: Record<string, string[]> = {
  football: ['1X2', 'BTTS', 'Over/Under 2.5', 'Handicap', 'Corners Over 9.5', 'Cards Over 3.5', 'Both Score', 'Clean Sheet', 'Half-Time Result', 'First Goal'],
  basketball: ['Money Line', 'Spread', 'Total Points Over/Under', 'First Half Winner', 'Quarter Winner'],
  tennis: ['Match Winner', 'Set Winner', 'Games Handicap', 'Total Games Over/Under', 'Set Correct Score'],
  hockey: ['Money Line', 'Puck Line', 'Total Goals Over/Under', 'Period Winner', 'Both Teams Score']
};

function getRandomTeams(sport: string, league: string) {
  const sportTeams = TEAMS[sport as keyof typeof TEAMS];
  if (!sportTeams) return ['Team A', 'Team B'];
  
  const leagueTeams = sportTeams[league as keyof typeof sportTeams];
  if (!leagueTeams || leagueTeams.length === 0) {
    // Fallback to any league in sport
    const allLeagues = Object.values(sportTeams).flat();
    if (allLeagues.length > 0) {
      const randomMatch = allLeagues[Math.floor(Math.random() * allLeagues.length)];
      return randomMatch;
    }
    return ['Team A', 'Team B'];
  }
  
  const randomMatch = leagueTeams[Math.floor(Math.random() * leagueTeams.length)];
  return randomMatch;
}

function getRealisticBetType(sport: string): string {
  const sportBets = BET_TYPES_CONFIG[sport];
  if (!sportBets) return '1X2';
  return sportBets[Math.floor(Math.random() * sportBets.length)];
}

// Generate realistic mock matches
function generateMockMatches() {
  const sports = ['football', 'basketball', 'tennis', 'hockey'];
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
    const leagueList = leagues[sport as keyof typeof leagues];
    const league = leagueList[Math.floor(Math.random() * leagueList.length)];
    const betType = getRealisticBetType(sport);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const teams = getRandomTeams(sport, league);
    
    const matchTime = new Date(now);
    matchTime.setHours(matchTime.getHours() + Math.floor(Math.random() * 48) - 24);

    // Generate realistic odds based on confidence
    const confidence = Math.floor(Math.random() * 100);
    let odds: number;
    if (confidence > 80) {
      odds = 1.2 + Math.random() * 0.8; // 1.2 - 2.0 for high confidence
    } else if (confidence > 60) {
      odds = 1.5 + Math.random() * 1.5; // 1.5 - 3.0 for medium confidence
    } else if (confidence > 40) {
      odds = 2.0 + Math.random() * 3.0; // 2.0 - 5.0 for low-medium confidence
    } else {
      odds = 3.0 + Math.random() * 7.0; // 3.0 - 10.0 for low confidence
    }

    matches.push({
      id: `match-${i}`,
      home: teams[0],
      away: teams[1],
      league: league,
      sport: sport,
      betType: betType,
      confidence: confidence,
      odds: odds.toFixed(2),
      hasFullStats: Math.random() > 0.3,
      status: status,
      time: matchTime.toISOString(),
      roi: Math.floor(Math.random() * 200 - 100),
      accuracy: Math.floor(Math.random() * 100),
      sampleSize: Math.floor(Math.random() * 150),
      valuePercentage: Math.floor(Math.random() * 50),
      isTopLeague: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'NBA', 'NHL', 'ATP Tour', 'WTA Tour'].includes(league),
      corners: sport === 'football' ? Math.floor(Math.random() * 20) : 0,
      cards: sport === 'football' ? Math.floor(Math.random() * 10) : 0,
      matchTimeType: status === 'scheduled' ? 'prematch' : 'live',
      score: status === 'live' || status === 'finished' ? `${Math.floor(Math.random() * 5)} - ${Math.floor(Math.random() * 5)}` : null
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

    // Generate matches with real team names
    const allMatches = generateMockMatches();
    
    console.log(`📊 Total matches from API: ${allMatches.length}`);

    // Apply filters
    const filteredMatches = allMatches.filter(match => {
      // Confidence filter
      if (match.confidence < filters.minConfidence) return false;
      
      // Sport filter
      if (!filters.sports.includes(match.sport)) return false;
      
      // Bet type filter - check if ANY bet type from filter matches
      const matchBetTypeBase = match.betType.split(' ')[0]; // Get base type (e.g., "Over/Under" from "Over/Under 2.5")
      const hasMatchingBetType = filters.betTypes.some(filterType => {
        const filterTypeBase = filterType.split(' ')[0];
        return matchBetTypeBase.includes(filterTypeBase) || filterType.includes(matchBetTypeBase);
      });
      if (!hasMatchingBetType) return false;
      
      // League filter
      if (!filters.showAllLeagues && !match.isTopLeague) return false;
      
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
      
      // Archive/date filter
      if (!filters.showArchive) {
        const matchDate = new Date(match.time);
        const now = new Date();
        const daysDiff = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 1) return false;
      } else {
        const matchDate = new Date(match.time);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.daysBack);
        if (matchDate < cutoffDate) return false;
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
