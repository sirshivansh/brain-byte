import { useState, useEffect, useRef } from "react";
import AttackTimeline from "./components/AttackTimeline";

const RISK_META = {
  critical: { color: "#ff4d4d", bg: "rgba(255,77,77,0.10)", glow: "0 0 12px rgba(255,77,77,0.35)", label: "CRITICAL", dot: "#ff4d4d" },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.10)", glow: "0 0 12px rgba(249,115,22,0.3)", label: "HIGH",     dot: "#f97316" },
  medium:   { color: "#eab308", bg: "rgba(234,179,8,0.10)",  glow: "0 0 12px rgba(234,179,8,0.3)",  label: "MEDIUM",   dot: "#eab308" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.10)",  glow: "0 0 12px rgba(34,197,94,0.3)",  label: "LOW",      dot: "#22c55e" },
  all:      { color: "#38bdf8", bg: "rgba(56,189,248,0.10)", glow: "0 0 12px rgba(56,189,248,0.3)", label: "ALL",      dot: "#38bdf8" },
};

function getCVSS(risk) {
  return { critical: 9.8, high: 8.2, medium: 5.6, low: 3.1 }[risk] ?? 0;
}
function getEPSS(risk) {
  return { critical: 0.92, high: 0.75, medium: 0.48, low: 0.21 }[risk] ?? 0;
}
function enrichMITRE(mitre) {
  if (typeof mitre === "string") {
    if (mitre.includes("T1110")) return { technique: "T1110", subtechnique: "T1110.003", name: "Password Spraying" };
    if (mitre.includes("T1190")) return { technique: "T1190", subtechnique: "T1190.001", name: "Exploit Public-Facing App" };
    if (mitre.includes("T1020")) return { technique: "T1020", subtechnique: "T1020.001", name: "Automated Exfiltration" };
  }
  return mitre;
}

/* ── Noise SVG background (data-uri, no network) ── */
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

/* ── Scan-line overlay ── */
const SCANLINES = `repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0,255,200,0.012) 2px,
  rgba(0,255,200,0.012) 4px
)`;

