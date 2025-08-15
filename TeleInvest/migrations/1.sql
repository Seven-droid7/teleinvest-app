
CREATE TABLE channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  subscriber_count INTEGER DEFAULT 0,
  daily_reach INTEGER DEFAULT 0,
  cpm REAL DEFAULT 0.0,
  monthly_revenue REAL DEFAULT 0.0,
  growth_rate REAL DEFAULT 0.0,
  total_shares INTEGER DEFAULT 100,
  available_shares INTEGER DEFAULT 100,
  price_per_share REAL DEFAULT 0.0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
