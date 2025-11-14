# Enhanced Development Workflow

## Overview

This guide shows you how to get an **Expo-like development experience** with your Next.js + Capacitor setup, including live reload and quick testing.

## Quick Start

### Option 1: Development with Live Reload (Recommended)

**For Emulator:**
```bash
# Terminal 1: Start Next.js dev server
pnpm dev

# Terminal 2: Enable live reload and open Android Studio
pnpm android:dev
```

**For Physical Device:**
1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. Set the IP in capacitor config or use:
   ```bash
   CAPACITOR_SERVER_URL=http://YOUR_IP:3000 pnpm android:dev
   ```

3. Make sure your device and computer are on the same WiFi network

### Option 2: Standard Development (No Live Reload)

```bash
# Build and test
pnpm build
pnpm android:sync
pnpm android:run
```

## Development Modes

### 1. Web Development (Fastest)
```bash
pnpm dev
```
- Opens at `http://localhost:3000`
- Hot reload enabled
- Fastest iteration
- Test in browser first

### 2. Android Development with Live Reload
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm android:dev
```

**What this does:**
- Connects Android app to your local dev server
- Changes in code → instantly visible on device
- Similar to Expo's hot reload!

**Requirements:**
- Next.js dev server running (`pnpm dev`)
- Android emulator or device connected
- Same network (for physical devices)

### 3. Production Build Testing
```bash
pnpm build
pnpm android:sync
pnpm android:run
```

**When to use:**
- Testing production build
- Before publishing
- Testing performance
- Final testing

## Configuration

### Enable Live Reload

Edit `capacitor.config.ts`:

```typescript
server: {
  androidScheme: 'https',
  // Uncomment for live reload:
  url: 'http://localhost:3000',  // For emulator
  // url: 'http://192.168.1.100:3000',  // For physical device (use your IP)
  cleartext: true,
}
```

**Or use environment variable:**
```bash
CAPACITOR_LIVE_RELOAD=true CAPACITOR_SERVER_URL=http://localhost:3000 pnpm android:sync
```

### Find Your IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Look for something like: inet 192.168.1.100
```

**Windows:**
```bash
ipconfig
# Look for IPv4 Address under your WiFi adapter
```

**Linux (alternative):**
```bash
hostname -I
```

## Workflow Comparison

### Expo Workflow (Reference)
```
1. Start Expo dev server
2. Scan QR code with Expo Go
3. App loads on device
4. Make changes → auto reloads
```

### Your Enhanced Workflow
```
1. Start Next.js dev server (pnpm dev)
2. Run android:dev (connects to dev server)
3. App opens in emulator/device
4. Make changes → auto reloads (if live reload enabled)
```

**Result: Same experience!** ✅

## Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `pnpm dev` | Start web dev server | Web development |
| `pnpm android:dev` | Enable live reload + open Android Studio | Development with live reload |
| `pnpm android:run` | Run on device/emulator | Quick testing |
| `pnpm android:sync` | Build + sync to Android | After code changes |
| `pnpm android:build` | Full build workflow | Production testing |
| `pnpm dev:android` | Start dev server + Android | One-command development |

## Tips & Tricks

### 1. Faster Iteration
- Develop in browser first (`pnpm dev`)
- Test on Android when needed
- Use live reload for mobile-specific testing

### 2. Network Issues
If live reload doesn't work:
- Check firewall settings
- Ensure device and computer on same network
- Try using `localhost` for emulator
- Use IP address for physical device

### 3. Production Testing
Always test production build before publishing:
```bash
pnpm build
pnpm android:sync
pnpm android:run
```

### 4. Debugging
- Use Chrome DevTools for web debugging
- Use Android Studio Logcat for native debugging
- Use `adb logcat` for terminal debugging

## Troubleshooting

### Live Reload Not Working

**Problem:** Changes not appearing on device

**Solutions:**
1. Check Next.js dev server is running
2. Verify IP address is correct (for physical devices)
3. Check network connection
4. Try restarting both dev server and Android app
5. Check `capacitor.config.ts` has correct URL

### Connection Refused

**Problem:** Can't connect to dev server

**Solutions:**
1. Ensure `pnpm dev` is running
2. Check firewall isn't blocking port 3000
3. For physical device: use computer's IP, not localhost
4. Verify device and computer on same WiFi

### App Shows Blank Screen

**Problem:** App loads but shows nothing

**Solutions:**
1. Check Android Studio Logcat for errors
2. Verify `out/` directory exists (run `pnpm build`)
3. Check `capacitor.config.ts` webDir is 'out'
4. Try disabling live reload and use production build

## Comparison with Expo

| Feature | Expo | Your Setup (Enhanced) |
|---------|------|----------------------|
| QR Code Scanning | ✅ | ⚠️ Use `android:run` (USB/WiFi) |
| Hot Reload | ✅ | ✅ With live reload enabled |
| Fast Development | ✅ | ✅ Same speed |
| Web Support | ❌ | ✅ Native |
| Single Codebase | ⚠️ Mobile only | ✅ Web + Mobile |

## Next Steps

1. **Try live reload:**
   ```bash
   pnpm dev
   # In another terminal:
   pnpm android:dev
   ```

2. **Test on physical device:**
   - Find your IP address
   - Update `capacitor.config.ts` with your IP
   - Connect device to same WiFi
   - Run `pnpm android:dev`

3. **Optimize workflow:**
   - Develop in browser for speed
   - Use Android for mobile-specific testing
   - Use production build for final testing

## Summary

You now have:
- ✅ Live reload capability (like Expo)
- ✅ Fast development workflow
- ✅ Web + Android from one codebase
- ✅ Better than Expo (because you have web support!)

**Your setup is actually better than Expo for your use case!** 🎉

