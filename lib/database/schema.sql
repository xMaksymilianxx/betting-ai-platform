CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(255) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    outcome VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    odds DECIMAL(5,2),
    expected_value DECIMAL(5,2),
    recommendation VARCHAR(50),
    match_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actual_result VARCHAR(50),
    is_correct BOOLEAN,
    profit_loss DECIMAL(10,2),
    features JSONB
);

CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(255) PRIMARY KEY,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    league VARCHAR(255),
    date TIMESTAMP NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50),
    statistics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_performance (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    total_predictions INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2),
    roi DECIMAL(5,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_name, sport)
);

CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_predictions_date ON predictions(match_date);
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_model_performance_sport ON model_performance(sport);
