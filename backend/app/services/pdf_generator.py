import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from datetime import datetime
from app.utils.qr_utils import generate_qr_code
from app.utils.logger import logger
from app.config import settings

def create_certificate_pdf(name: str, course: str, filename: str) -> str:
    """Generates a premium certificate PDF and returns the file path."""
    os.makedirs(settings.GENERATED_FILES_DIR, exist_ok=True)
    file_path = os.path.join(settings.GENERATED_FILES_DIR, filename)

    # Use landscape for a more traditional certificate feel
    c = canvas.Canvas(file_path, pagesize=landscape(letter))
    width, height = landscape(letter)

    # background color
    c.setFillColor(HexColor("#F9FAFB"))
    c.rect(0, 0, width, height, fill=1)

    # Border Design
    c.setStrokeColor(HexColor("#1E3A8A")) # Deep Blue
    c.setLineWidth(8)
    c.rect(0.25*inch, 0.25*inch, width-0.5*inch, height-0.5*inch, stroke=1, fill=0)
    
    c.setStrokeColor(HexColor("#3B82F6")) # Lighter Blue
    c.setLineWidth(2)
    c.rect(0.4*inch, 0.4*inch, width-0.8*inch, height-0.8*inch, stroke=1, fill=0)

    # Title
    c.setFillColor(HexColor("#111827"))
    c.setFont("Helvetica-Bold", 45)
    c.drawCentredString(width/2, height - 2*inch, "CERTIFICATE OF COMPLETION")

    # Subtitle
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height - 2.8*inch, "This is to certify that")

    # Recipient Name
    c.setFillColor(HexColor("#1E40AF"))
    c.setFont("Helvetica-Bold", 40)
    c.drawCentredString(width/2, height - 3.8*inch, name.upper())

    # Success message
    c.setFillColor(HexColor("#111827"))
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height - 4.5*inch, "has successfully completed the course")

    # Course Name
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width/2, height - 5.2*inch, course)

    # Date
    c.setFont("Helvetica", 14)
    current_date = datetime.now().strftime("%B %d, %Y")
    c.drawCentredString(width/2, 1.5*inch, f"Issued on: {current_date}")
    
    # Signer Label
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, 1.2*inch, "Digital Signature Verified by System Admin")

    # Generate QR Code Metadata (MANDATORY STRUCTURE)
    metadata = {
        "name": name,
        "course": course,
        "issued_at": datetime.now().isoformat(),
        "issuer": "System Admin"
    }
    qr_img_bytes = generate_qr_code(metadata)
    
    # Save temp image for reportlab
    temp_qr_path = os.path.join(settings.GENERATED_FILES_DIR, f"temp_qr_{filename}.png")
    with open(temp_qr_path, "wb") as f:
        f.write(qr_img_bytes.getbuffer())

    # Draw QR Code on PDF (Bottom Right)
    c.drawImage(temp_qr_path, width - 2.5*inch, 0.75*inch, width=1.5*inch, height=1.5*inch)
    
    c.showPage()
    c.save()

    # Clean up temp QR image
    if os.path.exists(temp_qr_path):
        os.remove(temp_qr_path)

    logger.info(f"Phase 2: Certificate PDF generated with QR: {file_path}")
    return file_path

def create_student_document_pdf(student: dict, admin_name: str, filename: str, v_uuid: str) -> str:
    """Generates a premium student document in landscape format."""
    os.makedirs(settings.GENERATED_FILES_DIR, exist_ok=True)
    file_path = os.path.join(settings.GENERATED_FILES_DIR, filename)

    # Use landscape for the premium certificate feel
    c = canvas.Canvas(file_path, pagesize=landscape(letter))
    width, height = landscape(letter)

    # background color
    c.setFillColor(HexColor("#F9FAFB"))
    c.rect(0, 0, width, height, fill=1)

    # Premium Border Design
    c.setStrokeColor(HexColor("#1E3A8A")) # Deep Blue
    c.setLineWidth(8)
    c.rect(0.25*inch, 0.25*inch, width-0.5*inch, height-0.5*inch, stroke=1, fill=0)
    
    c.setStrokeColor(HexColor("#3B82F6")) # Lighter Blue
    c.setLineWidth(2)
    c.rect(0.4*inch, 0.4*inch, width-0.8*inch, height-0.8*inch, stroke=1, fill=0)

    # Header
    c.setFillColor(HexColor("#111827"))
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 1.8*inch, "OFFICIAL ACADEMIC RECORD")

    # Name Section
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height - 2.6*inch, "This is to certify the academic status of")
    
    c.setFillColor(HexColor("#1E40AF"))
    c.setFont("Helvetica-Bold", 40)
    c.drawCentredString(width/2, height - 3.5*inch, student["name"].upper())

    # Details Grid
    c.setFillColor(HexColor("#111827"))
    c.setFont("Helvetica-Bold", 16)
    
    mid_x = width / 2
    y_start = height - 4.5*inch
    
    # Left Column info
    c.drawRightString(mid_x - 0.5*inch, y_start, "Register Number:")
    c.drawRightString(mid_x - 0.5*inch, y_start - 0.5*inch, "Academic Branch:")
    c.drawRightString(mid_x - 0.5*inch, y_start - 1.0*inch, "Year of Study:")
    
    # Right Column info
    c.setFont("Helvetica", 16)
    c.drawString(mid_x + 0.5*inch, y_start, student["register_number"])
    c.drawString(mid_x + 0.5*inch, y_start - 0.5*inch, student["branch"])
    c.drawString(mid_x + 0.5*inch, y_start - 1.0*inch, f"Year {student['year']}")

    # Footer / Signing Info
    c.setFont("Helvetica-Bold", 12)
    current_date = datetime.now().strftime("%B %d, %Y")
    c.drawCentredString(width/2, 1.5*inch, f"Issued by {admin_name} on {current_date}")
    
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width/2, 1.2*inch, "Digital Signature Verified and Embedded via RSA-2048")

    # Generate QR Code URL
    verify_url = f"{settings.FRONTEND_URL}/verify/{v_uuid}"
    qr_img_bytes = generate_qr_code(verify_url)
    
    # Save temp image for reportlab
    temp_qr_path = os.path.join(settings.GENERATED_FILES_DIR, f"temp_sqr_{filename}.png")
    with open(temp_qr_path, "wb") as f:
        f.write(qr_img_bytes.getbuffer())

    # Draw QR Code on PDF (Bottom Right)
    c.drawImage(temp_qr_path, width - 2.2*inch, 0.75*inch, width=1.5*inch, height=1.5*inch)
    
    c.showPage()
    c.save()

    # Clean up temp QR image
    if os.path.exists(temp_qr_path):
        os.remove(temp_qr_path)

    logger.info(f"Landscape Student document PDF generated: {file_path}")
    return file_path

