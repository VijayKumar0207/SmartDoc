import os
import hashlib
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.db import models
from app.services.pdf_generator import create_student_document_pdf, create_bonafide_certificate_pdf
from app.services.signer import sign_pdf
from app.utils.logger import logger

async def generate_student_document(db: Session, student_id: int, admin: models.User, doc_type: str = "academic_record"):
    """Generate, sign, and store a document for a student."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return None

    # Generate unique verification UUID
    v_uuid = str(uuid.uuid4())

    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    prefix = "bonafide" if doc_type == "bonafide" else "student"
    filename = f"{prefix}_{student.id}_{timestamp}.pdf"

    # Convert student object to dict for generator
    student_data = {
        "id": student.id,
        "name": student.name,
        "register_number": student.register_number,
        "branch": student.branch,
        "year": student.year,
        "email": student.email
    }

    try:
        # Generate PDF based on type
        if doc_type == "bonafide":
            temp_path = create_bonafide_certificate_pdf(student_data, admin.name, filename, v_uuid)
        else:
            temp_path = create_student_document_pdf(student_data, admin.name, filename, v_uuid)

        # Sign PDF
        signed_path = await sign_pdf(temp_path)

        # Calculate hash of signed file
        with open(signed_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        # Save to DB
        db_doc = models.Document(
            student_id=student.id,
            file_path=signed_path,
            document_hash=file_hash,
            verification_uuid=v_uuid,
            generated_by=admin.id
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        logger.info(f"Document generated and saved for student {student.name}")
        return db_doc
    except Exception as e:
        logger.error(f"Error in document generation service: {str(e)}")
        raise e
