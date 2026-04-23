import { useState, useEffect } from "react";

// Brand colors extracted & built from the multi-color segmented logo
const C = {
  navy:    "#12192B",   // primary dark
  yellow:  "#F6C94E",   // logo segment 1
  violet:  "#7B52E8",   // logo segment 2
  teal:    "#2BBFAD",   // logo segment 3
  white:   "#FFFFFF",
  bg:      "#F5F6FA",
  surface: "#FFFFFF",
  border:  "#E8EAF0",
  muted:   "#8B90A7",
  ink:     "#1E2435",
};

// The logo mark SVG — multi-color segmented clipboard + checkmark
function LogoMark({ size = 48 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Clipboard body */}
      <rect x="6" y="10" width="36" height="33" rx="5" fill={C.white} />
      {/* Color segments on border — left yellow, bottom violet, right teal */}
      {/* Top border (split) */}
      <path d="M14 10 H24" stroke={C.yellow} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M24 10 H34" stroke={C.teal} strokeWidth="3.5" strokeLinecap="round"/>
      {/* Left border yellow */}
      <path d="M6 14 V43" stroke={C.yellow} strokeWidth="3.5" strokeLinecap="round"/>
      {/* Right border teal */}
      <path d="M42 14 V43" stroke={C.teal} strokeWidth="3.5" strokeLinecap="round"/>
      {/* Bottom border violet */}
      <path d="M6 43 H42" stroke={C.violet} strokeWidth="3.5" strokeLinecap="round"/>
      {/* Corner radii connectors */}
      <rect x="6" y="10" width="36" height="33" rx="5" fill="none" stroke="transparent" strokeWidth="0"/>
      {/* Clip handle */}
      <rect x="17" y="6" width="14" height="8" rx="4" fill={C.navy}/>
      <rect x="20" y="8" width="8" height="4" rx="2" fill={C.white}/>
      {/* Checkmark */}
      <path d="M16 27 L21.5 33 L32 20" stroke={C.navy} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LogoMarkSmall({ size = 32 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="33" rx="5" fill={C.white}/>
      <path d="M14 10 H24" stroke={C.yellow} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M24 10 H34" stroke={C.teal} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M6 14 V43" stroke={C.yellow} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M42 14 V43" stroke={C.teal} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M6 43 H42" stroke={C.violet} strokeWidth="3.5" strokeLinecap="round"/>
      <rect x="17" y="6" width="14" height="8" rx="4" fill={C.navy}/>
      <rect x="20" y="8" width="8" height="4" rx="2" fill={C.white}/>
      <path d="M16 27 L21.5 33 L32 20" stroke={C.navy} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Logo mark on dark bg
function LogoMarkDark({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="33" rx="5" fill="rgba(255,255,255,0.08)"/>
      <path d="M14 10 H24" stroke={C.yellow} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M24 10 H34" stroke={C.teal} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M6 14 V43" stroke={C.yellow} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M42 14 V43" stroke={C.teal} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M6 43 H42" stroke={C.violet} strokeWidth="3.5" strokeLinecap="round"/>
      <rect x="17" y="6" width="14" height="8" rx="4" fill={C.white}/>
      <rect x="20" y="8" width="8" height="4" rx="2" fill={C.navy}/>
      <path d="M16 27 L21.5 33 L32 20" stroke={C.white} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ClipboardBrandFinal() {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setLoaded(true), 350);
  }, []);

  const copyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .up { opacity:0; transform:translateY(18px); animation: fadeUp 0.6s ease forwards; }
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }

        .swatch { transition: transform 0.18s, box-shadow 0.18s; cursor:pointer; }
        .swatch:hover { transform:translateY(-4px); box-shadow: 0 12px 28px rgba(18,25,43,0.14); }

        .btn-navy {
          background: ${C.navy};
          color: ${C.white};
          border: none;
          border-radius: 10px;
          padding: 13px 26px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: background 0.15s, transform 0.15s;
        }
        .btn-navy:hover { background: #1e2d4a; transform:translateY(-1px); }

        .btn-violet {
          background: ${C.violet};
          color: ${C.white};
          border: none;
          border-radius: 10px;
          padding: 13px 26px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: opacity 0.15s, transform 0.15s;
        }
        .btn-violet:hover { opacity: 0.88; transform:translateY(-1px); }

        .btn-outline {
          background: transparent;
          color: ${C.navy};
          border: 1.5px solid ${C.border};
          border-radius: 10px;
          padding: 12px 26px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: border-color 0.15s, background 0.15s;
        }
        .btn-outline:hover { border-color: ${C.navy}; background: #F0F2F8; }

        .card { background: ${C.white}; border-radius: 16px; border: 1px solid ${C.border}; }

        .mono {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: ${C.muted};
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px 4px 7px;
          border-radius: 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
        }
        .dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

        .tab {
          padding: 7px 16px;
          border-radius: 8px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          border: none;
          transition: background 0.15s, color 0.15s;
          letter-spacing: -0.01em;
        }

        .agent-row {
          background: ${C.white};
          border: 1px solid ${C.border};
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: box-shadow 0.15s;
          cursor: default;
        }
        .agent-row:hover { box-shadow: 0 4px 14px rgba(18,25,43,0.08); }

        .segment-bar {
          height: 4px;
          border-radius: 2px;
          display: flex;
          gap: 2px;
          overflow: hidden;
        }
      `}</style>

      {/* ── HERO BAND ── */}
      <div
        className={loaded ? "up" : ""}
        style={{
          background: C.navy,
          padding: "56px 60px 52px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* subtle grid */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:`linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize:"48px 48px",
        }}/>
        {/* color accent blobs */}
        <div style={{ position:"absolute", top:-40, right:80, width:220, height:220, borderRadius:"50%", background:C.violet, opacity:0.12, filter:"blur(60px)" }}/>
        <div style={{ position:"absolute", bottom:-20, right:200, width:160, height:160, borderRadius:"50%", background:C.teal, opacity:0.1, filter:"blur(50px)" }}/>
        <div style={{ position:"absolute", top:20, right:340, width:100, height:100, borderRadius:"50%", background:C.yellow, opacity:0.1, filter:"blur(40px)" }}/>

        <div style={{ position:"relative", zIndex:1 }}>
          {/* Logo lockup */}
          <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"36px" }}>
            <LogoMarkDark size={52} />
            <span style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:800, fontSize:"30px", color:C.white, letterSpacing:"-0.03em" }}>
              Clipboard
            </span>
          </div>

          {/* Three-color accent bar */}
          <div style={{ display:"flex", gap:"6px", marginBottom:"24px" }}>
            {[C.yellow, C.teal, C.violet].map(col => (
              <div key={col} style={{ width:32, height:4, borderRadius:2, background:col }}/>
            ))}
          </div>

          <h1 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:800, fontSize:"50px", color:C.white, letterSpacing:"-0.035em", lineHeight:"1.02", marginBottom:"18px" }}>
            Your business,<br/>
            <span style={{ color:C.yellow }}>handled.</span>
          </h1>
          <p style={{ fontFamily:"'DM Sans'", fontWeight:300, fontSize:"16px", color:"rgba(255,255,255,0.5)", lineHeight:"1.65", maxWidth:"420px", marginBottom:"32px" }}>
            Pre-built AI agent teams for business operators. Visual, simple, and built for people who want results — not a PhD in AI.
          </p>

          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            <button className="btn-violet" style={{ fontSize:"15px", padding:"14px 30px" }}>Get Early Access →</button>
            <button style={{ background:"rgba(255,255,255,0.08)", color:C.white, border:"1px solid rgba(255,255,255,0.15)", borderRadius:"10px", padding:"14px 26px", fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:"15px", cursor:"pointer", letterSpacing:"-0.01em" }}>
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:"48px 60px", display:"grid", gap:"44px" }}>

        {/* ── LOGO VARIATIONS ── */}
        <div className={loaded ? "up" : ""} style={{ animationDelay:"0.08s" }}>
          <p className="mono" style={{ marginBottom:"18px" }}>Logo System</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
            {/* Light */}
            <div className="card" style={{ padding:"32px 28px", display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" }}>
              <LogoMark size={56}/>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:"22px", color:C.navy, letterSpacing:"-0.03em" }}>Clipboard</span>
              </div>
              <p className="mono">Light / Default</p>
            </div>
            {/* Dark */}
            <div style={{ background:C.navy, borderRadius:16, padding:"32px 28px", display:"flex", flexDirection:"column", alignItems:"center", gap:"14px" }}>
              <LogoMarkDark size={56}/>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:"22px", color:C.white, letterSpacing:"-0.03em" }}>Clipboard</span>
              </div>
              <p className="mono" style={{ color:"rgba(255,255,255,0.3)" }}>Dark Mode</p>
            </div>
            {/* Mark only */}
            <div className="card" style={{ padding:"32px 28px", display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", background:"#F0F2F8" }}>
              <LogoMark size={72}/>
              <p className="mono">Icon Mark</p>
            </div>
          </div>
        </div>

        {/* ── COLOR PALETTE ── */}
        <div className={loaded ? "up" : ""} style={{ animationDelay:"0.14s" }}>
          <p className="mono" style={{ marginBottom:"18px" }}>Color Palette</p>

          {/* Primary */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"10px", marginBottom:"10px" }}>
            <div
              className="swatch"
              onClick={() => copyHex(C.navy)}
              style={{ background:C.navy, borderRadius:12, padding:"28px 22px 18px", minHeight:120, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}
            >
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:"13px", color:"rgba(255,255,255,0.9)" }}>Navy</div>
              <div style={{ fontFamily:"'DM Mono'", fontSize:"9px", color:"rgba(255,255,255,0.35)", marginTop:2 }}>{copied === C.navy ? "Copied!" : C.navy}</div>
              <p style={{ fontFamily:"'DM Sans'", fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:6, fontWeight:300 }}>Primary · Dark BG</p>
            </div>
            {[
              { name:"Yellow", hex:C.yellow, light:true, note:"Logo · CTA" },
              { name:"Violet", hex:C.violet, light:false, note:"Logo · Accent" },
              { name:"Teal", hex:C.teal, light:false, note:"Logo · Success" },
            ].map(c => (
              <div
                key={c.hex}
                className="swatch"
                onClick={() => copyHex(c.hex)}
                style={{ background:c.hex, borderRadius:12, padding:"20px 18px 16px", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}
              >
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:"12px", color: c.light ? C.navy : "rgba(255,255,255,0.95)" }}>{c.name}</div>
                <div style={{ fontFamily:"'DM Mono'", fontSize:"9px", color: c.light ? "rgba(18,25,43,0.35)" : "rgba(255,255,255,0.35)", marginTop:1 }}>{copied === c.hex ? "Copied!" : c.hex}</div>
                <p style={{ fontFamily:"'DM Sans'", fontSize:"9px", color: c.light ? "rgba(18,25,43,0.4)" : "rgba(255,255,255,0.35)", marginTop:4, fontWeight:300 }}>{c.note}</p>
              </div>
            ))}
          </div>

          {/* Secondary */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px" }}>
            {[
              { name:"White", hex:C.white, border:true },
              { name:"Surface", hex:C.bg, border:true },
              { name:"Muted", hex:"#8B90A7", border:false },
            ].map(c => (
              <div
                key={c.hex}
                className="swatch"
                onClick={() => copyHex(c.hex)}
                style={{ background:c.hex, borderRadius:12, padding:"16px 18px 14px", border: c.border ? `1px solid ${C.border}` : "none", display:"flex", justifyContent:"space-between", alignItems:"center" }}
              >
                <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:"12px", color: c.name === "Muted" ? C.white : C.navy }}>{c.name}</span>
                <span style={{ fontFamily:"'DM Mono'", fontSize:"9px", color: c.name === "Muted" ? "rgba(255,255,255,0.45)" : C.muted }}>{copied === c.hex ? "Copied!" : c.hex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TYPOGRAPHY ── */}
        <div className={loaded ? "up" : ""} style={{ animationDelay:"0.2s" }}>
          <p className="mono" style={{ marginBottom:"18px" }}>Typography</p>
          <div className="card" style={{ padding:"40px 44px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"44px" }}>
            <div>
              <p className="mono" style={{ marginBottom:"14px" }}>Display — Bricolage Grotesque 800</p>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:"52px", color:C.navy, lineHeight:"0.98", letterSpacing:"-0.035em" }}>
                Work<br/>
                <span style={{ color:C.violet }}>less.</span><br/>
                <span style={{ WebkitTextStroke:`2px ${C.teal}`, color:"transparent" }}>Do more.</span>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
              <div>
                <p className="mono" style={{ marginBottom:"10px" }}>Body — DM Sans 300/400</p>
                <p style={{ fontFamily:"'DM Sans'", fontSize:"15px", color:"#4A5068", lineHeight:"1.7", fontWeight:300 }}>
                  Clipboard runs your back office so you can focus on what actually moves the needle. Agents that draft, track, follow up, and report — while you close deals.
                </p>
              </div>
              <div>
                <p className="mono" style={{ marginBottom:"10px" }}>Labels — DM Mono</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  <div className="pill" style={{ background:"#FEF9E7", color:"#B8860B" }}><div className="dot" style={{ background:C.yellow }}/> Contracts</div>
                  <div className="pill" style={{ background:"#F0EBFF", color:C.violet }}><div className="dot" style={{ background:C.violet }}/> Agents</div>
                  <div className="pill" style={{ background:"#E6FAF8", color:"#1A8A7D" }}><div className="dot" style={{ background:C.teal }}/> Active</div>
                </div>
              </div>
              <div>
                <p className="mono" style={{ marginBottom:"10px" }}>Scale</p>
                {[
                  { label:"H1", size:"48px", weight:800 },
                  { label:"H2", size:"28px", weight:700 },
                  { label:"H3", size:"18px", weight:600 },
                  { label:"Body", size:"15px", weight:400, sans:true },
                ].map(t => (
                  <div key={t.label} style={{ display:"flex", alignItems:"baseline", gap:"12px", marginBottom:4 }}>
                    <span style={{ fontFamily:"'DM Mono'", fontSize:"8px", color:C.muted, width:24 }}>{t.label}</span>
                    <span style={{ fontFamily: t.sans ? "'DM Sans'" : "'Bricolage Grotesque'", fontWeight:t.weight, fontSize:t.size, color:C.navy, letterSpacing:"-0.02em", lineHeight:"1" }}>{t.label === "Body" ? "The quick brown fox" : "Clipboard"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── UI COMPONENTS ── */}
        <div className={loaded ? "up" : ""} style={{ animationDelay:"0.26s" }}>
          <p className="mono" style={{ marginBottom:"18px" }}>UI Components</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>

            {/* Buttons + inputs */}
            <div className="card" style={{ padding:"30px 32px" }}>
              <p className="mono" style={{ marginBottom:"18px" }}>Buttons</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", alignItems:"flex-start" }}>
                <button className="btn-navy">Get Started Free</button>
                <button className="btn-violet">Explore Templates →</button>
                <button className="btn-outline">Watch Demo</button>
              </div>
            </div>

            {/* Agent card */}
            <div className="card" style={{ padding:"30px 32px" }}>
              <p className="mono" style={{ marginBottom:"18px" }}>Agent Card</p>
              <div style={{ background:C.bg, borderRadius:12, padding:"18px 20px", border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <LogoMarkSmall size={22}/>
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:"13px", color:C.navy, letterSpacing:"-0.01em" }}>Lead Nurture Agent</div>
                      <div style={{ fontFamily:"'DM Sans'", fontSize:"11px", color:C.muted, marginTop:1 }}>TC Firm · Creative Finance</div>
                    </div>
                  </div>
                  <div className="pill" style={{ background:"#E6FAF8", color:"#1A8A7D" }}><div className="dot" style={{ background:C.teal }}/> Live</div>
                </div>
                {/* Segment bar */}
                <div style={{ display:"flex", gap:3, marginBottom:12 }}>
                  <div style={{ flex:3, height:3, borderRadius:2, background:C.violet }}/>
                  <div style={{ flex:2, height:3, borderRadius:2, background:C.teal }}/>
                  <div style={{ flex:1, height:3, borderRadius:2, background:C.yellow }}/>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {[["14", "Tasks", C.violet],["98%", "Rate", C.teal],["2m", "Last run", C.yellow]].map(([val, label, col]) => (
                    <div key={label} style={{ flex:1, background:C.white, borderRadius:8, padding:"8px 10px", border:`1px solid ${C.border}`, textAlign:"center" }}>
                      <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:"15px", color:col }}>{val}</div>
                      <div style={{ fontFamily:"'DM Mono'", fontSize:"8px", color:C.muted, letterSpacing:"0.08em", marginTop:1 }}>{label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── APP CHROME PREVIEW ── */}
        <div className={loaded ? "up" : ""} style={{ animationDelay:"0.32s" }}>
          <p className="mono" style={{ marginBottom:"18px" }}>App Layout Preview</p>
          <div className="card" style={{ display:"grid", gridTemplateColumns:"210px 1fr", height:"280px", overflow:"hidden" }}>
            {/* Sidebar */}
            <div style={{ background:C.navy, padding:"20px 14px", display:"flex", flexDirection:"column", gap:2, borderRight:`1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:20, padding:"0 4px" }}>
                <LogoMarkDark size={28}/>
                <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:"15px", color:C.white, letterSpacing:"-0.02em" }}>Clipboard</span>
              </div>
              {[
                { label:"Dashboard", active:false, color:null },
                { label:"My Agents", active:true, color:C.teal },
                { label:"Templates", active:false, color:null },
                { label:"Deals", active:false, color:C.yellow },
                { label:"Reports", active:false, color:null },
                { label:"Settings", active:false, color:null },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", borderRadius:8, background: item.active ? "rgba(255,255,255,0.1)" : "transparent", cursor:"pointer" }}>
                  <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight: item.active ? 700 : 500, fontSize:"12px", color: item.active ? C.white : "rgba(255,255,255,0.38)", letterSpacing:"-0.01em" }}>{item.label}</span>
                  {item.color && <div style={{ width:6, height:6, borderRadius:"50%", background:item.color }}/>}
                </div>
              ))}
            </div>

            {/* Main panel */}
            <div style={{ background:C.bg, padding:"22px 26px", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                <div>
                  <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:"17px", color:C.navy, letterSpacing:"-0.02em" }}>My Agents</div>
                  <div style={{ fontFamily:"'DM Sans'", fontSize:"11px", color:C.muted, marginTop:2 }}>3 running · 1 paused</div>
                </div>
                <div style={{ background:C.violet, color:C.white, borderRadius:8, padding:"7px 14px", fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:"12px", cursor:"pointer", letterSpacing:"-0.01em" }}>+ New Agent</div>
              </div>

              <div style={{ display:"flex", gap:4, marginBottom:14 }}>
                {["All","Running","Paused"].map((t,i) => (
                  <button key={t} className="tab" onClick={()=>setActiveTab(i)} style={{ background: activeTab===i ? C.white : "transparent", color: activeTab===i ? C.navy : C.muted, boxShadow: activeTab===i ? "0 1px 6px rgba(18,25,43,0.1)" : "none" }}>{t}</button>
                ))}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { name:"Follow-Up Bot", type:"TC Firm", color:C.teal, status:"Running" },
                  { name:"Deal Tracker", type:"Creative Finance", color:C.violet, status:"Running" },
                  { name:"Contract Reviewer", type:"TC Firm", color:C.yellow, status:"Paused" },
                ].map(a => (
                  <div key={a.name} className="agent-row">
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background: a.status === "Running" ? C.teal : C.muted, flexShrink:0 }}/>
                      <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:"12px", color:C.navy, letterSpacing:"-0.01em" }}>{a.name}</span>
                      <div className="pill" style={{ background: a.color === C.teal ? "#E6FAF8" : a.color === C.violet ? "#F0EBFF" : "#FEF9E7", color: a.color === C.teal ? "#1A8A7D" : a.color === C.violet ? C.violet : "#B8860B", padding:"2px 8px" }}>{a.type}</div>
                    </div>
                    <span style={{ fontFamily:"'DM Mono'", fontSize:"9px", color: a.status === "Running" ? C.teal : C.muted, letterSpacing:"0.08em" }}>{a.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BRAND VOICE ── */}
        <div className={loaded ? "up" : ""} style={{ animationDelay:"0.38s", background:C.navy, borderRadius:16, padding:"40px 48px", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:28 }}>
          {[
            { word:"Simple", col:C.yellow, desc:"No config files. No engineers. Just click and run." },
            { word:"Modern", col:C.violet, desc:"Built for how business actually works in 2025." },
            { word:"Reliable", col:C.teal, desc:"Shows up every day and does the work." },
            { word:"Yours", col:C.white, desc:"Niche-built templates that fit your exact business." },
          ].map(v => (
            <div key={v.word}>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:"22px", color:v.col, letterSpacing:"-0.02em", marginBottom:8 }}>{v.word}</div>
              <div style={{ fontFamily:"'DM Sans'", fontSize:"12px", color:"rgba(255,255,255,0.42)", lineHeight:"1.55", fontWeight:300 }}>{v.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", paddingBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:10 }}>
            {[C.yellow, C.violet, C.teal].map(col => <div key={col} style={{ width:20, height:3, borderRadius:2, background:col }}/>)}
          </div>
          <p className="mono">Clipboard · Final Brand Direction · Multi-Color System</p>
        </div>
      </div>
    </div>
  );
}
