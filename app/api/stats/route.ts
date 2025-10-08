import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    // Get all predictions with outcomes
    const { data: predictions, error } = await supabase
      .from('prediction_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const totalPredictions = predictions?.length || 0;
    const completedPredictions = predictions?.filter(p => p.outcome) || [];
    const correctPredictions = completedPredictions.filter(p => p.outcome === 'won').length;
    const accuracy = completedPredictions.length > 0 
      ? Math.round((correctPredictions / completedPredictions.length) * 100) 
      : 0;

    // Calculate profit/loss
    const totalProfit = completedPredictions.reduce((sum, p) => {
      return sum + (p.profit_loss || 0);
    }, 0);

    // Calculate ROI
    const totalStake = completedPredictions.reduce((sum, p) => {
      return sum + (p.stake_suggested || 1);
    }, 0);
    const roi = totalStake > 0 ? Math.round((totalProfit / totalStake) * 100) : 0;

    // By Type
    const byType: any = {};
    completedPredictions.forEach(p => {
      const type = p.prediction_type;
      if (!byType[type]) {
        byType[type] = {
          total: 0,
          won: 0,
          lost: 0,
          profit: 0,
          accuracy: 0,
          roi: 0
        };
      }
      
      byType[type].total++;
      if (p.outcome === 'won') byType[type].won++;
      if (p.outcome === 'lost') byType[type].lost++;
      byType[type].profit += p.profit_loss || 0;
    });

    // Calculate accuracy and ROI per type
    Object.keys(byType).forEach(type => {
      const data = byType[type];
      data.accuracy = Math.round((data.won / data.total) * 100);
      const typeStake = completedPredictions
        .filter(p => p.prediction_type === type)
        .reduce((sum, p) => sum + (p.stake_suggested || 1), 0);
      data.roi = typeStake > 0 ? Math.round((data.profit / typeStake) * 100) : 0;
    });

    // By League (from match data - would need to join with match_history)
    const byLeague: any = {};

    return NextResponse.json({
      success: true,
      stats: {
        totalPredictions,
        correctPredictions,
        accuracy,
        totalProfit: Math.round(totalProfit * 100) / 100,
        roi,
        byType,
        byLeague,
        recentPredictions: predictions?.slice(0, 20) || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [API] Stats error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
