import { useState, useEffect, useRef } from "react";
import { useWebSocket, getServerIP } from "../hooks/useWebSocket";
import { useGame } from "../context/GameContext";

export function QRLobby({ selectedCats, selectedTypes, onStart, onBack }) {
  const { questions } = useGame();
  const serverIP = getServerIP();
  const urlA = `http://${serverIP}:3000/#/keypad/A`;
  const urlB = `http://${serverIP}:3000/#/keypad/B`;

  const [teamA, setTeamA] = useState(false);
  const [teamB, setTeamB] = useState(false);
  const sendRef = useRef(null);

  // Build question pool once
  const poolRef = useRef(
    [...questions.filter(q =>
      (selectedCats.length === 0 || selectedCats.includes(q.category)) &&
      (selectedTypes.length === 0 || selectedTypes.includes(q.type))
    )].sort(() => Math.random() - 0.5)
  );

  const { send, connected } = useWebSocket({
    onOpen: () => {
      sendRef.current?.({ type: "REGISTER_BOARD" });
    },
    onMessage: (msg) => {
      if (msg.type === "PHONES_CONNECTED") {
        setTeamA(msg.teamA);
        setTeamB(msg.teamB);
      }
    }
  });
  sendRef.current = send;

  useEffect(() => {
    if (connected) sendRef.current({ type: "REGISTER_BOARD" });
  }, [connected]);

  const handleStart = () => {
    const firstQ = poolRef.current[0];
    if (!firstQ) return;
    // Send START_GAME with first question so phones get it immediately
    sendRef.current({
      type: "START_GAME",
      currentQ: firstQ,
      pool: poolRef.current,
    });
    onStart(poolRef.current); // pass pool to MultiArena
  };

  const qr = (url, color) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=0d1b2a&color=${color}&format=png&qzone=2`;

  const bothConnected = teamA && teamB;

  return (
    <div style={{ minHeight:"100vh", width:"100vw", background:"radial-gradient(ellipse at 20% 50%,#0a192f,#061018 40%,#020810)", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes glowB{0%,100%{box-shadow:0 0 20px #00C9FF33}50%{box-shadow:0 0 50px #00C9FF99}}
        @keyframes glowR{0%,100%{box-shadow:0 0 20px #FF6B6B33}50%{box-shadow:0 0 50px #FF6B6B99}}
        @keyframes glowGold{0%,100%{box-shadow:0 0 20px #FFD70055}50%{box-shadow:0 0 60px #FFD700cc}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
      `}</style>

      <div style={{ position:"absolute", inset:0, opacity:0.03, backgroundImage:"linear-gradient(#00C9FF 1px,transparent 1px),linear-gradient(90deg,#00C9FF 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>

      {/* Top bar */}
      <div style={{ padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #ffffff0d" }}>
        <button onClick={onBack} style={{ padding:"7px 16px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid #ffffff22", color:"#aaa", cursor:"pointer", fontFamily:"'Orbitron',monospace", fontSize:11 }}>← BACK</button>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Orbitron',monospace", color:"#FFD700", fontSize:14, fontWeight:900, letterSpacing:3 }}>🎮 GAME LOBBY</div>
          <div style={{ fontFamily:"'Orbitron',monospace", color:"#ffffff33", fontSize:9, letterSpacing:2 }}>BOTH TEAMS SCAN QR TO JOIN</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:connected?"rgba(0,255,136,0.1)":"rgba(255,80,80,0.1)", border:`1px solid ${connected?"#00FF8833":"#FF505033"}` }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:connected?"#00FF88":"#FF5050", animation:connected?"pulse 2s infinite":"none" }}/>
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:connected?"#00FF88":"#FF5050" }}>{connected?"SERVER LIVE":"OFFLINE"}</span>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px", gap:20, animation:"slideUp 0.5s ease" }}>

        <p style={{ fontFamily:"'Exo 2',sans-serif", color:"#ffffff55", fontSize:14, textAlign:"center", margin:0 }}>
          Each team scans their QR code on a phone
        </p>

        {/* QR Cards */}
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>

          {/* Team A */}
          <div style={{
            background: teamA ? "rgba(0,201,255,0.1)" : "rgba(0,201,255,0.04)",
            border: `2px solid ${teamA ? "#00C9FF" : "#00C9FF33"}`,
            borderRadius:24, padding:"20px 18px", textAlign:"center", minWidth:220,
            animation: teamA ? "glowB 2s infinite" : "none",
            transition:"all 0.4s"
          }}>
            <div style={{ fontFamily:"'Orbitron',monospace", color:"#00C9FF", fontSize:14, fontWeight:900, letterSpacing:3, marginBottom:12 }}>📱 TEAM A</div>
            <div style={{ background:"#fff", borderRadius:12, padding:8, display:"inline-block", marginBottom:12 }}>
              <img src={qr(urlA,"00C9FF")} width={200} height={200} alt="Team A QR" style={{ display:"block", borderRadius:8 }}/>
            </div>
            <div style={{ padding:"10px 16px", borderRadius:12, background: teamA ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${teamA ? "#00FF8855" : "#ffffff11"}`, marginBottom:8 }}>
              <span style={{ fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:900, color: teamA ? "#00FF88" : "#ffffff33" }}>
                {teamA ? "✅ CONNECTED!" : "⏳ WAITING..."}
              </span>
            </div>
            <div style={{ fontFamily:"monospace", fontSize:9, color:"#ffffff22", wordBreak:"break-all" }}>{urlA}</div>
          </div>

          {/* Team B */}
          <div style={{
            background: teamB ? "rgba(255,107,107,0.1)" : "rgba(255,107,107,0.04)",
            border: `2px solid ${teamB ? "#FF6B6B" : "#FF6B6B33"}`,
            borderRadius:24, padding:"20px 18px", textAlign:"center", minWidth:220,
            animation: teamB ? "glowR 2s infinite" : "none",
            transition:"all 0.4s"
          }}>
            <div style={{ fontFamily:"'Orbitron',monospace", color:"#FF6B6B", fontSize:14, fontWeight:900, letterSpacing:3, marginBottom:12 }}>📱 TEAM B</div>
            <div style={{ background:"#fff", borderRadius:12, padding:8, display:"inline-block", marginBottom:12 }}>
              <img src={qr(urlB,"FF6B6B")} width={200} height={200} alt="Team B QR" style={{ display:"block", borderRadius:8 }}/>
            </div>
            <div style={{ padding:"10px 16px", borderRadius:12, background: teamB ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${teamB ? "#00FF8855" : "#ffffff11"}`, marginBottom:8 }}>
              <span style={{ fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:900, color: teamB ? "#00FF88" : "#ffffff33" }}>
                {teamB ? "✅ CONNECTED!" : "⏳ WAITING..."}
              </span>
            </div>
            <div style={{ fontFamily:"monospace", fontSize:9, color:"#ffffff22", wordBreak:"break-all" }}>{urlB}</div>
          </div>
        </div>

        {/* Connection dots */}
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:teamA?"#00FF88":"#ffffff22", boxShadow:teamA?"0 0 8px #00FF88":"none", transition:"all 0.3s" }}/>
            <span style={{ fontFamily:"'Orbitron',monospace", color:teamA?"#00FF88":"#ffffff33", fontSize:11 }}>Team A</span>
          </div>
          <span style={{ color:"#ffffff22" }}>·</span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:teamB?"#00FF88":"#ffffff22", boxShadow:teamB?"0 0 8px #00FF88":"none", transition:"all 0.3s" }}/>
            <span style={{ fontFamily:"'Orbitron',monospace", color:teamB?"#00FF88":"#ffffff33", fontSize:11 }}>Team B</span>
          </div>
        </div>

        {/* START button */}
        <button
          onClick={handleStart}
          disabled={!bothConnected}
          style={{
            padding:"16px 72px", borderRadius:50, fontSize:17, fontWeight:900,
            fontFamily:"'Orbitron',monospace", letterSpacing:3,
            cursor: bothConnected ? "pointer" : "not-allowed",
            border:"none", transition:"all 0.3s",
            background: bothConnected ? "linear-gradient(135deg,#FFD700,#FFA500)" : "rgba(255,255,255,0.07)",
            color: bothConnected ? "#000" : "#ffffff22",
            boxShadow: bothConnected ? "0 0 40px #FFD70066" : "none",
            animation: bothConnected ? "glowGold 2s infinite" : "none",
            transform: bothConnected ? "scale(1.03)" : "scale(1)",
          }}
        >
          {bothConnected ? "▶ START GAME!" : "⏳ WAITING FOR BOTH TEAMS..."}
        </button>

        <p style={{ fontFamily:"'Orbitron',monospace", color:"#ffffff18", fontSize:9, letterSpacing:1 }}>
          {poolRef.current.length} questions ready
        </p>
      </div>
    </div>
  );
}
