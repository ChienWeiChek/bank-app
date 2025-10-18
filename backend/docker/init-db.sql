-- Bank App Database Initialization Script
-- This script creates the necessary tables and indexes for the banking application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('checking', 'savings', 'credit')) NOT NULL,
  name VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) CHECK (type IN ('transfer', 'payment', 'deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) CHECK (status IN ('completed', 'pending', 'failed')) NOT NULL,
  from_account_id UUID REFERENCES accounts(id),
  to_account_id UUID REFERENCES accounts(id),
  recipient_name VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);

-- Insert sample data for development
-- Sample user (password: SecurePassword123!)
INSERT INTO users (id, email, name, phone_number, password_hash) VALUES
('11111111-1111-1111-1111-111111111111', 'demo@bankapp.com', 'Demo User', '+1234567890', '$2a$12$HfYccbcuQFShkZjQpgJwruyAl8ubKdLfe.X/QgrItgitKK4ktZdOi'),
('88880000-0000-0000-0000-000000000000', 'alice.taylor@bankapp.com', 'Alice Taylor', '+1555000001', '$2a$12$HfYccbcuQFShkZjQpgJwruyAl8ubKdLfe.X/QgrItgitKK4ktZdOi'),
('88880000-0000-0000-0000-000000000001', 'brian.lee@bankapp.com', 'Brian Lee', '+1555000002', '$2a$12$HfYccbcuQFShkZjQpgJwruyAl8ubKdLfe.X/QgrItgitKK4ktZdOi'),
('88880000-0000-0000-0000-000000000002', 'carla.mendez@bankapp.com', 'Carla Mendez', '+1555000003', '$2a$12$HfYccbcuQFShkZjQpgJwruyAl8ubKdLfe.X/QgrItgitKK4ktZdOi'),
('88880000-0000-0000-0000-000000000003', 'david.nguyen@bankapp.com', 'David Nguyen', '+1555000004', '$2a$12$HfYccbcuQFShkZjQpgJwruyAl8ubKdLfe.X/QgrItgitKK4ktZdOi')
ON CONFLICT (email) DO NOTHING;

-- Sample accounts
INSERT INTO accounts (id, user_id, type, name, number, balance, currency) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'checking', 'Main Checking', '****1234', 12500.75, 'USD'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'savings', 'Emergency Fund', '****5678', 8500.25, 'USD'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'credit', 'Credit Card', '****9012', -1250.50, 'USD'),

-- Alice Taylor
('a1000000-0000-0000-0000-000000000001', '88880000-0000-0000-0000-000000000000', 'checking', 'Alice Main Checking', '****1100', 2450.25, 'USD'),
('a1000000-0000-0000-0000-000000000002', '88880000-0000-0000-0000-000000000000', 'savings', 'Alice Savings', '****1101', 5400.50, 'USD'),

-- Brian Lee
('a2000000-0000-0000-0000-000000000001', '88880000-0000-0000-0000-000000000001', 'checking', 'Brian Checking', '****2200', 8600.00, 'USD'),
('a2000000-0000-0000-0000-000000000002', '88880000-0000-0000-0000-000000000001', 'savings', 'Brian Travel Fund', '****2201', 1200.30, 'USD'),

-- Carla Mendez
('a3000000-0000-0000-0000-000000000001', '88880000-0000-0000-0000-000000000002', 'checking', 'Carla Everyday', '****3300', 3900.75, 'USD'),
('a3000000-0000-0000-0000-000000000002', '88880000-0000-0000-0000-000000000002', 'savings', 'Carla SaveMore', '****3301', 9200.10, 'USD'),

-- David Nguyen
('a4000000-0000-0000-0000-000000000001', '88880000-0000-0000-0000-000000000003', 'checking', 'David Main Account', '****4400', 10100.00, 'USD'),
('a4000000-0000-0000-0000-000000000002', '88880000-0000-0000-0000-000000000003', 'credit',   'David Credit Line', '****4401', -500.00, 'USD')
ON CONFLICT (id) DO NOTHING;

-- Sample contacts
INSERT INTO contacts (id, user_id, name, phone_number, email) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'John Doe', '+1234567890', 'john.doe@email.com'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Jane Smith', '+0987654321', 'jane.smith@email.com'),
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Bob Johnson', '+1122334455', NULL)
ON CONFLICT (id) DO NOTHING;

-- Sample transactions
INSERT INTO transactions (id, type, amount, description, date, status, from_account_id, to_account_id, recipient_name, user_id) VALUES
('88888888-8888-8888-8888-888888888888', 'transfer', -250.00, 'Transfer to John Doe', '2025-10-15T14:30:00Z', 'completed', '22222222-2222-2222-2222-222222222222', NULL, 'John Doe', '11111111-1111-1111-1111-111111111111'),
('99999999-9999-9999-9999-999999999999', 'payment', -89.99, 'Electricity Bill', '2025-10-14T09:15:00Z', 'completed', '22222222-2222-2222-2222-222222222222', NULL, 'Utility Company', '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'deposit', 1500.00, 'Salary Deposit', '2025-10-10T08:00:00Z', 'completed', NULL, '22222222-2222-2222-2222-222222222222', 'Employer', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;
