# 🎮 Smart Tug of War — WebSocket Edition

Play on your smartboard with student phones — all on the **same WiFi**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Build + start the server
npm start
```

The terminal will show your LAN IP, for example:
```
╔══════════════════════════════════════════════════╗
║  🎮  Smart Tug of War  —  WebSocket Server        ║
║  LAN IP  : 192.168.1.105                          ║
║  App URL : http://192.168.1.105:3000              ║
║  WS  URL : ws://192.168.1.105:4000                ║
╚══════════════════════════════════════════════════╝
```

---

## 📱 How to Play with Phones

1. Open `http://192.168.1.105:3000` on the **smartboard**
2. Start a **Multi-Device** game — two QR codes appear
3. Team A students scan the **blue QR** — opens Team A answer page
4. Team B students scan the **red QR** — opens Team B answer page
5. Teacher clicks **NEXT ▶** to advance questions

> **⚠️ All devices must be on the same WiFi network**

---

## 🔧 Development Mode

```bash
# Terminal 1: Start WebSocket server
node server.js

# Terminal 2: Start Vite dev server  
npm run dev
```

The dev server runs on port 5173. Phone URLs use port 5173 in dev mode.

---

## 📁 Project Structure

```
├── server.js          ← WebSocket + HTTP server (Node.js)
├── src/
│   ├── hooks/
│   │   └── useWebSocket.js    ← WS hook for React
│   ├── pages/
│   │   ├── MultiArena.jsx     ← Smartboard game view (with QR codes)
│   │   └── MobileKeypadPage.jsx  ← Phone answer page
│   └── ...
```

---

## 🌐 Ports Used

| Port | Purpose |
|------|---------|
| 3000 | HTTP — serves the built React app |
| 4000 | WebSocket — real-time game sync |

Make sure your firewall allows these ports on the local network.
