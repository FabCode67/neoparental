# API Testing Guide

## API Endpoint
```
POST https://neoparental-fast-api.onrender.com/predict
```

## Testing from the App

### Method 1: Upload Audio File
1. Open the app
2. Navigate to Home screen
3. Tap "5 Recorded audio sound" card
4. Tap "Tap to select audio file"
5. Select an audio file (.wav, .mp3, .m4a)
6. Tap "Upload"
7. Wait for response
8. View results in modal

### Method 2: Record Audio
1. Open the app
2. Navigate to Home screen
3. Tap "5 Recorded audio sound" card
4. Tap "Start Listening"
5. Record baby sounds (3-10 seconds)
6. Tap "Stop Recording"
7. Tap "Upload"
8. View results in modal

## Expected API Response

### Success Response
```json
{
  "output": "Hungry",
  "prediction": "Hungry",
  "level": "Medium",
  "recommendation": "The baby might be hungry. Try feeding them milk or formula. Watch for hunger cues like rooting or sucking on hands."
}
```

### Alternative Success Response
```json
{
  "output": "Tired",
  "prediction": "Tired",
  "level": "High",
  "recommendation": "The baby appears tired. Create a calm environment, dim the lights, and help them settle for sleep. Watch for sleep cues like yawning or rubbing eyes."
}
```

### Possible Output Values
- `Hungry` - Baby needs to be fed
- `Tired` - Baby needs sleep
- `Uncomfortable` - Baby might have a wet diaper or be uncomfortable
- `Pain` - Baby might be in pain (gas, colic)
- `Needs Attention` - Baby wants comfort or interaction

## Testing with cURL

### Basic Test
```bash
curl -X POST \
  https://neoparental-fast-api.onrender.com/predict \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/audio.wav'
```

### With Response Headers
```bash
curl -X POST \
  https://neoparental-fast-api.onrender.com/predict \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/audio.wav' \
  -v
```

## Testing with Postman

1. **Set Method**: POST
2. **URL**: `https://neoparental-fast-api.onrender.com/predict`
3. **Body**: 
   - Select "form-data"
   - Key: `file` (change type to File)
   - Value: Select audio file
4. **Send Request**
5. **View Response**

## Testing with Python

```python
import requests

url = "https://neoparental-fast-api.onrender.com/predict"
files = {'file': open('audio.wav', 'rb')}

response = requests.post(url, files=files)
print(response.json())
```

## Common Error Responses

### 400 Bad Request
```json
{
  "detail": "No file provided"
}
```
**Cause**: File not included in request
**Fix**: Ensure file is properly attached with key "file"

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "file"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
**Cause**: Invalid request format
**Fix**: Check multipart/form-data format

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```
**Cause**: Server-side processing error
**Fix**: Check audio file format, try different file

### 503 Service Unavailable
**Cause**: API server is down or restarting
**Fix**: Wait a few moments and retry

## Audio File Requirements

### Supported Formats
- ✅ WAV (.wav)
- ✅ MP3 (.mp3)
- ✅ M4A (.m4a)
- ✅ AAC (.aac)

### Recommended Specifications
- **Sample Rate**: 44100 Hz or 48000 Hz
- **Bit Depth**: 16-bit
- **Channels**: Mono or Stereo
- **Duration**: 3-30 seconds
- **File Size**: < 5 MB

### Not Recommended
- ❌ Very short clips (< 1 second)
- ❌ Very long recordings (> 60 seconds)
- ❌ Low quality recordings (< 8000 Hz)
- ❌ Very large files (> 10 MB)

## Debugging API Issues in App

### Check Network Connection
```javascript
// In listening.tsx, the API call logs errors
console.error('Upload error:', error);
```

### Enable Verbose Logging
Add to `utils/api.ts`:
```javascript
export async function uploadAudioForPrediction(file: AudioFile) {
  console.log('Uploading file:', file);
  console.log('API URL:', `${API_BASE_URL}/predict`);
  
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType || 'audio/wav',
      name: file.name || 'audio.wav',
    });
    
    console.log('FormData created:', formData);
    
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
```

### Test API Health
```javascript
// Add to your testing code
import { checkApiHealth } from '@/utils/api';

const isHealthy = await checkApiHealth();
console.log('API is healthy:', isHealthy);
```

## Mock Data for Testing (Offline)

If API is unavailable, use mock data:

```javascript
// In listening.tsx, replace uploadAudio function temporarily
const uploadAudio = async (file: AudioFile) => {
  setIsUploading(true);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response
  const mockResponse = {
    output: 'Hungry',
    prediction: 'Hungry',
    level: 'Medium',
    recommendation: 'The baby might be hungry. Try feeding them milk or formula.',
  };
  
  setResult(mockResponse);
  setIsUploading(false);
};
```

## Testing Checklist

- [ ] Test with WAV file
- [ ] Test with MP3 file
- [ ] Test with M4A file
- [ ] Test with recorded audio
- [ ] Test with uploaded file
- [ ] Test error handling (no file)
- [ ] Test error handling (invalid format)
- [ ] Test loading states
- [ ] Test results display
- [ ] Test "Try Again" functionality
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test with poor network
- [ ] Test with no network (offline)

## Performance Notes

### API Response Time
- **Average**: 2-5 seconds
- **Fast**: < 2 seconds
- **Slow**: 5-10 seconds
- **Timeout**: > 30 seconds (investigate)

### First Request
The API may be slower on the first request if the server is "cold" (sleeping). Subsequent requests should be faster.

### Optimization Tips
1. Show loading indicator immediately
2. Add timeout handling (30 seconds)
3. Allow cancellation of requests
4. Cache results locally
5. Implement retry logic

## Sample Audio Files

For testing, you can use:
1. **Baby cry recordings** from:
   - YouTube (download as audio)
   - Free sound libraries
   - Record your own test samples

2. **Test with different cry types**:
   - Hungry cry (rhythmic, repetitive)
   - Tired cry (continuous, whiny)
   - Pain cry (sudden, intense)
   - Discomfort cry (whimpering)

## Troubleshooting

### "Network request failed"
- Check internet connection
- Verify API URL is correct
- Check if API server is running
- Try curl test to verify connectivity

### "Upload failed"
- Check file format
- Verify file size (< 5 MB)
- Ensure file is not corrupted
- Try different audio file

### "No response"
- API might be down
- Check API server status
- Implement timeout handling
- Use mock data for testing

### "Invalid response"
- Check API response format
- Verify JSON structure
- Update response parsing code
- Check API version compatibility

---

**API Status**: Check at https://neoparental-fast-api.onrender.com/health
**Support**: Contact backend team if issues persist
