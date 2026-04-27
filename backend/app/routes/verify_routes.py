from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services.verifier import verify_pdf_signature
from app.utils.logger import logger
from app.utils.auth_utils import get_current_user
from app.utils.hash_utils import generate_file_hash
import os
import shutil

router = APIRouter(prefix="/verify", tags=["verification"])

@router.post("/", response_model=schemas.VerificationResult)
async def verify_uploaded_pdf(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Verifies an uploaded PDF file and links it to a document and verifier."""
    temp_path = f"temp_verify_{file.filename}"
    
    try:
        # 1. Save file temporarily
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Verify signature
        result = await verify_pdf_signature(temp_path)
        
        # 3. Try to link to a document record via hash
        file_hash = generate_file_hash(temp_path)
        doc = db.query(models.Document).filter(models.Document.document_hash == file_hash).first()
        
        # 4. Log verification in DB
        log = models.VerificationLog(
            document_id=doc.id if doc else None,
            verifier_id=current_user.id,
            status=result.get("status", "UNKNOWN"),
            message=f"Signer: {result.get('signer_name')}, Intact: {result.get('document_intact')}"
        )
        db.add(log)
        db.commit()
        
        return result
    except Exception as e:
        logger.error(f"Error during verification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.get("/logs", response_model=list[schemas.VerificationLogResponse])
async def get_verification_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieves verification history. Admins see all, Users see their own activity and their documents."""
    if current_user.role == models.UserRole.ADMIN:
        return db.query(models.VerificationLog).order_by(models.VerificationLog.verified_at.desc()).all()
    
    # For regular users:
    # 1. Logs of verifications they performed
    # 2. Logs of verifications performed on their own documents
    
    student = db.query(models.Student).filter(models.Student.email == current_user.email).first()
    doc_ids = [doc.id for doc in student.documents] if student else []
        
    return db.query(models.VerificationLog).filter(
        (models.VerificationLog.verifier_id == current_user.id) |
        (models.VerificationLog.document_id.in_(doc_ids))
    ).order_by(models.VerificationLog.verified_at.desc()).all()
