"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardContent = getDashboardContent;
function getDashboardContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Quota Monitor</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg:            #0d0f14;
            --surface:       rgba(255,255,255,0.04);
            --surface-hover: rgba(255,255,255,0.07);
            --border:        rgba(255,255,255,0.08);
            --text:          #e2e8f0;
            --text-muted:    #64748b;
            --text-dim:      #94a3b8;
            --accent:        #6366f1;

            --green:  #22c55e;
            --amber:  #f59e0b;
            --red:    #ef4444;
            --grey:   #475569;

            --green-glow: rgba(34,197,94,0.15);
            --amber-glow: rgba(245,158,11,0.15);
            --red-glow:   rgba(239,68,68,0.15);
            --grey-glow:  rgba(71,85,105,0.10);

            --radius: 16px;
            --radius-sm: 10px;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            padding: 20px 24px 40px;
            overflow-x: hidden;
        }

        /* Ambient background blobs */
        body::before, body::after {
            content: '';
            position: fixed;
            border-radius: 50%;
            filter: blur(80px);
            pointer-events: none;
            z-index: 0;
        }
        body::before {
            width: 400px; height: 400px;
            top: -120px; left: -80px;
            background: radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%);
        }
        body::after {
            width: 300px; height: 300px;
            bottom: -60px; right: -60px;
            background: radial-gradient(circle, rgba(34,197,94,0.08), transparent 70%);
        }

        .page { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; }

        /* ── Header ── */
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .logo {
            width: 38px; height: 38px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 18px;
            box-shadow: 0 0 20px rgba(99,102,241,0.4);
        }
        .header-title { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.3px; }
        .header-sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }

        .header-right { display: flex; align-items: center; gap: 10px; }

        .status-badge {
            display: flex; align-items: center; gap: 6px;
            padding: 5px 12px;
            border-radius: 999px;
            font-size: 0.75rem; font-weight: 500;
            border: 1px solid var(--border);
            background: var(--surface);
        }
        .status-dot {
            width: 7px; height: 7px;
            border-radius: 50%;
            background: var(--grey);
            transition: background 0.4s;
        }
        .status-dot.connected { background: var(--green); box-shadow: 0 0 6px var(--green); animation: pulse 2s infinite; }
        .status-dot.searching { background: var(--amber); animation: pulse 1s infinite; }
        .status-dot.offline   { background: var(--red); }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .refresh-btn {
            display: flex; align-items: center; gap: 6px;
            padding: 7px 14px;
            border: 1px solid var(--border);
            background: var(--surface);
            color: var(--text);
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 0.8rem; font-weight: 500;
            font-family: inherit;
            transition: background 0.2s, transform 0.15s;
        }
        .refresh-btn:hover { background: var(--surface-hover); }
        .refresh-btn:active { transform: scale(0.97); }
        .refresh-btn .icon { font-size: 1rem; display: inline-block; transition: transform 0.6s; }
        .refresh-btn.spinning .icon { animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Timestamp ── */
        .timestamp-bar {
            font-size: 0.72rem;
            color: var(--text-muted);
            margin-bottom: 20px;
            display: flex; align-items: center; gap: 6px;
        }

        /* ── Model Grid ── */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        /* ── Model Card ── */
        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 20px;
            position: relative;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            animation: fadeSlideIn 0.4s ease both;
        }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        /* Stagger animation delay per card */
        .card:nth-child(1) { animation-delay: 0.05s; }
        .card:nth-child(2) { animation-delay: 0.10s; }
        .card:nth-child(3) { animation-delay: 0.15s; }
        .card:nth-child(4) { animation-delay: 0.20s; }
        .card:nth-child(5) { animation-delay: 0.25s; }
        .card:nth-child(6) { animation-delay: 0.30s; }

        /* Glow tint in top-left corner */
        .card::before {
            content: '';
            position: absolute;
            top: -30px; left: -30px;
            width: 120px; height: 120px;
            border-radius: 50%;
            filter: blur(30px);
            opacity: 0.6;
            pointer-events: none;
        }
        .card.health-good::before   { background: var(--green-glow); }
        .card.health-warn::before   { background: var(--amber-glow); }
        .card.health-crit::before   { background: var(--red-glow); }
        .card.health-empty::before  { background: var(--grey-glow); }

        .card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        .model-name { font-size: 0.95rem; font-weight: 600; }
        .health-pill {
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 3px 8px;
            border-radius: 999px;
        }
        .health-pill.good  { background: rgba(34,197,94,0.15);  color: var(--green); }
        .health-pill.warn  { background: rgba(245,158,11,0.15); color: var(--amber); }
        .health-pill.crit  { background: rgba(239,68,68,0.15);  color: var(--red); }
        .health-pill.empty { background: rgba(71,85,105,0.15);  color: var(--grey); }

        /* ── Circular Ring ── */
        .ring-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 16px;
        }
        .ring-svg { transform: rotate(-90deg); }
        .ring-bg   { fill: none; stroke: rgba(255,255,255,0.06); }
        .ring-track {
            fill: none;
            stroke-linecap: round;
            transition: stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                        stroke 0.4s;
        }
        .ring-text-wrap {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .ring-percent {
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1;
            letter-spacing: -0.5px;
        }
        .ring-label {
            font-size: 0.65rem;
            color: var(--text-muted);
            margin-top: 2px;
        }
        .ring-container {
            position: relative;
            width: 110px;
            height: 110px;
        }

        /* ── Stats Row ── */
        .stats-row {
            display: flex;
            justify-content: space-between;
            gap: 8px;
        }
        .stat {
            flex: 1;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 8px 10px;
        }
        .stat-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 3px; }
        .stat-value { font-size: 0.85rem; font-weight: 600; font-variant-numeric: tabular-nums; }

        /* ── Credits Panel ── */
        .credits-panel {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 14px 20px;
            display: none;
            margin-bottom: 16px;
        }
        .credits-panel.visible { display: flex; align-items: center; gap: 32px; }
        .credit-item { display: flex; flex-direction: column; gap: 3px; }
        .credit-label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
        .credit-value { font-size: 1rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .credit-sub { font-size: 0.72rem; color: var(--text-muted); }
        .info-panel {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 24px;
            flex-wrap: wrap;
        }
        .info-item { display: flex; flex-direction: column; gap: 2px; }
        .info-label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
        .info-value { font-size: 0.82rem; font-weight: 500; font-family: 'Courier New', monospace; }

        /* ── Error / Searching State ── */
        .state-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 48px 32px;
            text-align: center;
            display: none;
        }
        .state-card.visible { display: block; }
        .state-icon { font-size: 2.5rem; margin-bottom: 16px; }
        .state-title { font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
        .state-sub { font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; }

        .spinner {
            display: inline-block;
            width: 2.5rem; height: 2.5rem;
            border: 3px solid rgba(255,255,255,0.08);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 0.9s linear infinite;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
<div class="page">

    <!-- Header -->
    <header class="header">
        <div class="header-left">
            <div class="logo">⚡</div>
            <div>
                <div class="header-title">AI Quota Monitor</div>
                <div class="header-sub">Antigravity Model Usage</div>
            </div>
        </div>
        <div class="header-right">
            <div class="status-badge">
                <div class="status-dot" id="status-dot"></div>
                <span id="status-text">Initializing…</span>
            </div>
            <button class="refresh-btn" id="refresh-btn" onclick="requestRefresh()">
                <span class="icon">↻</span> Refresh
            </button>
        </div>
    </header>

    <!-- Timestamp -->
    <div class="timestamp-bar" id="timestamp-bar" style="display:none">
        <span>🕐</span>
        <span id="last-refresh-text"></span>
    </div>

    <!-- Searching state -->
    <div class="state-card" id="state-searching">
        <div class="spinner"></div>
        <div class="state-title">Searching for Antigravity…</div>
        <div class="state-sub">Scanning for the Antigravity language server process.<br>Make sure Antigravity is running.</div>
    </div>

    <!-- Error state -->
    <div class="state-card" id="state-error">
        <div class="state-icon">🔌</div>
        <div class="state-title">Could not connect</div>
        <div class="state-sub" id="error-text"></div>
    </div>

    <!-- Credits panel -->
    <div class="credits-panel" id="credits-panel">
        <div class="credit-item">
            <span class="credit-label">Prompt Credits</span>
            <span class="credit-value" id="cred-available">—</span>
            <span class="credit-sub" id="cred-monthly"></span>
        </div>
    </div>

    <!-- Model grid -->
    <div class="grid" id="model-grid"></div>

    <!-- Connection info -->
    <div class="info-panel" id="info-panel" style="display:none">
        <div class="info-item">
            <span class="info-label">API Port</span>
            <span class="info-value" id="info-port">—</span>
        </div>
        <div class="info-item">
            <span class="info-label">Mode</span>
            <span class="info-value">Local</span>
        </div>
        <div class="info-item">
            <span class="info-label">Poll Interval</span>
            <span class="info-value">2 min</span>
        </div>
    </div>

</div>

<script>
    const vscode = acquireVsCodeApi();

    // ── Helpers ────────────────────────────────────────────────────────────

    function healthClass(pct) {
        if (pct > 50) return 'good';
        if (pct > 20) return 'warn';
        if (pct > 0)  return 'crit';
        return 'empty';
    }

    function healthLabel(pct) {
        if (pct > 50) return 'Healthy';
        if (pct > 20) return 'Low';
        if (pct > 0)  return 'Critical';
        return 'Exhausted';
    }

    function ringColor(pct) {
        if (pct > 50) return '#22c55e';
        if (pct > 20) return '#f59e0b';
        if (pct > 0)  return '#ef4444';
        return '#475569';
    }

    function remainingStr(pct) {
        if (pct >= 100) return 'Full';
        if (pct <= 0)  return 'Exhausted';
        return pct + '% left';
    }

    function resetStr(isoStr) {
        if (!isoStr) return '—';
        const reset = new Date(isoStr);
        const diffMs = reset - Date.now();
        if (diffMs <= 0) return 'Soon';
        const h = Math.floor(diffMs / 3600000);
        const m = Math.floor((diffMs % 3600000) / 60000);
        return h > 0 ? \`\${h}h \${m}m\` : \`\${m}m\`;
    }

    function makeSvgRing(pct, color) {
        const r = 44;
        const circ = 2 * Math.PI * r;
        const offset = circ * (1 - pct / 100);
        const uid = 'r' + Math.random().toString(36).slice(2,7);
        return \`
        <svg class="ring-svg" width="110" height="110" viewBox="0 0 110 110">
            <circle class="ring-bg" cx="55" cy="55" r="\${r}" stroke-width="8"/>
            <circle class="ring-track" id="\${uid}" cx="55" cy="55" r="\${r}" stroke-width="8"
                stroke="\${color}"
                stroke-dasharray="\${circ}"
                stroke-dashoffset="\${circ}"
            />
        </svg>\`;
    }

    function buildCard(model) {
        const hc = healthClass(model.percentRemaining);
        const color = ringColor(model.percentRemaining);
        const r = 44;
        const circ = 2 * Math.PI * r;
        const uid = 'ring-' + model.id.replace(/[^a-zA-Z0-9]/g,'-');

        return \`
        <div class="card health-\${hc}">
            <div class="card-top">
                <span class="model-name">\${escHtml(model.name)}</span>
                <span class="health-pill \${hc}">\${healthLabel(model.percentRemaining)}</span>
            </div>
            <div class="ring-wrap">
                <div class="ring-container">
                    <svg class="ring-svg" width="110" height="110" viewBox="0 0 110 110">
                        <circle class="ring-bg" cx="55" cy="55" r="\${r}" stroke-width="8"/>
                        <circle class="ring-track" id="\${uid}" cx="55" cy="55" r="\${r}" stroke-width="8"
                            stroke="\${color}"
                            stroke-dasharray="\${circ.toFixed(2)}"
                            stroke-dashoffset="\${circ.toFixed(2)}"
                        />
                    </svg>
                    <div class="ring-text-wrap">
                        <span class="ring-percent" style="color:\${color}">\${model.percentRemaining}%</span>
                        <span class="ring-label">remaining</span>
                    </div>
                </div>
            </div>
            <div class="stats-row">
                <div class="stat">
                    <div class="stat-label">Status</div>
                    <div class="stat-value">\${remainingStr(model.percentRemaining)}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Resets in</div>
                    <div class="stat-value">\${resetStr(model.resetAt)}</div>
                </div>
            </div>
        </div>\`;
    }

    function escHtml(s) {
        return String(s)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
    }

    function animateRing(id, pct) {
        const el = document.getElementById(id);
        if (!el) return;
        const r = 44;
        const circ = 2 * Math.PI * r;
        const target = circ * (1 - Math.min(pct, 100) / 100);
        setTimeout(() => { el.style.strokeDashoffset = target.toFixed(2); }, 80);
    }

    function showState(which) {
        document.getElementById('state-searching').classList.toggle('visible', which === 'searching');
        document.getElementById('state-error').classList.toggle('visible', which === 'error');
        document.getElementById('model-grid').style.display = which === 'data' ? '' : 'none';
        document.getElementById('info-panel').style.display = which === 'data' ? '' : 'none';
        document.getElementById('timestamp-bar').style.display = which === 'data' ? '' : 'none';
    }

    function setStatus(kind, text) {
        const dot = document.getElementById('status-dot');
        const label = document.getElementById('status-text');
        dot.className = 'status-dot ' + kind;
        label.textContent = text;
    }

    // ── Message handler ────────────────────────────────────────────────────

    window.addEventListener('message', event => {
        const msg = event.data;

        if (msg.command === 'searching') {
            showState('searching');
            setStatus('searching', 'Searching…');
        }

        if (msg.command === 'updateQuota') {
            stopRefreshSpin();
            const d = msg.data;

            if (d.error && d.models.length === 0) {
                document.getElementById('error-text').textContent = d.error;
                showState('error');
                setStatus('offline', 'Offline');
                return;
            }

            if (d.models.length === 0) {
                document.getElementById('error-text').textContent = 'No model quota data returned.';
                showState('error');
                setStatus('offline', 'No data');
                return;
            }

            // Render cards
            const grid = document.getElementById('model-grid');
            grid.innerHTML = d.models.map(buildCard).join('');
            // Animate rings after DOM insertion
            d.models.forEach(m => {
                animateRing('ring-' + m.id.replace(/[^a-zA-Z0-9]/g,'-'), m.percentRemaining);
            });

            // Credits panel
            const cPanel = document.getElementById('credits-panel');
            if (d.credits) {
                document.getElementById('cred-available').textContent = d.credits.available.toLocaleString();
                document.getElementById('cred-monthly').textContent = 'of ' + d.credits.monthly.toLocaleString() + ' monthly';
                cPanel.classList.add('visible');
            } else {
                cPanel.classList.remove('visible');
            }

            // Info panel
            document.getElementById('info-port').textContent = d.port ? ':' + d.port : '—';

            // Timestamp
            if (d.lastRefreshed) {
                const t = new Date(d.lastRefreshed);
                document.getElementById('last-refresh-text').textContent =
                    'Last refreshed: ' + t.toLocaleTimeString();
            }

            showState('data');
            setStatus('connected', 'Connected');
        }
    });

    // ── Refresh button ─────────────────────────────────────────────────────

    function requestRefresh() {
        vscode.postMessage({ command: 'refresh' });
        startRefreshSpin();
    }

    function startRefreshSpin() {
        const btn = document.getElementById('refresh-btn');
        btn.classList.add('spinning');
        btn.disabled = true;
    }

    function stopRefreshSpin() {
        const btn = document.getElementById('refresh-btn');
        btn.classList.remove('spinning');
        btn.disabled = false;
    }

    // ── Initial state ──────────────────────────────────────────────────────
    showState('searching');
    setStatus('searching', 'Searching…');
</script>
</body>
</html>`;
}
//# sourceMappingURL=webviewContent.js.map