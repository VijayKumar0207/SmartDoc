#!/usr/bin/env python3
"""Test script to verify SMTP email configuration"""

import smtplib
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

print(f"Testing SMTP Connection...")
print(f"Server: {SMTP_SERVER}")
print(f"Port: {SMTP_PORT}")
print(f"Username: {SMTP_USERNAME}")
print(f"Password: {'*' * len(SMTP_PASSWORD)}")
print()

try:
    print("Connecting to SMTP server...")
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
        print("✓ Connected!")
        
        print("Starting TLS...")
        server.starttls()
        print("✓ TLS Started!")
        
        print("Logging in...")
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        print("✓ Login Successful!")
        
        print("\n✓✓✓ Email configuration is working correctly! ✓✓✓")
        
except smtplib.SMTPAuthenticationError:
    print("✗ Authentication Error: Invalid email or password!")
    print("  - Check SMTP_USERNAME and SMTP_PASSWORD in .env")
except smtplib.SMTPException as e:
    print(f"✗ SMTP Error: {e}")
except Exception as e:
    print(f"✗ Connection Error: {e}")
