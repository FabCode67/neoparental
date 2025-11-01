# NeoParental App - Setup Guide

## Overview
This is a React Native Expo application for NeoParental baby cry analysis.

## Screens Implemented
1. **Home Screen** (`app/(tabs)/index.tsx`) - Dashboard with welcome banner, categories, daily track stats, and blog
2. **Listening Screen** (`app/listening.tsx`) - Audio upload and recording interface with API integration
3. **History Screen** (`app/history.tsx`) - View all recorded and uploaded audio files

## Installation Steps

### 1. Install Dependencies
Run the following command in the project root:

```bash
npm install
```

This will install the required packages:
- expo-av (for audio recording)
- expo-document-picker (for file selection)

### 2. Start the Development Server

```bash
npm start
```

Or for specific platforms:
```bash
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For Web
```

## Features

### Home Screen
- Welcome banner with user greeting
- Category selection (CHW/Pediatrician)
- Daily track statistics with navigation
- Blog preview section
- Bottom navigation bar

### Listening Screen
- **File Upload**: Select audio files from device
- **Audio Recording**: Record audio directly in the app
- **API Integration**: Uploads to `https://neoparental-fast-api.onrender.com/predict`
- **Results Display**: Shows prediction output, level, and recommendations
- Loading states and error handling

### History Screen
- Lists all recorded/uploaded audio files
- Filter between recorded and uploaded
- View details of each audio file
- Download option

## API Integration

### Endpoint
`POST https://neoparental-fast-api.onrender.com/predict`

### Request Format
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: FormData with 'file' field containing the audio file

### Example Response
```json
{
  "output": "Hungry",
  "prediction": "Hungry",
  "level": "Medium",
  "recommendation": "Feed the baby..."
}
```

## Navigation Structure

```
app/
├── (tabs)/
│   ├── index.tsx         # Home/Dashboard
│   ├── explore.tsx       # Explore (existing)
│   └── _layout.tsx       # Tab navigation
├── listening.tsx         # Audio upload/recording
├── history.tsx          # Audio history
└── _layout.tsx          # Root layout
```

## Permissions Required

### iOS (Info.plist)
Add to `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app needs access to the microphone to record baby sounds.",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to select audio files."
      }
    }
  }
}
```

### Android (AndroidManifest.xml)
Automatically handled by expo-av and expo-document-picker

## Color Scheme
- Primary: `#FF5722` (Orange)
- Secondary: `#8D6E63` (Brown)
- Accent: `#FFE0B2` (Light Orange)
- Background: `#5D4037` (Dark Brown)

## Notes
- Audio recording uses high-quality preset
- File picker accepts all audio formats
- Results are displayed in a modal overlay
- All screens have proper loading and error states
- No README files were created in the screens directory as requested

## Troubleshooting

### Audio Recording Not Working
1. Check microphone permissions
2. Test on a physical device (simulators may have issues)
3. Ensure expo-av is properly installed

### File Upload Issues
1. Check network connectivity
2. Verify API endpoint is accessible
3. Check file format compatibility

### Navigation Issues
1. Ensure expo-router is properly configured
2. Check that all screen files are in the correct directories
3. Restart the development server

## Next Steps
1. Run `npm install` to install new dependencies
2. Test on device/emulator
3. Customize colors and images as needed
4. Add real user data and authentication
5. Implement persistent storage for history
