# Migration to expo-audio (SDK 54+)

## Important Change

**expo-av has been deprecated and removed in Expo SDK 54.** 

The audio recording functionality has been migrated to use **expo-audio**, which is the new recommended library.

## Changes Made

### 1. Package Updates

**Before (expo-av):**
```json
{
  "expo-av": "~15.0.4"
}
```

**After (expo-audio):**
```json
{
  "expo-audio": "~15.0.3"
}
```

### 2. Import Changes

**Before:**
```javascript
import { Audio } from 'expo-av';
```

**After:**
```javascript
import { 
  useAudioRecorder, 
  RecordingPresets,
  setIsAudioActiveAsync 
} from 'expo-audio';
```

### 3. API Changes

#### Recording Setup

**Before (expo-av):**
```javascript
const [recording, setRecording] = useState(null);

const startRecording = async () => {
  const permission = await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  setRecording(recording);
};
```

**After (expo-audio):**
```javascript
const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

const startRecording = async () => {
  const permission = await audioRecorder.requestPermissionsAsync();
  await setIsAudioActiveAsync(true);
  await audioRecorder.record();
};
```

#### Stop Recording

**Before (expo-av):**
```javascript
const stopRecording = async () => {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
};
```

**After (expo-audio):**
```javascript
const stopRecording = async () => {
  const uri = await audioRecorder.stop();
  await setIsAudioActiveAsync(false);
};
```

#### Check Recording State

**Before (expo-av):**
```javascript
const isRecording = recording !== null;
```

**After (expo-audio):**
```javascript
const isRecording = audioRecorder.isRecording;
```

## Benefits of expo-audio

1. **Modern API**: Hook-based approach fits better with React
2. **Better Performance**: More efficient recording management
3. **Simpler State Management**: Built-in recording state
4. **Future-Proof**: Actively maintained by Expo team
5. **Better Documentation**: More examples and guides

## Configuration Changes

### app.json

**Before:**
```json
{
  "plugins": [
    [
      "expo-av",
      {
        "microphonePermission": "..."
      }
    ]
  ]
}
```

**After:**
```json
{
  "plugins": [
    [
      "expo-audio",
      {
        "microphonePermission": "..."
      }
    ]
  ]
}
```

## Full Migration Steps

1. **Update package.json**
   ```bash
   npm uninstall expo-av
   npm install expo-audio
   ```

2. **Update app.json**
   - Change plugin from `expo-av` to `expo-audio`

3. **Update imports in code**
   ```javascript
   // Old
   import { Audio } from 'expo-av';
   
   // New
   import { useAudioRecorder, RecordingPresets, setIsAudioActiveAsync } from 'expo-audio';
   ```

4. **Refactor recording logic**
   - Replace `Audio.Recording.createAsync()` with `useAudioRecorder()` hook
   - Use `audioRecorder.record()` instead of managing recording state manually
   - Use `audioRecorder.stop()` for stopping
   - Check `audioRecorder.isRecording` for recording state

5. **Clean and rebuild**
   ```bash
   rm -rf node_modules
   npm install
   npm start -- --clear
   ```

## Compatibility

- ✅ **Expo SDK 54+**: expo-audio (current)
- ⚠️ **Expo SDK 53**: expo-audio (beta) or expo-av (deprecated)
- ⚠️ **Expo SDK 52 and below**: expo-av only

## Documentation

- [expo-audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Migration Guide](https://docs.expo.dev/versions/latest/sdk/audio/#migrating-from-expo-av)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)

## Troubleshooting

### "Cannot find module 'expo-av'"
**Solution**: Run `npm install` to install expo-audio

### "expo-av plugin not found"
**Solution**: Update app.json to use `expo-audio` plugin

### Recording not working
**Solution**: 
1. Check permissions are granted
2. Test on physical device (simulator may have issues)
3. Ensure `setIsAudioActiveAsync(true)` is called before recording

### Permission errors
**Solution**: Update app.json with correct expo-audio plugin configuration

## Feature Parity

All features from expo-av audio recording are available in expo-audio:

- ✅ Audio recording
- ✅ Permission handling
- ✅ Recording quality presets
- ✅ Recording state management
- ✅ File output (URI)
- ✅ iOS and Android support

## Additional Resources

- Example code in `app/listening.tsx`
- Expo audio examples: https://github.com/expo/expo/tree/main/packages/expo-audio
- Community discussions: https://forums.expo.dev

---

**Status**: ✅ Migration complete - using expo-audio
**Last Updated**: October 31, 2025
