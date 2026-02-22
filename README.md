
# 🚀 AI Quota Monitor — Real-Time AI Usage & Quota Dashboard for Antigravity & VS Code

**AI Quota Monitor** is a developer-focused Antigravity/VS Code extension that shows **real-time AI model usage, quota limits, and reset timers** directly inside your editor.

Track usage for **Gemini, Claude, GPT, and Antigravity AI models** without switching tabs or interrupting your workflow.

👉 Built for developers who rely on AI coding assistants and want **complete visibility over token limits, usage health, and remaining quota**.

**Author:** Aditya Dubey
GitHub: [https://github.com/cyberadityacode](https://github.com/cyberadityacode)

---

## 🧠 What Problem Does AI Quota Monitor Solve?

Modern AI IDEs and coding assistants impose hidden limits:

* Token quotas
* Prompt credits
* Model usage caps
* Silent throttling
* Unknown reset times

Developers often hit limits unexpectedly — breaking flow during coding sessions.

**AI Quota Monitor solves this by providing a live AI usage dashboard inside VS Code.**

You always know:

✅ How much quota remains
✅ Which model is at risk
✅ When limits reset
✅ Current usage health

---

## ✨ Key Features

### 📊 Real-Time AI Model Quota Dashboard

Visual cards display live usage for each AI model:

* Animated circular quota progress rings
* Remaining percentage indicator
* Health status (Healthy / Low / Critical / Exhausted)
* Automatic reset countdown timer

Supported models include:

* Gemini models
* Claude models
* GPT models
* Antigravity language server models

---

### ⚡ Zero Configuration Setup

No API keys. No login. No setup.

The extension automatically:

1. Detects the Antigravity language server
2. Extracts secure local session tokens
3. Connects to the local RPC endpoint
4. Fetches live quota data every 2 minutes

Install → Open → Monitor instantly.

---

### 🔔 Smart Status Bar Monitoring

A persistent VS Code status bar indicator shows:

* The **most critical model**
* Remaining quota percentage
* Dynamic warning icons as limits drop

Click to open the full dashboard instantly.

---

### 📈 Prompt Credits Tracking

View monthly and remaining prompt credits alongside model quotas.

Perfect for monitoring subscription usage and avoiding throttling.

---

### 🔄 Live Refresh Controls

* One-click refresh inside dashboard
* Command Palette support
* Animated refresh feedback

Command:

```
AI Quota Monitor: Refresh Now
```

---

### 🖥️ Cross-Platform Support

Works seamlessly across operating systems:

| Platform | Detection Method |
| -------- | ---------------- |
| Linux    | ps + ss          |
| macOS    | ps + lsof        |
| Windows  | wmic + netstat   |

---

## 📸 Extension Preview

*(Add your screenshots here — screenshots significantly improve marketplace SEO)*

* Dashboard overview
* Status bar integration
* Offline detection state

---

## 🚀 Installation Guide

### From VS Code Marketplace

1. Open Extensions (`Ctrl + Shift + X`)
2. Search **AI Quota Monitor**
3. Click Install

### Manual Installation (VSIX)

```bash
code --install-extension ai-quota-monitor-1.0.0.vsix
```

---

## ▶️ How to Use

1. Launch Antigravity IDE
2. Ensure the language server is running
3. Open Command Palette (`Ctrl + Shift + P`)
4. Run:

```
AI Quota Monitor: Show Dashboard
```

Your live AI quota dashboard opens instantly.

---

## 🧩 Available Commands

| Command        | Description                  |
| -------------- | ---------------------------- |
| Show Dashboard | Opens visual quota dashboard |
| Refresh Now    | Fetch latest quota data      |

---

## ⚙️ How AI Quota Monitor Works

AI Quota Monitor communicates only with the **local Antigravity language server**.

```
Local Language Server
        ↓
Secure Local HTTPS Request
        ↓
Quota Data Extraction
        ↓
VS Code Dashboard Rendering
```

### Technical Flow

* Detect running language server process
* Discover active ports automatically
* Send secure Connect-RPC request
* Parse quota configuration
* Render real-time UI

✅ No cloud communication
✅ No external API calls
✅ Fully local execution

---

## 🔒 Privacy & Security

Developer privacy is a core design principle.

* 100% local communication (127.0.0.1 only)
* No telemetry
* No analytics tracking
* No credential storage
* No external servers

Your usage data never leaves your machine.

---

## 📊 Dashboard Explained

Each model card displays:

* **Quota Ring** → Remaining usage visually
* **Percentage** → Exact quota remaining
* **Health Status** → Instant risk awareness
* **Reset Timer** → Next refresh window

Status bar always prioritizes the lowest remaining quota.

---

## 🛠 Configuration (Upcoming)

Planned customizable settings:

| Setting         | Default | Purpose                      |
| --------------- | ------- | ---------------------------- |
| pollingInterval | 120000  | Data refresh interval        |
| showStatusBar   | true    | Toggle status bar visibility |

---

## 🔧 Build From Source

```bash
git clone https://github.com/your-username/ai-quota-monitor.git
cd ai-quota-monitor
npm install
npm run compile
npm run watch
```

Press **F5** in VS Code to start Extension Development Host.

---

## 🐛 Troubleshooting

### Dashboard Cannot Connect

* Ensure Antigravity IDE is fully loaded
* Reload window via Command Palette
* Run manual refresh

### Status Shows Offline

Language server not detected — verify Antigravity extension is active.

### Always Shows 100%

Unlimited plans may report full quota continuously.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork repository
2. Create feature branch
3. Commit changes
4. Open Pull Request

---

## 📄 License

MIT © 2026 Aditya Dubey (cyberadityacode)

---