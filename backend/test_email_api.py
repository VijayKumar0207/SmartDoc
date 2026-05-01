#!/usr/bin/env python3
"""Quick test to verify email sending through the API"""

import sys
import requests
import json

BASE_URL = "http://localhost:8000"

# Get auth token first
print("Testing email functionality...")
print()

# Login as admin
login_data = {
    "username": "admin@example.com",
    "password": "admin123"
}

print("1. Logging in as admin...")
response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
if response.status_code != 200:
    print(f"✗ Login failed: {response.text}")
    sys.exit(1)

token = response.json()["access_token"]
print("✓ Login successful!")
print()

# Get first document
print("2. Fetching documents...")
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/documents/", headers=headers)
if response.status_code != 200:
    print(f"✗ Failed to fetch documents: {response.text}")
    sys.exit(1)

docs = response.json()
if not docs:
    print("✗ No documents found. Please generate a document first.")
    sys.exit(1)

doc_id = docs[0]["id"]
print(f"✓ Found document ID: {doc_id}")
print()

# Test sending email
print("3. Testing email send...")
email_data = {"email": "test@example.com"}
response = requests.post(
    f"{BASE_URL}/documents/share/{doc_id}",
    json=email_data,
    headers=headers
)

print(f"Response Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    print("\n✓✓✓ Email sending works! Check logs for delivery confirmation. ✓✓✓")
else:
    print(f"\n✗ Email sending failed: {response.json()}")
