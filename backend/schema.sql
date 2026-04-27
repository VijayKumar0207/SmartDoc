-- schema.sql
-- PDF Digital Signing & Verification System Schema

-- Create ENUM for User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create USERS table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create DOCUMENTS table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    document_hash VARCHAR(64) NOT NULL, -- SHA256 is 64 hex chars
    signed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for document hash
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(document_hash);

-- Create VERIFICATION_LOGS table
CREATE TABLE IF NOT EXISTS verification_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    verifier_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- VALID / TAMPERED / NO_SIGNATURE
    message VARCHAR(500),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
