import { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "../context/GameContext";
import { RopeArena, QuestionDisplay, Fireworks, ScoreBar } from "../components/SharedUI";
import { TeacherPanel } from "../components/TeacherPanel";
import { useWebSocket, getServerIP } from "../hooks/useWebSocket";

const WIN_SCORE = 5;

function QRBlock({ label, accentColor, url, submitted }) {
  const rgb = accentColor === "#00C9FF" ? "0,201,255" : "255,107,107";
  const colorHex = accentColor.replace("#","");
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}&bgcolor=0d1b2a&color=${colorHex}&format=png&qzone=1`;
  return (
    <div style={{ background:`rgba(${rgb},0.07)`, border:`2px solid ${accentColor}44`, borderRadius:18, padding:"14px 12px", textAlign:"center", minWidth:178, flexShrink:0 }}>
      <div style={{ fontFamily:"'Orbitron',monospace", color:accentColor, fontSize:13, fontWeight:900, marginBottom:8, letterSpacing:2 }}>{label}</div>
      <div style={{ background:"#fff", borderRadius:10, padding:6, display:"inline-block", boxShadow:`0 0 20px ${accentColor}44` }}>
        <img src={qrSrc} alt={`QR ${label}`} style={{ width:150, height:150, display:"block", borderRadius:6 }} onError={e=>{e.target.style.opacity=0.2;}}/>
      </div>
      <div style={{ marginTop:6, fontFamily:"monospace", fontSize:8, color:"#ffffff33", wordBreak:"break-all", lineHeight:1.3 }}>{url}</div>
      <div style={{ marginTop:8, padding:"5px 10px", borderRadius:8, background:submitted?"#00FF8818":"rgba(255,255,255,0.04)", border:`1px solid ${submitted?"#00FF8844":"#ffffff11"}`, fontFamily:"'Orbitron',monospace", fontSize:11, color:submitted?"#00FF88":"#ffffff44", animation:submitted?"none":"pulse 2s infinite" }}>
        {submitted?"✓ ANSWER IN!":"⏳ WAITING..."}
      </div>
    </div>
  );
}

function WsBadge({ connected }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:connected?"rgba(0,255,136,0.12)":"rgba(255,80,80,0.12)", border:`1px solid ${connected?"#00FF8833":"#FF505033"}` }}>
      <div style={{ width:7, height:7, borderRadius:"50%", background:connected?"#00FF88":"#FF5050", boxShadow:connected?"0 0 6px #00FF88":"0 0 6px #FF5050", animation:connected?"pulse 2s infinite":"none" }}/>
      <span style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:connected?"#00FF88":"#FF5050" }}>{connected?"LIVE":"NO SERVER"}</span>
    </div>
  );
}

export function MultiArena({ selectedCats, selectedTypes, initialPool, onBack }) {
  const { questions } = useGame();
  const [showTeacher, setShowTeacher] = useState(false);
  const pool = useRef(initialPool?.length > 0 ? initialPool : [...questions.filter(q=>(selectedCats.length===0||selectedCats.includes(q.category))&&(selectedTypes.length===0||selectedTypes.includes(q.type)))].sort(()=>Math.random()-0.5));
  const [idx, setIdx]             = useState(0);
  const [ropePos, setRopePos]     = useState(0);
  const [scoreA, setScoreA]       = useState(0);
  const [scoreB, setScoreB]       = useState(0);
  const [activePull, setActivePull] = useState(null);
  const [gameOver, setGameOver]   = useState(false);
  const [winner, setWinner]       = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [submittedA, setSubmittedA] = useState(false);
  const [submittedB, setSubmittedB] = useState(false);
  const [serverIP, setServerIP]   = useState(getServerIP());
  const lockRef   = useRef(false);
  const stateRef  = useRef({ scoreA:0, scoreB:0, ropePos:0 });
  const ansRef    = useRef({ A:null, B:null, tA:null, tB:null });
  const sendRef   = useRef(null);
  const currentQ  = pool.current[idx % pool.current.length];

  const urlA = `http://${serverIP}:3000/#/keypad/A`;
  const urlB = `http://${serverIP}:3000/#/keypad/B`;

  const nextQ = useCallback(()=>{ setIdx(i=>i+1); setFeedbackMsg(""); setActivePull(null); },[]);

  const resolveRound = useCallback((ansA, ansB, tA, tB) => {
    if (lockRef.current) return;
    lockRef.current = true;
    const correct = currentQ.answer.trim().toLowerCase();
    const rightA  = ansA?.trim().toLowerCase()===correct;
    const rightB  = ansB?.trim().toLowerCase()===correct;
    let { scoreA:sa, scoreB:sb, ropePos:rp } = stateRef.current;
    let pull=null, msg="";
    if (rightA && rightB) {
      if ((tA??Infinity)<(tB??Infinity)){sa++;rp--;pull="A";msg="⚡ TEAM A FASTER! Both correct — A scores!";}
      else if((tB??Infinity)<(tA??Infinity)){sb++;rp++;pull="B";msg="⚡ TEAM B FASTER! Both correct — B scores!";}
      else{msg="🤝 EXACT TIE — no movement!";}
    } else if(rightA){sa++;rp--;pull="A";msg="✅ Team A correct!";}
    else if(rightB){sb++;rp++;pull="B";msg="✅ Team B correct!";}
    else{msg="❌ Nobody correct! Answer: "+currentQ.answer;}
    stateRef.current={scoreA:sa,scoreB:sb,ropePos:rp};
    setFeedbackMsg(msg);setScoreA(sa);setScoreB(sb);setRopePos(rp);
    if(pull){setActivePull(pull);setTimeout(()=>setActivePull(null),900);}
    const roundResult = {
      question: currentQ.question,
      answer: currentQ.answer,
      ansA: ansA||"—", ansB: ansB||"—",
      rightA, rightB, pull,
      scoreA:sa, scoreB:sb,
    };
    setRoundHistory(h=>[roundResult,...h].slice(0,10));
    sendRef.current?.({type:"UPDATE_SCORES",update:{scoreA:sa,scoreB:sb,ropePos:rp,status:"resolved"}, roundResult});
    if(sa>=WIN_SCORE){setTimeout(()=>{setGameOver(true);setWinner("A");sendRef.current?.({type:"GAME_OVER",winner:"A"});},800);return;}
    if(sb>=WIN_SCORE){setTimeout(()=>{setGameOver(true);setWinner("B");sendRef.current?.({type:"GAME_OVER",winner:"B"});},800);return;}
    setTimeout(nextQ,2200);
  },[currentQ,nextQ]);

  const resolveRef = useRef(resolveRound);
  resolveRef.current = resolveRound;

  const { send, connected } = useWebSocket({
    onOpen: () => { sendRef.current?.({ type:"REGISTER_BOARD" }); },
    onMessage: useCallback((msg) => {
      if (msg.type==="STATE") {
        const s = msg.state;
        if (!s) return;
        if (s.submittedA && !ansRef.current.A) { ansRef.current.A=s.answerA; ansRef.current.tA=s.timeA; setSubmittedA(true); }
        if (s.submittedB && !ansRef.current.B) { ansRef.current.B=s.answerB; ansRef.current.tB=s.timeB; setSubmittedB(true); }
        if (s.submittedA && s.submittedB && !lockRef.current) {
          resolveRef.current(s.answerA, s.answerB, s.timeA, s.timeB);
        }
      }
    },[])
  });

  sendRef.current = send;

  useEffect(()=>{ setServerIP(getServerIP()); },[]);

  useEffect(()=>{
    if(!currentQ) return;
    ansRef.current={A:null,B:null,tA:null,tB:null};
    setSubmittedA(false); setSubmittedB(false);
    lockRef.current=false;
    // idx=0 already handled by START_GAME from QRLobby; only send NEXT_QUESTION for subsequent rounds
    if(idx > 0) {
      sendRef.current({type:"NEXT_QUESTION",currentQ,ropePos:stateRef.current.ropePos,scoreA:stateRef.current.scoreA,scoreB:stateRef.current.scoreB});
    }
  },[idx]);

  // START_GAME is sent by QRLobby before navigating here

  const handleSkip=()=>{ if(lockRef.current) return; lockRef.current=true; setFeedbackMsg("⏭ Skipped! Answer: "+currentQ?.answer); setTimeout(nextQ,1500); };
  const handleRestart=()=>{
    pool.current=[...pool.current].sort(()=>Math.random()-0.5);
    stateRef.current={scoreA:0,scoreB:0,ropePos:0};
    ansRef.current={A:null,B:null,tA:null,tB:null};
    setIdx(0);setRopePos(0);setScoreA(0);setScoreB(0);
    setGameOver(false);setWinner(null);setFeedbackMsg("");setActivePull(null);
    setSubmittedA(false);setSubmittedB(false);
    lockRef.current=false;
    sendRef.current({type:"RESET"});
  };

  if(!pool.current.length) return(
    <div style={{minHeight:"100vh",background:"#020810",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <p style={{fontFamily:"'Orbitron',monospace",color:"#FFD700",fontSize:16}}>No questions match!</p>
      <button onClick={onBack} style={{padding:"12px 32px",borderRadius:50,background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",color:"#000",fontWeight:900,fontFamily:"'Orbitron',monospace",cursor:"pointer"}}>← Back</button>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",width:"100vw",background:"radial-gradient(ellipse at 20% 50%,#0a192f,#061018 40%,#020810)",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;700;900&display=swap');
        @keyframes fall{0%{transform:translateY(-20px) scale(0);opacity:1}100%{transform:translateY(120vh) scale(1);opacity:0}}
        @keyframes bounceIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes starFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        *{box-sizing:border-box}
      `}</style>
      <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:"linear-gradient(#00C9FF 1px,transparent 1px),linear-gradient(90deg,#00C9FF 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>

      {gameOver&&(<><Fireworks/><div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:200,background:"rgba(2,8,16,0.85)",backdropFilter:"blur(4px)"}}>
        <div style={{fontSize:72,marginBottom:16,animation:"starFloat 2s ease-in-out infinite"}}>🏆</div>
        <h2 style={{fontFamily:"'Orbitron',monospace",color:winner==="A"?"#00C9FF":"#FF6B6B",fontSize:46,fontWeight:900,margin:"0 0 8px",letterSpacing:4}}>TEAM {winner} WINS!</h2>
        <p style={{color:"#ffffff66",fontSize:16,marginBottom:10,fontFamily:"'Exo 2',sans-serif"}}>Final: <span style={{color:"#00C9FF",fontWeight:700}}>{scoreA}</span> — <span style={{color:"#FF6B6B",fontWeight:700}}>{scoreB}</span></p>
        <div style={{display:"flex",gap:12}}>
          <button onClick={handleRestart} style={{padding:"12px 40px",borderRadius:50,background:"linear-gradient(135deg,#00C9FF,#0080FF)",border:"none",color:"#fff",fontWeight:900,fontFamily:"'Orbitron',monospace",fontSize:14,cursor:"pointer"}}>🔄 AGAIN</button>
          <button onClick={onBack} style={{padding:"12px 40px",borderRadius:50,background:"transparent",border:"2px solid #FFD70044",color:"#FFD700",fontFamily:"'Orbitron',monospace",fontSize:14,cursor:"pointer"}}>🏠 MENU</button>
        </div>
      </div></>)}

      <div style={{padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #ffffff0d"}}>
        <button onClick={onBack} style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,0.06)",border:"1px solid #ffffff22",color:"#aaa",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11}}>← MENU</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"'Orbitron',monospace",color:"#FFD70088",fontSize:10,letterSpacing:2}}>📱 MULTI-DEVICE · ⚡ WEBSOCKET</span>
          <WsBadge connected={connected}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleSkip} style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,215,0,0.08)",border:"1px solid #FFD70033",color:"#FFD700",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11}}>⏭ SKIP</button>
          <button onClick={()=>setShowTeacher(true)} style={{padding:"6px 14px",borderRadius:8,background:"rgba(255,215,0,0.08)",border:"1px solid #FFD70033",color:"#FFD700",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11}}>🔐</button>
        </div>
      </div>

      <div style={{padding:"10px 16px"}}>
        <div style={{marginBottom:8}}><ScoreBar scoreA={scoreA} scoreB={scoreB} win={WIN_SCORE}/></div>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <QRBlock label="📱 TEAM A" accentColor="#00C9FF" url={urlA} submitted={submittedA}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{background:"rgba(255,255,255,0.02)",borderRadius:18,border:"1px solid #ffffff0d",padding:"6px 14px 8px",marginBottom:8}}>
              <RopeArena ropePos={ropePos} pulling={activePull}/>
            </div>
            <div style={{marginBottom:8,animation:"slideIn 0.4s ease"}}><QuestionDisplay question={currentQ} size="big"/></div>
            {feedbackMsg&&(
              <div style={{textAlign:"center",animation:"bounceIn 0.4s ease"}}>
                <div style={{display:"inline-block",padding:"8px 20px",borderRadius:12,background:feedbackMsg.includes("✅")||feedbackMsg.includes("⚡")||feedbackMsg.includes("🤝")?"rgba(0,255,136,0.15)":"rgba(255,51,51,0.15)",border:`1px solid ${feedbackMsg.includes("✅")||feedbackMsg.includes("⚡")||feedbackMsg.includes("🤝")?"#00FF8866":"#FF333366"}`,color:feedbackMsg.includes("✅")||feedbackMsg.includes("⚡")||feedbackMsg.includes("🤝")?"#00FF88":"#FF3333",fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:900}}>{feedbackMsg}</div>
              </div>
            )}
            {(!submittedA||!submittedB)&&!feedbackMsg&&(
              <div style={{textAlign:"center",marginTop:6}}>
                <span style={{fontFamily:"'Orbitron',monospace",color:"#FFD70055",fontSize:10,animation:"pulse 2s infinite"}}>⏳ Waiting for {!submittedA&&!submittedB?"both teams":!submittedA?"Team A":"Team B"}...</span>
              </div>
            )}
          </div>
          <QRBlock label="📱 TEAM B" accentColor="#FF6B6B" url={urlB} submitted={submittedB}/>
        </div>

        {!connected&&(
          <div style={{marginTop:12,padding:"10px 16px",borderRadius:12,background:"rgba(255,80,80,0.1)",border:"1px solid #FF505033",fontFamily:"'Orbitron',monospace",fontSize:10,color:"#FF8080",textAlign:"center"}}>
            ⚠️ NOT CONNECTED TO SERVER — run <code style={{background:"rgba(255,255,255,0.1)",padding:"1px 6px",borderRadius:4}}>npm start</code> then refresh.
          </div>
        )}

        {/* ── Round History ── */}
        {roundHistory.length>0&&(
          <div style={{marginTop:14}}>
            <div style={{fontFamily:"'Orbitron',monospace",color:"#ffffff33",fontSize:10,letterSpacing:2,marginBottom:8}}>📋 ROUND HISTORY</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {roundHistory.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid #ffffff08"}}>
                  {/* Result icon */}
                  <div style={{width:28,height:28,borderRadius:"50%",background:r.pull==="A"?"rgba(0,201,255,0.2)":r.pull==="B"?"rgba(255,107,107,0.2)":"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>
                    {r.pull==="A"?"🔵":r.pull==="B"?"🔴":"🤝"}
                  </div>
                  {/* Question */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#ffffff88",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.question}</div>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#FFD70077",marginTop:2}}>
                      ✓ <span style={{color:"#FFD700"}}>{r.answer}</span>
                    </div>
                  </div>
                  {/* Team A answer */}
                  <div style={{textAlign:"center",minWidth:64}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00C9FF88",marginBottom:2}}>TEAM A</div>
                    <div style={{padding:"3px 7px",borderRadius:6,background:r.rightA?"rgba(0,255,136,0.15)":"rgba(255,51,51,0.15)",border:`1px solid ${r.rightA?"#00FF8844":"#FF333344"}`,fontFamily:"'Orbitron',monospace",fontSize:10,color:r.rightA?"#00FF88":"#FF6666",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {r.rightA?"✓":"✗"} {r.ansA}
                    </div>
                  </div>
                  {/* Team B answer */}
                  <div style={{textAlign:"center",minWidth:64}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#FF6B6B88",marginBottom:2}}>TEAM B</div>
                    <div style={{padding:"3px 7px",borderRadius:6,background:r.rightB?"rgba(0,255,136,0.15)":"rgba(255,51,51,0.15)",border:`1px solid ${r.rightB?"#00FF8844":"#FF333344"}`,fontFamily:"'Orbitron',monospace",fontSize:10,color:r.rightB?"#00FF88":"#FF6666",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {r.rightB?"✓":"✗"} {r.ansB}
                    </div>
                  </div>
                  {/* Scores */}
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"#ffffff44",flexShrink:0}}>
                    <span style={{color:"#00C9FF"}}>{r.scoreA}</span><span style={{color:"#ffffff22"}}> — </span><span style={{color:"#FF6B6B"}}>{r.scoreB}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showTeacher&&<TeacherPanel onClose={()=>setShowTeacher(false)}/>}
    </div>
  );
}
