# Quick Test - Force Result Display

If the result modal still doesn't show after uploading, test if it can render at all.

## Add this temporarily to listening.tsx

Add this code right after the `checkPermissions()` useEffect (around line 40):

```typescript
// TEMPORARY TEST: Force show result after 5 seconds
useEffect(() => {
  console.log('TEST: Will show test result in 5 seconds...');
  const timer = setTimeout(() => {
    console.log('TEST: Setting test result NOW');
    setResult({
      predicted_label: 'TEST LABEL',
      confidence: 99,
      level: 'High',
      output: 'Test Output',
      recommendation: 'This is a test. If you see this, the modal works!'
    });
  }, 5000); // 5 seconds

  return () => clearTimeout(timer);
}, []);
```

## Expected Behavior

1. Refresh page
2. Go to listening screen
3. Wait 5 seconds
4. Result modal should pop up with "TEST LABEL"

## If It Works
→ Modal can render, problem is in the upload flow timing

## If It Doesn't Work
→ Modal has a CSS/rendering issue

Share the result!
