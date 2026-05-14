
-- Bodaboda PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER | RIDER | ADMIN
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plate_number VARCHAR(20) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    pickup VARCHAR(255) NOT NULL,
    dropoff VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED', -- REQUESTED | ACCEPTED | COMPLETED | CANCELLED
    fare NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ride_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL,
    source VARCHAR(50),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed (passwords are BCrypt of "password123")
INSERT INTO users (full_name, email, phone, password_hash, role) VALUES
('Admin User', 'admin@bodaboda.io', '+254700000000', '$2a$10$7sTUJ6bI5jKqgkjtVyJ9X.qLqHk6yh1wVcL8YhzN8s1mSd5fG3wYO', 'ADMIN'),
('Jane Customer', 'jane@bodaboda.io', '+254711111111', '$2a$10$7sTUJ6bI5jKqgkjtVyJ9X.qLqHk6yh1wVcL8YhzN8s1mSd5fG3wYO', 'CUSTOMER'),
('John Rider', 'john@bodaboda.io', '+254722222222', '$2a$10$7sTUJ6bI5jKqgkjtVyJ9X.qLqHk6yh1wVcL8YhzN8s1mSd5fG3wYO', 'RIDER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO riders (user_id, plate_number, available)
SELECT id, 'KMDA 123A', TRUE FROM users WHERE email='john@bodaboda.io'
ON CONFLICT (user_id) DO NOTHING;
