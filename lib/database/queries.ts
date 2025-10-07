import { sql } from '@vercel/postgres';

export async function savePrediction(prediction: any) {
  try {
    await sql`
      INSERT INTO predictions (match_id, prediction_type, predicted_outcome, confidence_score, match_date, features)
      VALUES (${prediction.matchId}, ${prediction.type}, ${prediction.prediction}, ${prediction.confidence}, ${prediction.matchDate}, ${JSON.stringify(prediction.features)})
    `;
  } catch (error) {
    console.error('Database error:', error);
  }
}

export async function getPerformanceMetrics() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
        AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100 as accuracy
      FROM predictions
      WHERE created_at > NOW() - INTERVAL '30 days'
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Database error:', error);
    return { total: 0, correct: 0, accuracy: 0 };
  }
}
