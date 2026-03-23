import { useState, useEffect, useRef } from "react";


const SESSION_KEY = "tow_session_v3";
const ANS_A_KEY   = "tow_answer_a_v3";
const ANS_B_KEY   = "tow_answer_b_v3";

/* ─── tiny Google-Forms colour palette ─────────────────────────── */
const TEAM_THEME = {
  A: { accent:"#1a73e8", banner:"#4285f4", label:"Team A", emoji:"🔵" },
  B: { accent:"#d93025", banner:"#ea4335", label:"Team B", emoji:"🔴" },
};

export function FormPage({ team, sessionId }) {
  const theme   = TEAM_THEME[team] ?? TEAM_THEME.A;
  const ansKey  = team === "A" ? ANS_A_KEY : ANS_B_KEY;

  const [question,   setQuestion]   = useState(null);
  const [value,      setValue]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);
  const [feedback,   setFeedback]   = useState(null); // "correct"|"wrong"|"missed"
  const [connected,  setConnected]  = useState(false);
  const [questionNo, setQuestionNo] = useState(1);

  const lastPhaseRef  = useRef("");
  const inputRef      = useRef(null);

  /* ── poll localStorage for session ── */
  useEffect(() => {
    const poll = setInterval(() => {
      try {
        const raw  = localStorage.getItem(SESSION_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data.sessionId !== sessionId) return;

        setConnected(true);
        if (data.question) setQuestion(data.question);

        if (data.phase !== lastPhaseRef.current) {
          lastPhaseRef.current = data.phase;

          if (data.phase === "playing") {
            setSubmitted(false);
            setValue("");
            setFeedback(null);
            setQuestionNo(n => n + 1);
            setTimeout(() => inputRef.current?.focus(), 200);
          }

          if (data.phase === "resolved") {
            setFeedback(prev => {
              if (prev) return prev;
              return prev;
            });
          }
        }
      } catch {}
    }, 350);
    return () => { clearInterval(poll); };
  }, [sessionId, submitted]);

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    localStorage.setItem(ansKey, JSON.stringify({
      sessionId, answer: value.trim(), team, timestamp: Date.now(),
    }));
    setSubmitted(true);
    // Optimistically show result after a short wait if we know the answer
    setTimeout(() => {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.question?.answer) {
          const correct = d.question.answer.trim().toLowerCase();
          setFeedback(value.trim().toLowerCase() === correct ? "correct" : "wrong");
        }
      }
    }, 600);
  };

  /* ─── Not connected ─── */
  if (!connected) return (
    <GFormShell theme={theme}>
      <div style={{ textAlign:"center", padding:"48px 24px" }}>
        <div style={{ fontSize:56, marginBottom:20, animation:"pulse 1.4s infinite" }}>🔗</div>
        <p style={gStyle.title}>Waiting for arena...</p>
        <p style={gStyle.hint}>Keep the smartboard open on the same Wi-Fi</p>
      </div>
    </GFormShell>
  );

  /* ─── Post-submit feedback ─── */
  if (feedback === "correct" || feedback === "wrong") return (
    <GFormShell theme={theme}>
      <div style={{ textAlign:"center", padding:"40px 20px" }}>
        <div style={{ fontSize:64, marginBottom:16, animation:"bounceIn 0.5s ease" }}>
          {feedback === "correct" ? "✅" : "❌"}
        </div>
        <p style={{ ...gStyle.title, color: feedback === "correct" ? "#0f9d58" : "#d93025" }}>
          {feedback === "correct" ? "Correct!" : "Wrong answer"}
        </p>
        <p style={gStyle.hint}>Next question loading on the arena...</p>
      </div>
    </GFormShell>
  );

  /* ─── Submitted, waiting ─── */
  if (submitted) return (
    <GFormShell theme={theme}>
      <div style={{ textAlign:"center", padding:"40px 20px" }}>
        <div style={{ fontSize:52, marginBottom:14, animation:"pulse 1.5s infinite" }}>⏳</div>
        <p style={gStyle.title}>Answer submitted!</p>
        <div style={{ background:"#f1f3f4", borderRadius:8, padding:"12px 16px", margin:"16px 0", textAlign:"left" }}>
          <p style={{ margin:0, color:"#5f6368", fontSize:13 }}>Your answer</p>
          <p style={{ margin:"4px 0 0", color:"#202124", fontWeight:600, fontSize:16 }}>{value}</p>
        </div>
        <p style={gStyle.hint}>Waiting for the other team...</p>
      </div>
    </GFormShell>
  );

  /* ─── Main form ─── */
  return (
    <GFormShell theme={theme}>
      <div style={{ padding:"20px 24px 28px" }}>
        {/* Question meta */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"#5f6368", fontWeight:500 }}>Question {questionNo}</span>
        </div>

        {/* Question text */}
        {question?.type === "picture" && question.imageUrl && (
          <img src={question.imageUrl} alt="q" style={{ width:"100%", maxHeight:180, objectFit:"contain", borderRadius:8, marginBottom:12 }} />
        )}
        <p style={{ fontSize:16, fontWeight:600, color:"#202124", lineHeight:1.55, margin:"0 0 20px" }}>
          {question?.question ?? "Loading question..."}
        </p>

        {/* MCQ options */}
        {question?.type === "mcq" && question.options ? (
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {question.options.map((opt, i) => {
              const sel = value === opt;
              return (
                <label key={i} onClick={() => setValue(opt)} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 16px", borderRadius:8, cursor:"pointer",
                  border:`2px solid ${sel ? theme.accent : "#dadce0"}`,
                  background: sel ? theme.accent + "12" : "#fff",
                  transition:"all 0.15s",
                }}>
                  <div style={{
                    width:18, height:18, borderRadius:"50%",
                    border:`2px solid ${sel ? theme.accent : "#5f6368"}`,
                    background: sel ? theme.accent : "transparent",
                    flexShrink:0, position:"relative",
                  }}>
                    {sel && <div style={{ position:"absolute", inset:3, borderRadius:"50%", background:"#fff" }} />}
                  </div>
                  <span style={{ fontSize:15, color:"#202124", fontWeight: sel ? 600 : 400 }}>{opt}</span>
                </label>
              );
            })}
          </div>
        ) : (
          /* Text input */
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:14, color:"#5f6368", marginBottom:8, fontWeight:500 }}>
              Your answer
            </label>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Type your answer here..."
              autoFocus
              style={{
                width:"100%", fontSize:16, padding:"12px 14px",
                border:"none", borderBottom:`2px solid ${value ? theme.accent : "#dadce0"}`,
                outline:"none", background:"#f8f9fa", borderRadius:"4px 4px 0 0",
                color:"#202124", transition:"border-color 0.2s", boxSizing:"border-box",
              }}
              onFocus={e => { e.target.style.borderBottomColor = theme.accent; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.background = "#f8f9fa"; }}
            />
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!value}
          style={{
            width:"100%", padding:"14px", borderRadius:6,
            background: value ? theme.accent : "#dadce0",
            border:"none", color:"#fff", fontSize:15, fontWeight:600,
            cursor: value ? "pointer" : "not-allowed",
            letterSpacing:"0.3px", transition:"all 0.2s",
            boxShadow: value ? `0 2px 8px ${theme.accent}44` : "none",
          }}
        >
          Submit Answer
        </button>

        <p style={{ textAlign:"center", marginTop:14, color:"#9aa0a6", fontSize:12 }}>
          ⚡ Fastest correct answer wins the round
        </p>
      </div>
    </GFormShell>
  );
}

