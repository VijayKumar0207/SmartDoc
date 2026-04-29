import sys
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db.models import User, UserRole, Base
from app.utils.hash_utils import hash_password

def seed():
    print("Seeding database...")
    
    
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
       
        admin_email = "admin@example.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if not existing_admin:
            print("Creating Admin user...")
            admin = User(
                name="System Admin",
                email=admin_email,
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN
            )
            db.add(admin)
        else:
            print(f"Admin user {admin_email} already exists.")

       
        users_data = [
            {"name": "John Doe", "email": "john@example.com", "pass": "user123"},
            {"name": "Jane Smith", "email": "jane@example.com", "pass": "user123"}
        ]
        
        for user_info in users_data:
            existing_user = db.query(User).filter(User.email == user_info["email"]).first()
            if not existing_user:
                print(f"Creating user {user_info['name']}...")
                user = User(
                    name=user_info["name"],
                    email=user_info["email"],
                    password_hash=hash_password(user_info["pass"]),
                    role=UserRole.USER
                )
                db.add(user)
            else:
                print(f"User {user_info['email']} already exists.")
        
        db.commit()
        print("Seeding completed successfully.")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
