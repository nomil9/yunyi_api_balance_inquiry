import * as vscode from 'vscode';

export function getConfiguration() {
    return vscode.workspace.getConfiguration('yunyi');
}

export function getBaseUrl(): string {
    return getConfiguration().get<string>('baseUrl') || 'https://yunyi.cfd/user/api/v1/me';
}

export type TokenSpec = { label: string; token: string };

function readNonEmptyString(key: string): string | undefined {
    const value = getConfiguration().get<string>(key);
    return value && value.trim() ? value.trim() : undefined;
}

export function getTokens(): TokenSpec[] {
    const api1 = readNonEmptyString('api-1');
    const api2 = readNonEmptyString('api-2');
    const api3 = readNonEmptyString('api-3');
    const legacy = readNonEmptyString('apiToken');

    // If user configured explicit tokens, use them; otherwise fall back to legacy single key.
    if (api1 || api2 || api3) {
        const list: TokenSpec[] = [];
        if (api1) list.push({ label: 'api-1', token: api1 });
        if (api2) list.push({ label: 'api-2', token: api2 });
        if (api3) list.push({ label: 'api-3', token: api3 });
        return list;
    }

    return legacy ? [{ label: 'yunyi', token: legacy }] : [];
}

export async function ensureLegacyToken(prompt: boolean = true): Promise<string | null> {
    const config = getConfiguration();
    let token = config.get<string>('apiToken');

    if (token) {
        return token;
    }

    if (!prompt) {
        return null;
    }

    const input = await vscode.window.showInputBox({
        prompt: '请输入 Yunyi API 的 Bearer token，它会保存到设置中。',
        ignoreFocusOut: true,
        password: true
    });

    if (input) {
        await config.update('apiToken', input, vscode.ConfigurationTarget.Global);
    }

    return input || null;
}

export function isAutoRefreshEnabled(): boolean {
    return getConfiguration().get<boolean>('autoRefresh') ?? true;
}

export function getRefreshIntervalMinutes(): number {
    const value = getConfiguration().get<number>('refreshIntervalMinutes');
    return value && value > 0 ? value : 10;
}

export function getWarningThresholdPercent(): number {
    const value = getConfiguration().get<number>('warningThresholdPercent');
    if (value === undefined || value === null || Number.isNaN(value)) {
        return 80;
    }
    return Math.max(0, Math.min(100, value));
}
