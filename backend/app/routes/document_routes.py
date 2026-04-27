from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.services import document_service
from app.utils.auth_utils import require_admin, get_current_user_optional
from app.utils.email_utils import send_email_with_attachment
from pydantic import BaseModel
import os

class ShareRequest(BaseModel):
    email: str

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/generate/{student_id}", response_model=schemas.DocumentResponse)
async def generate_document(
    student_id: int,
    doc_type: str = "academic_record",
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Generate PDF for selected student. (Admin Only)"""
    try:
        doc = await document_service.generate_student_document(db, student_id, admin, doc_type)
        if not doc:
            raise HTTPException(status_code=404, detail="Student not found")
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/verify-public/{uuid}", response_model=schemas.DocumentResponse)
async def get_document_by_uuid(
    uuid: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_optional)
):
    """Public verification route to get document details by unique UUID and log the event."""
    doc = db.query(models.Document).filter(models.Document.verification_uuid == uuid).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or invalid UUID")
    
    # Log the verification event
    log = models.VerificationLog(
        document_id=doc.id,
        verifier_id=current_user.id if current_user else None,
        status="VALID",
        message=f"Public QR Verification for {doc.student.name}"
    )
    db.add(log)
    db.commit()
    
    return doc

@router.post("/share/{document_id}")
async def share_document(
    document_id: int,
    request: ShareRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Share a generated document via email. (Admin Only)"""
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on server")

    subject = "Your Cryptographically Signed Certificate"
    body = (
        f"Hello,\n\n"
        f"Please find attached your newly generated, cryptographically signed certificate.\n"
        f"You can verify its authenticity using the QR code embedded in the document or by visiting our verification portal.\n\n"
        f"Document ID: {doc.verification_uuid}\n\n"
        f"Best regards,\n"
        f"Smart Certificate Verification System"
    )

    try:
        send_email_with_attachment(
            to_email=request.email,
            subject=subject,
            body=body,
            file_path=doc.file_path
        )
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

