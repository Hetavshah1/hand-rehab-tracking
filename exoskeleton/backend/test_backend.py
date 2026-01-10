# Test script to check if the backend routes are working
import requests
import json

def test_backend():
    base_url = "http://127.0.0.1:5000"
    
    print("Testing backend routes...")
    
    # Test if backend is running
    try:
        response = requests.get(f"{base_url}/")
        print(f"Backend status: {response.status_code}")
    except:
        print("❌ Backend is not running!")
        return
    
    # Test login endpoint
    try:
        login_data = {
            "email": "test@example.com",
            "password": "test123"
        }
        response = requests.post(f"{base_url}/login", json=login_data)
        print(f"Login endpoint: {response.status_code}")
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"✅ Login successful, token received")
            
            # Test patients endpoint
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/patients", headers=headers)
            print(f"Patients endpoint: {response.status_code}")
            if response.status_code == 200:
                patients = response.json()
                print(f"✅ Found {len(patients)} patients")
                
                if patients:
                    # Test individual patient endpoint
                    patient_id = patients[0]['id']
                    response = requests.get(f"{base_url}/patients/{patient_id}", headers=headers)
                    print(f"Individual patient endpoint: {response.status_code}")
                    if response.status_code == 200:
                        print("✅ Individual patient data retrieved successfully")
                    else:
                        print(f"❌ Individual patient endpoint failed: {response.text}")
                else:
                    print("⚠️ No patients found to test individual endpoint")
            else:
                print(f"❌ Patients endpoint failed: {response.text}")
        else:
            print(f"❌ Login failed: {response.text}")
    except Exception as e:
        print(f"❌ Error testing endpoints: {e}")

if __name__ == "__main__":
    test_backend()


