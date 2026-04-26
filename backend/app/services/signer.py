import os
import asyncio
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers
from pyhanko.sign.fields import SigFieldSpec
from app.config import settings
from app.utils.logger import logger

async def sign_pdf(file_path: str) -> str:
    """Signs a PDF file digitally using RSA/X.509 via pyHanko. Handles async context correctly."""
    
    signed_file_path = file_path.replace(".pdf", "_signed.pdf")
    logger.info(f"Phase 3: Digitally signing PDF: {file_path}")

    def sync_sign_logic():
        # Load the SimpleSigner with our private key and certificate
        signer = signers.SimpleSigner.load(
            key_file=settings.PRIVATE_KEY_PATH,
            cert_file=settings.CERTIFICATE_PATH,
        )

        with open(file_path, 'rb') as inf:
            w = IncrementalPdfFileWriter(inf)

            # Define the new signature field 'Sig1' (Invisible)
            new_field_spec = SigFieldSpec(
                sig_field_name="Sig1"
            )

            # Metadata for the signature
            meta = signers.PdfSignatureMetadata(
                field_name="Sig1",
                reason="Certification of Authenticity",
                location="System Admin Server",
            )

            # Perform the signature in one pass with new_field_spec
            with open(signed_file_path, 'wb') as outf:
                signers.sign_pdf(
                    w,
                    meta,
                    signer=signer,
                    new_field_spec=new_field_spec,
                    output=outf,
                )
        return signed_file_path

    try:
        # Offload blocking pyHanko call to a thread to avoid event loop issues
        result = await asyncio.to_thread(sync_sign_logic)
        logger.info(f"PDF digital signature 'Sig1' added: {result}")
        return result

    except Exception as e:
        logger.error(f"Signing failed: {str(e)}")
        raise e