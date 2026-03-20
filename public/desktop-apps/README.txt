========================================
HOW TO ADD YOUR DESKTOP APP FILES HERE
========================================

When you build your desktop apps, put the installer files in this folder with these exact names:

GAMER APP:
----------
- Daylight-ES365-Gamer-Windows.exe
- Daylight-ES365-Gamer-macOS.dmg
- Daylight-ES365-Gamer-Linux.AppImage

MINER APP:
----------
- Daylight-ES365-Miner-Windows.exe
- Daylight-ES365-Miner-macOS.dmg
- Daylight-ES365-Miner-Linux.AppImage

Once you add these files here, the download buttons on your homepage will work automatically!

HOW TO GET THE FILES:
---------------------
1. On your local computer, open a terminal in this project folder
2. Run: npm install
3. Run: npm run electron:build:gamer
4. Run: npm run electron:build:miner
5. Find the built files (they'll be in a "dist" or "dist-electron" folder)
6. Rename them to match the names above
7. Copy them into this folder

That's it! Your website will serve them for download.
