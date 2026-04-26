import os
import datetime
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from app.utils.logger import logger
from app.config import settings

def generate_keys_and_cert():
    """Generates 2048-bit RSA private key and a self-signed X.509 certificate valid for 5 years."""
    if os.path.exists(settings.PRIVATE_KEY_PATH) and os.path.exists(settings.CERTIFICATE_PATH):
        logger.info("Cryptographic identity already exists. Skipping generation.")
        return

    logger.info("Phase 1: Generating cryptographic identity (RSA 2048 + X.509)...")
    
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    # Write private key to file
    with open(settings.PRIVATE_KEY_PATH, "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        ))

    # Generate self-signed certificate
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, u"US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"California"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, u"San Francisco"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"System Admin"),
        x509.NameAttribute(NameOID.COMMON_NAME, u"System Administrator"),
    ])
    
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.datetime.utcnow()
    ).not_valid_after(
        # Valid for exactly 5 years
        datetime.datetime.utcnow() + datetime.timedelta(days=5*365)
    ).add_extension(
        x509.BasicConstraints(ca=True, path_length=None),
        critical=True,
    ).sign(private_key, hashes.SHA256())

    # Write certificate to file
    with open(settings.CERTIFICATE_PATH, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))
    
    logger.info("Cryptographic identity generated successfully.")

def get_private_key():
    with open(settings.PRIVATE_KEY_PATH, "rb") as key_file:
        return serialization.load_pem_private_key(
            key_file.read(),
            password=None,
        )

def get_certificate():
    with open(settings.CERTIFICATE_PATH, "rb") as cert_file:
        return x509.load_pem_x509_certificate(cert_file.read())
