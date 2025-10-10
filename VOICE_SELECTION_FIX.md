# 🎤 Voice Selection Fix - Complete Solution

## 🚨 Problem

**Issue**: When you select different voices and click "Test voice", you always hear the **same voice** (usually System Default), not the voice you selected.

**Why it happens**:

1. **Settings cache delay** - When you change the dropdown, it saves to IndexedDB, but React state (`settings.voiceName`) hasn't updated yet when you click Test
2. **Browser voice caching** - Some browsers (especially iOS/Safari) ignore voice changes if synthesis is already queued
3. **Language mismatch** - If `utterance.lang` doesn't match the voice's language, browsers silently fall back to system default
4. **iOS/PWA limitations** - Standalone PWAs on iOS may only expose 1-2 voices regardless of what's installed

---

## ✅ Complete Fix Applied

### 1. **Direct Voice Override** (hooks/use-speech.ts)

Added ability to pass voice name directly to `speak()` function:

```typescript
// Before
speak(text) // Always uses settings.voiceName (might be stale)

// After
speak(text, "Samantha") // Uses specified voice immediately
```

**Changes**:

- `speak()` now accepts `overrideVoiceName?: string`
- `speakChunks()` now accepts `overrideVoiceName?: string`
- `selectBestVoice()` now accepts `overrideVoiceName?: string`

### 2. **Read from DOM** (app/settings/page.tsx)

Test button now reads the **current** dropdown value directly:

```typescript
const handleTestVoice = async () => {
  // Get current selection from DOM (bypasses React state delay)
  const selectElement = document.getElementById("voice-select")
  const selectedVoiceName = selectElement?.value || ""

  // Pass directly to speak function
  speak(sample, selectedVoiceName || undefined)
}
```

### 3. **Language Alignment** (hooks/use-speech.ts)

Set utterance language to match the voice:

```typescript
// Before
utterance.lang = "en-US" // Always US English
utterance.voice = selectedVoice

// After
if (selectedVoice) {
  utterance.lang = selectedVoice.lang // Match voice language!
  utterance.voice = selectedVoice
}
```

### 4. **Cancel Pending Speech** (hooks/use-speech.ts)

Cancel any pending synthesis before starting new utterance:

```typescript
// Cancel any pending utterances before speaking
if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
  window.speechSynthesis.cancel()
}
window.speechSynthesis.speak(utterance)
```

### 5. **Voice Name in Sample** (app/settings/page.tsx)

Sample now says the voice name so you can confirm:

```typescript
const voiceLabel = selectedVoiceName || "System Default"
const sample = `Hello. This is ${voiceLabel}.`
```

---

## 🧪 How to Test

### Desktop (Chrome/Edge)

1. Open Settings → Voice
2. You should see multiple voices (Samantha, Alex, Victoria, etc.)
3. Select a different voice
4. Click **"Test voice"**
5. You should hear: "Hello. This is [Voice Name]." in that voice
6. Try different voices - each should sound different

### Mobile (iOS Safari)

1. Open Settings → Voice
2. You might only see "System Default" (iOS limitation)
3. Click **"Refresh voices"** - might add 1-2 more voices
4. Select a voice
5. Click **"Test voice"**
6. Should hear that voice (if available on iOS)

**Note**: iOS in standalone PWA mode often limits voices to just the system default. This is an Apple platform restriction, not a bug in your app.

### Mobile (Android Chrome)

1. Open Settings → Voice
2. Should see Google voices (en-US, en-GB, etc.)
3. Select different voices
4. Click **"Test voice"**
5. Should hear different voices

---

## 🔍 Debugging

### Check Console Logs

When you click "Test voice", look for:

```
[Speech] Using selected voice: Samantha
[Speech] Text split into 1 chunk(s)
[Speech] Speaking 1 chunk(s) with voice: Samantha
[Speech] Started speaking with voice: Samantha
```

If you see:

- `"Using Daniel voice as fallback"` - Your selected voice wasn't found
- `"Using any English voice"` - Falling back to default
- `"No suitable voice found"` - No voices available

### Check Available Voices

In browser console:

```javascript
// List all available voices
window.speechSynthesis.getVoices().forEach((v) => {
  console.log(v.name, v.lang, v.localService)
})
```

### Test Voice Directly

In browser console:

```javascript
// Force test a specific voice
const utterance = new SpeechSynthesisUtterance("Test")
const voices = window.speechSynthesis.getVoices()
utterance.voice = voices.find((v) => v.name === "Samantha")
utterance.lang = utterance.voice?.lang || "en-US"
window.speechSynthesis.speak(utterance)
```

---

## 🎯 What Should Happen Now

### When you select a voice and click "Test voice":

