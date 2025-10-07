import { sql } from '@vercel/postgres';

export async function initDatabase(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        match_id VARCHAR(255) NOT NULL,
        prediction_type VARCHAR(50) NOT NULL,
        outcome VARCHAR(50) NOT NULL,
        confidence DECIMAL(5,2) NOT NULL,
        match_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actual_result VARCHAR(50),
        is_correct BOOLEAN,
        profit_loss DECIMAL(10,2)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(255) PRIMARY KEY,
        home_team VARCHAR(255) NOT NULL,
        away_team VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        home_score INTEGER,
        away_score INTEGER
      )
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database init error:', error);
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
