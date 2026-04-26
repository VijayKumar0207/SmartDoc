from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services.pdf_generator import create_certificate_pdf
from app.services.signer import sign_pdf
from app.services.tamper import tamper_pdf
from app.utils.logger import logger
import os
import uuid

router = APIRouter(prefix="/pdf", tags=["pdf"])

@router.post("/generate", response_model=schemas.DocumentResponse)
async def generate_and_sign_pdf(doc_in: schemas.DocumentCreate, db: Session = Depends(get_db)):
    """Generates, signs, and saves a PDF certificate."""
    try:
        # 1. Generate unique filename
        uid = str(uuid.uuid4())[:8]
        filename = f"cert_{uid}.pdf"
        
        # 2. Create PDF
        file_path = create_certificate_pdf(doc_in.name, doc_in.course, filename)
        
        # 3. Sign PDF
        signed_file_path = await sign_pdf(file_path)
        
        # 4. Save to DB
        db_doc = models.Document(
            name=doc_in.name,
            course=doc_in.course,
            file_path=signed_file_path
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        return db_doc
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("/download/{doc_id}")
async def download_pdf(doc_id: int, db: Session = Depends(get_db)):
    """Downloads a specific signed PDF."""
    db_doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(db_doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(db_doc.file_path, filename=os.path.basename(db_doc.file_path), media_type="application/pdf")

@router.post("/tamper/{doc_id}")
async def tamper_with_pdf(doc_id: int, db: Session = Depends(get_db)):
    """Creates a tampered version of an existing signed PDF for demonstration."""
    db_doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        tampered_path = tamper_pdf(db_doc.file_path)
        return FileResponse(tampered_path, filename=os.path.basename(tampered_path), media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
