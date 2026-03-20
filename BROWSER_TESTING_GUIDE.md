# Simple Browser Testing Guide - Miner to Gamer Streaming

This guide explains how to test your streaming platform using just 2 browser tabs on one computer.

## What You're Testing

- **Gamer Tab**: Broadcasts their screen/game (like streaming Roblox)
- **Miner Tab**: Watches the gamer's stream and can send remote inputs

## Setup Steps

### 1. Start the Development Server

```bash
npm run dev
```

Your app will open at `http://localhost:5173`

### 2. Open Two Browser Tabs

- **Tab 1** (Gamer): `http://localhost:5173`
- **Tab 2** (Miner): `http://localhost:5173`

### 3. Create Two Test Accounts

**Tab 1 - Gamer Account:**
1. Click "Register"
2. Email: `gamer@test.com`
3. Password: `password123`
4. Username: `ProGamer`
5. Select role: **Gamer**
6. Complete registration

**Tab 2 - Miner Account:**
1. Click "Register"
2. Email: `miner@test.com`
3. Password: `password123`
4. Username: `ProMiner`
5. Select role: **Miner**
6. Complete registration

### 4. Start Streaming (Gamer Tab)

1. Go to Dashboard
2. Click "Streaming" or "Broadcast"
3. Click "Start Streaming"
4. Browser will ask to share screen - choose:
   - **Entire Screen** (to stream Roblox or any game)
   - **Application Window** (to stream just Roblox window)
   - **Browser Tab** (to stream just a web game)
5. Allow camera/microphone if you want
6. Your stream is now LIVE!

### 5. Watch Stream (Miner Tab)

1. Go to "Browse Streams" or "Games"
2. You should see "ProGamer" listed as live
3. Click on their stream
4. You should see the gamer's screen

### 6. Test Remote Control (Optional)

If you want the miner to control the gamer's game:

**Gamer Tab:**
- Enable "Allow Remote Control" in stream settings

**Miner Tab:**
- Click on the video
- Your mouse/keyboard should control the gamer's screen
- Try moving the mouse and clicking

## Testing with Roblox

### Option 1: Stream Roblox Desktop App

**Gamer Tab:**
1. Open Roblox on your computer
2. Start a game
3. In your browser, click "Start Streaming"
4. Select "Application Window" → Choose Roblox
5. Gamer's Roblox is now streaming!

**Miner Tab:**
- Watches the Roblox game
- Can control it remotely (if allowed)

### Option 2: Stream Roblox Browser Version

**Gamer Tab:**
1. Open new browser tab: `https://www.roblox.com`
2. Log in and start a game
3. In your app tab, click "Start Streaming"
4. Select "Browser Tab" → Choose the Roblox tab
5. Roblox browser game is streaming!

**Miner Tab:**
- Watches the stream
- Can play remotely

## Troubleshooting

### "No streams available"
- Make sure gamer clicked "Start Streaming"
- Refresh the miner tab
- Check both are logged in

### "Black screen" on miner side
- Gamer needs to approve screen sharing
- Try selecting different screen/window
- Check browser permissions

### Remote control not working
- Gamer must enable "Allow Remote Control"
- Click on the video player in miner tab
- Some browsers block this - try Chrome

### Can't see the stream
- Both users must be on same WiFi (or internet)
- Check browser console for errors (F12)
- Make sure WebRTC is allowed in browser

## What's Happening Behind the Scenes

1. **Gamer** shares screen → Captured by WebRTC
2. **Database** stores stream info (who's streaming)
3. **Miner** connects via WebRTC peer connection
4. **Video/Audio** flows directly between browsers (P2P)
5. **Remote inputs** (mouse/keyboard) sent back to gamer

## Next Steps After Browser Testing Works

Once you confirm:
- ✅ Gamer can start stream
- ✅ Miner can see stream
- ✅ Remote control works (if needed)

Then you can:
1. Package as desktop apps (Electron)
2. Deploy to web hosting
3. Test on different computers/networks

## Quick Test Checklist

- [ ] Both accounts created (gamer + miner)
- [ ] Gamer can start streaming
- [ ] Miner can see list of live streams
- [ ] Miner can watch the stream
- [ ] Video/audio quality is acceptable
- [ ] Remote control works (if enabled)
- [ ] Can stream Roblox (desktop or browser)

## Tips

- Use **Chrome or Edge** for best WebRTC support
- **Headphones** recommended to avoid audio feedback
- Start with **screen sharing** before trying remote control
- Test on **same computer first**, then try different devices
