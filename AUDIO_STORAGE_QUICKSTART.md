# Audio Prediction Storage - Quick Start

## 🎯 What's New

Your NeoParental app can now:
✅ Save audio files to your backend database  
✅ Store prediction results with audio metadata  
✅ Retrieve prediction history  
✅ View statistics about predictions  
✅ Delete old predictions  

## 🚀 Quick Setup (5 minutes)

### Step 1: Fix bcrypt issue
```bash
cd backend
pip install --upgrade bcrypt==4.0.1
```

### Step 2: Run setup script
**Windows:**
```bash
setup_audio_storage.bat
```

**Mac/Linux:**
```bash
chmod +x setup_audio_storage.sh
./setup_audio_storage.sh
```

### Step 3: Update backend URL
Edit `utils/api.ts` line 6:
```typescript
const BACKEND_API_URL = 'http://localhost:8000'; // Or your deployed URL
```

### Step 4: Start backend
```bash
cd backend
python main.py
```

### Step 5: Test
1. Open your Expo app
2. Go to Listening screen
3. Record or upload audio
4. You should see: **"Prediction completed and saved to your history!"**

## 📊 What Gets Saved

Every prediction saves:
- 🎵 **Audio file** (stored in `backend/uploads/audio/`)
- 📝 **Prediction result** (label, confidence, etc.)
- 👤 **User ID** (automatically linked)
- ⏱️ **Timestamp** (when prediction was made)
- 📏 **File metadata** (size, duration, filename)

## 🔗 New API Endpoints

All available at `http://localhost:8000/docs`:

| Endpoint | Purpose |
|----------|---------|
| `POST /audio-predictions/` | Save audio + prediction |
| `GET /audio-predictions/` | Get user's history |
| `GET /audio-predictions/stats/summary` | Get statistics |
| `DELETE /audio-predictions/{id}` | Delete prediction |

## 📱 How to Use in Your App

### Already Integrated ✅
The listening screen automatically saves predictions!

### Get User History
```typescript
import { getAudioPredictionHistory } from '@/utils/api';

const history = await getAudioPredictionHistory();
console.log(`User has ${history.length} predictions`);
```

### Get Statistics
```typescript
import { getPredictionStats } from '@/utils/api';

const stats = await getPredictionStats();
// stats.total_predictions
// stats.predictions_by_label
// stats.average_confidence
```

## 🐛 Common Issues

### "Authentication required"
→ Make sure user is logged in before recording

### "Cannot connect to backend"
→ Check if backend is running: `python main.py`  
→ Verify BACKEND_API_URL in `utils/api.ts`

### Bcrypt error on login
→ Run: `pip install --upgrade bcrypt==4.0.1`

### "Failed to save audio file"
→ Check if `backend/uploads/audio/` exists  
→ Check folder permissions

## 📚 Full Documentation

Read **AUDIO_STORAGE_GUIDE.md** for:
- Complete API reference
- Database schema details
- Production deployment tips
- Advanced features
- Troubleshooting guide

## ✅ Verify It's Working

Check these indicators:

1. Backend starts without errors
2. Visit `http://localhost:8000/docs` - see new endpoints
3. Upload audio in app - see success message
4. Check MongoDB - see documents in `audio_predictions` collection
5. Check folder - see files in `backend/uploads/audio/`

## 🎉 You're Done!

Your audio predictions are now being saved automatically. Every time a user:
- Records audio
- Uploads audio  
- Gets a prediction

The result is stored in your database for future reference!

---

**Need Help?** Check the logs:
- Expo: Terminal running `npx expo start`
- Backend: Terminal running `python main.py`
- MongoDB: Check your Atlas dashboard

**Files Changed:**
- `backend/models.py` - New models
- `backend/routes_audio_predictions.py` - New routes (NEW FILE)
- `backend/main.py` - Added router
- `backend/database.py` - Added collection
- `utils/api.ts` - New functions
- `app/listening.tsx` - Auto-save enabled
