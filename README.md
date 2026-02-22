# AI Quota Monitor

> **Real-time Antigravity AI model quota and usage dashboard — right inside VS Code.**
>
> **Author:** [Aditya Dubey](https://github.com/cyberadityacode)

Monitor your Gemini, Claude, and GPT model limits without leaving your editor. AI Quota Monitor automatically detects the Antigravity language server, fetches live quota data, and renders a beautiful visual dashboard with animated progress rings, color-coded health indicators, and reset countdowns.

---

## 📸 Screenshots

<!-- Dashboard overview screenshot -->
> *Screenshot: Dashboard overview showing model quota cards — add your screenshot here*

![AI Quota Monitor Dashboard](./images/dashboard.png)

<!-- Status bar screenshot -->
> *Screenshot: Status bar showing live quota summary — add your screenshot here*

![Status Bar Integration](./images/statusbar.png)

<!-- Error / offline state screenshot -->
> *Screenshot: Graceful offline state when Antigravity is not running — add your screenshot here*

![Offline State](./images/offline.png)

---

## ✨ Features

### 🔴🟡🟢 Visual Model Cards
Each AI model gets its own card with:
- **Animated SVG circular progress ring** — fills/drains as your quota changes
- **Color-coded health status** — green (>50%), amber (20–50%), red (<20%), grey (exhausted)
- **Health pill label** — Healthy / Low / Critical / Exhausted at a glance
- **Reset countdown** — shows exactly how long until your quota refreshes (e.g. `2h 15m`)

### ⚡ Zero-Config Auto Detection
No manual setup required. The extension automatically:
1. Scans your running processes for the Antigravity language server
2. Extracts the secure port and CSRF token from the process arguments
3. Connects to the local gRPC/Connect-RPC endpoint
4. Starts polling every 2 minutes

### 📊 Prompt Credits Panel
View your available and monthly **Prompt Credits** alongside model quotas — all in one place.

### 🔔 Status Bar Integration
The extension adds a persistent item to your VS Code status bar showing the most-at-risk model's remaining percentage. Click it to open the full dashboard instantly.

### 🔄 Live Refresh
Hit the **Refresh** button inside the dashboard (with a satisfying spin animation) or run the **AI Quota Monitor: Refresh Now** command from the Command Palette for an immediate update.

### 🖥️ Cross-Platform Support
| Platform | Detection Method |
|---|---|
| **Linux** | `ps aux` + `ss -tlnp` |
| **macOS** | `ps aux` + `lsof` |
| **Windows** | `wmic` + `netstat -ano` |

---

## 🚀 Getting Started

### Prerequisites
- [Antigravity IDE](https://antigravity.google) installed and running
- VS Code `^1.80.0` or Antigravity (which is built on VS Code)

### Installation

**From the Extension Marketplace:**
1. Open VS Code / Antigravity
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for **"AI Quota Monitor"**
4. Click **Install**

**From VSIX (manual):**
```bash
code --install-extension ai-quota-monitor-1.0.0.vsix
```

### Usage
1. Make sure Antigravity is running (the language server must be active)
2. Open the Command Palette (`Ctrl+Shift+P`)
3. Run **`AI Quota Monitor: Show Dashboard`**
4. The dashboard opens in a side panel with live data

---

## 🗂️ Commands

| Command | Description |
|---|---|
| `AI Quota Monitor: Show Dashboard` | Open the visual quota dashboard |
| `AI Quota Monitor: Refresh Now` | Force an immediate quota data refresh |

Access all commands from the Command Palette (`Ctrl+Shift+P`) by typing `AI Quota Monitor`.

---

## ⚙️ How It Works

AI Quota Monitor talks exclusively to the **local** Antigravity language server — no external network calls, no auth setup.

```
Antigravity Language Server (local)
         │
         │  HTTPS  POST /exa.language_server_pb.LanguageServerService/GetUserStatus
         │  Header: x-codeium-csrf-token: <auto-detected>
         ▼
AI Quota Monitor Extension
         │
         ▼
    VS Code Webview Dashboard
```

1. **Process detection** — finds `language_server` in running processes
2. **Port discovery** — uses `ss` / `lsof` / `netstat` to find all listening ports
3. **Secure request** — sends a Connect-RPC POST with the session CSRF token (self-signed cert, local only)
4. **Parse & render** — extracts `clientModelConfigs`, `quotaInfo`, `planStatus` and renders the dashboard

All communication stays on `127.0.0.1`. No data leaves your machine.

---

## 📈 Dashboard Explained

### Model Cards

```
┌─────────────────────────────┐
│  Gemini 3.1 Pro      Healthy│
│         ○                   │
│       80%                   │
│     remaining               │
│  Status      Resets in      │
│  80% left    2h 15m         │
└─────────────────────────────┘
```

- **Ring** — fills proportionally to the quota remaining
- **Percent** — exact percentage remaining in this refresh window
- **Status** — human-readable summary (Full / X% left / Exhausted)
- **Resets in** — countdown to next quota reset (pulled directly from the API)

### Status Bar

```
$(pass-filled) Gemini 3.1 Pro: 80%
```
Shows the lowest-quota model so you always see the most critical situation first. Icon changes to `$(warning)` or `$(error)` as quota drops.

### Prompt Credits Panel

When available, shows your remaining Prompt Credits and the monthly allowance:

```
Prompt Credits
500    of 50,000 monthly
```

---

## 🔒 Privacy & Security

- **100% local** — only connects to `127.0.0.1` (your own machine)
- **No telemetry** — zero analytics or usage tracking
- **No stored credentials** — reads the CSRF token from the process at runtime only
- **Self-signed cert** — the Antigravity language server uses a local self-signed TLS certificate; the extension accepts it safely since the connection never leaves localhost

---

## 🛠️ Configuration

Currently the extension uses sensible defaults with no required configuration. Future versions will expose settings for:

| Setting | Default | Description |
|---|---|---|
| `aiQuotaMonitor.pollingInterval` | `120000` | Polling interval in ms (2 minutes) |
| `aiQuotaMonitor.showStatusBar` | `true` | Show/hide the status bar item |

---

## 🔧 Building from Source

```bash
# Clone the repository
git clone https://github.com/your-username/ai-quota-monitor.git
cd ai-quota-monitor

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile on changes)
npm run watch
```

To test locally, press **F5** in VS Code / Antigravity to launch the Extension Development Host.

---

## 🐛 Troubleshooting

**Dashboard shows "Could not connect"**
- Make sure Antigravity is fully loaded (not just VS Code — the *Antigravity* extension must be active)
- Try reloading the window: `Ctrl+Shift+P` → **Developer: Reload Window**
- Run the Refresh command to trigger re-detection

**Status bar shows "AI Quota: Offline"**
- The language server process wasn't found. Check that you have the Antigravity extension installed and enabled.

**Models show 100% on every refresh**
- Some plan tiers report unlimited quota as `remainingFraction: 1`. This is expected behavior from the API.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2026 [Aditya Dubey](https://github.com/cyberadityacode)

---

## 🙏 Acknowledgements

Inspired by the open-source work of:
- [wusimpl/AntigravityQuotaWatcher](https://github.com/wusimpl/AntigravityQuotaWatcher)
- [Henrik-3/AntigravityQuota](https://github.com/Henrik-3/AntigravityQuota)

Special thanks to the Antigravity community for reverse-engineering the local API.

---

*AI Quota Monitor is an independent, community-built extension by [Aditya Dubey](https://github.com/cyberadityacode) and is not affiliated with or endorsed by Google.*
