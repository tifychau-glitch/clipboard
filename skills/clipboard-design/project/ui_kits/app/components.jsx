// App UI components — sidebar, topbar, agent rows, composer
const { useState: useStateA } = React;

function Sidebar({ active, setActive }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: I.dashboard },
    { id: "agents",    label: "My agents", icon: I.agents, accent: "#2BBFAD", count: 4 },
    { id: "templates", label: "Templates", icon: I.templates },
    { id: "deals",     label: "Deals",     icon: I.deals, accent: "#F6C94E" },
    { id: "reports",   label: "Reports",   icon: I.reports },
    { id: "settings",  label: "Settings",  icon: I.settings },
  ];
  return (
    <aside style={{
      background: "#12192B", width: 232, padding: "22px 14px",
      display: "flex", flexDirection: "column", gap: 2,
      borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
    }}>
      <div style={{ padding: "0 6px 22px" }}>
        <CBLogo dark size={28}/>
      </div>
      {items.map(it => {
        const isActive = it.id === active;
        return (
          <div key={it.id} onClick={() => setActive(it.id)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "9px 10px", borderRadius: 8,
            background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
            cursor: "pointer", transition: "background 0.15s",
          }}>
            <span style={{
              display: "flex", alignItems: "center", gap: 10,
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: isActive ? 700 : 500,
              fontSize: 13, letterSpacing: "-0.01em",
              color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
            }}>
              <span style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.45)", display: "flex" }}>{it.icon}</span>
              {it.label}
            </span>
            {it.accent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: it.accent }}/>}
            {it.count && <span style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{it.count}</span>}
          </div>
        );
      })}
      <div style={{ flex: 1 }}/>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 8px", borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
      }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F6C94E", color: "#12192B", fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>JM</div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 12, color: "#fff", letterSpacing: "-0.01em" }}>Jamie Mitchell</div>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Mitchell TC · Pro</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, action }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 28px", borderBottom: "1px solid #E8EAF0", background: "#fff",
    }}>
      <div>
        <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 22, color: "#12192B", letterSpacing: "-0.025em" }}>{title}</div>
        {subtitle && <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "#8B90A7", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button style={{ background: "#F5F6FA", border: "none", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#12192B", cursor: "pointer" }}>{I.search}</button>
        <button style={{ background: "#F5F6FA", border: "none", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#12192B", cursor: "pointer", position: "relative" }}>
          {I.bell}
          <span style={{ position: "absolute", top: 8, right: 9, width: 6, height: 6, borderRadius: "50%", background: "#F6C94E" }}/>
        </button>
        {action}
      </div>
    </div>
  );
}

function AgentRow({ agent, onOpen }) {
  const pillColor = agent.category === "TC Firm" ? "teal" : agent.category === "Creative Finance" ? "violet" : "yellow";
  return (
    <div onClick={() => onOpen && onOpen(agent)} style={{
      background: "#fff", border: "1px solid #E8EAF0", borderRadius: 10,
      padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "box-shadow 0.15s", cursor: "pointer",
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(18,25,43,0.08)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: agent.status === "Running" ? "#2BBFAD" : "#8B90A7", flexShrink: 0 }}/>
        <div>
          <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 13, color: "#12192B", letterSpacing: "-0.01em" }}>{agent.name}</div>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#8B90A7", marginTop: 2 }}>Last run {agent.lastRun} · {agent.tasks} tasks</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Pill color={pillColor}>{agent.category}</Pill>
        <span style={{ fontFamily: "'DM Mono'", fontSize: 9, color: agent.status === "Running" ? "#2BBFAD" : "#8B90A7", letterSpacing: "0.1em" }}>
          {agent.status.toUpperCase()}
        </span>
        <span style={{ color: "#8B90A7", display: "flex" }}>{I.chevron}</span>
      </div>
    </div>
  );
}

function AgentDetail({ agent, onClose }) {
  const steps = [
    { id: 1, label: "New lead detected in Gmail", status: "done", time: "09:41" },
    { id: 2, label: "Lead data enriched from public sources", status: "done", time: "09:41" },
    { id: 3, label: "Personalized reply drafted", status: "done", time: "09:42" },
    { id: 4, label: "Waiting for your approval", status: "active", time: "now" },
    { id: 5, label: "Send email + log to CRM", status: "pending", time: "" },
  ];
  return (
    <div style={{ padding: "24px 28px", overflow: "auto", flex: 1 }}>
      <button onClick={onClose} style={{
        fontFamily: "'DM Mono'", fontSize: 10, color: "#8B90A7", letterSpacing: "0.1em",
        background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 14,
      }}>← BACK TO AGENTS</button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "#12192B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CBMark size={30} dark/>
          </div>
          <div>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 24, color: "#12192B", letterSpacing: "-0.025em" }}>{agent.name}</div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "#8B90A7", marginTop: 2 }}>{agent.category} · Created 3 days ago</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" size="sm" icon={I.pause}>Pause</Button>
          <Button variant="violet" size="sm" icon={I.sparkle}>Run now</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { val: "14", lbl: "TASKS TODAY", col: "#7B52E8" },
          { val: "98%", lbl: "SUCCESS RATE", col: "#2BBFAD" },
          { val: "2m", lbl: "LAST RUN", col: "#F6C94E" },
          { val: "$4.2k", lbl: "PIPELINE MOVED", col: "#12192B" },
        ].map(s => (
          <div key={s.lbl} style={{ background: "#fff", border: "1px solid #E8EAF0", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 24, color: s.col, letterSpacing: "-0.025em" }}>{s.val}</div>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "#8B90A7", letterSpacing: "0.12em", marginTop: 4 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <div style={{ background: "#fff", border: "1px solid #E8EAF0", borderRadius: 12, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 14, color: "#12192B", letterSpacing: "-0.01em" }}>Current run</div>
            <span style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "#2BBFAD", letterSpacing: "0.12em" }}>● IN PROGRESS</span>
          </div>
          {steps.map((s, i) => (
            <div key={s.id} style={{ display: "flex", gap: 12, paddingBottom: i === steps.length - 1 ? 0 : 12, position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: s.status === "done" ? "#2BBFAD" : s.status === "active" ? "#7B52E8" : "#F5F6FA",
                  border: s.status === "pending" ? "1px solid #E8EAF0" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                }}>
                  {s.status === "done" && <span style={{ display: "flex" }}>{React.cloneElement(I.check, { size: 12 })}</span>}
                  {s.status === "active" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.4s ease infinite" }}/>}
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, width: 1, background: "#E8EAF0", marginTop: 4 }}/>}
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: s.status === "active" ? 500 : 400, color: s.status === "pending" ? "#8B90A7" : "#12192B" }}>{s.label}</div>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "#8B90A7", letterSpacing: "0.1em", marginTop: 2 }}>{s.time && s.time.toUpperCase()}</div>
              </div>
            </div>
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        </div>

        <div style={{ background: "#12192B", borderRadius: 12, padding: "20px 22px", color: "#fff" }}>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", marginBottom: 10 }}>DRAFT PREVIEW</div>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.65, fontWeight: 300 }}>
            Hi Priya,<br/><br/>
            Saw your inquiry about the 4-plex on Winchester. I put together a quick breakdown on creative finance options that might fit — subject-to and seller carry both pencil here.<br/><br/>
            Want to jump on a 15-min call tomorrow?
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
            <Button variant="yellow" size="sm" icon={React.cloneElement(I.check, { size: 14 })}>Approve &amp; send</Button>
            <button style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 12, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}>Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, TopBar, AgentRow, AgentDetail });
