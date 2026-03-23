import { useState } from "react";
import { CATEGORIES } from "../data/questions";
import { useGame } from "../context/GameContext";
import { TeacherPanel } from "../components/TeacherPanel";
import { PLAYER1_IMG, PLAYER2_IMG } from "../assets";

export function HomePage({ onStartSingle, onStartMulti }) {
  const { questions } = useGame();
  const [showTeacher, setShowTeacher] = useState(false);
  const [showConfig, setShowConfig] = useState(null);
  const [selCats, setSelCats] = useState([]);
  const [selTypes, setSelTypes] = useState([]);

  const toggleCat=(id)=>setSelCats(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleType=(t)=>setSelTypes(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);

  const handleStart=()=>{
    if(showConfig==="single")onStartSingle(selCats,selTypes);
    else onStartMulti(selCats,selTypes);
  };

  const filteredCount=questions.filter(q=>(selCats.length===0||selCats.includes(q.category))&&(selTypes.length===0||selTypes.includes(q.type))).length;

  return (
    <div style={{minHeight:"100vh",width:"100vw",background:"radial-gradient(ellipse at 20% 50%,#0a192f 0%,#061018 40%,#020810 100%)",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;700;900&display=swap');
        @keyframes glow{0%,100%{box-shadow:0 0 20px #FFD70044}50%{box-shadow:0 0 50px #FFD700aa}}
        @keyframes bounceIn{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        *{box-sizing:border-box}
      `}</style>
      <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:"linear-gradient(#00C9FF 1px,transparent 1px),linear-gradient(90deg,#00C9FF 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>

      <div style={{padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #ffffff0d",position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:26}}>🧠</span>
          <div>
            <h1 style={{fontFamily:"'Orbitron',monospace",color:"#FFD700",fontSize:18,margin:0,fontWeight:900,letterSpacing:3}}>SMART TUG OF WAR</h1>
            <p style={{color:"#ffffff44",fontSize:9,margin:0,fontFamily:"'Orbitron',monospace",letterSpacing:2}}>APTITUDE & REASONING ARENA</p>
          </div>
        </div>
        <button onClick={()=>setShowTeacher(true)} style={{padding:"8px 16px",borderRadius:10,background:"rgba(255,215,0,0.08)",border:"1px solid #FFD70044",color:"#FFD700",fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,cursor:"pointer"}}>🔐 TEACHER</button>
      </div>

      {/* Config modal */}
      {showConfig&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}}>
          <div style={{background:"linear-gradient(135deg,#0d1b2a,#1a2a3a)",border:"2px solid #ffffff14",borderRadius:24,padding:28,width:"100%",maxWidth:560,maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"'Orbitron',monospace",color:"#FFD700",margin:"0 0 20px",fontSize:15}}>
              {showConfig==="single"?"🖥️ Single Board":"📱 Multi-Device"} — Configure
            </h3>
            <div style={{marginBottom:16}}>
              <label style={{color:"#aaa",fontFamily:"'Orbitron',monospace",fontSize:10,display:"block",marginBottom:8,letterSpacing:1}}>CATEGORIES (empty = all)</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {CATEGORIES.map(cat=>{const on=selCats.includes(cat.id);return <button key={cat.id} onClick={()=>toggleCat(cat.id)} style={{padding:"5px 11px",borderRadius:20,cursor:"pointer",background:on?cat.color+"33":"rgba(255,255,255,0.06)",border:`1px solid ${on?cat.color:"#ffffff22"}`,color:on?cat.color:"#888",fontFamily:"'Orbitron',monospace",fontSize:10,transition:"all 0.2s"}}>{cat.icon} {cat.label}</button>;})}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{color:"#aaa",fontFamily:"'Orbitron',monospace",fontSize:10,display:"block",marginBottom:8,letterSpacing:1}}>QUESTION TYPES (empty = all)</label>
              <div style={{display:"flex",gap:8}}>
                {[["qa","📝 Q&A"],["mcq","🔘 MCQ"],["picture","🖼️ Picture"]].map(([t,l])=>{const on=selTypes.includes(t);return <button key={t} onClick={()=>toggleType(t)} style={{flex:1,padding:"8px",borderRadius:10,cursor:"pointer",background:on?"#00C9FF22":"rgba(255,255,255,0.05)",border:on?"1px solid #00C9FF66":"1px solid #ffffff22",color:on?"#00C9FF":"#888",fontFamily:"'Orbitron',monospace",fontSize:11}}>{l}</button>;})}
              </div>
            </div>
            <div style={{background:"rgba(255,215,0,0.06)",borderRadius:10,padding:"9px 14px",marginBottom:16,border:"1px solid #FFD70022"}}>
              <span style={{fontFamily:"'Orbitron',monospace",color:"#FFD700",fontSize:11}}>{filteredCount} question{filteredCount!==1?"s":""} match</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowConfig(null)} style={{flex:1,padding:"11px",borderRadius:10,background:"transparent",border:"1px solid #ffffff22",color:"#aaa",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:12}}>← Back</button>
              <button onClick={handleStart} disabled={filteredCount===0} style={{flex:2,padding:"11px",borderRadius:10,background:filteredCount>0?"linear-gradient(135deg,#FFD700,#FFA500)":"rgba(255,255,255,0.1)",border:"none",color:filteredCount>0?"#000":"#666",fontWeight:900,cursor:filteredCount>0?"pointer":"not-allowed",fontFamily:"'Orbitron',monospace",fontSize:13,letterSpacing:1}}>▶ START GAME</button>
            </div>
          </div>
        </div>
      )}

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 20px",position:"relative",zIndex:2}}>
        {/* Hero with custom images */}
        <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:4,marginBottom:24,animation:"bounceIn 1s ease"}}>
          <img src={PLAYER2_IMG} alt="A2" style={{height:80,filter:"hue-rotate(200deg) saturate(1.4)",transform:"scaleX(-1)"}}/>
          <img src={PLAYER1_IMG} alt="A1" style={{height:90,filter:"hue-rotate(180deg)",transform:"scaleX(-1)"}}/>
          <div style={{fontSize:26,margin:"0 10px",color:"#FFD700",fontFamily:"'Orbitron',monospace",fontWeight:900,alignSelf:"center"}}>⚡</div>
          <img src={PLAYER1_IMG} alt="B1" style={{height:90}}/>
          <img src={PLAYER2_IMG} alt="B2" style={{height:80,filter:"brightness(0.85)"}}/>
        </div>

        <h2 style={{fontFamily:"'Orbitron',monospace",color:"#fff",fontSize:26,margin:"0 0 10px",fontWeight:900,textAlign:"center"}}>KNOWLEDGE BATTLE</h2>
        <p style={{color:"#ffffff66",fontSize:14,textAlign:"center",maxWidth:440,marginBottom:10,fontFamily:"'Exo 2',sans-serif",lineHeight:1.7}}>
          Answer aptitude & reasoning questions to pull the rope.<br/>
          <strong style={{color:"#FFD700"}}>⚡ Fastest correct answer wins each round!</strong>
        </p>
        <p style={{color:"#ffffff33",fontSize:12,marginBottom:32,fontFamily:"'Orbitron',monospace",letterSpacing:1}}>FIRST TO 5 POINTS WINS</p>

        <div style={{display:"flex",gap:18,flexWrap:"wrap",justifyContent:"center",marginBottom:36}}>
          <div style={{width:260,padding:"24px 20px",borderRadius:20,background:"linear-gradient(135deg,rgba(0,201,255,0.1),rgba(0,128,255,0.05))",border:"2px solid #00C9FF33",cursor:"pointer",transition:"all 0.25s",textAlign:"center"}}
            onClick={()=>setShowConfig("single")}
            onMouseEnter={e=>{e.currentTarget.style.border="2px solid #00C9FF88";e.currentTarget.style.transform="translateY(-4px)";}}
            onMouseLeave={e=>{e.currentTarget.style.border="2px solid #00C9FF33";e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{fontSize:44,marginBottom:12}}>🖥️</div>
            <h3 style={{fontFamily:"'Orbitron',monospace",color:"#00C9FF",fontSize:15,margin:"0 0 8px",fontWeight:900}}>SINGLE BOARD</h3>
            <p style={{color:"#ffffff66",fontSize:12,fontFamily:"'Exo 2',sans-serif",lineHeight:1.6,margin:"0 0 14px"}}>Both teams type on the same smartboard. Two keypads side by side.</p>
            <div style={{display:"flex",justifyContent:"center",gap:6}}>
              <span style={{padding:"3px 9px",borderRadius:10,background:"#00C9FF22",color:"#00C9FF",fontSize:10,fontFamily:"'Orbitron',monospace"}}>1 Screen</span>
              <span style={{padding:"3px 9px",borderRadius:10,background:"#00C9FF22",color:"#00C9FF",fontSize:10,fontFamily:"'Orbitron',monospace"}}>2 Keypads</span>
            </div>
          </div>
          <div style={{width:260,padding:"24px 20px",borderRadius:20,background:"linear-gradient(135deg,rgba(255,107,107,0.1),rgba(255,50,50,0.05))",border:"2px solid #FF6B6B33",cursor:"pointer",transition:"all 0.25s",textAlign:"center"}}
            onClick={()=>setShowConfig("multi")}
            onMouseEnter={e=>{e.currentTarget.style.border="2px solid #FF6B6B88";e.currentTarget.style.transform="translateY(-4px)";}}
            onMouseLeave={e=>{e.currentTarget.style.border="2px solid #FF6B6B33";e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{fontSize:44,marginBottom:12}}>📱</div>
            <h3 style={{fontFamily:"'Orbitron',monospace",color:"#FF6B6B",fontSize:15,margin:"0 0 8px",fontWeight:900}}>MULTI-DEVICE</h3>
            <p style={{color:"#ffffff66",fontSize:12,fontFamily:"'Exo 2',sans-serif",lineHeight:1.6,margin:"0 0 14px"}}>Scan QR codes on phones. Arena shows on smartboard. Teams answer from devices.</p>
            <div style={{display:"flex",justifyContent:"center",gap:6}}>
              <span style={{padding:"3px 9px",borderRadius:10,background:"#FF6B6B22",color:"#FF6B6B",fontSize:10,fontFamily:"'Orbitron',monospace"}}>QR Code</span>
              <span style={{padding:"3px 9px",borderRadius:10,background:"#FF6B6B22",color:"#FF6B6B",fontSize:10,fontFamily:"'Orbitron',monospace"}}>Phones</span>
            </div>
          </div>
        </div>

        <div style={{textAlign:"center"}}>
          <p style={{color:"#ffffff44",fontFamily:"'Orbitron',monospace",fontSize:10,letterSpacing:2,marginBottom:10}}>QUESTION CATEGORIES</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center"}}>
            {CATEGORIES.map(cat=><span key={cat.id} style={{padding:"3px 11px",borderRadius:20,background:cat.color+"18",border:`1px solid ${cat.color}44`,color:cat.color,fontSize:10,fontFamily:"'Orbitron',monospace"}}>{cat.icon} {cat.label}</span>)}
          </div>
          <p style={{color:"#ffffff22",fontFamily:"'Orbitron',monospace",fontSize:9,marginTop:12,letterSpacing:1}}>{questions.length} questions loaded</p>
        </div>
      </div>

      {showTeacher&&<TeacherPanel onClose={()=>setShowTeacher(false)}/>}
    </div>
  );
}
