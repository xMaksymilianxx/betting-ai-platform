import { sql } from '@vercel/postgres';

export async function savePrediction(prediction: any): Promise<void> {
  try {
    await sql`
      INSERT INTO predictions (
        match_id, prediction_type, outcome, confidence, 
        odds, expected_value, recommendation, match_date, features
      ) VALUES (
        ${prediction.matchId}, ${prediction.type}, ${prediction.prediction},
        ${prediction.confidence}, ${prediction.odds || null}, 
        ${prediction.expectedValue || null}, ${prediction.recommendation || null},
        ${prediction.matchDate}, ${JSON.stringify(prediction.features || {})}
      )
    `;
  } catch (error) {
    console.error('Save prediction error:', error);
  }
}

export async function updatePredictionResult(
  matchId: string,
  actualResult: string,
  profitLoss: number
): Promise<void> {
  try {
    await sql`
      UPDATE predictions
      SET actual_result = ${actualResult},
          is_correct = (outcome = ${actualResult}),
          profit_loss = ${profitLoss}
      WHERE match_id = ${matchId}
    `;
  } catch (error) {
    console.error('Update prediction error:', error);
  }
}

export async function getPerformanceMetrics(days: number = 30): Promise<any> {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
        AVG(confidence) as avg_confidence,
        SUM(profit_loss) as profit
      FROM predictions
      WHERE match_date >= NOW() - INTERVAL '${days} days'
        AND actual_result IS NOT NULL
    `;
    
    const row = result.rows[0];
    return {
      total: parseInt(row.total) || 0,
      correct: parseInt(row.correct) || 0,
      accuracy: row.total > 0 ? (row.correct / row.total) * 100 : 0,
      avgConfidence: parseFloat(row.avg_confidence) || 0,
      profit: parseFloat(row.profit) || 0,
    };
  } catch (error) {
    console.error('Get metrics error:', error);
    return { total: 0, correct: 0, accuracy: 0, avgConfidence: 0, profit: 0 };
  }
}

export async function getPredictionHistory(limit: number = 50): Promise<any[]> {
  try {
    const result = await sql`
      SELECT *
      FROM predictions
      ORDER BY match_date DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error('Get history error:', error);
    return [];
  }
}

export async function updateModelPerformance(
  modelName: string,
  sport: string,
  metrics: any
): Promise<void> {
  try {
    await sql`
      INSERT INTO model_performance (model_name, sport, total_predictions, correct_predictions, accuracy, roi)
      VALUES (${modelName}, ${sport}, ${metrics.total}, ${metrics.correct}, ${metrics.accuracy}, ${metrics.roi})
      ON CONFLICT (model_name, sport)
      DO UPDATE SET
        total_predictions = ${metrics.total},
        correct_predictions = ${metrics.correct},
        accuracy = ${metrics.accuracy},
        roi = ${metrics.roi},
        last_updated = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Update model performance error:', error);
  }
}
