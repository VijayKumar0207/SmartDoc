from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services.verifier import verify_pdf_signature
from app.utils.logger import logger
import os
import shutil

router = APIRouter(prefix="/verify", tags=["verification"])

@router.post("/", response_model=schemas.VerificationResult)
async def verify_uploaded_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Verifies an uploaded PDF file."""
    temp_path = f"temp_verify_{file.filename}"
    
    try:
        # 1. Save file temporarily
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 2. Verify signature
        result = await verify_pdf_signature(temp_path)
        
        # 3. Log verification in DB
        log = models.VerificationLog(
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
async def get_verification_logs(db: Session = Depends(get_db)):
    """Retrieves all verification history."""
    return db.query(models.VerificationLog).order_by(models.VerificationLog.verified_at.desc()).all()
