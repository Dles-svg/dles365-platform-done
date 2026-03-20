# Testing Guide: Miner Streams to Gamer
## No Tokens Required for Testing

This guide walks through testing the core streaming functionality where a **MINER streams their PC/hardware to a GAMER** who can remotely control it.

**IMPORTANT**: During this testing phase, NO DL365 tokens are required. Payment/token systems are disabled for testing purposes.

---

## Prerequisites

### Both Users Need:
- Downloaded AppImage files (Miner or Gamer version)
- Made executable: `chmod +x "Daylight ES365 [App]-1.0.0.AppImage"`
- Stable internet connection
- Modern browser (Chrome/Firefox recommended)

---

## MINER Test Sequence

### 1. Launch & Login
```
1. Open Miner AppImage
2. Register new account: miner1@test.com / testpass123
3. Auto-redirect to Dashboard
```

### 2. Setup Your Equipment
```
Go to: Equipment Rental / Marketplace
1. Click "List My Equipment"
2. Fill in PC specs:
   - GPU: NVIDIA RTX 4090
   - CPU: AMD Ryzen 9 7950X
   - RAM: 64GB
   - Storage: 2TB NVMe
   - Tier: Select from (Standard/Premium/Professional/Elite/Ultimate/Legendary)
3. Set availability: "Available Now"
4. Click "Save Equipment"
```

**Note**: Pricing fields can be left at defaults - no tokens will be charged during testing.

### 3. Start Broadcasting
```
Go to: Streaming Page (/streaming)
1. Click "Start Broadcasting"
2. Choose what to share:
   ☐ Full Desktop Access
   ☐ Specific Application
   ☐ Game Window
3. Browser will prompt for screen sharing permission - ALLOW
4. Click "Go Live"
```

### 4. Get Your Connection Code
```
After going live, you'll see:
- Stream Status: "🟢 LIVE - Waiting for viewers"
- Your Stream Code: STREAM-ABC123XYZ
- Share this code with the gamer
```

### 5. Wait for Gamer to Connect
```
Status updates:
- "Waiting for connection..."
- "Gamer connected!" (when gamer joins)
- "Receiving remote inputs" (when gamer starts controlling)
```

### 6. Monitor the Session
```
You'll see:
- Gamer's mouse movements (cursor overlay)
- Keyboard inputs being executed on your PC
- Chat messages from gamer
- Connection quality metrics
- Session duration timer
```

### 7. Test Controls
```
- Let gamer control your desktop
- They can open applications
- Play games on your hardware
- Type and navigate
- You maintain admin override
```

### 8. End Session
```
When testing complete:
- Click "End Broadcast"
- Session logs saved to history
- No payment processing (testing mode)
```

---

## GAMER Test Sequence

### 1. Launch & Login
```
1. Open Gamer AppImage
2. Register: gamer1@test.com / testpass123
3. Auto-redirect to Dashboard
```

### 2. Browse Available Equipment
```
Go to: Marketplace / Equipment Rental
1. See list of available miners
2. Filter options:
   - By GPU tier
   - By availability
   - By specs
3. Or use "Enter Stream Code" option
```

### 3. Connect to Miner
```
Option A - From Marketplace:
1. Find miner's equipment listing
2. Click "Connect Now"
3. Skip payment (testing mode)

Option B - Direct Code:
1. Click "Join by Code"
2. Enter: STREAM-ABC123XYZ
3. Click "Connect"
```

### 4. Stream Starts
```
Connection sequence:
1. "Establishing WebRTC connection..."
2. "Receiving video stream..."
3. "Remote input enabled"
4. "Connected! You can now control the remote PC"
```

### 5. Test Remote Control
```
You should be able to:
✓ See miner's screen in real-time
✓ Move mouse - cursor appears on miner's screen
✓ Click - executes on miner's PC
✓ Type - keyboard input works
✓ Hear audio from miner's PC
✓ Play games/use applications
```

### 6. Quality Checks
```
Test these metrics:
- Input latency: < 100ms (click to response)
- Video quality: 720p-1080p smooth playback
- Audio sync: Sound matches video
- Frame rate: 30-60 FPS
- Connection stability: No frequent drops
```

### 7. Interactive Features
```
During session:
- Chat with miner
- Request assistance
- Report connection issues
- Check session timer
```

### 8. End Session
```
When done testing:
- Click "Disconnect"
- Session ends gracefully
- History logged
- No payment processing
```

---

## Testing Checklist

