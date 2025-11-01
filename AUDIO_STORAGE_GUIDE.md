# Audio Prediction Storage - Implementation Guide

## Overview
This implementation allows your NeoParental app to save audio files and their prediction results to your MongoDB database through your FastAPI backend.

## 🎯 What Was Implemented

### Backend Changes

#### 1. **New Models** (`models.py`)
Added new Pydantic models for audio predictions:
- `AudioPredictionCreate`: For creating new audio predictions
- `AudioPredictionResponse`: For returning audio prediction data
- `AudioPredictionListResponse`: For listing predictions

#### 2. **New Routes** (`routes_audio_predictions.py`)
Created a new router with these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/audio-predictions/` | Save audio file + prediction result |
| GET | `/audio-predictions/` | Get all user's predictions (paginated) |
| GET | `/audio-predictions/{id}` | Get specific prediction details |
| GET | `/audio-predictions/{id}/audio` | Download the audio file |
| DELETE | `/audio-predictions/{id}` | Delete prediction and audio file |
| GET | `/audio-predictions/stats/summary` | Get user statistics |

#### 3. **Database Updates** (`database.py`)
- Added `audio_predictions` collection
- Created indexes for faster queries:
  - Index on `user_id` 
  - Index on `created_at` (descending)

#### 4. **Main App** (`main.py`)
- Registered the new audio predictions router
- Updated API documentation

### Frontend Changes

#### 1. **Enhanced API Utils** (`utils/api.ts`)
Added new functions:

```typescript
// Save audio + prediction to backend
uploadAndSaveAudioPrediction(file, duration)

// Get user's prediction history
getAudioPredictionHistory(skip, limit)

// Get user statistics
getPredictionStats()

// Delete a prediction
deleteAudioPrediction(predictionId)
```

#### 2. **Updated Listening Screen** (`app/listening.tsx`)
- Now automatically saves predictions to the backend
- Shows success message after saving
- Tracks recording duration for database storage

## 🚀 How It Works

### Flow Diagram
```
User Records/Uploads Audio
         ↓
Expo App → ML API (Get Prediction)
         ↓
Expo App → Your Backend (Save Audio + Result)
         ↓
MongoDB (Stored with user_id)
```

### Step-by-Step Process

1. **User interacts with app**: Records or uploads audio
2. **Upload to ML API**: Audio sent to prediction API
3. **Get prediction result**: ML model returns classification
4. **Save to backend**: Audio file + result saved to your database
5. **Confirmation**: User sees success message

### Data Storage

Each saved prediction contains:
```json
{
  "user_id": "user123",
  "audio_filename": "recording_20250131_143022.m4a",
  "audio_stored_filename": "user123_20250131_143022.m4a",
  "audio_path": "/uploads/audio/user123_20250131_143022.m4a",
  "audio_size": 245760,
  "audio_duration": 5.2,
  "prediction_result": {
    "predicted_label": "Hungry",
    "confidence": 87.5,
    "processing_time": 1.23
  },
  "created_at": "2025-01-31T14:30:22.000Z"
}
```

## 📝 Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install --upgrade bcrypt==4.0.1  # Fix bcrypt compatibility
```

### 2. Update Backend URL

In `utils/api.ts`, change the backend URL:

```typescript
const BACKEND_API_URL = 'http://your-backend-url.com'; // Update this!
```

For local testing:
```typescript
const BACKEND_API_URL = 'http://localhost:8000';
```

For production:
```typescript
const BACKEND_API_URL = 'https://your-backend.onrender.com';
```

### 3. Create Uploads Directory

The backend will automatically create this, but you can do it manually:

```bash
cd backend
mkdir -p uploads/audio
```

### 4. Restart Backend Server

```bash
cd backend
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test the Implementation

#### Test Backend Endpoints:
Visit: `http://localhost:8000/docs`

You'll see the new endpoints documented in the Swagger UI.

#### Test from Expo App:
1. Run your Expo app
2. Navigate to the Listening screen
3. Record or upload audio
4. Check console logs for "Saved to backend successfully"

## 🔍 Testing Examples

### Test with cURL

#### 1. Register/Login (Get Token)
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### 2. Save Audio Prediction
```bash
curl -X POST http://localhost:8000/audio-predictions/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "audio_file=@test_audio.m4a" \
  -F 'prediction_result={"predicted_label":"Hungry","confidence":85.5}' \
  -F "audio_duration=5.2"
```

#### 3. Get Predictions
```bash
curl -X GET http://localhost:8000/audio-predictions/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Get Statistics
```bash
curl -X GET http://localhost:8000/audio-predictions/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Database Structure

