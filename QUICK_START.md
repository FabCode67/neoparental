# Quick Start Guide

## Installation

```bash
# Install dependencies
npm install

# Start the app
npm start
```

## New Dependencies Installed
- `expo-av` - For audio recording
- `expo-document-picker` - For file selection

## Screens Created

### 1. Home Screen (`app/(tabs)/index.tsx`)
- Dashboard with welcome message
- Daily statistics (5 recorded, 3 uploaded, 7 feedback)
- Category selection
- Blog preview
- Tap "5 Recorded audio sound" to go to Listening screen
- Tap "7 Feedback" to go to History screen

### 2. Listening Screen (`app/listening.tsx`)
- Upload audio files from device
- Record audio directly
- Sends to API: `https://neoparental-fast-api.onrender.com/predict`
- Displays results with output, level, and recommendations

### 3. History Screen (`app/history.tsx`)
- View all recorded/uploaded audio
- Filter between recorded and uploaded
- Shows output results and dates

## Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## Testing the API Integration

1. Go to Home screen
2. Tap on "5 Recorded audio sound" card
3. In Listening screen, either:
   - Tap "Tap to select audio file" to upload
   - Tap "Start Listening" to record
4. Tap "Upload" button
5. View the results

## Permissions
The app will request:
- **Microphone access** - for recording audio
- **File access** - for selecting audio files

These are configured in `app.json`

## API Response Format
```json
{
  "output": "Hungry",
  "prediction": "Hungry", 
  "level": "Medium",
  "recommendation": "Feed the baby..."
}
```

## Color Scheme
- Primary: #FF5722 (Orange)
- Background: #8D6E63 (Brown)
- Cards: #D7CCC8 (Light Brown)
- Buttons: #5D4037 (Dark Brown)
- Accents: #FFE0B2 (Light Orange)

## Troubleshooting

**Audio recording not working?**
- Use a physical device (simulators may not work)
- Check microphone permissions are granted

**File upload not working?**
- Check network connection
- Verify API endpoint is accessible
- Try different audio file formats

**Navigation issues?**
- Restart the development server
- Clear cache: `npm start -- --clear`

## Files Changed
- `app/(tabs)/index.tsx` - Home screen (replaced existing)
- `app/listening.tsx` - New listening screen
- `app/history.tsx` - New history screen
- `package.json` - Added expo-av and expo-document-picker
- `app.json` - Added permissions

## Next Steps
1. Run `npm install` if you haven't
2. Start the app with `npm start`
3. Test on your device/emulator
4. Replace placeholder images in Home screen
5. Test API integration with real audio files

---

**Note:** No README files were created in the screens directory as requested. All documentation is in the root directory.
