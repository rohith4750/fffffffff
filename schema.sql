-- PostgreSQL Database DDL Schema for FinFlow Microfinance System

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Admin & Field Agents with PIN authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    pin_code VARCHAR(10) NOT NULL, -- 4-digit quick agent PIN
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'AGENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    avatar VARCHAR(500),
    assigned_area VARCHAR(255),
    target_daily_collection NUMERIC(12, 2) DEFAULT 25000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    occupation VARCHAR(255),
    aadhaar_number VARCHAR(30),
    pan_number VARCHAR(20),
    photo_url TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    guarantor_name VARCHAR(255),
    guarantor_mobile VARCHAR(20),
    guarantor_address TEXT,
    guarantor_relationship VARCHAR(100),
    assigned_agent_id VARCHAR(64) REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('NEW', 'ACTIVE', 'BLOCKED', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customer Documents Table (Cloudinary storage URLs)
CREATE TABLE IF NOT EXISTS customer_documents (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    public_id VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Loans Table (Weekly & Monthly finance)
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(64) PRIMARY KEY,
    loan_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
    assigned_agent_id VARCHAR(64) NOT NULL REFERENCES users(id),
    loan_type VARCHAR(20) NOT NULL CHECK (loan_type IN ('WEEKLY', 'MONTHLY')),
    principal_amount NUMERIC(12, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    total_interest_expected NUMERIC(12, 2) NOT NULL,
    total_amount_expected NUMERIC(12, 2) NOT NULL,
    tenure_count INTEGER NOT NULL,
    disbursed_date DATE,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DISBURSED', 'ACTIVE', 'OVERDUE', 'CLOSED')),
    principal_outstanding NUMERIC(12, 2) NOT NULL,
    interest_outstanding NUMERIC(12, 2) NOT NULL,
    penalty_outstanding NUMERIC(12, 2) DEFAULT 0,
    total_collected NUMERIC(12, 2) DEFAULT 0,
    penalty_type VARCHAR(30) DEFAULT 'DAILY_FIXED',
    penalty_rate_or_amount NUMERIC(10, 2) DEFAULT 50.00,
    days_overdue INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Loan Schedules Table
CREATE TABLE IF NOT EXISTS loan_schedules (
    id VARCHAR(64) PRIMARY KEY,
    loan_id VARCHAR(64) NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    expected_principal NUMERIC(12, 2) NOT NULL,
    expected_interest NUMERIC(12, 2) NOT NULL,
    total_due NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_date DATE
);

-- 6. Collections Table (GPS verified transactions)
CREATE TABLE IF NOT EXISTS collections (
    id VARCHAR(64) PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    loan_id VARCHAR(64) NOT NULL REFERENCES loans(id),
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id),
    agent_id VARCHAR(64) NOT NULL REFERENCES users(id),
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    penalty_paid NUMERIC(12, 2) DEFAULT 0,
    interest_paid NUMERIC(12, 2) DEFAULT 0,
    principal_paid NUMERIC(12, 2) DEFAULT 0,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    accuracy_meters INTEGER DEFAULT 8,
    location_address TEXT,
    device_info TEXT,
    remarks TEXT,
    proof_image_url TEXT,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Double-Entry General Ledger Table
CREATE TABLE IF NOT EXISTS general_ledger (
    id VARCHAR(64) PRIMARY KEY,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL,
    account VARCHAR(100) NOT NULL,
    debit NUMERIC(12, 2) DEFAULT 0,
    credit NUMERIC(12, 2) DEFAULT 0,
    reference_id VARCHAR(64) NOT NULL,
    description TEXT NOT NULL
);

-- 8. Immutable Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    device VARCHAR(255),
    ip_address VARCHAR(50)
);

-- Indexes for ultra-fast queries
CREATE INDEX IF NOT EXISTS idx_customers_assigned_agent ON customers(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_loans_customer ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_collections_agent ON collections(agent_id);
CREATE INDEX IF NOT EXISTS idx_collections_loan ON collections(loan_id);
CREATE INDEX IF NOT EXISTS idx_ledger_account ON general_ledger(account);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
