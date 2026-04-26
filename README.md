# PDF Digital Signing & Verification System

A production-ready full-stack application for generating, digitally signing, and verifying PDF certificates.

## Features
- **PDF Generation**: Custom certificates with student name and course.
- **Embedded Metadata**: QR codes containing JSON metadata.
- **Digital Signatures**: RSA-2048 signing using `pyHanko` and `cryptography`.
- **Identity Verification**: X.509 self-signed certificates for local CA demonstration.
- **Tamper Detection**: Verification engine to detect binary-level modifications.
- **Audit Logs**: PostgreSQL tracking of all verification attempts.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: FastAPI (Python), SQLAlchemy, ReportLab, pyHanko, qrcode.
- **Database**: PostgreSQL.

---

## Setup Instructions

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (ensure it's running and you've created a database named `pdf_system`)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment in `.env` (root directory):
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/pdf_system"
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Database Setup
Create the tables using the provided SQL schema:
```bash
psql -d pdf_system -f database/schema.sql
```
*(Alternatively, FastAPI will auto-generate the tables on the first run via SQLAlchemy)*

---

## Usage Guide
1. **Generate**: Go to the "Generate" page, enter a name and course, then click "Generate & Sign". Download the PDF.
2. **Verify**: Use the "Verify" page to upload the downloaded PDF. It should return "VALID".
3. **Tamper**: On the "Generate" page, after creating a PDF, click "Simulate Tampering". This downloads a modified version.
4. **Prove Tampering**: Upload the "tampered" version to the "Verify" page. It will return "TAMPERED".
