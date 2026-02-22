import * as https from 'https';
import { exec } from 'child_process';

export interface ModelQuota {
    id: string;
    name: string;
    remainingFraction: number; // 0.0 – 1.0
    percentRemaining: number;  // 0 – 100
    resetAt: Date | null;
}

export interface PromptCredits {
    available: number;
    monthly: number;
}

export interface QuotaResult {
    models: ModelQuota[];
    credits: PromptCredits | null;
    port: number | null;
    error?: string;
}

interface ServerInfo {
    httpsPort: number;
    csrfToken: string;
}

const GRPC_PATH = '/exa.language_server_pb.LanguageServerService/GetUserStatus';

function runCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 1024 * 4 }, (err, stdout, stderr) => {
            err ? reject(new Error(stderr || err.message)) : resolve(stdout);
        });
    });
}

/**
 * Scan running processes for the Antigravity language server.
 * Extracts the HTTPS port and CSRF token from its CLI args.
 */
async function detectServerInfo(): Promise<ServerInfo | null> {
    let output: string;
    try {
        const cmd = process.platform === 'win32'
            ? 'wmic process get commandline /format:list'
            : 'ps aux';
        output = await runCommand(cmd);
    } catch {
        return null;
    }

    const lines = output.split('\n');
    for (const line of lines) {
        if (!line.includes('language_server')) { continue; }

        // The process is started with --server_port <https_port> and --csrf_token <token>
        const serverPortMatch = line.match(/--server_port[=\s]+(\d+)/);
        const csrfMatch = line.match(/--csrf_token[=\s]+([A-Za-z0-9._\-/=+]+)/);

        if (serverPortMatch && csrfMatch) {
            return {
                httpsPort: parseInt(serverPortMatch[1], 10),
                csrfToken: csrfMatch[1],
            };
        }

        // Fallback: some versions use --lsp_port and the HTTPS port adjacent to it
        // or we can probe all listening ports of the PID
    }

    return null;
}

/**
 * Scan all TCP ports the language_server process listens on.
 * Strategy differs by platform:
 *  - Linux:   ps aux  + ss -tlnp
 *  - macOS:   ps aux  + lsof -iTCP -sTCP:LISTEN -a -p <pid>
 *  - Windows: wmic    + netstat -ano
 */
async function findServerPorts(): Promise<{ ports: number[], csrfToken: string } | null> {
    const platform = process.platform;

    if (platform === 'win32') {
        return findServerPortsWindows();
    } else {
        return findServerPortsUnix(platform === 'darwin');
    }
}

/** Linux + macOS */
async function findServerPortsUnix(isMac: boolean): Promise<{ ports: number[], csrfToken: string } | null> {
    let psOut: string;
    try {
        psOut = await runCommand('ps aux');
    } catch { return null; }

    let pid: string | null = null;
    let csrfToken: string | null = null;

    for (const line of psOut.split('\n')) {
        if (!line.includes('language_server')) { continue; }

        const csrfMatch = line.match(/--csrf_token[=\s]+([A-Za-z0-9._\-/=+]+)/);
        if (!csrfMatch) { continue; }

        // ps aux: USER PID %CPU %MEM ... COMMAND — PID is column index 1
        const parts = line.trim().split(/\s+/);
        pid = parts[1];
        csrfToken = csrfMatch[1];
        break;
    }

    if (!pid || !csrfToken) { return null; }

    const ports: number[] = [];

    try {
        let out: string;
        if (isMac) {
            // lsof is available on all macOS versions
            out = await runCommand(`lsof -iTCP -sTCP:LISTEN -a -p ${pid} -n -P`);
            // Output: name column is *:<port> or 127.0.0.1:<port>
            const portRegex = /(?:localhost|127\.0\.0\.1|::1|\*):(\d+)/gi;
            let m: RegExpExecArray | null;
            while ((m = portRegex.exec(out)) !== null) {
                ports.push(parseInt(m[1], 10));
            }
        } else {
            // Linux: ss is standard on all modern distros
            out = await runCommand(`ss -tlnp | grep "pid=${pid}"`);
            const portRegex = /127\.0\.0\.1:(\d+)/g;
            let m: RegExpExecArray | null;
            while ((m = portRegex.exec(out)) !== null) {
                ports.push(parseInt(m[1], 10));
            }
        }
    } catch { /* port discovery failed, will try cached */ }

    return { ports, csrfToken };
}

