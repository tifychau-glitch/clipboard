// Shared Clipboard React components — used by both UI kits.
// Exposes components on window for cross-script use.

const { useState, useEffect, useCallback } = React;

// ── Logo ───────────────────────────────────────────────────────────────
function CBMark({ size = 32, dark = false }) {
  const clipFill = dark ? "rgba(255,255,255,0.08)" : "#FFFFFF";
  const handleFill = dark ? "#FFFFFF" : "#12192B";
  const handleInner = dark ? "#12192B" : "#FFFFFF";
  const checkStroke = dark ? "#FFFFFF" : "#12192B";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="10" width="36" height="33" rx="5" fill={clipFill}/>
      <path d="M14 10 H24" stroke="#F6C94E" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M24 10 H34" stroke="#2BBFAD" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M6 14 V43" stroke="#F6C94E" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M42 14 V43" stroke="#2BBFAD" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M6 43 H42" stroke="#7B52E8" strokeWidth="3.5" strokeLinecap="round"/>
      <rect x="17" y="6" width="14" height="8" rx="4" fill={handleFill}/>
      <rect x="20" y="8" width="8" height="4" rx="2" fill={handleInner}/>
      <path d="M16 27 L21.5 33 L32 20" stroke={checkStroke} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CBLogo({ dark = false, size = 28 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <CBMark size={size} dark={dark} />
      <span style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 800,
        fontSize: size * 0.58,
        color: dark ? "#fff" : "#12192B",
        letterSpacing: "-0.03em",
        lineHeight: 1
      }}>clipboard</span>
    </div>
  );
}

// ── Icons (Lucide-style inline SVGs) ────────────────────────────────
const Icon = ({ path, size = 18, stroke = "currentColor", width = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const I = {
  dashboard: <Icon path={<><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>} />,
  agents: <Icon path={<><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M9 3h6v4H9z"/><path d="M8 12l3 3 5-6"/></>} />,
  templates: <Icon path={<><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="12" width="10" height="8" rx="1"/><rect x="15" y="12" width="6" height="8" rx="1"/></>} />,
  deals: <Icon path={<><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>} />,
  reports: <Icon path={<><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></>} />,
  settings: <Icon path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8L7 17M17 7l2.8-2.8"/></>} />,
  plus: <Icon path={<><path d="M12 5v14M5 12h14"/></>} />,
  search: <Icon path={<><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>} />,
  play: <Icon path={<><path d="M8 5v14l11-7z"/></>} width={0} stroke="currentColor" />,
  pause: <Icon path={<><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>} />,
  check: <Icon path={<path d="M20 6L9 17l-5-5"/>} width={2} />,
  chevron: <Icon path={<path d="M9 18l6-6-6-6"/>} />,
  arrowRight: <Icon path={<><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>} />,
  more: <Icon path={<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>} />,
  bell: <Icon path={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />,
  mail: <Icon path={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7"/></>} />,
  file: <Icon path={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>} />,
  sparkle: <Icon path={<><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/></>} />,
  menu: <Icon path={<><path d="M3 6h18M3 12h18M3 18h18"/></>} />,
  zap: <Icon path={<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>} />,
  shield: <Icon path={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} />,
  users: <Icon path={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />,
};

// ── Pill ──────────────────────────────────────────────────────────────
function Pill({ color = "teal", children, dot = true }) {
  const map = {
    teal:   { bg: "#E6FAF8", fg: "#1A8A7D", d: "#2BBFAD" },
    violet: { bg: "#F0EBFF", fg: "#5B32C8", d: "#7B52E8" },
    yellow: { bg: "#FEF9E7", fg: "#B8860B", d: "#F6C94E" },
    muted:  { bg: "#F5F6FA", fg: "#8B90A7", d: "#8B90A7" },
  }[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: dot ? "3px 10px 3px 8px" : "3px 10px",
      borderRadius: 999,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 11, fontWeight: 500,
      background: map.bg, color: map.fg, whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: map.d }}/>}
      {children}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────────────
function Button({ variant = "navy", size = "md", children, onClick, icon }) {
  const base = {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    borderRadius: size === "sm" ? 8 : 10,
    border: "none",
    cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 6,
    transition: "all 0.15s cubic-bezier(0.2,0.7,0.2,1)",
    fontSize: size === "sm" ? 12 : 14,
    padding: size === "sm" ? "7px 14px" : "12px 22px",
  };
  const styles = {
    navy:    { ...base, background: "#12192B", color: "#fff" },
    violet:  { ...base, background: "#7B52E8", color: "#fff" },
    yellow:  { ...base, background: "#F6C94E", color: "#12192B" },
    outline: { ...base, background: "transparent", color: "#12192B", border: "1.5px solid #E8EAF0" },
    ghost:   { ...base, background: "transparent", color: "#12192B" },
  };
  return <button style={styles[variant]} onClick={onClick}>{icon}{children}</button>;
}

// Expose globally
Object.assign(window, { CBMark, CBLogo, Icon, I, Pill, Button });
