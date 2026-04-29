import os
from pyhanko.keys import load_cert_from_pemder
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign import signers, validation
from pyhanko.sign.fields import SigFieldSpec
from pyhanko_certvalidator import ValidationContext
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRIVATE_KEY_PATH = os.path.join(BASE_DIR, "private_key.pem")
CERTIFICATE_PATH = os.path.join(BASE_DIR, "certificate.pem")
TEMP_PDF = os.path.join(BASE_DIR, "test_unsigned.pdf")
SIGNED_PDF = os.path.join(BASE_DIR, "test_signed.pdf")

def create_raw_pdf():
    c = canvas.Canvas(TEMP_PDF, pagesize=letter)
    c.drawString(100, 750, "Test Document")
    c.save()

def simulate():
    create_raw_pdf()
    print(f"[1] Raw PDF created")

    
    signer = signers.SimpleSigner.load(
        key_file=PRIVATE_KEY_PATH,
        cert_file=CERTIFICATE_PATH,
    )
    
    with open(TEMP_PDF, 'rb') as inf:
        w = IncrementalPdfFileWriter(inf)
        new_field_spec = SigFieldSpec(sig_field_name="Sig1", box=(50, 50, 200, 150))
        meta = signers.PdfSignatureMetadata(field_name="Sig1")
        
        
        pdf_signer = signers.PdfSigner(
            signature_meta=meta,
            signer=signer,
            new_field_spec=new_field_spec
        )
        
        
        with open(SIGNED_PDF, 'wb') as outf:
            
            try:
                signers.sign_pdf(w, meta, signer=signer, new_field_spec=new_field_spec, output=outf)
            except Exception as e:
                print(f"Signing failed (likely asyncio loop error): {e}")
                
    
    if os.path.exists(SIGNED_PDF):
        print(f"[2] Signed PDF exists")
        
        root_cert = load_cert_from_pemder(CERTIFICATE_PATH)
        vc = ValidationContext(trust_roots=[root_cert])

        with open(SIGNED_PDF, 'rb') as f:
            reader = PdfFileReader(f)
            sig = reader.embedded_signatures[-1]
            status = validation.validate_pdf_signature(sig, vc)
            print("\n--- ATTRIBUTE CHECK ---")
            for attr in ['signature_algorithm', 'md_algorithm', 'pk_algorithm', 'signer_cert']:
                print(f"{attr}: {hasattr(status, attr)}")
            
            if hasattr(status, 'md_algorithm'):
                print(f"MD Algorithm: {status.md_algorithm}")
            
           
            cert = sig.signer_cert
            print(f"Cert Subject: {cert.subject}")

if __name__ == "__main__":
    simulate()
