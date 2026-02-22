import * as vscode from 'vscode';
import { QuotaResult, ModelQuota, PromptCredits } from './quotaService';
import { getDashboardContent } from './webviewContent';

export class DashboardProvider {
    public static currentPanel: DashboardProvider | undefined;
    public static readonly viewType = 'aiQuotaVisualizer';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _onRefreshRequested: (() => void) | undefined;

    public static createOrShow(
        extensionUri: vscode.Uri,
        onRefresh: () => void
    ): DashboardProvider {
        const column = vscode.ViewColumn.Two;

        if (DashboardProvider.currentPanel) {
            DashboardProvider.currentPanel._panel.reveal(column);
            return DashboardProvider.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            DashboardProvider.viewType,
            'AI Quota Monitor',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [extensionUri],
            }
        );

        DashboardProvider.currentPanel = new DashboardProvider(panel, extensionUri, onRefresh);
        return DashboardProvider.currentPanel;
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        onRefresh: () => void
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._onRefreshRequested = onRefresh;

        this._panel.webview.html = getDashboardContent();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                if (message.command === 'refresh') {
                    this._onRefreshRequested?.();
                }
            },
            null,
            this._disposables
        );
    }

    public updateData(result: QuotaResult, lastRefreshed: Date): void {
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

    public showSearching(): void {
        this._panel.webview.postMessage({ command: 'searching' });
    }

    public dispose(): void {
        DashboardProvider.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) { x.dispose(); }
        }
    }
}

function serializeModel(m: ModelQuota): object {
    return {
        id: m.id,
        name: m.name,
        remainingFraction: m.remainingFraction,
        percentRemaining: m.percentRemaining,
        resetAt: m.resetAt ? m.resetAt.toISOString() : null,
    };
}
