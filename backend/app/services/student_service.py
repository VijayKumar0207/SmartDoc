from sqlalchemy.orm import Session
from app.db import models, schemas
from typing import List, Optional

def get_all_students(db: Session, branch: Optional[str] = None) -> List[models.Student]:
    """Retrieve all students, optionally filtered by branch."""
    query = db.query(models.Student)
    if branch:
        query = query.filter(models.Student.branch == branch)
    return query.all()

def search_students(db: Session, search_query: str) -> List[models.Student]:
    """Search students by name or register number (case-insensitive)."""
    return db.query(models.Student).filter(
        (models.Student.name.ilike(f"%{search_query}%")) |
        (models.Student.register_number.ilike(f"%{search_query}%"))
    ).all()

def get_student_by_id(db: Session, student_id: int) -> Optional[models.Student]:
    """Get a single student by ID."""
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def create_student(db: Session, student_in: schemas.StudentCreate) -> models.Student:
    """Create a new student record."""
    db_student = models.Student(**student_in.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student
