// Marketing site components
function Nav() {
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "22px 48px", position: "relative", zIndex: 2,
    }}>
      <CBLogo dark size={32}/>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {["Product", "Templates", "Pricing", "Customers"].map(l => (
          <a key={l} href="#" style={{
            fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 14,
            color: "rgba(255,255,255,0.7)", textDecoration: "none", letterSpacing: "-0.01em",
          }}>{l}</a>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ background: "transparent", border: "none", color: "#fff", fontFamily: "'Bricolage Grotesque'", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Sign in</button>
        <Button variant="yellow" size="sm">Get early access</Button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <div style={{ background: "#12192B", position: "relative", overflow: "hidden", padding: "0 0 96px" }}>
      <div style={{ position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "48px 48px" }}/>
      <div style={{ position: "absolute", top: -60, right: 160, width: 280, height: 280, borderRadius: "50%", background: "#7B52E8", opacity: 0.18, filter: "blur(80px)" }}/>
      <div style={{ position: "absolute", bottom: 60, right: 340, width: 200, height: 200, borderRadius: "50%", background: "#2BBFAD", opacity: 0.14, filter: "blur(60px)" }}/>
      <div style={{ position: "absolute", top: 100, right: 440, width: 140, height: 140, borderRadius: "50%", background: "#F6C94E", opacity: 0.15, filter: "blur(50px)" }}/>
      <Nav/>
      <div style={{ position: "relative", padding: "80px 48px 0", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 60, alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {["#F6C94E", "#2BBFAD", "#7B52E8"].map(c => <div key={c} style={{ width: 36, height: 4, borderRadius: 2, background: c }}/>)}
          </div>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.2em", marginBottom: 18 }}>FOR REAL ESTATE OPERATORS</div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 72, color: "#fff", letterSpacing: "-0.035em", lineHeight: 1.0, margin: 0 }}>
            Your business,<br/><span style={{ color: "#F6C94E" }}>handled.</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans'", fontWeight: 300, fontSize: 18, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "22px 0 32px", maxWidth: 440 }}>
            Pre-built AI agent teams for business operators. Visual, simple, and built for people who want results — not a PhD in AI.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="yellow" icon={I.arrowRight}>Get early access</Button>
            <button style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 14, padding: "12px 22px", borderRadius: 10, cursor: "pointer", letterSpacing: "-0.01em" }}>Watch demo</button>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
            {[
              { n: "2,400+", l: "TASKS HANDLED DAILY" },
              { n: "98.4%", l: "ACCURACY" },
              { n: "$0", l: "ENGINEERS NEEDED" },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 24, color: "#fff", letterSpacing: "-0.025em" }}>{s.n}</div>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Preview card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 40px 80px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 13, color: "#12192B", letterSpacing: "-0.01em" }}>My agents</div>
            <Pill color="teal">4 live</Pill>
          </div>
          {[
            { n: "Follow-Up Bot", s: "Running", p: "teal", c: "TC Firm" },
            { n: "Deal Tracker", s: "Running", p: "violet", c: "Creative Finance" },
            { n: "Seller Outreach", s: "Running", p: "violet", c: "Creative Finance" },
          ].map(a => (
            <div key={a.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "#F5F6FA", borderRadius: 10, marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2BBFAD" }}/>
                <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 12, color: "#12192B", letterSpacing: "-0.01em" }}>{a.n}</span>
              </div>
              <Pill color={a.p}>{a.c}</Pill>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "14px 16px", background: "#12192B", borderRadius: 10, color: "#fff" }}>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "#2BBFAD", letterSpacing: "0.12em", marginBottom: 6 }}>● TASK HANDLED · JUST NOW</div>
            <div style={{ fontFamily: "'DM Sans'", fontSize: 13, lineHeight: 1.5, fontWeight: 300 }}>
              <span style={{ color: "#fff", fontWeight: 500 }}>Follow-Up Bot</span> sent a personalized reply to Priya Patel about the 4-plex on Winchester.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoWall() {
  return (
    <div style={{ padding: "48px 48px", background: "#fff", borderBottom: "1px solid #E8EAF0" }}>
      <div style={{ textAlign: "center", fontFamily: "'DM Mono'", fontSize: 10, color: "#8B90A7", letterSpacing: "0.2em", marginBottom: 24 }}>TRUSTED BY OPERATORS AT</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 52, flexWrap: "wrap" }}>
        {["Mitchell TC", "Greene Capital", "Signal Realty", "North & Co", "Basin Holdings", "Rowan Group"].map(n => (
          <span key={n} style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 18, color: "#8B90A7", letterSpacing: "-0.02em", opacity: 0.7 }}>{n}</span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const feats = [
    { c: "#F6C94E", tag: "yellow", label: "CONTRACTS", title: "Contracts, handled.", desc: "Draft, review, and send every document your business touches. With state-rule checks baked in.", icon: I.file },
    { c: "#7B52E8", tag: "violet", label: "AGENTS",    title: "Agents that show up.", desc: "Niche-built templates for TC firms, creative finance, and admin. Pick one, click run, done.", icon: I.agents },
    { c: "#2BBFAD", tag: "teal",   label: "LIVE",      title: "Status you can trust.", desc: "Every task is visible. Every decision needs your thumbs-up until you say otherwise.", icon: I.check },
  ];
  return (
    <div style={{ padding: "96px 48px", background: "#F5F6FA" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#8B90A7", letterSpacing: "0.2em", marginBottom: 14 }}>WHAT CLIPBOARD DOES</div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 44, color: "#12192B", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, maxWidth: 640, marginInline: "auto" }}>
            A full back office<br/>that runs itself.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {feats.map(f => (
            <div key={f.label} style={{ background: "#fff", border: "1px solid #E8EAF0", borderRadius: 16, padding: "32px 28px" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: f.c + "22", color: f.c, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                {f.icon}
              </div>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: f.c, letterSpacing: "0.2em", marginBottom: 8, fontWeight: 500 }}>{f.label}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 24, color: "#12192B", letterSpacing: "-0.025em", marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 14, color: "#4A5068", lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pricing() {
  const tiers = [
    { name: "Starter", price: "$49", period: "/mo", desc: "For solo operators getting started.", feats: ["2 active agents", "10,000 tasks/mo", "Email support", "Pre-built templates"], cta: "outline", ctaLabel: "Start free trial" },
    { name: "Pro", price: "$149", period: "/mo", desc: "For teams running a real back office.", feats: ["10 active agents", "Unlimited tasks", "Priority support", "Custom triggers", "Approval workflows"], cta: "violet", ctaLabel: "Get Pro", featured: true },
    { name: "Firm", price: "Talk to us", period: "", desc: "For brokerages and multi-office TCs.", feats: ["Unlimited agents", "Multi-workspace", "Dedicated success", "SSO + audit log", "SLA"], cta: "outline", ctaLabel: "Book a call" },
  ];
  return (
    <div style={{ padding: "96px 48px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#8B90A7", letterSpacing: "0.2em", marginBottom: 14 }}>PRICING</div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 44, color: "#12192B", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}>
            Simple pricing.<br/>Priced per seat, not per magic.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {tiers.map(t => (
            <div key={t.name} style={{
              background: t.featured ? "#12192B" : "#fff",
              border: t.featured ? "none" : "1px solid #E8EAF0",
              borderRadius: 16, padding: "32px 28px", position: "relative",
              color: t.featured ? "#fff" : "#12192B",
            }}>
              {t.featured && <div style={{ position: "absolute", top: -10, right: 24, background: "#F6C94E", color: "#12192B", fontFamily: "'DM Mono'", fontSize: 9, letterSpacing: "0.15em", padding: "5px 10px", borderRadius: 999, fontWeight: 500 }}>MOST POPULAR</div>}
              <div style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", marginBottom: 8 }}>{t.name}</div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: t.featured ? "rgba(255,255,255,0.55)" : "#8B90A7", fontWeight: 300, marginBottom: 24, lineHeight: 1.5 }}>{t.desc}</div>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 24 }}>
                <span style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 44, letterSpacing: "-0.03em", lineHeight: 1 }}>{t.price}</span>
                <span style={{ fontFamily: "'DM Sans'", fontSize: 14, color: t.featured ? "rgba(255,255,255,0.5)" : "#8B90A7", marginLeft: 4 }}>{t.period}</span>
              </div>
              <div style={{ marginBottom: 28 }}>
                {t.feats.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontFamily: "'DM Sans'", fontSize: 13, color: t.featured ? "rgba(255,255,255,0.85)" : "#12192B" }}>
                    <span style={{ color: t.featured ? "#F6C94E" : "#2BBFAD", display: "flex" }}>{React.cloneElement(I.check, { size: 14 })}</span>
                    {f}
                  </div>
                ))}
              </div>
              <button style={{
                width: "100%",
                background: t.cta === "violet" ? "#F6C94E" : (t.featured ? "rgba(255,255,255,0.1)" : "transparent"),
                color: t.cta === "violet" ? "#12192B" : (t.featured ? "#fff" : "#12192B"),
                border: t.featured && t.cta !== "violet" ? "1px solid rgba(255,255,255,0.15)" : (t.cta !== "violet" ? "1.5px solid #E8EAF0" : "none"),
                fontFamily: "'Bricolage Grotesque'", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em",
                padding: "14px", borderRadius: 10, cursor: "pointer",
              }}>{t.ctaLabel}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTABand() {
  return (
    <div style={{ padding: "80px 48px", background: "#12192B", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, borderRadius: "50%", background: "#7B52E8", opacity: 0.2, filter: "blur(100px)" }}/>
      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
          {["#F6C94E", "#2BBFAD", "#7B52E8"].map(c => <div key={c} style={{ width: 28, height: 4, borderRadius: 2, background: c }}/>)}
        </div>
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 56, color: "#fff", letterSpacing: "-0.035em", lineHeight: 1.02, margin: "0 0 20px" }}>
          Stop managing tasks.<br/><span style={{ color: "#F6C94E" }}>Start closing deals.</span>
        </h2>
        <p style={{ fontFamily: "'DM Sans'", fontWeight: 300, fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 480, marginInline: "auto" }}>
          Join the waitlist. We're onboarding new firms every Friday.
        </p>
        <Button variant="yellow" icon={I.arrowRight}>Get early access</Button>
      </div>
    </div>
  );
}

function Footer() {
  const cols = [
    ["Product", ["Features", "Templates", "Pricing", "Changelog"]],
    ["Resources", ["Docs", "Help center", "API", "Blog"]],
    ["Company", ["About", "Customers", "Careers", "Contact"]],
  ];
  return (
    <footer style={{ background: "#0D1120", padding: "48px 48px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48 }}>
        <div>
          <CBLogo dark size={32}/>
          <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 14, maxWidth: 280, lineHeight: 1.55, fontWeight: 300 }}>
            Pre-built AI agent teams for business operators. Your business, handled.
          </p>
        </div>
        {cols.map(([h, items]) => (
          <div key={h}>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em", marginBottom: 14, fontWeight: 500 }}>{h.toUpperCase()}</div>
            {items.map(i => <a key={i} href="#" style={{ display: "block", fontFamily: "'DM Sans'", fontSize: 13, color: "rgba(255,255,255,0.75)", textDecoration: "none", padding: "4px 0", fontWeight: 400 }}>{i}</a>)}
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 40, paddingTop: 24, display: "flex", justifyContent: "space-between", maxWidth: 1200, margin: "40px auto 0" }}>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>© 2025 CLIPBOARD INC.</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["#F6C94E", "#2BBFAD", "#7B52E8"].map(c => <div key={c} style={{ width: 16, height: 3, borderRadius: 2, background: c }}/>)}
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Hero, LogoWall, Features, Pricing, CTABand, Footer });
