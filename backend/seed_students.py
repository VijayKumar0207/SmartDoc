import sys
import os

# Add the current directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.db import models

def seed():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    students = [
        {"name": "Arun Kumar", "register_number": "REG001", "branch": "CSE", "year": 3, "email": "arun@example.com"},
        {"name": "Priya Sharma", "register_number": "REG002", "branch": "ECE", "year": 2, "email": "priya@example.com"},
        {"name": "Rahul Verma", "register_number": "REG003", "branch": "MECH", "year": 4, "email": "rahul@example.com"},
        {"name": "Sneha Reddy", "register_number": "REG004", "branch": "CSE", "year": 1, "email": "sneha@example.com"},
        {"name": "Vikram Singh", "register_number": "REG005", "branch": "ECE", "year": 3, "email": "vikram@example.com"},
        {"name": "Ananya Das", "register_number": "REG006", "branch": "MECH", "year": 2, "email": "ananya@example.com"},
        {"name": "Siddharth Malhotra", "register_number": "REG007", "branch": "CSE", "year": 4, "email": "sid@example.com"},
        {"name": "Kavita Iyer", "register_number": "REG008", "branch": "ECE", "year": 1, "email": "kavita@example.com"},
        {"name": "Aditya Rao", "register_number": "REG009", "branch": "MECH", "year": 3, "email": "aditya@example.com"},
        {"name": "Megha Gupta", "register_number": "REG010", "branch": "CSE", "year": 2, "email": "megha@example.com"},
        {"name": "Rohan Joshi", "register_number": "REG011", "branch": "ECE", "year": 4, "email": "rohan@example.com"},
        {"name": "Ishani Bose", "register_number": "REG012", "branch": "MECH", "year": 1, "email": "ishani@example.com"},
        {"name": "Abhishek Nair", "register_number": "REG013", "branch": "CSE", "year": 3, "email": "abhishek@example.com"},
        {"name": "Tanvi Kapoor", "register_number": "REG014", "branch": "ECE", "year": 2, "email": "tanvi@example.com"},
        {"name": "Varun Kulkarni", "register_number": "REG015", "branch": "MECH", "year": 4, "email": "varun@example.com"},
    ]

    added_count = 0
    for s_data in students:
        # Check if student already exists
        exists = db.query(models.Student).filter(models.Student.register_number == s_data["register_number"]).first()
        if not exists:
            student = models.Student(**s_data)
            db.add(student)
            added_count += 1
    
    db.commit()
    db.close()
    print(f"Successfully seeded {added_count} new students.")

if __name__ == "__main__":
    seed()
