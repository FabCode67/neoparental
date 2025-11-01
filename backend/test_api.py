"""
Test script for Audio Prediction Storage API
Run this to verify your backend is working correctly
"""

import requests
import json
import sys
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123"
TEST_NAME = "Test User"

def test_health():
    """Test if backend is running"""
    print("\n1️⃣  Testing backend health...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend at {BASE_URL}")
        print("   Make sure backend is running: python main.py")
        return False

def test_register_login():
    """Test user registration and login"""
    print("\n2️⃣  Testing authentication...")
    
    # Try to register (might fail if user exists)
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "full_name": TEST_NAME
            }
        )
        if response.status_code == 201:
            print("✅ User registered successfully")
        else:
            print("ℹ️  User might already exist, trying login...")
    except Exception as e:
        print(f"⚠️  Registration error: {e}")
    
    # Login
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print("✅ Login successful")
            return token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_audio_endpoints(token):
    """Test audio prediction endpoints"""
    print("\n3️⃣  Testing audio prediction endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a simple test file
    test_file_path = Path("test_audio.txt")
    test_file_path.write_text("This is a test audio file")
    
    # Test save prediction
    print("\n   📤 Testing save prediction...")
    try:
        files = {
            "audio_file": ("test_audio.txt", open(test_file_path, "rb"), "audio/mpeg")
        }
        data = {
            "prediction_result": json.dumps({
                "predicted_label": "Hungry",
                "confidence": 85.5,
                "processing_time": 1.2
            }),
            "audio_size": "24",
            "audio_duration": "5.0"
        }
        
        response = requests.post(
            f"{BASE_URL}/audio-predictions/",
            headers=headers,
            files=files,
            data=data
        )
        
        if response.status_code == 201:
            prediction_data = response.json()
            prediction_id = prediction_data.get("id")
            print(f"✅ Prediction saved (ID: {prediction_id})")
            
            # Clean up test file
            test_file_path.unlink()
            
            return prediction_id
        else:
            print(f"❌ Failed to save prediction: {response.text}")
            test_file_path.unlink()
            return None
    except Exception as e:
        print(f"❌ Error saving prediction: {e}")
        if test_file_path.exists():
            test_file_path.unlink()
        return None

def test_get_predictions(token):
    """Test retrieving predictions"""
    print("\n   📥 Testing get predictions...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(
            f"{BASE_URL}/audio-predictions/",
            headers=headers
        )
        
        if response.status_code == 200:
            predictions = response.json()
            print(f"✅ Retrieved {len(predictions)} predictions")
            return True
        else:
            print(f"❌ Failed to get predictions: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting predictions: {e}")
        return False

def test_get_stats(token):
    """Test getting statistics"""
    print("\n   📊 Testing statistics...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(
            f"{BASE_URL}/audio-predictions/stats/summary",
            headers=headers
        )
        
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Statistics retrieved:")
            print(f"   - Total predictions: {stats.get('total_predictions')}")
            print(f"   - Average confidence: {stats.get('average_confidence')}%")
            return True
        else:
            print(f"❌ Failed to get stats: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
        return False

def test_delete_prediction(token, prediction_id):
    """Test deleting a prediction"""
    if not prediction_id:
        print("\n   ⏭️  Skipping delete test (no prediction ID)")
        return True
    
    print("\n   🗑️  Testing delete prediction...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.delete(
            f"{BASE_URL}/audio-predictions/{prediction_id}",
            headers=headers
        )
        
        if response.status_code == 204:
            print("✅ Prediction deleted successfully")
            return True
        else:
            print(f"❌ Failed to delete prediction: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error deleting prediction: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Audio Prediction Storage - Backend Test Suite")
    print("=" * 60)
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Backend is not running. Start it with: python main.py")
        sys.exit(1)
    
    # Test 2: Authentication
    token = test_register_login()
    if not token:
        print("\n❌ Authentication failed. Cannot continue tests.")
        sys.exit(1)
    
    # Test 3: Audio prediction endpoints
    prediction_id = test_audio_endpoints(token)
    
    # Test 4: Get predictions
    test_get_predictions(token)
    
    # Test 5: Get statistics
    test_get_stats(token)
    
    # Test 6: Delete prediction
    test_delete_prediction(token, prediction_id)
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 All tests completed!")
    print("=" * 60)
    print("\n✅ Your backend is ready to use!")
    print("\nNext steps:")
    print("1. Update BACKEND_API_URL in utils/api.ts")
    print("2. Run your Expo app")
    print("3. Test recording/uploading audio")
    print("\n📚 Read AUDIO_STORAGE_GUIDE.md for more info")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(0)