def create_bonafide_certificate_pdf(student: dict, admin_name: str, filename: str, v_uuid: str) -> str:
    """Generates a professional Bonafide Certificate in portrait format."""
    os.makedirs(settings.GENERATED_FILES_DIR, exist_ok=True)
    file_path = os.path.join(settings.GENERATED_FILES_DIR, filename)

    # Use portrait for the traditional Bonafide feel
    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter # 8.5 x 11 inches

    # Assets
    assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
    logo_path = os.path.join(assets_dir, "logo.png")
    stamp_path = os.path.join(assets_dir, "stamp.png")

    # background color (Soft cream/white)
    c.setFillColor(HexColor("#FFFFFF"))
    c.rect(0, 0, width, height, fill=1)

    current_date = datetime.now().strftime("%d-%m-%Y")

    # Elegant Border
    c.setStrokeColor(HexColor("#1E3A8A")) # Deep Blue
    c.setLineWidth(4)
    c.rect(0.4*inch, 0.4*inch, width-0.8*inch, height-0.8*inch, stroke=1, fill=0)
    
    c.setLineWidth(1)
    c.rect(0.5*inch, 0.5*inch, width-1.0*inch, height-1.0*inch, stroke=1, fill=0)

    # Logo Header
    if os.path.exists(logo_path):
        c.drawImage(logo_path, width/2 - 0.75*inch, height - 1.5*inch, width=1.5*inch, height=1.5*inch, mask='auto')

    # College Name
    c.setFillColor(HexColor("#111827"))
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width/2, height - 1.8*inch, "SMART INSTITUTE OF TECHNOLOGY")
    
    c.setFont("Helvetica", 10)
    c.drawCentredString(width/2, height - 2.0*inch, "Official Academic Institution • Document Verification Hub")
    
    # Line separator
    c.setLineWidth(1)
    c.line(1*inch, height - 2.3*inch, width - 1*inch, height - 2.3*inch)

    # Title
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width/2, height - 2.8*inch, "BONAFIDE CERTIFICATE")

    # Body Content
    c.setFont("Helvetica", 14)
    y_text = height - 4.2*inch
    line_height = 0.4*inch
    
    text_lines = [
        "This is to certify that",
        f"Mr./Ms. {student['name'].upper()}",
        f"bearing Register Number {student['register_number']}",
        f"is a bonafide student of this institution,",
        f"presently studying in Year {student['year']} of",
        f"{student['branch']} engineering.",
        "",
        "This certificate is issued for academic and official purposes."
    ]

    for i, line in enumerate(text_lines):
        if i == 1 or i == 2: # Highlight name and reg no
            c.setFont("Helvetica-Bold", 16)
        else:
            c.setFont("Helvetica", 14)
        c.drawCentredString(width/2, y_text - (i * line_height), line)

    # Stamping area (Bottom Left - Only Seal)
    if os.path.exists(stamp_path):
        c.drawImage(stamp_path, 0.8*inch, 0.8*inch, width=1.5*inch, height=1.5*inch, mask='auto')

    # Authority Signature Area (Bottom Right)
    c.setFillColor(HexColor("#111827"))
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width - 2*inch, 1.4*inch, "Principal / Admin")
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width - 2*inch, 1.2*inch, "(Signed by System Admin)")

    # Generate QR Code URL
    verify_url = f"{settings.FRONTEND_URL}/verify/{v_uuid}"
    qr_img_bytes = generate_qr_code(verify_url)
    
    # Save temp image for reportlab
    temp_qr_path = os.path.join(settings.GENERATED_FILES_DIR, f"temp_bqr_{filename}.png")
    with open(temp_qr_path, "wb") as f:
        f.write(qr_img_bytes.getbuffer())

    # Draw QR Code on PDF (Center Bottom)
    c.drawImage(temp_qr_path, width/2 - 0.75*inch, 0.6*inch, width=1.5*inch, height=1.5*inch)
    
    c.showPage()
    c.save()

    # Clean up temp QR image
    if os.path.exists(temp_qr_path):
        os.remove(temp_qr_path)

    logger.info(f"Bonafide Certificate PDF generated: {file_path}")
    return file_path
