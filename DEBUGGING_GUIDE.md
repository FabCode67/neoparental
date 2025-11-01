# Debugging Guide - Audio Prediction Not Displaying

## Current Issue
- Prediction API returns successfully
- Response: `{"prediction_value": 4.0, "predicted_label": "Tired/Sleepy", "confidence": 100.0, ...}`
- But result modal not showing on screen
- Nothing saved to database

## What We Fixed

### 1. Made Backend Save Optional
The app now works even if user is not logged in:
- ✅ Always gets prediction from ML API
- ✅ Optionally saves to backend (if user is authenticated)
- ✅ Shows appropriate message based on login status

### 2. Added Debug Logging
Added extensive console logging to track the flow:
- `=== UPLOAD STARTED ===`
- `=== RAW RESPONSE ===`
- `=== FORMATTING RESPONSE ===`
- `=== SETTING RESULT ===`
- `=== RESULT STATE CHANGED ===`
- `=== RENDERING RESULT VIEW ===`

## How to Debug

### Step 1: Open Browser Console
Since you're testing in web (localhost:8082), open browser DevTools:
1. Press `F12` or right-click → Inspect
2. Go to **Console** tab
3. Clear the console (trash icon)

### Step 2: Upload Audio
1. Go to listening screen
2. Upload an audio file
3. Click "Upload"

### Step 3: Check Console Logs
Look for these logs in sequence:

```
=== UPLOAD STARTED ===
Uploading audio file: {...}

Step 1: Getting prediction...
Preparing upload: {...}
Blob created: XXXX bytes
Uploading to API...
Response status: 200
API Success Response: {...}
Prediction received: {...}

Step 2: User not authenticated, skipping database save
(OR)
Step 2: User is authenticated, saving to database...

=== RAW RESPONSE ===
Response object: {...}
Prediction: {...}
Saved to backend: false (or true)

=== FORMATTING RESPONSE ===
Formatted response: {...}

=== SETTING RESULT ===
Result state updated

=== RESULT STATE CHANGED ===
Result is now: {...}

=== RENDERING RESULT VIEW ===

=== SUCCESS ===
Showing message: ...

=== UPLOAD COMPLETE ===
```

### Step 4: Identify the Issue

#### If you see "UPLOAD STARTED" but no "RAW RESPONSE"
→ **Problem:** API call is failing
- Check network tab for error
- Verify prediction API is accessible

#### If you see "RAW RESPONSE" but no "FORMATTING RESPONSE"
→ **Problem:** Formatting function crashed
- Check if prediction has correct structure
- Look for JavaScript errors

#### If you see "FORMATTING RESPONSE" but no "SETTING RESULT"
→ **Problem:** setResult call failed
- Check for React errors
- Verify component is still mounted

#### If you see "SETTING RESULT" but no "RESULT STATE CHANGED"
→ **Problem:** State update didn't trigger
- React state issue
- Check if result is actually set

#### If you see "RESULT STATE CHANGED" but no "RENDERING RESULT VIEW"
→ **Problem:** Conditional render not working
- `if (result)` condition is false
- Result might be empty object

#### If you see "RENDERING RESULT VIEW"
→ **Success!** Modal should be visible
- If not visible, check CSS/styling issues

## Common Issues & Solutions

### Issue 1: "Cannot read property 'predicted_label' of undefined"
**Solution:** The prediction object structure doesn't match

Check the actual response:
```javascript
console.log('Prediction structure:', JSON.stringify(response.prediction, null, 2));
```

Expected:
```json
{
  "prediction_value": 4.0,
  "predicted_label": "Tired/Sleepy",
  "confidence": 100.0,
  "processing_time": 2.43835,
  "timestamp": "2025-10-31T22:19:11.611586"
}
```

### Issue 2: Result modal renders but is invisible
**Solution:** Check styling

Add temporary debug styling:
```typescript
<View style={[styles.resultModal, { backgroundColor: 'red', zIndex: 9999 }]}>
```

### Issue 3: State updates but component doesn't re-render
**Solution:** Force re-render

Add key prop:
```typescript
{result && <ResultView key={Date.now()} result={result} />}
```

### Issue 4: "Authentication required" error
**Solution:** This is expected if not logged in

The app will now show: "Prediction completed! (Log in to save predictions to history)"

## Quick Test

### Test Without Login
```bash
# 1. Make sure you're NOT logged in
# 2. Upload audio
# 3. Should see: "Prediction completed! (Log in to save predictions to history)"
# 4. Result modal should still show
```

### Test With Login
```bash
# 1. Login to the app first
# 2. Upload audio
# 3. Should see: "Prediction completed and saved to your history!"
# 4. Check MongoDB for saved prediction
```

## Manual Result Test

If all else fails, test if the modal works by hardcoding:

```typescript
// Add this at the top of the component
useEffect(() => {
  // Test: Set a dummy result after 3 seconds
  setTimeout(() => {
    console.log('Setting test result');
    setResult({
      predicted_label: 'Test Label',
      confidence: 99,
      level: 'High',
      output: 'Test Output',
      recommendation: 'This is a test recommendation'
    });
  }, 3000);
}, []);
```

If modal shows with dummy data → Problem is in the API/formatting
If modal doesn't show with dummy data → Problem is in the rendering

## Next Steps

1. **Run the app and check console logs**
2. **Identify where the flow stops** using the debug markers
3. **Share the console output** with the specific error
4. **Check Network tab** to see the actual API response

## Expected Console Output (Success)

```
=== UPLOAD STARTED ===
Uploading audio file: {"uri":"...","name":"..."}
Step 1: Getting prediction...
Preparing upload: {uri: "...", name: "...", type: "audio/m4a"}
Blob created: 245760 bytes
Uploading to API...
Response status: 200
API Success Response: {predicted_label: "Tired/Sleepy", confidence: 100, ...}
Prediction received: {predicted_label: "Tired/Sleepy", confidence: 100, ...}
Step 2: User not authenticated, skipping database save
=== RAW RESPONSE ===
Response object: {"prediction":{...},"savedToBackend":false}
Prediction: {"predicted_label":"Tired/Sleepy","confidence":100,...}
Saved to backend: false
=== FORMATTING RESPONSE ===
Formatted response: {"predicted_label":"Tired/Sleepy","confidence":100,"output":"Tired/Sleepy","level":"High","recommendation":"..."}
=== SETTING RESULT ===
Result state updated
=== RESULT STATE CHANGED ===
Result is now: {"predicted_label":"Tired/Sleepy",...}
=== RENDERING RESULT VIEW ===
=== SUCCESS ===
Showing message: Prediction completed! (Log in to save predictions to history)
=== UPLOAD COMPLETE ===
```

---

After you run the app and check the logs, share the console output and we can pinpoint exactly where the issue is!
