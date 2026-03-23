import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../context/GameContext";
import { RopeArena, QuestionDisplay, Fireworks, ScoreBar } from "../components/SharedUI";
import { Keypad } from "../components/Keypad";
import { TeacherPanel } from "../components/TeacherPanel";

const WIN_SCORE = 5;

export function SingleGame({ selectedCats, selectedTypes, onBack }) {
  const { questions } = useGame();
  const [showTeacher, setShowTeacher] = useState(false);

  const pool = useRef([...questions.filter(q=>(selectedCats.length===0||selectedCats.includes(q.category))&&(selectedTypes.length===0||selectedTypes.includes(q.type)))].sort(()=>Math.random()-0.5));

  const [idx, setIdx] = useState(0);
  const [ropePos, setRopePos] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [ansA, setAnsA] = useState(""); const [ansB, setAnsB] = useState("");
  const [submittedA, setSubmittedA] = useState(false);
  const [submittedB, setSubmittedB] = useState(false);
  const [timeSubmitA, setTimeSubmitA] = useState(null);
  const [timeSubmitB, setTimeSubmitB] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [shakeA, setShakeA] = useState(false); const [shakeB, setShakeB] = useState(false);
  const [activePull, setActivePull] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const lockRef = useRef(false);
  const roundStartRef = useRef(Date.now());

  const currentQ = pool.current[idx % pool.current.length];

  const nextQ = useCallback(() => {
    setIdx(i=>i+1);
    setAnsA(""); setAnsB("");
    setSubmittedA(false); setSubmittedB(false);
    setTimeSubmitA(null); setTimeSubmitB(null);
    setFeedbackMsg(""); setActivePull(null);
    lockRef.current = false;
    roundStartRef.current = Date.now();
  }, []);

  const resolve = useCallback((sA, sB, tA, tB, curScoreA=null, curScoreB=null, curRope=null) => {
    if (lockRef.current) return;
    lockRef.current = true;

    const correct = currentQ.answer.trim().toLowerCase();
    const rightA = sA?.trim().toLowerCase() === correct;
    const rightB = sB?.trim().toLowerCase() === correct;

    let newScoreA = curScoreA ?? scoreA;
    let newScoreB = curScoreB ?? scoreB;
    let newRope = curRope ?? ropePos;
    let pull = null;
    let msg = "";

    if (rightA && rightB) {
      // Both correct — fastest wins
      if (tA !== null && tB !== null) {
        if (tA < tB) { newScoreA++; newRope--; pull="A"; msg="⚡ TEAM A FASTER! Both correct but A wins!"; }
        else if (tB < tA) { newScoreB++; newRope++; pull="B"; msg="⚡ TEAM B FASTER! Both correct but B wins!"; }
        else { msg="🤝 EXACT TIE! Both correct same time — no movement."; }
      } else {
        // Only one submitted (other timed out)
        if (tA!==null) { newScoreA++; newRope--; pull="A"; msg="✅ Team A correct!"; }
        else { newScoreB++; newRope++; pull="B"; msg="✅ Team B correct!"; }
      }
    } else if (rightA && !rightB) { newScoreA++; newRope--; pull="A"; msg="✅ Team A correct!"; }
    else if (rightB && !rightA) { newScoreB++; newRope++; pull="B"; msg="✅ Team B correct!"; }
    else { msg="❌ Nobody got it! Answer: " + currentQ.answer; }

    if (!rightA && sA) { setShakeA(true); setTimeout(()=>setShakeA(false),500); }
    if (!rightB && sB) { setShakeB(true); setTimeout(()=>setShakeB(false),500); }

    setFeedbackMsg(msg);
    setScoreA(newScoreA); setScoreB(newScoreB); setRopePos(newRope);
    if (pull) { setActivePull(pull); setTimeout(()=>setActivePull(null),900); }

    if (newScoreA>=WIN_SCORE){setTimeout(()=>{setGameOver(true);setWinner("A");},700);return;}
    if (newScoreB>=WIN_SCORE){setTimeout(()=>{setGameOver(true);setWinner("B");},700);return;}

    setTimeout(nextQ, 2200);
  }, [currentQ, scoreA, scoreB, ropePos, nextQ]);

  const handleSubmitA = () => {
    if (submittedA || !ansA) return;
    const t = Date.now() - roundStartRef.current;
    setSubmittedA(true); setTimeSubmitA(t);
    if (submittedB) resolve(ansA, ansB, t, timeSubmitB);
  };

  const handleSubmitB = () => {
    if (submittedB || !ansB) return;
    const t = Date.now() - roundStartRef.current;
    setSubmittedB(true); setTimeSubmitB(t);
    if (submittedA) resolve(ansA, ansB, timeSubmitA, t);
  };

  const handleSkip = () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setFeedbackMsg("⏭ Skipped! Answer: " + currentQ?.answer);
    setTimeout(nextQ, 1500);
  };

  const handleRestart = () => {
    pool.current = [...pool.current].sort(()=>Math.random()-0.5);
    setIdx(0); setRopePos(0); setScoreA(0); setScoreB(0);
    setAnsA(""); setAnsB(""); setSubmittedA(false); setSubmittedB(false);
    setTimeSubmitA(null); setTimeSubmitB(null);
    setFeedbackMsg(""); setGameOver(false); setWinner(null); setActivePull(null);
    lockRef.current = false;
    roundStartRef.current = Date.now();
  };

  if (!pool.current.length) return (
    <div style={{ minHeight:"100vh",background:"#020810",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16 }}>
      <div style={{ fontSize:48 }}>😕</div>
      <p style={{ fontFamily:"'Orbitron',monospace",color:"#FFD700",fontSize:16 }}>No questions match your filters!</p>
      <button onClick={onBack} style={{ padding:"12px 32px",borderRadius:50,background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",color:"#000",fontWeight:900,fontFamily:"'Orbitron',monospace",cursor:"pointer" }}>← Back</button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",width:"100vw",background:"radial-gradient(ellipse at 20% 50%,#0a192f,#061018 40%,#020810)",position:"relative",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;700;900&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}
        @keyframes fall{0%{transform:translateY(-20px) scale(0);opacity:1}100%{transform:translateY(120vh) scale(1);opacity:0}}
        @keyframes bounceIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        @keyframes starFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
      `}</style>
      <div style={{ position:"absolute",inset:0,opacity:0.03,backgroundImage:"linear-gradient(#00C9FF 1px,transparent 1px),linear-gradient(90deg,#00C9FF 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none" }}/>

      {gameOver&&(<><Fireworks/><div style={{ position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:200,background:"rgba(2,8,16,0.85)",backdropFilter:"blur(4px)" }}><div style={{ fontSize:72,marginBottom:16,animation:"starFloat 2s ease-in-out infinite" }}>🏆</div><h2 style={{ fontFamily:"'Orbitron',monospace",color:winner==="A"?"#00C9FF":"#FF6B6B",fontSize:46,fontWeight:900,margin:"0 0 8px",letterSpacing:4 }}>TEAM {winner} WINS!</h2><p style={{ color:"#ffffff66",fontSize:16,marginBottom:10,fontFamily:"'Exo 2',sans-serif" }}>Final: <span style={{color:"#00C9FF",fontWeight:700}}>{scoreA}</span> — <span style={{color:"#FF6B6B",fontWeight:700}}>{scoreB}</span></p><p style={{ fontFamily:"'Orbitron',monospace",color:"#FFD700",fontSize:12,letterSpacing:2,marginBottom:36 }}>🌟 KNOWLEDGE IS POWER!</p><div style={{display:"flex",gap:12}}><button onClick={handleRestart} style={{ padding:"12px 40px",borderRadius:50,background:"linear-gradient(135deg,#00C9FF,#0080FF)",border:"none",color:"#fff",fontWeight:900,fontFamily:"'Orbitron',monospace",fontSize:14,cursor:"pointer",letterSpacing:2 }}>🔄 AGAIN</button><button onClick={onBack} style={{ padding:"12px 40px",borderRadius:50,background:"transparent",border:"2px solid #FFD70044",color:"#FFD700",fontFamily:"'Orbitron',monospace",fontSize:14,cursor:"pointer" }}>🏠 MENU</button></div></div></>)}

      <div style={{ padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #ffffff0d" }}>
        <button onClick={onBack} style={{ padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,0.06)",border:"1px solid #ffffff22",color:"#aaa",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11 }}>← MENU</button>
        <span style={{ fontFamily:"'Orbitron',monospace",color:"#FFD70088",fontSize:10,letterSpacing:2 }}>🖥️ SINGLE BOARD · ⚡ FASTEST WINS</span>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleSkip} style={{ padding:"6px 14px",borderRadius:8,background:"rgba(255,215,0,0.08)",border:"1px solid #FFD70033",color:"#FFD700",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11 }}>⏭ SKIP</button>
          <button onClick={()=>setShowTeacher(true)} style={{ padding:"6px 14px",borderRadius:8,background:"rgba(255,215,0,0.08)",border:"1px solid #FFD70033",color:"#FFD700",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:11 }}>🔐</button>
        </div>
      </div>

      <div style={{ padding:"10px 16px" }}>
        <div style={{ marginBottom:8 }}><ScoreBar scoreA={scoreA} scoreB={scoreB} win={WIN_SCORE}/></div>

        <div style={{ background:"rgba(255,255,255,0.02)",borderRadius:18,border:"1px solid #ffffff0d",padding:"6px 14px 8px",marginBottom:8 }}>
          <RopeArena ropePos={ropePos} pulling={activePull}/>
        </div>

        <div style={{ marginBottom:10,animation:"slideIn 0.4s ease" }}><QuestionDisplay question={currentQ}/></div>

        {feedbackMsg&&(
          <div style={{ textAlign:"center",marginBottom:8,animation:"bounceIn 0.4s ease" }}>
            <div style={{ display:"inline-block",padding:"7px 18px",borderRadius:12,background:feedbackMsg.includes("✅")||feedbackMsg.includes("⚡")||feedbackMsg.includes("🤝")?"rgba(0,255,136,0.15)":"rgba(255,51,51,0.15)",border:`1px solid ${feedbackMsg.includes("✅")||feedbackMsg.includes("⚡")||feedbackMsg.includes("🤝")?"#00FF8866":"#FF333366"}`,color:feedbackMsg.includes("✅")||feedbackMsg.includes("⚡")||feedbackMsg.includes("🤝")?"#00FF88":"#FF3333",fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:900 }}>{feedbackMsg}</div>
          </div>
        )}

        {(submittedA!==submittedB)&&!feedbackMsg&&(
          <div style={{ textAlign:"center",marginBottom:8 }}>
            <span style={{ fontFamily:"'Orbitron',monospace",color:"#FFD70088",fontSize:11 }}>⏳ Waiting for {submittedA?"Team B":"Team A"}...</span>
          </div>
        )}

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
          <Keypad team="A" question={currentQ} value={ansA} onChange={setAnsA} onSubmit={handleSubmitA} submitted={submittedA} shake={shakeA} correct={false} wrong={false} disabled={submittedA}/>
          <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontFamily:"'Orbitron',monospace",color:"#ffffff18",fontSize:10,letterSpacing:1 }}>VS</span></div>
          <Keypad team="B" question={currentQ} value={ansB} onChange={setAnsB} onSubmit={handleSubmitB} submitted={submittedB} shake={shakeB} correct={false} wrong={false} disabled={submittedB}/>
        </div>
      </div>

      {showTeacher&&<TeacherPanel onClose={()=>setShowTeacher(false)}/>}
    </div>
  );
}
