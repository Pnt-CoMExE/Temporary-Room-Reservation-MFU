-- ==========================================
-- 0. กวาดล้างตารางเก่าและตารางขยะทั้งหมดทิ้ง
-- ==========================================
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_addons CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS booking CASCADE; -- ลบตารางที่สะกดผิด
DROP TABLE IF EXISTS addons CASCADE;
DROP TABLE IF EXISTS room_pricing CASCADE;
DROP TABLE IF EXISTS room_rates CASCADE; -- ลบตารางเก่า
DROP TABLE IF EXISTS room_rate CASCADE; -- ลบตารางเก่า
DROP TABLE IF EXISTS rate_document CASCADE; -- ลบตารางเก่า
DROP TABLE IF EXISTS organization_type CASCADE; -- ลบตารางเก่า
DROP TABLE IF EXISTS room CASCADE; -- ลบตารางที่สะกดผิด
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE; -- ลบตารางเก่า (เราใช้ Cookie แทนแล้ว)
DROP TABLE IF EXISTS users CASCADE;


-- ==========================================
-- PostgreSQL Script: MFU Rental Space System
-- (Version: Clean Install)
-- ==========================================

-- 1. ข้อมูลผู้ใช้และความปลอดภัย
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    user_type VARCHAR(50) DEFAULT 'external', -- internal, external, admin
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ข้อมูลห้อง
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- ห้องประชุม, ลานกิจกรรม
    status VARCHAR(50) DEFAULT 'เปิดใช้งาน', -- เปิดใช้งาน, ปิดปรับปรุง
    capacity INT,
    location VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ข้อมูลเรทราคา 3 ระดับ
CREATE TABLE IF NOT EXISTS room_pricing (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    price_half_day_internal NUMERIC(10,2),
    price_full_day_internal NUMERIC(10,2),
    price_half_day_co_organizer NUMERIC(10,2),
    price_full_day_co_organizer NUMERIC(10,2),
    price_half_day_external NUMERIC(10,2),
    price_full_day_external NUMERIC(10,2),
    effective_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ระบบอุปกรณ์เสริม (Add-ons)
CREATE TABLE IF NOT EXISTS addons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price_per_unit NUMERIC(10,2) NOT NULL,
    unit_name VARCHAR(50), -- ตัว, ชุด
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. การทำรายการ (จอง)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_no VARCHAR(50) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
    organization_type VARCHAR(50), -- internal, co_organizer, external
    partner_name VARCHAR(255),
    proof_document_url TEXT,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50), -- ครึ่งวันเช้า, ครึ่งวันบ่าย, เต็มวัน
    objective TEXT,
    room_price NUMERIC(10,2) NOT NULL,
    addons_price NUMERIC(10,2) DEFAULT 0 NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved_pending_payment, approved_paid, disapproved, cancelled
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- การจองอุปกรณ์เสริม
CREATE TABLE IF NOT EXISTS booking_addons (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id INT NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

-- การชำระเงิน
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, successful, failed
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ฟีดแบค / รีวิว
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. การเก็บบันทึกประวัติการทำงานของแอดมิน (Audit Logs)
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    target_table VARCHAR(100),
    target_id INT,
    old_value JSONB, 
    new_value JSONB, 
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);