export default function App() {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [query, setQuery]                   = useState("");
  const [aiResponse, setAiResponse]         = useState("");
  const [toast, setToast]                   = useState(null);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [isLoading, setIsLoading]           = useState(false);
  const [activeFilter, setActiveFilter]     = useState("all");
  const [inputFocused, setInputFocused]     = useState(false);
  const aiPanelRef = useRef(null);

  /* ── sample data ── */
  useEffect(() => {
    const raw = [
      { timestamp: "2026-04-03 14:05:12", source: "firewall", description: "Port scan detected on port 3389", mitre: "T1190 - Exploit Public-Facing Application", risk: "high",     ip: "192.168.1.45" },
      { timestamp: "2026-04-03 14:07:33", source: "auth",     description: "5 failed login attempts",          mitre: "T1110 - Brute Force",                      risk: "critical", ip: "192.168.1.45", user: "admin" },
      { timestamp: "2026-04-03 14:12:09", source: "cloud",    description: "Successful login + data export",   mitre: "T1020 - Automated Exfiltration",           risk: "critical", ip: "192.168.1.45", user: "admin" },
    ];
    setTimelineEvents(raw.map(e => ({ ...e, cvss: getCVSS(e.risk), epss: getEPSS(e.risk), mitre: enrichMITRE(e.mitre) })));
  }, []);

  /* ── typing effect ── */
  useEffect(() => {
    if (!aiResponse) { setDisplayedResponse(""); return; }
    let i = 0;
    const t = setInterval(() => {
      setDisplayedResponse(aiResponse.substring(0, i + 1));
      i++;
      if (i >= aiResponse.length) clearInterval(t);
    }, 15);
    return () => clearInterval(t);
  }, [aiResponse]);

  /* ── scroll ai panel on new text ── */
  useEffect(() => {
    if (aiPanelRef.current) aiPanelRef.current.scrollTop = aiPanelRef.current.scrollHeight;
  }, [displayedResponse]);

  const handleAskSecureAI = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setAiResponse("");
    try {
      const res  = await fetch("/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: query }) });
      const data = await res.json();
      if (data.timeline) {
        setTimelineEvents(data.timeline.map(e => ({ ...e, cvss: e.cvss ?? getCVSS(e.risk), epss: e.epss ?? getEPSS(e.risk), mitre: enrichMITRE(e.mitre) })));
      }
      setAiResponse(data.response || data.message || "");
      setQuery("");
    } catch {
      setAiResponse("⚠️ Server error. Is backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (actionType, details) => {
    setToast(`${actionType} executed for ${details}`);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredEvents = activeFilter === "all" ? timelineEvents : timelineEvents.filter(e => e.risk === activeFilter);

  const counts = ["critical","high","medium","low"].reduce((acc, r) => {
    acc[r] = timelineEvents.filter(e => e.risk === r).length;
    return acc;
  }, {});

  return (
      <div style={{
        height: "100vh",                    // Changed from minHeight
        background: "#050d12",
        backgroundImage: `${SCANLINES}, ${NOISE}`,
        color: "#e2eaf0",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",                 // Keep this
      }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Syne:wght@700;800&display=swap');

        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.25); border-radius: 2px; }

        .filter-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px; border-radius: 6px;
          border: 1px solid transparent;
          background: transparent; color: #7a92a3;
          font-family: inherit; font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; cursor: pointer; width: 100%;
          transition: all 0.18s ease; text-align: left;
        }
        .filter-btn:hover { background: rgba(255,255,255,0.04); color: #c8dde8; }
        .filter-btn.active { background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); color: #e2eaf0; }

        .ask-input {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 8px; padding: 10px 16px;
          color: #e2eaf0; font-family: inherit; font-size: 13px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ask-input:focus { border-color: rgba(56,189,248,0.55); box-shadow: 0 0 0 3px rgba(56,189,248,0.08); }
        .ask-input::placeholder { color: #3d5566; }

        .analyze-btn {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          border: none; border-radius: 8px; padding: 10px 22px;
          color: #020d14; font-family: inherit; font-size: 12px; font-weight: 700;
          letter-spacing: 0.06em; cursor: pointer;
          transition: opacity 0.18s, transform 0.12s;
          white-space: nowrap;
        }
        .analyze-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .analyze-btn:active:not(:disabled) { transform: translateY(0); }
        .analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scanIn { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0% 0 0); } }

        .ai-response-text {
          font-size: 12.5px; line-height: 1.75; color: #94b8c9;
          white-space: pre-wrap; word-break: break-word;
          animation: fadeSlideUp 0.3s ease;
        }

        .badge {
          display: inline-block; padding: 2px 7px; border-radius: 4px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
        }

        .grid-stat {
          display: flex; flex-direction: column; gap: 2px;
          padding: 10px 14px; border-radius: 8px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .separator {
          height: 1px; background: rgba(255,255,255,0.06); margin: 0;
        }

        .glow-accent {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }

        .header-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 18px;
          background: linear-gradient(90deg, #38bdf8, #06b6d4, #22d3ee);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: -0.01em;
        }

        .status-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
          animation: pulse-dot 2s ease infinite;
          box-shadow: 0 0 6px rgba(34,197,94,0.6);
        }

        .panel-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
          color: #3d5566; text-transform: uppercase; margin-bottom: 14px;
        }

                /* ── Improved Scrollbars ── */
        main::-webkit-scrollbar,
        aside::-webkit-scrollbar {
          width: 6px;
        }

        main::-webkit-scrollbar-track,
        aside::-webkit-scrollbar-track {
          background: transparent;
        }

        main::-webkit-scrollbar-thumb,
        aside::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.35);
          border-radius: 3px;
        }

        main::-webkit-scrollbar-thumb:hover,
        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.55);
        }

        /* Smooth scrolling */
        main {
          scroll-behavior: smooth;
        }

        /* Optional: Make left sidebar scrollbar thinner */
        aside {
          scrollbar-width: thin;
          scrollbar-color: rgba(56,189,248,0.35) transparent;
        }

                /* Prevent unwanted horizontal scroll */
        body, html, #root {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

      `}</style>

      {/* ── GLOW ACCENTS ── */}
      <div className="glow-accent" style={{ width: 400, height: 400, background: "rgba(6,182,212,0.06)", top: -100, left: -80 }} />
      <div className="glow-accent" style={{ width: 300, height: 300, background: "rgba(56,189,248,0.04)", bottom: 0, right: 200 }} />

      {/* ══════════════ HEADER ══════════════ */}
      <header style={{
        borderBottom: "1px solid rgba(56,189,248,0.1)",
        background: "rgba(5,13,18,0.85)",
        backdropFilter: "blur(12px)",
        padding: "0 24px",
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 20, zIndex: 10, position: "relative", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M13 2L4 7v6c0 5.25 3.85 10.16 9 11.35C18.15 23.16 22 18.25 22 13V7L13 2z" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1.2"/>
            <path d="M9 13l3 3 5-5" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="header-logo-text">SecureAI</span>
          <span style={{ fontSize: 11, color: "#3d5566", fontWeight: 600, letterSpacing: "0.08em" }}>CO-PILOT</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
            <div className="status-dot" />
            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, letterSpacing: "0.1em" }}>LIVE</span>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ display: "flex", gap: 10, flex: 1, maxWidth: 560 }}>
          <input
            className="ask-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAskSecureAI()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask SecureAI... (e.g. 'Summarize the attack chain')"
          />
          <button className="analyze-btn" onClick={handleAskSecureAI} disabled={isLoading || !query.trim()}>
            {isLoading ? "ANALYZING..." : "ANALYZE ↗"}
          </button>
        </div>

        {/* Event count pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "#3d5566", letterSpacing: "0.06em" }}>EVENTS</span>
          <span style={{ background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700, color: "#38bdf8" }}>
            {timelineEvents.length}
          </span>
        </div>
      </header>

        {/* ══════════════ BODY ══════════════ */}
        <div style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",           // Keep this on the flex container
          position: "relative"
        }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{
          width: 200, flexShrink: 0,
          borderRight: "1px solid rgba(56,189,248,0.08)",
          background: "rgba(5,13,18,0.6)",
          padding: "20px 14px",
          display: "flex", flexDirection: "column", gap: 4,
          overflowY: "auto",
        }}>
          <div className="panel-label">Risk Filter</div>

          {["all", "critical", "high", "medium", "low"].map(r => {
            const m = RISK_META[r];
            const count = r === "all" ? timelineEvents.length : counts[r] ?? 0;
            return (
              <button
                key={r}
                className={`filter-btn${activeFilter === r ? " active" : ""}`}
                onClick={() => setActiveFilter(r)}
                style={activeFilter === r ? { borderColor: m.color + "40", color: m.color } : {}}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: m.dot, flexShrink: 0, boxShadow: activeFilter === r ? `0 0 6px ${m.dot}` : "none" }} />
                <span style={{ flex: 1 }}>{m.label}</span>
                <span style={{ fontSize: 10, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "1px 7px", color: "#5a7a8a" }}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="separator" style={{ margin: "16px 0 14px" }} />
          <div className="panel-label">Summary</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["critical","high","medium","low"].map(r => {
              const m = RISK_META[r];
              const n = counts[r] ?? 0;
              const pct = timelineEvents.length ? Math.round((n / timelineEvents.length) * 100) : 0;
              return (
                <div key={r} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3d5566" }}>
                    <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
                    <span>{n}</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: m.color, borderRadius: 2, transition: "width 0.4s ease", boxShadow: n > 0 ? `0 0 6px ${m.color}80` : "none" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

{/* ── MAIN TIMELINE ── */}
<main style={{
  flex: 1,
  overflowY: "auto",
  padding: "24px 28px",
  minWidth: 0,
  scrollBehavior: "smooth"
}}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#e2eaf0", letterSpacing: "0.06em" }}>
        ATTACK TIMELINE
      </h2>
      <p style={{ margin: "3px 0 0", fontSize: 11, color: "#3d5566" }}>
        {filteredEvents.length === 0 ? "No events" : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""}`} 
        {activeFilter === "all" ? "showing all" : `filtered by ${activeFilter}`}
      </p>
    </div>

    <div style={{ display: "flex", gap: 8 }}>
      {counts.critical > 0 && (
        <span className="badge" style={{ background: "rgba(255,77,77,0.12)", color: "#ff4d4d", border: "1px solid rgba(255,77,77,0.25)" }}>
          {counts.critical} CRITICAL
        </span>
      )}
      {counts.high > 0 && (
        <span className="badge" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)" }}>
          {counts.high} HIGH
        </span>
      )}
    </div>
  </div>

  {/* Show message when no events */}
  {filteredEvents.length === 0 ? (
    <div style={{
      height: "70vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#3d5566",
      textAlign: "center",
      padding: "40px"
    }}>
      <div style={{
        fontSize: "48px",
        marginBottom: "16px",
        opacity: 0.3
      }}>
        📭
      </div>
      <h3 style={{ 
        fontSize: "15px", 
        fontWeight: 600, 
        color: "#64748b", 
        marginBottom: "8px",
        letterSpacing: "0.5px"
      }}>
        No events present
      </h3>
      <p style={{ 
        fontSize: "12.5px", 
        maxWidth: "280px", 
        lineHeight: 1.5 
      }}>
        {activeFilter === "all" 
          ? "No attack events detected yet. Ask SecureAI to analyze or load new data." 
          : `No ${activeFilter} risk events found with current filter.`}
      </p>

      {activeFilter !== "all" && (
        <button
          onClick={() => setActiveFilter("all")}
          style={{
            marginTop: "24px",
            padding: "8px 20px",
            background: "rgba(56,189,248,0.1)",
            color: "#38bdf8",
            border: "1px solid rgba(56,189,248,0.3)",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Show All Events
        </button>
      )}
    </div>
  ) : (
    <AttackTimeline events={filteredEvents} onAction={handleAction} />
  )}
</main>

        {/* ── RIGHT AI PANEL ── */}
        <aside style={{
          width: 300, flexShrink: 0,
          borderLeft: "1px solid rgba(56,189,248,0.08)",
          background: "rgba(5,13,18,0.6)",
          display: "flex", flexDirection: "column",
          overflowY: "hidden",
        }}>
          {/* panel header */}
          <div style={{
            padding: "16px 18px 14px",
            borderBottom: "1px solid rgba(56,189,248,0.08)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="#06b6d4" strokeWidth="1.2"/>
              <path d="M5 7.5h5M7.5 5v5" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "#3d5566" }}>AI INVESTIGATION</span>
            {isLoading && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 3, alignItems: "center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: "50%", background: "#06b6d4",
                    animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite`,
                  }}/>
                ))}
              </div>
            )}
          </div>

          {/* response area */}
          <div ref={aiPanelRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
            {displayedResponse ? (
              <div className="ai-response-text">{displayedResponse}</div>
            ) : isLoading ? (
              <div style={{ fontSize: 12, color: "#3d5566", fontStyle: "italic" }}>Analyzing threat data...</div>
            ) : (
              <div style={{ fontSize: 12, color: "#2a3d49", lineHeight: 1.7 }}>
                <div style={{ marginBottom: 12, color: "#3d5566" }}>Ready for investigation.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "Summarize the attack chain",
                    "What is the risk of T1110?",
                    "Recommend containment steps",
                  ].map(hint => (
                    <button
                      key={hint}
                      onClick={() => { setQuery(hint); }}
                      style={{
                        background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.12)",
                        borderRadius: 6, padding: "7px 11px", color: "#3d6678",
                        fontFamily: "inherit", fontSize: 11, cursor: "pointer",
                        textAlign: "left", transition: "all 0.15s", lineHeight: 1.4,
                      }}
                      onMouseEnter={e => { e.target.style.background = "rgba(56,189,248,0.1)"; e.target.style.color = "#7ab8cc"; }}
                      onMouseLeave={e => { e.target.style.background = "rgba(56,189,248,0.05)"; e.target.style.color = "#3d6678"; }}
                    >
                      ↗ {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* quick stats footer */}
          <div style={{
            borderTop: "1px solid rgba(56,189,248,0.08)",
            padding: "14px 18px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
          }}>
            {[
              { label: "CVSS MAX", value: timelineEvents.length ? Math.max(...timelineEvents.map(e => e.cvss ?? 0)).toFixed(1) : "—", color: "#ff4d4d" },
              { label: "EPSS MAX", value: timelineEvents.length ? (Math.max(...timelineEvents.map(e => e.epss ?? 0)) * 100).toFixed(0) + "%" : "—", color: "#f97316" },
              { label: "SOURCES",  value: [...new Set(timelineEvents.map(e => e.source))].length || "—", color: "#38bdf8" },
              { label: "IPs",      value: [...new Set(timelineEvents.map(e => e.ip).filter(Boolean))].length || "—", color: "#22c55e" },
            ].map(s => (
              <div key={s.label} className="grid-stat">
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#2a3d49" }}>{s.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ══════════════ TOAST ══════════════ */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28,
          background: "rgba(5,13,18,0.95)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 10, padding: "12px 18px",
          display: "flex", alignItems: "center", gap: 10,
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 20px rgba(34,197,94,0.15)",
          animation: "fadeSlideUp 0.25s ease",
          zIndex: 100,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.7)" }} />
          <span style={{ fontSize: 12, color: "#94b8c9", fontWeight: 500 }}>{toast}</span>
        </div>
      )}
    </div>
  );
}