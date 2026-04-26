import os
import random
from app.utils.logger import logger

def tamper_pdf(file_path: str) -> str:
    """
    Intentionally modifies the binary content of a PDF to break signature integrity.
    This demonstrates Phase 4: Tamper Demonstration.
    """
    logger.info(f"Phase 4: Tampering with signed PDF: {file_path}")
    
    if "_signed" not in file_path:
        logger.warning("Tampering with a non-signed file will not show signature invalidation.")

    tampered_file_path = file_path.replace(".pdf", "_tampered.pdf")
    
    with open(file_path, "rb") as f:
        data = bytearray(f.read())
    
    # Method 1: Modify a string in the binary (Effective for human-readable parts)
    # Method 2: Flip a random bit in the body (Guaranteed to break digital signature hash)
    
    # We look for the recipient's name or common PDF tokens
    try:
        # Flip a bit in the metadata or middle of the file
        # We avoid the header (%PDF-1.x) to keep the file 'openable' but 'invalid'
        index = random.randint(100, len(data) - 100)
        data[index] = data[index] ^ 0xFF # XOR to flip all bits in one byte
        
        logger.info(f"Flipped byte at offset {index}")
            
    except Exception as e:
        logger.error(f"Tamper failed: {str(e)}")
        # Fallback: simple byte increment
        data[len(data) // 2] = (data[len(data) // 2] + 1) % 256

    with open(tampered_file_path, "wb") as f:
        f.write(data)
    
    logger.info(f"PDF tampered (Integrity Broken) and saved to: {tampered_file_path}")
    return tampered_file_path
