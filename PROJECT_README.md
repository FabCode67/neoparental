# NeoParental Mobile App

A React Native Expo application for analyzing baby cry sounds to help parents understand their baby's needs.

## 📱 Features

- **Dashboard**: Overview of recorded audio, uploads, and feedback
- **Audio Recording**: Record baby sounds directly in the app
- **File Upload**: Upload existing audio files for analysis
- **AI Analysis**: Get predictions about baby's needs (Hungry, Tired, etc.)
- **History**: View all past recordings and their analysis results

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   cd neoparentalapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## 📋 Project Structure

```
neoparentalapp/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home/Dashboard screen
│   │   ├── explore.tsx        # Explore screen
│   │   └── _layout.tsx        # Tab navigation
│   ├── listening.tsx          # Audio upload/record screen
│   ├── history.tsx           # Audio history screen
│   └── _layout.tsx           # Root layout
├── components/               # Reusable components
├── constants/
│   └── app.ts               # App constants (colors, API, etc.)
├── utils/
│   └── api.ts               # API utility functions
├── assets/                  # Images, fonts, etc.
└── package.json
```

## 🎨 Screens

### 1. Home Screen
- Welcome banner with user greeting
- Category selection (CHW/Pediatrician)
- Statistics cards showing:
  - Recorded audio count
  - Uploaded audio count
  - Feedback count
- Blog preview section
- Bottom navigation

### 2. Listening Screen
- **File Upload**:
  - Select audio files from device
  - Preview file details
  - Upload to API
- **Recording**:
  - Start/stop recording
  - Real-time recording indicator
  - Automatic save after recording
- **Results**:
  - Display prediction output
  - Show confidence level
  - Provide recommendations

### 3. History Screen
- List all recorded/uploaded audio
- Filter by type (Recorded/Uploaded)
- View details of each analysis
- Download option (UI ready)

## 🔌 API Integration

### Endpoint
```
POST https://neoparental-fast-api.onrender.com/predict
```

### Request Format
```javascript
const formData = new FormData();
formData.append('file', {
  uri: audioFile.uri,
  type: 'audio/wav',
  name: 'audio.wav',
});
```

### Response Format
```json
{
  "output": "Hungry",
  "prediction": "Hungry",
  "level": "Medium",
  "recommendation": "Feed the baby as they might be hungry..."
}
```

## 🎨 Design System

### Colors
```javascript
{
  primary: '#FF5722',      // Orange
  secondary: '#8D6E63',    // Brown
  cardBackground: '#D7CCC8', // Light Brown
  darkBrown: '#5D4037',
  lightOrange: '#FFE0B2',
}
```

### Key Components
- Custom card layouts
- Rounded buttons with icons
- Status indicators
- Modal overlays for results

## 🔐 Permissions

### iOS
- Microphone access (for recording)
- File access (for uploads)

### Android
- RECORD_AUDIO
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE

Permissions are automatically requested at runtime when needed.

## 📦 Dependencies

### Core
- `expo` ~54.0.20
- `react-native` 0.81.5
- `expo-router` ~6.0.13

### Audio & Files
- `expo-av` ~15.0.4 (audio recording)
- `expo-document-picker` ~13.0.3 (file selection)

### UI & Navigation
- `@expo/vector-icons` ^15.0.3
- `@react-navigation/native` ^7.1.8
- `react-native-gesture-handler` ~2.28.0

## 🧪 Testing

### Test Audio Recording
1. Navigate to Home screen
2. Tap "5 Recorded audio sound" card
3. In Listening screen, tap "Start Listening"
4. Record for a few seconds
5. Tap "Stop Recording"
6. Tap "Upload" to send to API

### Test File Upload
1. Navigate to Listening screen
2. Tap "Tap to select audio file"
3. Select an audio file
4. Tap "Upload"
5. View results in modal

### Test History
1. Navigate to Home screen
2. Tap "7 Feedback" card
3. View list of previous recordings
4. Tap "View more" for details

## 🐛 Troubleshooting

### Audio Recording Not Working
- **Issue**: Recording doesn't start
- **Solution**: Use a physical device (simulators may not support microphone)
- **Solution**: Check microphone permissions are granted

### File Upload Fails
- **Issue**: Upload returns error
- **Solution**: Check network connection
- **Solution**: Verify API endpoint is accessible
- **Solution**: Try a different audio file format

### Build Errors
- **Issue**: Dependencies not found
- **Solution**: Run `npm install` again
- **Solution**: Clear cache: `npm start -- --clear`
- **Solution**: Delete `node_modules` and reinstall

## 📝 Development Notes

### Adding New Screens
1. Create file in `app/` directory
2. Use `expo-router` for navigation
3. Follow existing screen patterns
4. Update tab navigation if needed

### Modifying API
1. Update `utils/api.ts`
2. Update types/interfaces
3. Update error handling
4. Test with real data

### Styling Guidelines
- Use constants from `constants/app.ts`
- Follow existing color scheme
- Maintain consistent spacing
- Use responsive layouts

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Home dashboard screen
- ✅ Audio recording functionality
- ✅ File upload capability
- ✅ API integration
- ✅ Results display
- ✅ History view
- ✅ Permission handling

### Upcoming Features
- [ ] User authentication
- [ ] Persistent storage
- [ ] Audio playback
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Multi-language support

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Guide](https://expo.github.io/router/)
- [Expo AV Documentation](https://docs.expo.dev/versions/latest/sdk/av/)

## 🤝 Contributing

1. Follow the existing code style
2. Test on both iOS and Android
3. Update documentation
4. Create pull request with description

## 📄 License

[Your License Here]

## 👥 Team

NeoParental Development Team

## 📧 Support

For issues and questions:
- Check the troubleshooting section
- Review existing documentation
- Contact the development team

---

**Built with ❤️ using React Native & Expo**
