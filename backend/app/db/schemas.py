from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class StudentBase(BaseModel):
    name: str
    register_number: str
    branch: str
    year: int
    email: str

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    student_id: int

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(BaseModel):
    id: int
    student_id: int
    file_path: str
    created_at: datetime
    # Optionally include student info
    student: Optional[StudentResponse] = None

    class Config:
        from_attributes = True

class VerificationLogBase(BaseModel):
    status: str
    message: Optional[str] = None

class VerificationLogResponse(VerificationLogBase):
    id: int
    document_id: Optional[int] = None
    verifier_id: Optional[int] = None
    verified_at: datetime

    class Config:
        from_attributes = True

class VerificationResult(BaseModel):
    status: str
    document_intact: bool
    signature_valid: bool
    signer_name: str
    issuer: str
    valid_from: str
    valid_to: str
    algorithm: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    user_name: str
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True
