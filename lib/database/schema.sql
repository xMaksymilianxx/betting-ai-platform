CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id VARCHAR(100) NOT NULL,
  prediction_type VARCHAR(50) NOT NULL,
  predicted_outcome VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  actual_outcome VARCHAR(50),
  is_correct BOOLEAN,
  odds_taken DECIMAL(6,2),
  profit_loss DECIMAL(10,2),
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  match_date TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS model_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  accuracy_7d DECIMAL(5,2),
  accuracy_30d DECIMAL(5,2),
  roi_7d DECIMAL(6,2),
  roi_30d DECIMAL(6,2),
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_date ON predictions(match_date);
CREATE INDEX idx_performance_model ON model_performance(model_name);