/** Windows: wmic for process list, netstat for ports */
async function findServerPortsWindows(): Promise<{ ports: number[], csrfToken: string } | null> {
    let wmicOut: string;
    let pid: string | null = null;
    let csrfToken: string | null = null;

    try {
        wmicOut = await runCommand('wmic process get processid,commandline /format:list');
    } catch { return null; }

    // wmic output: CommandLine=...\nProcessId=...\n\n
    const blocks = wmicOut.split(/\n\n+/);
    for (const block of blocks) {
        if (!block.includes('language_server')) { continue; }

        const csrfMatch = block.match(/--csrf_token[=\s]+([A-Za-z0-9._\-/=+]+)/);
        const pidMatch  = block.match(/ProcessId=(\d+)/i);
        if (csrfMatch && pidMatch) {
            csrfToken = csrfMatch[1];
            pid = pidMatch[1];
            break;
        }
    }

    if (!pid || !csrfToken) { return null; }

    const ports: number[] = [];
    try {
        // netstat -ano shows PID column; filter to our PID
        const ns = await runCommand(`netstat -ano | findstr ${pid}`);
        // Lines: TCP  127.0.0.1:PORT  ...  LISTENING  PID
        const portRegex = /127\.0\.0\.1:(\d+)\s+\S+\s+LISTENING\s+(\d+)/gi;
        let m: RegExpExecArray | null;
        while ((m = portRegex.exec(ns)) !== null) {
            if (m[2] === pid) {
                ports.push(parseInt(m[1], 10));
            }
        }
    } catch { /* ignore port discovery failure */ }

    return { ports, csrfToken };
}


/**
 * Make the Connect-RPC/gRPC-web POST call to GetUserStatus on the given HTTPS port.
 */
function callGetUserStatus(port: number, csrfToken: string): Promise<QuotaResult> {
    return new Promise(resolve => {
        const body = '{}';
        const options: https.RequestOptions = {
            hostname: '127.0.0.1',
            port,
            path: GRPC_PATH,
            method: 'POST',
            rejectUnauthorized: false, // self-signed cert
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'x-codeium-csrf-token': csrfToken,
            },
            timeout: 6000,
        };

        const req = https.request(options, res => {
            let raw = '';
            res.on('data', chunk => (raw += chunk));
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    resolve({ models: [], credits: null, port, error: `HTTP ${res.statusCode}: ${raw.slice(0, 80)}` });
                    return;
                }
                try {
                    const json = JSON.parse(raw);
                    resolve(parseResponse(json, port));
                } catch (e: any) {
                    resolve({ models: [], credits: null, port, error: `Parse error: ${e.message}` });
                }
            });
        });
        req.on('error', err => resolve({ models: [], credits: null, port: null, error: err.message }));
        req.on('timeout', () => { req.destroy(); resolve({ models: [], credits: null, port: null, error: 'Timed out' }); });
        req.write(body);
        req.end();
    });
}

function parseResponse(json: any, port: number): QuotaResult {
    const models: ModelQuota[] = [];

    // Real response shape: json.userStatus.cascadeModelConfigData.clientModelConfigs[]
    const configs: any[] = json?.userStatus?.cascadeModelConfigData?.clientModelConfigs ?? [];

    // Deduplicate by label — some models appear multiple times with same quota
    const seen = new Set<string>();
    for (const c of configs) {
        const label: string = c.label ?? c.name ?? 'Unknown';
        if (seen.has(label)) { continue; }
        seen.add(label);

        const qi = c.quotaInfo ?? {};
        const remaining: number = qi.remainingFraction ?? 1;
        let resetAt: Date | null = null;
        if (qi.resetTime) { resetAt = new Date(qi.resetTime); }

        models.push({
            id: String(c.modelOrAlias?.model ?? label),
            name: label,
            remainingFraction: remaining,
            percentRemaining: Math.round(remaining * 100),
            resetAt,
        });
    }

    // Sort: lowest remaining first
    models.sort((a, b) => a.remainingFraction - b.remainingFraction);

    // Credits
    const ps = json?.userStatus?.planStatus ?? {};
    const credits: PromptCredits | null = ps.availablePromptCredits != null
        ? { available: ps.availablePromptCredits, monthly: ps.planInfo?.monthlyPromptCredits ?? 0 }
        : null;

    return { models, credits, port };
}

// ─── Public API ──────────────────────────────────────────────────────────────

let _pollingTimer: ReturnType<typeof setInterval> | null = null;
let _cachedPort: number | null = null;
let _cachedToken: string = '';

export async function fetchQuota(): Promise<QuotaResult> {
    // 1. Try process detection to find HTTPS port + token
    const found = await findServerPorts();

    if (found && found.ports.length > 0) {
        // Try each port with HTTPS — pick the one that responds
        for (const port of found.ports) {
            const result = await callGetUserStatus(port, found.csrfToken);
            if (result.models.length > 0 || !result.error) {
                _cachedPort = port;
                _cachedToken = found.csrfToken;
                return result;
            }
        }
        // Return the last attempt's error for context
        _cachedPort = found.ports[0];
        _cachedToken = found.csrfToken;
        return callGetUserStatus(found.ports[0], found.csrfToken);
    }

    // 2. Use cached port/token
    if (_cachedPort && _cachedToken) {
        return callGetUserStatus(_cachedPort, _cachedToken);
    }

    return {
        models: [],
        credits: null,
        port: null,
        error: 'Antigravity language server not found. Is Antigravity running?',
    };
}

export function startPolling(intervalMs: number, callback: (result: QuotaResult) => void): void {
    stopPolling();
    fetchQuota().then(callback);
    _pollingTimer = setInterval(() => fetchQuota().then(callback), intervalMs);
}

export function stopPolling(): void {
    if (_pollingTimer !== null) {
        clearInterval(_pollingTimer);
        _pollingTimer = null;
    }
}