1. ✅ Reads current dropdown value from DOM (bypasses React state)
2. ✅ Ensures voices are loaded (iOS workaround)
3. ✅ Finds the exact voice you selected
4. ✅ Sets utterance language to match voice language
5. ✅ Cancels any pending speech
6. ✅ Speaks with the selected voice
7. ✅ Says the voice name so you can confirm
8. ✅ Auto-stops after 2.5 seconds
9. ✅ Shows "Testing..." button state

**Result**: Each voice should sound **distinctly different**!

---

## 🚨 Platform Limitations

### iOS Safari / iOS PWA

- **Limited voices**: Often shows only "System Default" or 1-2 voices
- **Why**: Apple restricts Web Speech API in web apps
- **Workaround**:
  - Click "Refresh voices" after user interaction
  - Try opening in Safari (non-PWA) to compare
  - Install voices in iOS Settings → Accessibility → Spoken Content → Voices

### Android Chrome

- **Good support**: Usually shows 10-20 Google voices
- **Should work**: Different voices should be clearly audible

### Desktop Browsers

- **Best support**: Chrome/Edge show many voices
- **macOS**: Samantha, Alex, Victoria, Daniel, Karen, etc.
- **Windows**: Microsoft David, Zira, Mark, etc.

---

## 💡 Pro Tips

### 1. Always Test in Console First

```javascript
// In browser console
const voices = window.speechSynthesis.getVoices()
console.log(`Found ${voices.length} voices:`)
voices.forEach((v, i) => console.log(`${i}: ${v.name} (${v.lang})`))
```

### 2. Verify Voice Object

```javascript
// In console after selecting a voice
const select = document.getElementById("voice-select")
console.log("Selected:", select.value)

const voices = window.speechSynthesis.getVoices()
const voice = voices.find((v) => v.name === select.value)
console.log("Voice object:", voice)
```

### 3. Force Voice Loading (iOS)

```javascript
// In console - force iOS to load voices
const utterance = new SpeechSynthesisUtterance("")
window.speechSynthesis.speak(utterance)
window.speechSynthesis.cancel()
// Then check voices again
window.speechSynthesis.getVoices()
```

---

## ✅ Verification Steps

After deploying:

1. **Clear your cache** (important!)
2. **Open Settings → Voice**
3. **Check console** - should see voice list logs
4. **Select "Samantha"** (if available)
5. **Click "Test voice"**
6. **Listen** - should hear female voice saying "Hello. This is Samantha."
7. **Select "Alex"** (if available)
8. **Click "Test voice"**
9. **Listen** - should hear male voice saying "Hello. This is Alex."

If all voices sound the same:

- Check console logs for which voice is actually being used
- Check if voices are actually available: `window.speechSynthesis.getVoices()`
- Try on a different device/browser
- iOS PWA users: Try in Safari browser first to verify

---

## 🔧 Code Changes Summary

### hooks/use-speech.ts

- ✅ Added `overrideVoiceName` parameter to `speak()`, `speakChunks()`, `selectBestVoice()`
- ✅ Set `utterance.lang` to match selected voice's language
- ✅ Cancel pending speech before new utterance
- ✅ Improved voice selection priority logic

### app/settings/page.tsx

- ✅ Added `testingVoice` state for button feedback
- ✅ Read dropdown value directly from DOM
- ✅ Pass voice name explicitly to `speak()`
- ✅ Voice name in spoken sample
- ✅ Button shows "Testing..." state

---

## 📊 Expected Results

| Platform                     | Voices Available    | Will Test Button Work?    |
| ---------------------------- | ------------------- | ------------------------- |
| **Desktop Chrome (macOS)**   | 20+ voices          | ✅ YES - Different voices |
| **Desktop Chrome (Windows)** | 15+ voices          | ✅ YES - Different voices |
| **Android Chrome**           | 10-20 Google voices | ✅ YES - Different voices |
| **iOS Safari (browser)**     | 1-5 voices          | ⚠️ MAYBE - Limited by iOS |
| **iOS PWA (installed)**      | 1-2 voices          | ⚠️ MAYBE - Very limited   |

---

## 🎯 Next Steps

1. **Deploy the fix**:

   ```bash
   cd /Users/sravanpolu/Projects/DailyBias
   pnpm build
   netlify deploy --prod
   ```

2. **Clear your cache** and test on:
   - Desktop browser
   - Mobile browser
   - PWA installed

3. **If still same voice**:
   - Open browser console
   - Run: `window.speechSynthesis.getVoices()`
   - Check how many voices you actually have
   - iOS might genuinely only have 1 voice available

---

**The fix is applied! Deploy and test with different voices.** 🎤

If you have multiple voices available and they still sound the same after deployment, let me know and I'll add debug logging to trace exactly what's happening.
