/**
 * Smart Tug of War — WebSocket Game Server
 */
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { networkInterfaces } from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

function getLanIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

const LAN_IP    = getLanIP();
const WS_PORT   = 4000;
const HTTP_PORT = 3000;

const MIME = {
  ".html":"text/html",".js":"application/javascript",".css":"text/css",
  ".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",
  ".ico":"image/x-icon",".json":"application/json",".woff2":"font/woff2",
};

const DIST = join(__dirname, "dist");

const httpServer = createServer((req, res) => {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";

  if (urlPath === "/server-config.js") {
    res.writeHead(200, { "Content-Type":"application/javascript" });
    res.end(`window.__SERVER_IP__ = "${LAN_IP}"; window.__WS_PORT__ = ${WS_PORT};`);
    return;
  }

  let filePath = join(DIST, urlPath);
  if (!existsSync(filePath)) filePath = join(DIST, "index.html");

  try {
    const data = readFileSync(filePath);
    const ext  = extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("Not found");
  }
});

httpServer.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`\n🌐 HTTP server: http://${LAN_IP}:${HTTP_PORT}`);
});

// ─── Game state ───────────────────────────────────────────────────────────────
let gameState = null;
// connected phones: Map<ws, { team:"A"|"B" }>
const phones  = new Map();
const boards  = new Set();

function getConnectedTeams() {
  const teams = { A: false, B: false };
  for (const [, info] of phones) {
    if (info.team === "A") teams.A = true;
    if (info.team === "B") teams.B = true;
  }
  return teams;
}

function broadcastAll(msg) {
  const str = JSON.stringify(msg);
  for (const [ws] of phones) { if (ws.readyState===1) ws.send(str); }
  for (const ws of boards)   { if (ws.readyState===1) ws.send(str); }
}

function broadcastBoards(msg) {
  const str = JSON.stringify(msg);
  for (const ws of boards) { if (ws.readyState===1) ws.send(str); }
}

function sendConnectedStatus() {
  const teams = getConnectedTeams();
  broadcastBoards({ type:"PHONES_CONNECTED", teamA: teams.A, teamB: teams.B });
}

// ─── WebSocket server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: WS_PORT, host:"0.0.0.0" });

wss.on("connection", (ws, req) => {
  console.log(`✅ Client connected (total: ${wss.clients.size})`);

  // Send current state
  if (gameState) ws.send(JSON.stringify({ type:"STATE", state:gameState }));
  else           ws.send(JSON.stringify({ type:"IDLE" }));

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    switch (msg.type) {

      case "REGISTER_BOARD": {
        boards.add(ws);
        sendConnectedStatus();
        break;
      }

      case "REGISTER_PHONE": {
        phones.set(ws, { team: msg.team });
        console.log(`📱 Phone registered: Team ${msg.team}`);
        sendConnectedStatus();
        // Tell the phone the current state
        if (gameState) ws.send(JSON.stringify({ type:"STATE", state:gameState }));
        else           ws.send(JSON.stringify({ type:"IDLE" }));
        break;
      }

      case "START_GAME": {
        gameState = {
          status: "playing",
          sessionId: Date.now().toString(),
          currentQ: msg.currentQ,
          ropePos: 0, scoreA:0, scoreB:0,
          submittedA:false, submittedB:false,
          answerA:"", answerB:"",
          timeA:null, timeB:null,
          roundStarted: Date.now(),
          history: [],
        };
        broadcastAll({ type:"STATE", state:gameState });
        console.log("🎮 Game started");
        break;
      }

      case "SUBMIT_ANSWER": {
        if (!gameState || gameState.status!=="playing") break;
        const team = msg.team;
        if (team==="A" && !gameState.submittedA) {
          gameState.answerA   = msg.answer;
          gameState.submittedA = true;
          gameState.timeA     = Date.now() - gameState.roundStarted;
        } else if (team==="B" && !gameState.submittedB) {
          gameState.answerB   = msg.answer;
          gameState.submittedB = true;
          gameState.timeB     = Date.now() - gameState.roundStarted;
        }
        broadcastAll({ type:"STATE", state:gameState });
        console.log(`📨 Team ${team} answered: "${msg.answer}"`);
        break;
      }

      case "NEXT_QUESTION": {
        if (!gameState) break;
        gameState = {
          ...gameState, status:"playing",
          currentQ: msg.currentQ,
          submittedA:false, submittedB:false,
          answerA:"", answerB:"",
          timeA:null, timeB:null,
          roundStarted: Date.now(),
          ropePos: msg.ropePos ?? gameState.ropePos,
          scoreA:  msg.scoreA  ?? gameState.scoreA,
          scoreB:  msg.scoreB  ?? gameState.scoreB,
        };
        broadcastAll({ type:"STATE", state:gameState });
        break;
      }

      case "UPDATE_SCORES": {
        if (!gameState) break;
        // Append round to history
        if (msg.roundResult) {
          gameState.history = [...(gameState.history||[]), msg.roundResult];
        }
        gameState = { ...gameState, ...msg.update };
        broadcastAll({ type:"STATE", state:gameState });
        break;
      }

      case "GAME_OVER": {
        if (gameState) gameState.status = "gameover";
        broadcastAll({ type:"GAME_OVER", winner:msg.winner });
        break;
      }

      case "RESET": {
        gameState = null;
        broadcastAll({ type:"IDLE" });
        break;
      }

      case "PING":
        ws.send(JSON.stringify({ type:"PONG" }));
        break;
    }
  });

  ws.on("close", () => {
    boards.delete(ws);
    if (phones.has(ws)) {
      console.log(`📱 Phone disconnected: Team ${phones.get(ws).team}`);
      phones.delete(ws);
      sendConnectedStatus();
    }
    console.log(`❌ Client disconnected (total: ${wss.clients.size})`);
  });

  ws.on("error", () => {
    boards.delete(ws); phones.delete(ws);
    sendConnectedStatus();
  });
});

wss.on("listening", () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  🎮  Smart Tug of War  —  WebSocket Server        ║`);
  console.log(`╠══════════════════════════════════════════════════╣`);
  console.log(`║  LAN IP  : ${LAN_IP.padEnd(38)} ║`);
  console.log(`║  App URL : http://${LAN_IP}:${HTTP_PORT}${"".padEnd(38 - LAN_IP.length - String(HTTP_PORT).length - 1)} ║`);
  console.log(`║  WS  URL : ws://${LAN_IP}:${WS_PORT}${"".padEnd(38 - LAN_IP.length - String(WS_PORT).length + 2)} ║`);
  console.log(`╠══════════════════════════════════════════════════╣`);
  console.log(`║  📱 Open http://${LAN_IP}:${HTTP_PORT} on phones    `);
  console.log(`║     (all devices on same WiFi)                    ║`);
  console.log(`╚══════════════════════════════════════════════════╝\n`);
});
