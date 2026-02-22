"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardProvider = void 0;
const vscode = require("vscode");
const webviewContent_1 = require("./webviewContent");
class DashboardProvider {
    static currentPanel;
    static viewType = 'aiQuotaVisualizer';
    _panel;
    _extensionUri;
    _disposables = [];
    _onRefreshRequested;
    static createOrShow(extensionUri, onRefresh) {
        const column = vscode.ViewColumn.Two;
        if (DashboardProvider.currentPanel) {
            DashboardProvider.currentPanel._panel.reveal(column);
            return DashboardProvider.currentPanel;
        }
        const panel = vscode.window.createWebviewPanel(DashboardProvider.viewType, 'AI Quota Monitor', column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [extensionUri],
        });
        DashboardProvider.currentPanel = new DashboardProvider(panel, extensionUri, onRefresh);
        return DashboardProvider.currentPanel;
    }
    constructor(panel, extensionUri, onRefresh) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._onRefreshRequested = onRefresh;
        this._panel.webview.html = (0, webviewContent_1.getDashboardContent)();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'refresh') {
                this._onRefreshRequested?.();
            }
        }, null, this._disposables);
    }
    updateData(result, lastRefreshed) {
        this._panel.webview.postMessage({
            command: 'updateQuota',
            data: {
                models: result.models.map(serializeModel),
                credits: result.credits,
                port: result.port,
                error: result.error ?? null,
                lastRefreshed: lastRefreshed.toISOString(),
            },
        });
    }
    showSearching() {
        this._panel.webview.postMessage({ command: 'searching' });
    }
    dispose() {
        DashboardProvider.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.DashboardProvider = DashboardProvider;
function serializeModel(m) {
    return {
        id: m.id,
        name: m.name,
        remainingFraction: m.remainingFraction,
        percentRemaining: m.percentRemaining,
        resetAt: m.resetAt ? m.resetAt.toISOString() : null,
    };
}
//# sourceMappingURL=DashboardProvider.js.map