-- Database Schema for PDF Signing & Verification System

-- Table for storing document metadata
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing verification logs
CREATE TABLE verification_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL, -- VALID, TAMPERED, NO_SIGNATURE, INVALID
    message TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_documents_name ON documents(name);
CREATE INDEX idx_verification_logs_status ON verification_logs(status);
