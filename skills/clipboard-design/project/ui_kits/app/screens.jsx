// Agent list screen
function AgentsScreen({ onOpen }) {
  const [tab, setTab] = useStateA("all");
  const agents = [
    { name: "Follow-Up Bot",      category: "TC Firm",          status: "Running", lastRun: "2m ago", tasks: 14 },
    { name: "Deal Tracker",       category: "Creative Finance", status: "Running", lastRun: "12m ago", tasks: 8 },
    { name: "Contract Reviewer",  category: "TC Firm",          status: "Paused",  lastRun: "1h ago",  tasks: 2 },
    { name: "Seller Outreach",    category: "Creative Finance", status: "Running", lastRun: "4m ago",  tasks: 27 },
    { name: "Weekly Report",      category: "Admin",            status: "Paused",  lastRun: "3d ago",  tasks: 4 },
  ];
  const filtered = tab === "all" ? agents : tab === "running" ? agents.filter(a => a.status === "Running") : agents.filter(a => a.status === "Paused");
  return (
    <div style={{ padding: "22px 28px", overflow: "auto", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 4, background: "#F5F6FA", padding: 3, borderRadius: 10 }}>
          {["all","running","paused"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 16px", border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 12, letterSpacing: "-0.01em",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#12192B" : "#8B90A7",
              boxShadow: tab === t ? "0 1px 3px rgba(18,25,43,0.08)" : "none",
              textTransform: "capitalize",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#8B90A7", letterSpacing: "0.1em" }}>
          {filtered.length} {filtered.length === 1 ? "AGENT" : "AGENTS"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(a => <AgentRow key={a.name} agent={a} onOpen={onOpen}/>)}
      </div>
    </div>
  );
}

// Templates picker
function TemplatesScreen() {
  const templates = [
    { name: "Lead Nurture",      category: "TC Firm",          desc: "Auto-follow-up on new leads, with approval checkpoints.", color: "#2BBFAD", tag: "teal", icon: I.mail },
    { name: "Contract Runner",   category: "TC Firm",          desc: "Draft, review, and send transaction coordination docs.", color: "#F6C94E", tag: "yellow", icon: I.file },
    { name: "Seller Outreach",   category: "Creative Finance", desc: "Find distressed sellers, qualify, and book calls.",      color: "#7B52E8", tag: "violet", icon: I.users },
    { name: "Deal Packager",     category: "Creative Finance", desc: "Build deal memos from property + financing inputs.",      color: "#7B52E8", tag: "violet", icon: I.zap },
    { name: "Weekly Pulse",      category: "Admin",            desc: "Sunday-night summary: deals moved, tasks complete.",     color: "#F6C94E", tag: "yellow", icon: I.reports },
    { name: "Compliance Check",  category: "Admin",            desc: "Verify every outbound doc against state rules.",         color: "#2BBFAD", tag: "teal", icon: I.shield },
  ];
  return (
    <div style={{ padding: "22px 28px", overflow: "auto", flex: 1 }}>
      <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#8B90A7", letterSpacing: "0.15em", marginBottom: 14 }}>PRE-BUILT FOR YOUR BUSINESS · 6 TEMPLATES</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {templates.map(t => (
          <div key={t.name} style={{
            background: "#fff", border: "1px solid #E8EAF0", borderRadius: 12,
            padding: "20px 22px", cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(18,25,43,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color + "22", color: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {t.icon}
              </div>
              <Pill color={t.tag}>{t.category}</Pill>
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 16, color: "#12192B", letterSpacing: "-0.02em", marginBottom: 6 }}>{t.name}</div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "#4A5068", lineHeight: 1.55, marginBottom: 16 }}>{t.desc}</div>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 12, color: "#7B52E8", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 4 }}>
              Use template <span style={{ display: "flex" }}>{React.cloneElement(I.arrowRight, { size: 14 })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard
function DashboardScreen() {
  return (
    <div style={{ padding: "22px 28px", overflow: "auto", flex: 1 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
        {[
          { val: "27", lbl: "TASKS HANDLED TODAY", col: "#7B52E8", sub: "+9 vs yesterday" },
          { val: "4",  lbl: "ACTIVE AGENTS",       col: "#2BBFAD", sub: "All healthy" },
          { val: "12", lbl: "DEALS IN PIPELINE",   col: "#F6C94E", sub: "$184k total" },
          { val: "0",  lbl: "ERRORS",              col: "#12192B", sub: "7-day streak" },
        ].map(s => (
          <div key={s.lbl} style={{ background: "#fff", border: "1px solid #E8EAF0", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 32, color: s.col, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "#8B90A7", letterSpacing: "0.12em", marginTop: 8 }}>{s.lbl}</div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#4A5068", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
        <div style={{ background: "#fff", border: "1px solid #E8EAF0", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 15, color: "#12192B", letterSpacing: "-0.02em" }}>Activity feed</div>
            <span style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "#8B90A7", letterSpacing: "0.12em" }}>LIVE</span>
          </div>
          {[
            { t: "2m ago",  a: "Follow-Up Bot",     msg: "Sent reply to Priya Patel", status: "done" },
            { t: "12m ago", a: "Deal Tracker",      msg: "Moved 1407 Winchester to Under Contract", status: "done" },
            { t: "28m ago", a: "Seller Outreach",   msg: "Drafted 6 messages · waiting approval", status: "wait" },
            { t: "1h ago",  a: "Contract Reviewer", msg: "Flagged missing signature on addendum", status: "alert" },
            { t: "2h ago",  a: "Follow-Up Bot",     msg: "Sent reply to Marcus Greene", status: "done" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid #F0F2F8" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                background: r.status === "done" ? "#2BBFAD" : r.status === "alert" ? "#F6C94E" : "#7B52E8" }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "#12192B", lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 500 }}>{r.a}</span> · {r.msg}
                </div>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "#8B90A7", letterSpacing: "0.1em", marginTop: 3 }}>{r.t.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#12192B", borderRadius: 12, padding: "24px 24px", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -10, width: 140, height: 140, borderRadius: "50%", background: "#7B52E8", opacity: 0.18, filter: "blur(40px)" }}/>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: "#F6C94E" }}/>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: "#2BBFAD" }}/>
              <div style={{ width: 20, height: 3, borderRadius: 2, background: "#7B52E8" }}/>
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 24, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 10 }}>
              Your Sunday<br/>pulse is ready.
            </div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, marginBottom: 18, fontWeight: 300 }}>
              27 tasks handled · 4 deals moved · 0 errors. Here's what your agents did this week.
            </div>
            <Button variant="yellow" size="sm" icon={React.cloneElement(I.arrowRight, { size: 14 })}>Read pulse</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AgentsScreen, TemplatesScreen, DashboardScreen });
