import { useState, useCallback } from "react";

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

  const handleCompare = useCallback(() => {
    if (!leftText.trim() && !rightText.trim()) return;
    setIsComparing(true);
    setHasCompared(true);
    setTimeout(() => {
      setDiffParts(computeDiff(leftText, rightText));
      setIsComparing(false);
    }, 700);
  }, [leftText, rightText]);

  const handleSwap = () => { setLeftText(rightText); setRightText(leftText); setDiffParts(null); };
  const handleReset = () => { setLeftText(""); setRightText(""); setDiffParts(null); };
  const hasContent = leftText.trim() || rightText.trim();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        #root {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          text-align: left;
        }

        :root {
          --bg: white;
          --sidebar-bg: #111d33;
          --sidebar-w: 230px;
          --border: rgba(255,255,255,0.07);
          --accent: #4b7bff;
          --accent-hover: #3a6aee;
          --text: #dde5f8;
          --muted: #6a7da8;
          --panel-bg: #f0f4fc;
          --panel-bg2: #e8eefa;
        }

        body {
          font-family: 'Noto Sans Georgian', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .layout { display: flex; min-height: 100vh; flex-direction: row; }

        .sidebar {
          width: var(--sidebar-w);
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: relative;
          z-index: 5;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 22px 20px 18px;
          border-bottom: 1px solid var(--border);
        }
        .logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg,#4b7bff,#7aa0ff);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 16px; letter-spacing: .08em;
        }

        .nav { padding: 14px 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }

        .nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 14px;
          border-radius: 10px 0 0 10px;
          font-size: 13.5px; font-weight: 500;
          color: var(--muted);
          cursor: pointer; border: none; background: none;
          width: 100%; text-align: left;
          transition: background .15s, color .15s;
          margin-right: -1px;
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--text); }
        .nav-item.active {
          background: #f0f4fc;
          color: var(--accent);
          font-weight: 600;
        }
        .nav-item.active svg { stroke: var(--accent); }

        .sidebar-footer {
          padding: 14px 16px;
          border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
        }
        .avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg,#6366f1,var(--accent));
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .user-name { font-size: 13px; font-weight: 500; }

        .main {
          flex: 1; display: flex; flex-direction: column;
          background: var(--bg);
          min-width: 0;
        }

        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px;
          padding: 14px 32px;
          border-bottom: 1px solid var(--border);
          width: 100%;
        }

        .lang-select {
          background: rgba(255,255,255,0.06);
          color: var(--muted);
          padding: 8px 34px 8px 13px;
          border-radius: 8px;
          font-family: inherit; font-size: 13.5px;
          cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath fill='%236a7da8' d='M1 1l4.5 4.5L10 1'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 11px center;
          transition: border-color .15s;
        }
        .lang-select:focus { outline: none; border-color: var(--accent); }

        .format-toggle {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--muted); cursor: pointer;
          user-select: none;
        }
        .chk-box {
          width: 17px; height: 17px;
          border: 1.5px solid var(--muted); border-radius: 4px;
          transition: all .15s;
        }

        .topbar-spacer { flex: 1; }

        .btn-new {
          display: flex; align-items: center; gap: 8px;
          background: #888; color: white; border: none;
          padding: 9px 18px; border-radius: 9px;
          font-family: inherit; font-size: 13.5px; font-weight: 600;
          cursor: pointer;
          transition: background .15s, transform .1s;
          white-space: nowrap;
        }
        .btn-new.active { background: var(--accent); }
        .btn-new:hover { background: var(--accent-hover); transform: translateY(-1px); }

        .content {
          flex: 1; padding: 28px 32px;
          display: flex; flex-direction: column; gap: 22px;
          overflow: auto;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }

        .panels-row {
          display: grid;
          grid-template-columns: 1fr 52px 1fr;
          gap: 0;
          flex: 1;
          min-height: 380px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .panel {
          background: var(--panel-bg);
          border-radius: 14px;
          display: flex; flex-direction: column;
          overflow: hidden;
          min-height: 380px;
        }
        .panel:last-child { background: var(--panel-bg2); }

        .panel textarea {
          flex: 1; width: 100%; border: none; outline: none; resize: none;
          padding: 20px 22px;
          font-family: inherit; font-size: 15px; line-height: 1.75;
          background: transparent; color: #1e2d4a;
          min-height: 380px;
        }
        .panel textarea::placeholder { color: #a0afd0; }

        .swap-col {
          display: flex; align-items: center; justify-content: center;
        }
        .swap-btn {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--muted);
          transition: background .15s, color .15s, transform .25s;
        }
        .swap-btn:hover { background: rgba(255,255,255,0.13); color: var(--text); transform: rotate(180deg); }

        .actions {
          display: flex; justify-content: center; align-items: center; gap: 12px;
          padding-bottom: 8px;
        }

        .btn-compare {
          display: flex; align-items: center; gap: 9px;
          padding: 13px 56px;
          background: var(--accent); color: white; border: none;
          border-radius: 11px;
          font-family: inherit; font-size: 15px; font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 22px rgba(75,123,255,.35);
          transition: background .15s, transform .1s, box-shadow .15s;
        }
        .btn-compare:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(75,123,255,.5);
        }
        .btn-compare:disabled { background: #888; opacity: .45; cursor: not-allowed; box-shadow: none; }

        .btn-clear {
          padding: 13px 22px;
          background: transparent; color: var(--muted);
          border: 1px solid var(--border); border-radius: 11px;
          font-family: inherit; font-size: 14px; cursor: pointer;
          transition: all .15s;
        }
        .btn-clear:hover { background: rgba(255,255,255,0.06); color: var(--text); }

        .stats { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .chip {
          padding: 5px 14px; border-radius: 999px;
          font-size: 12.5px; font-weight: 600;
          display: flex; align-items: center; gap: 5px;
        }
        .chip-red { background: rgba(239,68,68,.12); color: #ef4444; }
        .chip-green { background: rgba(34,197,94,.12); color: #22c55e; }
        .chip-blue { background: rgba(75,123,255,.12); color: #6699ff; }

        .loading-wrap {
          flex: 1; display: flex; align-items: center; justify-content: center;
        }
        .loading-card {
          background: white; border-radius: 16px;
          padding: 36px 52px;
          display: flex; flex-direction: column; align-items: center; gap: 18px;
          box-shadow: 0 8px 40px rgba(0,0,0,.1);
        }
        .spinner {
          width: 38px; height: 38px;
          border: 3px solid #e0e8ff; border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-label { font-size: 13.5px; color: #8899cc; font-weight: 500; }
        .prog-track { width: 200px; height: 6px; background: #e0e8ff; border-radius: 99px; overflow: hidden; }
        .prog-fill { height: 100%; background: linear-gradient(90deg,var(--accent),#7aa0ff); border-radius: 99px; animation: prog .7s ease forwards; }
        @keyframes prog { from { width:0 } to { width:100% } }

        .page-selector { display: none; }
        .tablet-nav { display: none; }
        .mobile-controls { display: none; }

        @media (min-width: 1024px) {
          :root { --sidebar-w: 240px; }
          .content { padding: 32px 40px; }
          .panels-row { min-height: 420px; }
          .panel { min-height: 420px; }
          .panel textarea { min-height: 420px; }
        }

        @media (max-width: 1023px) {
          :root { --sidebar-w: 200px; }
          .content { padding: 22px 22px; gap: 18px; }
          .btn-compare { padding: 12px 40px; }
        }

        /* Tablet */
        @media (max-width: 900px) and (min-width: 601px) {
          .layout { flex-direction: column; }
          
          .sidebar { 
            width: 100%; 
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
          }
          .logo-wrap { padding: 0; border-bottom: none; gap: 8px; }
          .logo-text { display: block !important; font-size: 14px; }
          
          .page-selector {
            display: flex !important;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
          }
          .page-selector svg { stroke: white; }
          
          .tablet-current-page {
            display: flex !important;
            background: white;
            padding: 10px 16px;
            border-bottom: 1px solid #e5e7eb;
            align-items: center;
            gap: 8px;
            color: var(--accent);
            font-size: 13px;
            font-weight: 500;
          }
          .tablet-current-page svg { stroke: var(--accent); }
          
          .nav, .sidebar-footer, .tablet-nav { display: none; }
          .main { margin-top: 0; }
          .content { padding: 18px 20px; }
          .panels-row { grid-template-columns: 1fr 44px 1fr; max-width: 100%; }
          .panel textarea { font-size: 14px; padding: 16px 18px; }
        }

        /* Mobile */
        @media (max-width: 600px) {
          .layout { flex-direction: column; }
          
          .sidebar { 
            width: 100%; 
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 10px 16px;
          }
          .logo-wrap { padding: 0; border-bottom: none; gap: 8px; }
          .logo-icon { width: 28px; height: 28px; font-size: 14px; }
          .logo-text { display: block !important; font-size: 14px; }
          
          .page-selector {
            display: flex !important;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 6px;
            color: white;
            font-size: 12px;
            cursor: pointer;
          }
          .page-selector svg { stroke: white; }
          
          .mobile-controls {
            display: flex !important;
            background: white;
            padding: 10px 16px;
            gap: 8px;
            border-bottom: 1px solid #e5e7eb;
            flex-wrap: wrap;
          }
          .mobile-controls .lang-select {
            font-size: 12px;
            padding: 6px 28px 6px 10px;
          }
          .mobile-controls .format-toggle {
            font-size: 12px;
          }
          .mobile-controls .btn-new {
            padding: 6px 10px;
            font-size: 12px;
          }
          
          .nav, .sidebar-footer { display: none; }
          .main { margin-top: 0; }
          .topbar-desktop { display: none !important; }
          
          .content { padding: 14px; gap: 16px; }
          .btn-compare { padding: 12px 32px; font-size: 14px; }
          .panels-row {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto 1fr;
            min-height: 300px;
          }
          .swap-col { padding: 6px 0; }
          .swap-btn { transform: rotate(90deg); }
          .swap-btn:hover { transform: rotate(270deg); }
          .panel textarea { min-height: 200px; font-size: 14px; padding: 14px; }
          .panel, .panel:last-child { min-height: 200px; }
        }

        @media (min-width: 1400px) {
          .panels-row { max-width: 1200px; }
          .panel textarea { font-size: 16px; padding: 24px 28px; }
        }

        @media (min-width: 1600px) {
          .panels-row { max-width: 1400px; }
          .content { padding: 32px 48px; }
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="logo-wrap">
            <div className="logo-icon">🦉</div>
            <span className="logo-text">ENAGRAM</span>
          </div>
          
          <button className="page-selector">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>
            ტექსტის შედარება
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          <nav className="nav">
            {[
              { label: "მართლმწერი", active: false, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
              { label: "ტექსტის შედარება", active: true, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
              { label: "ხმა → ტექსტი", active: false, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> },
              { label: "ტექსტი → ხმა", active: false, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> },
              { label: "PDF კონვერტაცია", active: false, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
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
          </div>
        </aside>

        <main className="main">
          <div className="tablet-current-page">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>
            ტექსტის შედარება
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
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
                  <div className="prog-track"><div className="prog-fill" /></div>
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
