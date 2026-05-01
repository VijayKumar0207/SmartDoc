#!/usr/bin/env python3
"""Test email sending API"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("Testing email send API...\n")

# Test login with correct endpoint
print("1. Testing authentication...")
login_data = {
    "username": "admin@example.com",
    "password": "admin123"
}

try:
    login_resp = requests.post(f"{BASE_URL}/auth/login", data=login_data, timeout=5)
    print(f"Status: {login_resp.status_code}")
    print(f"Response: {login_resp.text}\n")
    
    if login_resp.status_code == 200:
        token = login_resp.json().get("access_token")
        print(f"✓ Login successful. Token: {token[:20]}...\n")
        
        # Get documents
        print("2. Fetching documents...")
        headers = {"Authorization": f"Bearer {token}"}
        docs_resp = requests.get(f"{BASE_URL}/documents/", headers=headers, timeout=5)
        print(f"Status: {docs_resp.status_code}")
        docs = docs_resp.json()
        print(f"Documents count: {len(docs)}\n")
        
        if docs:
            doc_id = docs[0]["id"]
            print(f"3. Testing email send for document ID: {doc_id}...")
            
            email_resp = requests.post(
                f"{BASE_URL}/documents/share/{doc_id}",
                json={"email": "test@example.com"},
                headers=headers,
                timeout=10
            )
            print(f"Status: {email_resp.status_code}")
            print(f"Response: {email_resp.text}")
            
            if email_resp.status_code == 200:
                print("\n✓✓✓ Email send successful!")
            else:
                print("\n✗ Email send failed")
        else:
            print("✗ No documents found")
    else:
        print("✗ Login failed")
        
except Exception as e:
    print(f"Error: {str(e)}")
