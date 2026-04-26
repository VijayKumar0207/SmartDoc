from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    generated_documents = relationship("Document", back_populates="generator")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    register_number = Column(String(50), unique=True, index=True, nullable=False)
    branch = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    email = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    documents = relationship("Document", back_populates="student")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    file_path = Column(String(255), nullable=False)
    document_hash = Column(String(64), index=True, nullable=True)
    verification_uuid = Column(String(50), unique=True, index=True, nullable=True)
    generated_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("Student", back_populates="documents")
    generator = relationship("User", back_populates="generated_documents")
    verifications = relationship("VerificationLog", back_populates="document", cascade="all, delete-orphan")

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    status = Column(String(50), nullable=False) # VALID / TAMPERED / NO_SIGNATURE
    message = Column(String(500), nullable=True)
    verified_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="verifications")