### Critical Functionality
- [ ] Miner can start broadcast
- [ ] Gamer can discover/connect to miner
- [ ] Video stream appears in gamer's view
- [ ] Audio streams correctly
- [ ] Mouse input works (gamer → miner)
- [ ] Keyboard input works
- [ ] Chat between users functions
- [ ] Session can be ended by either party

### Connection Quality
- [ ] WebRTC establishes < 5 seconds
- [ ] Input latency < 100ms
- [ ] Video smooth, no excessive buffering
- [ ] Audio in sync with video
- [ ] Reconnection works after network hiccup

### Edge Cases
- [ ] What happens if miner closes browser?
- [ ] What if gamer loses internet?
- [ ] Can miner override gamer's input?
- [ ] Multiple gamers trying to connect?
- [ ] Session timeout behavior

### Database Verification
```sql
-- Check streaming session was created
SELECT * FROM streaming_sessions
WHERE broadcaster_id = 'miner-user-id'
ORDER BY created_at DESC LIMIT 1;

-- Check peer connection established
SELECT * FROM peer_connections
WHERE status = 'connected'
ORDER BY created_at DESC;

-- Verify equipment listing
SELECT * FROM equipment_rentals
WHERE owner_id = 'miner-user-id';
```

---

## Expected Behavior

### ✅ Success Indicators

**Miner Side:**
- Status shows "Connected to 1 viewer"
- Can see gamer's cursor overlay
- Inputs execute on their PC
- Chat messages appear
- Session timer running

**Gamer Side:**
- Video stream displays miner's screen
- Mouse movements feel responsive
- Keyboard inputs register
- Audio plays clearly
- Controls feel native (not delayed)

### ❌ Common Issues & Fixes

**"WebRTC connection failed"**
- Check firewall settings
- Ensure browser permissions granted
- Try refreshing both sides

**"No video appearing"**
- Miner: Did you grant screen share permission?
- Gamer: Check browser console for errors
- Verify both on same network/internet

**"Input lag is terrible"**
- Check internet speed (both sides need 10+ Mbps)
- Close other bandwidth-heavy apps
- Try lower quality settings

**"Can't find miner's stream"**
- Verify miner is broadcasting (status: LIVE)
- Check stream code is correct
- Refresh marketplace/equipment list

---

## Technical Flow

```
MINER                          SUPABASE                     GAMER
  |                                |                           |
  |--[Start Broadcast]------------>|                           |
  |                                |                           |
  |<--[Stream ID Created]----------|                           |
  |                                |                           |
  |                                |<--[Search Streams]--------|
  |                                |                           |
  |                                |--[Available Streams]----->|
  |                                |                           |
  |<--[WebRTC Offer]--------------------------------[Connect]--|
  |                                |                           |
  |--[WebRTC Answer]------------------------------------->|
  |                                |                           |
  |<=================WebRTC P2P Connection===============>|
  |                                |                           |
  |--[Video/Audio Stream]------------------------------>|
  |                                |                           |
  |<--[Keyboard/Mouse Input]----------------------------|
  |                                |                           |
  |--[Execute Input on PC]                                     |
  |                                |                           |
  |--[Screen Update]-------------------------------->|
  |                                |                           |
```

---

## After Testing

### Report These Metrics:
1. **Connection Success Rate**: X out of Y attempts
2. **Average Input Latency**: Xms
3. **Video Quality**: Resolution & FPS achieved
4. **Audio Quality**: Clear / Distorted / Delayed
5. **Session Stability**: Disconnections per hour
6. **User Experience**: Smooth / Laggy / Unusable

### Next Steps After Testing:
- Token/payment system integration (when ready)
- Advanced features: Multi-viewer support
- Recording/replay functionality
- Hardware performance monitoring
- Scheduling system for rentals

---

## Quick Start Commands

### Miner:
```bash
# Run AppImage
./Daylight\ ES365\ \[Miner\]-1.0.0.AppImage

# Browser auto-opens to: http://localhost:5173
# Login → Go to /streaming → Start Broadcasting
```

### Gamer:
```bash
# Run AppImage
./Daylight\ ES365\ \[Gamer\]-1.0.0.AppImage

# Browser auto-opens to: http://localhost:5173
# Login → Go to /marketplace → Connect to Miner
```

---

## Support

If you encounter issues during testing:
1. Check browser console (F12) for errors
2. Verify Supabase connection in `.env`
3. Ensure WebRTC ports aren't blocked
4. Check both users have camera/mic permissions granted
5. Review network conditions (speed test)

**No tokens needed - just test the streaming!** 🎮⛏️
