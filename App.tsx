import { useState, useCallback } from "react";
import "./App.css";

type DiffPart = {
  text: string;
  type: "equal" | "added" | "removed";
};

function computeDiff(oldText: string, newText: string): DiffPart[] {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  const m = oldWords.length;
  const n = newWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const ops: Array<{ type: "equal" | "added" | "removed"; text: string }> = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      ops.push({ type: "equal", text: oldWords[i - 1] }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: "added", text: newWords[j - 1] }); j--;
    } else {
      ops.push({ type: "removed", text: oldWords[i - 1] }); i--;
    }
  }
  ops.reverse();
  const parts: DiffPart[] = [];
  for (const op of ops) {
    if (parts.length > 0 && parts[parts.length - 1].type === op.type)
      parts[parts.length - 1].text += op.text;
    else parts.push({ ...op });
  }
  return parts;
}

function DiffView({ parts, side }: { parts: DiffPart[]; side: "left" | "right" }) {
  return (
    <div style={{ flex: 1, padding: "20px 22px", fontSize: 15, lineHeight: 1.75, color: "#1e2d4a", overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {parts.map((part, idx) => {
        if (part.type === "equal") return <span key={idx}>{part.text}</span>;
        if (side === "left" && part.type === "removed")
          return <span key={idx} style={{ background: "rgba(239,68,68,0.15)", color: "#b91c1c", borderRadius: 3, padding: "0 2px", textDecoration: "line-through", fontWeight: 500 }}>{part.text}</span>;
        if (side === "right" && part.type === "added")
          return <span key={idx} style={{ background: "rgba(34,197,94,0.15)", color: "#15803d", borderRadius: 3, padding: "0 2px", fontWeight: 500 }}>{part.text}</span>;
        return null;
      })}
    </div>
  );
}

export default function App() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffParts, setDiffParts] = useState<DiffPart[] | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCompare = useCallback(() => {
    if (!leftText.trim() && !rightText.trim()) return;
    setIsComparing(true);
    setHasCompared(true);
    setProgress(0);
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);
    setTimeout(() => {
      setDiffParts(computeDiff(leftText, rightText));
      setIsComparing(false);
      setProgress(0);
    }, 700);
  }, [leftText, rightText]);

  const handleSwap = () => { setLeftText(rightText); setRightText(leftText); setDiffParts(null); };
  const handleReset = () => { setLeftText(""); setRightText(""); setDiffParts(null); setHasCompared(false); };
  const hasContent = leftText.trim() || rightText.trim();

  return (
    <>
      <div className="layout">
        <aside className="sidebar">
          <div className="logo-wrap">
            <img src="/src/logo/engram_logo.png" alt="ENAGRAM" style={{ width: 42.65, height: 44, objectFit: 'contain' }} />
            <span className="logo-text">ENAGRAM</span>
          </div>
          
          <button className="page-selector" >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>
          </button>

          <nav className="nav">
            {[
              { label: "მართლმწერი", active: false, icon: <svg width="29" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="8.5" y="12.5" textAnchor="middle" fontSize="4" fontWeight="600" fontFamily="Arial, sans-serif" fill="currentColor">ABC</text>
                <path d="M6 16L10 19L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg> },
              { label: "ტექსტის შედარება", active: true, icon: <svg width="29" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16L7 6L10 16M5.5 12H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 13C14 11.9 14.9 11 16 11H17C18.1 11 19 11.9 19 13V14C19 15.1 18.1 16 17 16H16C14.9 16 14 15.1 14 14V13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="19" y1="11" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="4" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="4" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg> },
              { label: "ხმა → ტექსტი", active: false, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> },
              { label: "ტექსტი → ხმა", active: false, icon: <svg width="29" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "-4px" }}>
                <line x1="3" y1="8" x2="3" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="7" y1="5" x2="7" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="11" y1="7" x2="11" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="15" y1="5.5" x2="15" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="19" y1="9" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg> },
              { label: "PDF კონვერტაცია", active: false, icon: <svg width="29" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "-8px" }}>
                <rect x="5" y="10" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="8" y="5" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="10" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg> },
            ].map(({ label, active, icon }) => (
              <button key={label} className={`nav-item${active ? " active" : ""}`}>
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="avatar">TO</div>
            <span className="user-name">თამარ ონიანი</span>
            <span className="user-options">...</span>
          </div>
        </aside>

        <main className="main">
          <div className="tablet-current-page" style={{ display: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>
            ტექსტის შედარება
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          
          <div className="mobile-controls">
            <select className="lang-select">
              <option>ქართული</option>
              <option>English</option>
              <option>Русский</option>
            </select>
            <label className="format-toggle">
              <div className="chk-box" />
              ფორმატის შენარჩუნება
            </label>
            <button className={`btn-new ${hasCompared ? 'active' : ''}`} onClick={handleReset}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>ახლის გახსნა</span>
            </button>
          </div>
          
          <div className="topbar topbar-desktop">
            <select className="lang-select">
              <option>ქართული</option>
              <option>English</option>
              <option>Русский</option>
            </select>
            <label className="format-toggle">
              <div className="chk-box" />
              ფორმატის შენარჩუნება
            </label>
            <div className="topbar-spacer" />
            <button className={`btn-new ${hasCompared ? 'active' : ''}`} onClick={handleReset}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>ახლის გახსნა</span>
            </button>
          </div>

          <div className="content">
            {isComparing ? (
              <div className="loading-wrap">
                <div className="loading-card">
                  <div className="spinner" />
                  <div className="loading-label">Converting... Thank you For your Patience</div>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                  <div className="loading-percent">{Math.min(progress, 100)}%</div>
                </div>
              </div>
            ) : (
              <>
                {diffParts && (
                  <div className="stats">
                    {(() => {
                      const count = (type: string) => diffParts.filter(p => p.type === type).map(p => p.text.trim().split(/\s+/).filter(Boolean).length).reduce((a, b) => a + b, 0);
                      return (
                        <>
                          <span className="chip chip-red">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            {count("removed")} წაშლილი
                          </span>
                          <span className="chip chip-green">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            {count("added")} დამატებული
                          </span>
                          <span className="chip chip-blue">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/></svg>
                            {count("equal")} უცვლელი
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="panels-row">
                  <div className="panel">
                    {diffParts
                      ? <DiffView parts={diffParts} side="left" />
                      : <textarea value={leftText} onChange={e => setLeftText(e.target.value)} placeholder="დაიწყე წერა..." />
                    }
                  </div>

                  <div className="swap-col">
                    <div className="swap-btn" onClick={handleSwap} title="Swap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                    </div>
                  </div>

                  <div className="panel">
                    {diffParts
                      ? <DiffView parts={diffParts} side="right" />
                      : <textarea value={rightText} onChange={e => setRightText(e.target.value)} placeholder="დაიწყე წერა..." />
                    }
                  </div>
                </div>
              </>
            )}

            <div className="actions">
              {diffParts && <button className="btn-clear" onClick={handleReset}>გასუფთავება</button>}
              <button className="btn-compare" onClick={handleCompare} disabled={!hasContent || isComparing}>
                {isComparing
                  ? <><div className="spinner" style={{ width: 17, height: 17, borderWidth: 2 }} />შედარება...</>
                  : <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
                      </svg>
                      შედარება
                    </>
                }
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
