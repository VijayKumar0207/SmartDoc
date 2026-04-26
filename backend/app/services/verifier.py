import os
import asyncio
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign import validation
from pyhanko.keys import load_cert_from_pemder
from pyhanko_certvalidator import ValidationContext
from app.config import settings
from app.utils.logger import logger

async def verify_pdf_signature(file_path: str) -> dict:
    """
    Phase 5: Verification Engine - Robust Version
    Extracts signatures and validates integrity and authenticity using pyHanko's high-level API.
    """
    logger.info(f"Phase 5: Verifying PDF integrity and signature: {file_path}")

    if not os.path.exists(file_path):
        return {"status": "FILE_NOT_FOUND", "message": "The file does not exist."}

    def sync_verify_logic():
        try:
            # Load the local certificate to establish a trust root for validation
            # Use load_cert_from_pemder for correct object instantiation
            root_cert = load_cert_from_pemder(settings.CERTIFICATE_PATH)
            
            # Trust our own generated CA
            vc = ValidationContext(trust_roots=[root_cert])

            with open(file_path, 'rb') as f:
                reader = PdfFileReader(f)
                
                # Get the last applied signature
                if not reader.embedded_signatures:
                    return {
                        "status": "NO SIGNATURE",
                        "document_intact": False,
                        "signature_valid": False,
                        "signer_name": "N/A",
                        "issuer": "N/A",
                        "valid_from": "N/A",
                        "valid_to": "N/A",
                        "algorithm": "N/A"
                    }

                # Validate the last signature
                sig = reader.embedded_signatures[-1]
                status = validation.validate_pdf_signature(sig, vc)
                
                document_intact = status.intact
                signature_valid = status.valid
                
                overall_status = "VALID"
                if not document_intact:
                    overall_status = "TAMPERED"
                elif not signature_valid:
                    overall_status = "INVALID SIGNATURE"

                # Extract certificate metadata
                cert = sig.signer_cert
                
                # Use md_algorithm which exists on PdfSignatureStatus
                algorithm_info = f"RSA with {status.md_algorithm.upper()}" if hasattr(status, 'md_algorithm') else "RSA with SHA-256"

                return {
                    "status": overall_status,
                    "document_intact": document_intact,
                    "signature_valid": signature_valid,
                    "signer_name": cert.subject.human_friendly if cert else "Unknown Signer",
                    "issuer": cert.issuer.human_friendly if cert else "Unknown Issuer",
                    "valid_from": cert.not_valid_before.isoformat() if cert else "N/A",
                    "valid_to": cert.not_valid_after.isoformat() if cert else "N/A",
                    "algorithm": algorithm_info
                }
        except Exception as e:
            logger.error(f"Internal Sync Verification Error: {str(e)}")
            raise e

    try:
        # Offload blocking pyHanko call to a thread
        return await asyncio.to_thread(sync_verify_logic)

    except Exception as e:
        logger.error(f"Verification Engine Failure: {str(e)}")
        return {
            "status": "ERROR",
            "document_intact": False,
            "signature_valid": False,
            "signer_name": f"Error: {str(e)}",
            "issuer": "Internal Engine Error",
            "valid_from": "N/A",
            "valid_to": "N/A",
            "algorithm": "N/A"
        }
