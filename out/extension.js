"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const DashboardProvider_1 = require("./DashboardProvider");
const quotaService_1 = require("./quotaService");
const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
let statusBarItem;
let lastResult = null;
function activate(context) {
    // ── Status bar ─────────────────────────────────────────────────────────
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'quotavisualizer.show';
    statusBarItem.tooltip = 'AI Quota Monitor — Click to open dashboard';
    statusBarItem.text = '$(loading~spin) AI Quota Monitor…';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // ── Commands ───────────────────────────────────────────────────────────
    const showCmd = vscode.commands.registerCommand('quotavisualizer.show', () => {
        const provider = DashboardProvider_1.DashboardProvider.createOrShow(context.extensionUri, triggerRefresh);
        if (lastResult) {
            provider.updateData(lastResult, new Date());
        }
        else {
            provider.showSearching();
        }
    });
    const refreshCmd = vscode.commands.registerCommand('quotavisualizer.refresh', () => {
        triggerRefresh();
    });
    context.subscriptions.push(showCmd, refreshCmd);
    // ── Polling ────────────────────────────────────────────────────────────
    (0, quotaService_1.startPolling)(POLL_INTERVAL_MS, result => {
        lastResult = result;
        updateStatusBar(result);
        if (DashboardProvider_1.DashboardProvider.currentPanel) {
            DashboardProvider_1.DashboardProvider.currentPanel.updateData(result, new Date());
        }
    });
    context.subscriptions.push({ dispose: quotaService_1.stopPolling });
}
function triggerRefresh() {
    statusBarItem.text = '$(loading~spin) Refreshing…';
    (0, quotaService_1.fetchQuota)().then(result => {
        lastResult = result;
        updateStatusBar(result);
        if (DashboardProvider_1.DashboardProvider.currentPanel) {
            DashboardProvider_1.DashboardProvider.currentPanel.updateData(result, new Date());
        }
    });
}
function updateStatusBar(result) {
    if (result.error && result.models.length === 0) {
        statusBarItem.text = '$(error) AI Quota: Offline';
        statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
        return;
    }
    if (result.models.length === 0) {
        statusBarItem.text = '$(question) AI Quota: No data';
        statusBarItem.color = undefined;
        return;
    }
    // Show summary: lowest quota model
    const worst = result.models.reduce((a, b) => a.percentRemaining < b.percentRemaining ? a : b);
    const icon = worst.percentRemaining > 50
        ? '$(pass-filled)'
        : worst.percentRemaining > 20
            ? '$(warning)'
            : '$(error)';
    const color = worst.percentRemaining > 50
        ? undefined
        : worst.percentRemaining > 20
            ? new vscode.ThemeColor('statusBarItem.warningForeground')
            : new vscode.ThemeColor('statusBarItem.errorForeground');
    statusBarItem.text = `${icon} ${worst.name}: ${worst.percentRemaining}%`;
    statusBarItem.color = color;
}
function deactivate() {
    (0, quotaService_1.stopPolling)();
}
//# sourceMappingURL=extension.js.map