-- MFU Space Reservation — initial schema for fresh PostgreSQL (Docker)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255),
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  user_type VARCHAR(50) DEFAULT 'external',
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'available',
  capacity INTEGER DEFAULT 0,
  location VARCHAR(255),
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_pricing (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  price_half_day_internal NUMERIC(10,2) DEFAULT 0,
  price_full_day_internal NUMERIC(10,2) DEFAULT 0,
  price_half_day_co_organizer NUMERIC(10,2) DEFAULT 0,
  price_full_day_co_organizer NUMERIC(10,2) DEFAULT 0,
  price_half_day_external NUMERIC(10,2) DEFAULT 0,
  price_full_day_external NUMERIC(10,2) DEFAULT 0,
  effective_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_no VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  room_id INTEGER REFERENCES rooms(id),
  organization_type VARCHAR(50),
  partner_name VARCHAR(255),
  proof_document_url TEXT,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  objective TEXT,
  room_price NUMERIC(10,2) DEFAULT 0,
  addons_price NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  memo_document_url TEXT,
  approval_document_url TEXT,
  promo_code VARCHAR(50),
  payment_slip_url TEXT,
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price_per_unit NUMERIC(10,2) DEFAULT 0,
  unit_name VARCHAR(50) DEFAULT 'ชิ้น',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_addons (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id INTEGER REFERENCES addons(id),
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  transaction_id VARCHAR(100) UNIQUE,
  amount NUMERIC(10,2) DEFAULT 0,
  payment_method VARCHAR(100),
  payment_gateway_ref TEXT,
  raw_payload JSONB,
  status VARCHAR(50) DEFAULT 'pending_verification',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id SERIAL PRIMARY KEY,
  admin_name VARCHAR(255),
  action VARCHAR(255),
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  limit_count INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  image_url TEXT,
  link VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON bookings(booking_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_room_pricing_room_id ON room_pricing(room_id);
