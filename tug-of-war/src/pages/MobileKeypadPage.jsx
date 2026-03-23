import { useState, useRef, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

export function MobileKeypadPage({ team }) {
  const accent  = team === "A" ? "#00C9FF" : "#FF6B6B";
  const bgColor = team === "A" ? "#031824" : "#200808";

  const [question,  setQuestion]  = useState(null);
  const [value,     setValue]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback,  setFeedback]  = useState(null); // null | "correct" | "wrong" | "missed"
  const [wsState,   setWsState]   = useState("connecting");
  const [scoreA,    setScoreA]    = useState(0);
  const [scoreB,    setScoreB]    = useState(0);

  const roundStartRef = useRef(Date.now());
  const sendRef       = useRef(null);
  const lastQRef      = useRef(null);

  const { send, connected } = useWebSocket({
    onOpen: () => {
      sendRef.current?.({ type: "REGISTER_PHONE", team });
    },
    onMessage: (msg) => {
      if (msg.type === "IDLE") {
        setWsState("waiting");
      }

      if (msg.type === "STATE") {
        const s = msg.state;
        if (!s) return;

        if (typeof s.scoreA === "number") setScoreA(s.scoreA);
        if (typeof s.scoreB === "number") setScoreB(s.scoreB);

        // New question arrived — reset form
        if (s.currentQ && s.currentQ.question !== lastQRef.current) {
          lastQRef.current = s.currentQ.question;
          setQuestion(s.currentQ);
          setValue("");
          setSubmitted(false);
          setFeedback(null);
          roundStartRef.current = Date.now();
          setWsState("playing");
        }

        if (s.status === "playing" && !s.currentQ?.question !== lastQRef.current) {
          setWsState("playing");
        }

        if (s.status === "resolved") {
          const mySubmitted = team === "A" ? s.submittedA : s.submittedB;
          const myAnswer    = team === "A" ? s.answerA    : s.answerB;
          if (mySubmitted && myAnswer && s.currentQ) {
            const correct = myAnswer.trim().toLowerCase() === s.currentQ.answer?.trim().toLowerCase();
            setFeedback(correct ? "correct" : "wrong");
          } else if (!mySubmitted) {
            setFeedback("missed");
          }
        }
      }

      if (msg.type === "GAME_OVER") {
        setWsState("gameover");
      }
    }
  });

  sendRef.current = send;

  const handleSubmit = (ans) => {
    const answer = ans ?? value;
    if (!answer.trim() || submitted) return;
    const elapsed = Date.now() - roundStartRef.current;
    sendRef.current({ type: "SUBMIT_ANSWER", team, answer: answer.trim(), elapsed });
    setValue(answer.trim());
    setSubmitted(true);
  };

  /* ── Styles ── */
  const S = {
    page: { minHeight:"100vh", background:bgColor, display:"flex", flexDirection:"column", fontFamily:"system-ui,sans-serif" },
    center: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px", textAlign:"center" },
  };

  /* ── Connecting ── */
  if (!connected || wsState === "connecting") return (
    <div style={S.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
      <div style={S.center}>
        <div style={{ width:52, height:52, border:`4px solid ${accent}22`, borderTop:`4px solid ${accent}`, borderRadius:"50%", animation:"spin 1s linear infinite", marginBottom:20 }}/>
        <div style={{ fontSize:16, fontWeight:700, color:accent, letterSpacing:2, marginBottom:8 }}>CONNECTING…</div>
        <div style={{ fontSize:13, color:"#ffffff55" }}>Team {team} · Same WiFi needed</div>
      </div>
    </div>
  );

  /* ── Waiting for game ── */
  if (wsState === "waiting" || !question) return (
    <div style={S.page}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} *{box-sizing:border-box}`}</style>
      <div style={S.center}>
        <div style={{ fontSize:60, marginBottom:20, animation:"pulse 2s infinite" }}>🎮</div>
        <div style={{ fontSize:18, fontWeight:900, color:accent, letterSpacing:2, marginBottom:10 }}>TEAM {team} READY</div>
        <div style={{ fontSize:13, color:"#ffffff44" }}>Waiting for teacher to start…</div>
        <div style={{ marginTop:24, display:"flex", gap:24 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:28, fontWeight:900, color:"#00C9FF" }}>{scoreA}</div>
            <div style={{ fontSize:10, color:"#ffffff33", letterSpacing:1 }}>TEAM A</div>
          </div>
          <div style={{ fontSize:20, color:"#ffffff22", alignSelf:"center" }}>—</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:28, fontWeight:900, color:"#FF6B6B" }}>{scoreB}</div>
            <div style={{ fontSize:10, color:"#ffffff33", letterSpacing:1 }}>TEAM B</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Game over ── */
  if (wsState === "gameover") return (
    <div style={S.page}>
      <style>{`*{box-sizing:border-box}`}</style>
      <div style={S.center}>
        <div style={{ fontSize:64, marginBottom:16 }}>🏆</div>
        <div style={{ fontSize:20, fontWeight:900, color:"#FFD700", letterSpacing:2, marginBottom:8 }}>GAME OVER!</div>
        <div style={{ fontSize:14, color:"#ffffff55" }}>Team A: <strong style={{color:"#00C9FF"}}>{scoreA}</strong> · Team B: <strong style={{color:"#FF6B6B"}}>{scoreB}</strong></div>
      </div>
    </div>
  );

  /* ── Feedback screen ── */
  if (feedback) return (
    <div style={S.page}>
      <style>{`@keyframes pop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}} *{box-sizing:border-box}`}</style>
      <div style={S.center}>
        <div style={{ fontSize:80, animation:"pop 0.5s ease", marginBottom:16 }}>
          {feedback==="correct" ? "✅" : feedback==="wrong" ? "❌" : "😶"}
        </div>
        <div style={{ fontSize:22, fontWeight:900, color:feedback==="correct"?"#00FF88":feedback==="wrong"?"#FF4444":"#FFD700", marginBottom:8 }}>
          {feedback==="correct" ? "CORRECT!" : feedback==="wrong" ? "WRONG!" : "NO ANSWER"}
        </div>
        {question && (
          <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:12, padding:"12px 20px", marginBottom:16, border:"1px solid #ffffff11" }}>
            <div style={{ fontSize:11, color:"#ffffff44", marginBottom:4 }}>CORRECT ANSWER</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#FFD700" }}>{question.answer}</div>
          </div>
        )}
        {feedback==="wrong" && value && (
          <div style={{ fontSize:12, color:"#FF6666" }}>You answered: <strong>{value}</strong></div>
        )}
        <div style={{ marginTop:20, fontSize:12, color:"#ffffff33" }}>Next question coming up…</div>
        <div style={{ marginTop:16, display:"flex", gap:24 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:26, fontWeight:900, color:"#00C9FF" }}>{scoreA}</div>
            <div style={{ fontSize:10, color:"#ffffff33", letterSpacing:1 }}>TEAM A</div>
          </div>
          <div style={{ fontSize:18, color:"#ffffff22", alignSelf:"center" }}>—</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:26, fontWeight:900, color:"#FF6B6B" }}>{scoreB}</div>
            <div style={{ fontSize:10, color:"#ffffff33", letterSpacing:1 }}>TEAM B</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Submitted waiting ── */
  if (submitted) return (
    <div style={S.page}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}} *{box-sizing:border-box}`}</style>
      <div style={S.center}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:`${accent}18`, border:`3px solid ${accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:16, animation:"pulse 2s infinite" }}>⏳</div>
        <div style={{ fontSize:18, fontWeight:900, color:accent, letterSpacing:2, marginBottom:8 }}>SUBMITTED!</div>
        <div style={{ fontSize:13, color:"#ffffff44", marginBottom:20 }}>Waiting for the other team…</div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:12, padding:"12px 24px", border:`1px solid ${accent}33` }}>
          <div style={{ fontSize:11, color:"#ffffff44", marginBottom:4, letterSpacing:1 }}>YOUR ANSWER</div>
          <div style={{ fontSize:22, fontWeight:900, color:accent }}>{value}</div>
        </div>
      </div>
    </div>
  );

  /* ── Main question screen ── */
  const isMCQ = question?.options?.length > 0;

  return (
    <div style={{ ...S.page, overflow:"hidden" }}>
      <style>{`*{box-sizing:border-box} input:focus{outline:none}`}</style>

      {/* Header */}
      <div style={{ background:`${accent}18`, padding:"10px 16px", borderBottom:`3px solid ${accent}55`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`${accent}22`, border:`2px solid ${accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
            {team==="A" ? "🔵" : "🔴"}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:900, color:accent, letterSpacing:2 }}>TEAM {team}</div>
            <div style={{ fontSize:9, color:"#ffffff33", letterSpacing:1 }}>{question?.category}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:16 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:900, color:"#00C9FF" }}>{scoreA}</div>
            <div style={{ fontSize:9, color:"#ffffff33" }}>A</div>
          </div>
          <div style={{ fontSize:16, color:"#ffffff22", alignSelf:"center" }}>:</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:900, color:"#FF6B6B" }}>{scoreB}</div>
            <div style={{ fontSize:9, color:"#ffffff33" }}>B</div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:16, padding:"16px", border:`1px solid ${accent}22`, marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#FFD70066", letterSpacing:2, marginBottom:10, fontWeight:700 }}>
            {question?.type?.toUpperCase()} QUESTION
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:"#ffffff", lineHeight:1.6 }}>
            {question?.question}
          </div>
        </div>

        {/* MCQ Options */}
        {isMCQ && (
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {question.options.map((opt, i) => {
              const letter = ["A","B","C","D"][i];
              const selected = value === opt;
              return (
                <button key={i} onClick={() => !submitted && setValue(opt)}
                  style={{
                    padding:"14px 16px", borderRadius:14, border:`2px solid ${selected ? accent : accent+"33"}`,
                    background: selected ? `${accent}22` : "rgba(255,255,255,0.04)",
                    color: selected ? accent : "#ffffffcc",
                    fontSize:15, fontWeight:selected?700:400, textAlign:"left",
                    cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:12,
                  }}
                >
                  <span style={{ width:28, height:28, borderRadius:"50%", background:selected?accent:`${accent}22`, color:selected?"#000":accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, flexShrink:0 }}>{letter}</span>
                  <span>{opt}</span>
                  {selected && <span style={{ marginLeft:"auto", fontSize:18 }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Text input for non-MCQ */}
        {!isMCQ && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:"#ffffff44", letterSpacing:1, marginBottom:8 }}>YOUR ANSWER</div>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Type your answer here…"
              autoFocus
              style={{
                width:"100%", padding:"14px 16px", borderRadius:14, fontSize:16, fontWeight:600,
                background:"rgba(255,255,255,0.07)", border:`2px solid ${value ? accent : accent+"33"}`,
                color:"#fff", fontFamily:"system-ui",
              }}
            />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={() => handleSubmit()}
          disabled={!value.trim()}
          style={{
            width:"100%", padding:"16px", borderRadius:16, fontSize:17, fontWeight:900,
            letterSpacing:2, border:"none", cursor: value.trim() ? "pointer" : "not-allowed",
            background: value.trim() ? `linear-gradient(135deg,${accent},${team==="A"?"#0080FF":"#CC2200"})` : "rgba(255,255,255,0.08)",
            color: value.trim() ? "#fff" : "#ffffff33",
            boxShadow: value.trim() ? `0 4px 24px ${accent}55` : "none",
            transition:"all 0.2s", marginBottom:24,
          }}
        >
          ⚡ SUBMIT ANSWER
        </button>
      </div>
    </div>
  );
}
