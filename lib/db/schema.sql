-- Optional raw SQL schema for manual DB setup (Drizzle migrations are preferred)
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisine_type VARCHAR(100),
  theme TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  popularity_score DECIMAL(10,2),
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0 NOT NULL,
  image_url TEXT,
  is_recommended BOOLEAN DEFAULT FALSE NOT NULL,
  font_size_tier VARCHAR(20) DEFAULT 'normal',
  cost_estimate DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_imports (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  source_type VARCHAR(20) NOT NULL,
  raw_sql_path TEXT,
  image_url TEXT,
  parsed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