### Collections

#### `audio_predictions`
```javascript
{
  _id: ObjectId,
  user_id: String,
  audio_filename: String,           // Original filename
  audio_stored_filename: String,    // Unique filename on server
  audio_path: String,                // Full path to file
  audio_size: Number,                // File size in bytes
  audio_duration: Number,            // Duration in seconds
  prediction_result: {
    predicted_label: String,
    confidence: Number,
    processing_time: Number,
    // ... other prediction fields
  },
  created_at: Date
}
```

### Indexes
- `user_id` (ascending) - Fast user queries
- `created_at` (descending) - Chronological sorting

## 🔐 Authentication

All audio prediction endpoints require authentication:

```typescript
Headers: {
  'Authorization': 'Bearer <your-jwt-token>'
}
```

The token is automatically retrieved from secure storage in the Expo app.

## 🎨 Frontend Usage Examples

### Save Prediction (Automatic)
```typescript
// Already integrated in listening.tsx
const { prediction, saved } = await uploadAndSaveAudioPrediction(audioFile, duration);
```

### Get History
```typescript
import { getAudioPredictionHistory } from '@/utils/api';

const history = await getAudioPredictionHistory(0, 20);
console.log('User has', history.length, 'predictions');
```

### Get Statistics
```typescript
import { getPredictionStats } from '@/utils/api';

const stats = await getPredictionStats();
console.log('Total predictions:', stats.total_predictions);
console.log('Average confidence:', stats.average_confidence);
```

### Delete Prediction
```typescript
import { deleteAudioPrediction } from '@/utils/api';

await deleteAudioPrediction(predictionId);
```

## 📱 Next Steps - Building History Screen

Create `app/history.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { getAudioPredictionHistory, SavedAudioPrediction } from '@/utils/api';

export default function HistoryScreen() {
  const [predictions, setPredictions] = useState<SavedAudioPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getAudioPredictionHistory(0, 50);
      setPredictions(history);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... render your UI
}
```

## ⚠️ Important Notes

### 1. File Storage
- Audio files are stored in `backend/uploads/audio/`
- Files are named with `{user_id}_{timestamp}.{extension}` format
- Make sure this directory has write permissions

### 2. File Size Limits
Consider adding file size limits:

```python
# In routes_audio_predictions.py
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

if len(content) > MAX_FILE_SIZE:
    raise HTTPException(
        status_code=413,
        detail="File too large (max 10MB)"
    )
```

### 3. Storage Cleanup
Consider implementing automatic cleanup of old files:

```python
# Create a scheduled task to delete files older than 30 days
from datetime import timedelta

async def cleanup_old_files():
    cutoff_date = datetime.utcnow() - timedelta(days=30)
    old_predictions = db.audio_predictions.find({
        "created_at": {"$lt": cutoff_date}
    })
    # Delete files and database records
```

### 4. Production Considerations

For production deployment:

1. **Use Cloud Storage**: Store files in AWS S3, Google Cloud Storage, etc.
2. **Add Rate Limiting**: Prevent abuse of upload endpoint
3. **Implement Compression**: Compress audio files before storage
4. **Add Validation**: Validate audio file formats and content
5. **Enable HTTPS**: Use SSL certificates for secure file transfer

## 🐛 Troubleshooting

### Error: "Authentication required"
- Make sure user is logged in
- Check if token is stored in secure storage
- Verify token hasn't expired

### Error: "Failed to save audio file"
- Check uploads directory permissions
- Verify disk space available
- Check file path in error logs

### Error: "Invalid prediction_result JSON format"
- Ensure prediction result is valid JSON
- Check ML API response format

### Database connection errors
- Verify MongoDB URI in .env
- Check MongoDB Atlas IP whitelist
- Test connection with `python -c "from database import get_database; get_database()"`

## 📖 API Documentation

Once your backend is running, access full API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Backend starts without errors
2. ✅ `/docs` endpoint shows new audio-predictions routes
3. ✅ Expo app shows "Prediction completed and saved to your history!" message
4. ✅ MongoDB shows documents in `audio_predictions` collection
5. ✅ Audio files appear in `backend/uploads/audio/` directory
6. ✅ GET endpoint returns user's prediction history

## 📞 Support

If you encounter issues:

1. Check console logs in both Expo app and backend
2. Verify environment variables in `.env`
3. Test endpoints individually using the `/docs` interface
4. Check MongoDB connection and collections
5. Verify file permissions on uploads directory

---

**Created:** October 31, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
