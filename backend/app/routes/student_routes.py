from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services import student_service
from app.utils.auth_utils import require_admin
from typing import List, Optional

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/", response_model=List[schemas.StudentResponse])
def get_students(
    branch: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Returns all students, optionally filtered by branch. (Admin Only)"""
    return student_service.get_all_students(db, branch=branch)

@router.get("/search", response_model=List[schemas.StudentResponse])
def search_students(
    query: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Search students by name or register number. (Admin Only)"""
    if not query:
        raise HTTPException(status_code=400, detail="Search query is required")
    return student_service.search_students(db, query)

@router.post("/", response_model=schemas.StudentResponse)
def create_student(
    student_in: schemas.StudentCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Create a new student. (Admin Only)"""
    return student_service.create_student(db, student_in)
