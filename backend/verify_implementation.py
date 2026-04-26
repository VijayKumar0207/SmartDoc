import requests
import time

BASE_URL = "http://localhost:8000"

def get_token(email, password):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        return resp.json()["access_token"]
    else:
        print(f"Login failed for {email}: {resp.status_code} {resp.text}")
        return None

def test_student_management():
    admin_token = get_token("admin@example.com", "admin123")
    user_token = get_token("john@example.com", "user123")

    if not admin_token or not user_token:
        return

    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    headers_user = {"Authorization": f"Bearer {user_token}"}

    print("\n--- Testing /students (Admin) ---")
    resp = requests.get(f"{BASE_URL}/students/", headers=headers_admin)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        students = resp.json()
        print(f"Total students retrieved: {len(students)}")
        if len(students) > 0:
            print(f"First student: {students[0]['name']} ({students[0]['branch']})")

    print("\n--- Testing /students (User) - Should be 403 ---")
    resp = requests.get(f"{BASE_URL}/students/", headers=headers_user)
    print(f"Status: {resp.status_code} (Expected: 403)")

    print("\n--- Testing /students?branch=CSE (Admin) ---")
    resp = requests.get(f"{BASE_URL}/students/?branch=CSE", headers=headers_admin)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"CSE students found: {len(resp.json())}")

    print("\n--- Testing /students/search?query=arun (Admin) ---")
    resp = requests.get(f"{BASE_URL}/students/search?query=arun", headers=headers_admin)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        results = resp.json()
        print(f"Search results for 'arun': {len(results)}")
        for r in results:
            print(f"- {r['name']} ({r['register_number']})")

    print("\n--- Testing Document Generation (Admin) ---")
    # Get first student ID
    resp = requests.get(f"{BASE_URL}/students/", headers=headers_admin)
    if resp.status_code == 200 and len(resp.json()) > 0:
        student_id = resp.json()[0]["id"]
        print(f"Generating document for student ID {student_id}...")
        resp = requests.post(f"{BASE_URL}/documents/generate/{student_id}", headers=headers_admin)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            doc = resp.json()
            print(f"Document generated successfully: {doc['file_path']}")
    
    print("\n--- Testing Document Generation (User) - Should be 403 ---")
    resp = requests.post(f"{BASE_URL}/documents/generate/1", headers=headers_user)
    print(f"Status: {resp.status_code} (Expected: 403)")

if __name__ == "__main__":
    test_student_management()
