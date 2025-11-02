# Quick ML API 500 Error Test

## The Issue
Your ML API returns: `500 - {"detail":"Error: "}`

This means the server is crashing but not telling us why.

## Most Likely Cause
**The ML API doesn't support M4A format (iOS recordings)**

iOS records in `.m4a` format by default.
Your ML model probably only accepts `.wav` files.

## Quick Test

### Test 1: Check what format you're uploading
Look at the console logs and find:
```
📁 File Information:
   Name: recording_123456.m4a  ← If you see .m4a, that's the problem!
   Extension: m4a
```

### Test 2: Try with a WAV file
1. Find a `.wav` audio file on your computer
2. Transfer it to your phone
3. Use "File upload" instead of recording
4. Select the WAV file
5. Upload

If WAV works but M4A doesn't → **Format is the issue**

## Solution Options

### Option A: Convert M4A to WAV (Recommended)
You need to add audio conversion in your app. This requires:
- Installing `expo-av` or `react-native-audio-toolkit`
- Converting recordings before upload
- More complex but better UX

### Option B: Only Allow WAV Files (Quick Fix)
Change recording format:

```typescript
// In listening.tsx, change RecordingPresets
const audioRecorder = useAudioRecorder({
  ...RecordingPresets.HIGH_QUALITY,
  extension: '.wav',  // Force WAV format
  outputFormat: RecordingOptionsPresets.HIGH_QUALITY.android.outputFormat,
});
```

### Option C: Update ML API to Accept M4A (Backend Fix)
Update your ML API on Render to handle M4A files:

```python
# In your ML API predict endpoint
import librosa

# Load audio with librosa (supports multiple formats)
audio, sr = librosa.load(audio_file, sr=None)
```

## Immediate Action
1. Apply the diagnostic code I provided
2. Try uploading
3. Share the detailed logs
4. The logs will tell us exactly what format is being sent

The diagnostic version will show warnings like:
```
⚠️  WARNING: Non-WAV format detected!
    ML API might only support WAV files
    This could be causing the 500 error
```
