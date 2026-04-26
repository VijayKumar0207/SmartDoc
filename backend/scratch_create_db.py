# scratch/create_db.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load .env from root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

def create_db():
    # Load database URL from .env
    db_url_full = os.getenv("DATABASE_URL")
    if not db_url_full:
        print("DATABASE_URL not found in .env")
        return

    # We need to connect to the default 'postgres' database to create a new one
    # Strip the target db name and replace with 'postgres'
    base_url = db_url_full.rsplit("/", 1)[0] + "/postgres"
    
    print(f"Attempting to connect to: {base_url}")
    engine = create_engine(base_url, isolation_level="AUTOCOMMIT")
    
    db_name = "pdf_signing_db"
    
    try:
        with engine.connect() as conn:
            # Check if database exists
            res = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{db_name}'"))
            if not res.fetchone():
                print(f"Creating database {db_name}...")
                conn.execute(text(f"CREATE DATABASE {db_name}"))
                print("Database created successfully.")
            else:
                print(f"Database {db_name} already exists.")
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_db()