/* ─── Shell that mimics Google Forms layout ─── */
function GFormShell({ theme, children }) {
  return (
    <div style={{ minHeight:"100vh", background:"#f0ebf8", fontFamily:"'Google Sans',Roboto,Arial,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}
        @keyframes bounceIn{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
        * { box-sizing:border-box; }
        input::placeholder { color:#bdc1c6; }
      `}</style>

      {/* Top colour band (like Google Forms) */}
      <div style={{ height:10, background:`linear-gradient(90deg,${theme.banner},${theme.accent})` }} />

      <div style={{ maxWidth:640, margin:"0 auto", padding:"16px 16px 40px" }}>
        {/* Header card */}
        <div style={{
          background:"#fff", borderRadius:"8px 8px 0 0",
          borderTop:`8px solid ${theme.accent}`,
          padding:"20px 24px 16px",
          boxShadow:"0 1px 3px rgba(0,0,0,0.12)",
          marginBottom:2,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <span style={{ fontSize:28 }}>{theme.emoji}</span>
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:"#202124", lineHeight:1.2 }}>
                {theme.label} Answer Form
              </h1>
              <p style={{ margin:"2px 0 0", fontSize:13, color:"#5f6368" }}>
                Smart Tug of War — Aptitude & Reasoning
              </p>
            </div>
          </div>
          <div style={{ height:1, background:"#e8eaed", marginTop:14 }} />
          <p style={{ margin:"10px 0 0", fontSize:12, color:"#d93025", fontWeight:500 }}>
            * Required
          </p>
        </div>

        {/* Main question card */}
        <div style={{
          background:"#fff", borderRadius:"0 0 8px 8px",
          boxShadow:"0 1px 3px rgba(0,0,0,0.12)",
          overflow:"hidden",
        }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:24, color:"#9aa0a6", fontSize:12 }}>
          <p style={{ margin:0 }}>🧠 Smart Tug of War</p>
          <p style={{ margin:"2px 0 0" }}>Never submit passwords through this form</p>
        </div>
      </div>
    </div>
  );
}

const gStyle = {
  title: { fontSize:18, fontWeight:600, color:"#202124", margin:"0 0 8px" },
  hint:  { fontSize:14, color:"#5f6368", margin:0, lineHeight:1.5 },
};
