import * as vscode from 'vscode';
import { fetchBalance, describeBalance, BalanceSummary } from './api';
import {
    ensureLegacyToken,
    getBaseUrl,
    getRefreshIntervalMinutes,
    getTokens,
    getWarningThresholdPercent,
    isAutoRefreshEnabled,
    TokenSpec
} from './config';
import { disposeStatusBar, updateStatusBar } from './statusBar';

let refreshTimer: NodeJS.Timeout | null = null;

export function activate(context: vscode.ExtensionContext) {
    const command = vscode.commands.registerCommand('yunyi.checkBalance', async () => {
        await refreshBalance(true);
    });

    context.subscriptions.push(command);

    updateStatusBar('yunyi：--%', '正在初始化...');

    // Refresh once on startup; do not prompt for token here.
    refreshBalance(false);
    setupAutoRefresh();

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (
                e.affectsConfiguration('yunyi.autoRefresh') ||
                e.affectsConfiguration('yunyi.refreshIntervalMinutes') ||
                e.affectsConfiguration('yunyi.warningThresholdPercent') ||
                e.affectsConfiguration('yunyi.apiToken') ||
                e.affectsConfiguration('yunyi.api-1') ||
                e.affectsConfiguration('yunyi.api-2') ||
                e.affectsConfiguration('yunyi.api-3')
            ) {
                setupAutoRefresh();
            }
        })
    );
}

async function refreshBalance(showNotifications: boolean) {
    let tokens = getTokens();

    if (tokens.length === 0) {
        // Backward compatible: prompt for a single legacy token only when user manually triggers refresh.
        const legacy = await ensureLegacyToken(showNotifications);
        if (legacy) {
            tokens = [{ label: 'yunyi', token: legacy }];
        }
    }

    if (tokens.length === 0) {
        updateStatusBar('yunyi：--%', '请在设置中填写 yunyi.api-1 / yunyi.api-2 / yunyi.api-3（或 yunyi.apiToken）');
        if (showNotifications) {
            vscode.window.showWarningMessage('请先配置 Yunyi API token，然后再刷新。');
        }
        return;
    }

    try {
        const summaries = await fetchAllSummaries(tokens);
        updateStatusBar(formatStatusText(summaries), buildTooltip(summaries));
        if (showNotifications) {
            vscode.window.showInformationMessage(formatStatusText(summaries));
        }
    } catch (error: any) {
        const message = error?.message || '未知错误';
        updateStatusBar('yunyi：--%', message);
        console.error('Yunyi balance fetch failed', error);
        if (showNotifications) {
            vscode.window.showErrorMessage(`获取 Yunyi 信息失败：${message}`);
        }
    }
}

async function fetchAllSummaries(tokens: TokenSpec[]): Promise<BalanceSummary[]> {
    const baseUrl = getBaseUrl();

    const results = await Promise.allSettled(tokens.map(async t => ({ label: t.label, data: await fetchBalance(baseUrl, t.token) })));
    const summaries: BalanceSummary[] = [];

    for (const r of results) {
        if (r.status !== 'fulfilled') {
            continue;
        }
        const summary = describeBalance(r.value.data);
        // Prefer API's service_type; otherwise use configured label.
        summary.service = summary.service || r.value.label;
        summaries.push(summary);
    }

    // Stable order: api-1 first, then api-2, then api-3, then the rest.
    const order = new Map<string, number>([
        ['api-1', 0],
        ['api-2', 1],
        ['api-3', 2]
    ]);

    summaries.sort((a, b) => {
        const ak = (a.service || '').toLowerCase();
        const bk = (b.service || '').toLowerCase();
        const av = order.has(ak) ? (order.get(ak) as number) : 99;
        const bv = order.has(bk) ? (order.get(bk) as number) : 99;
        if (av !== bv) return av - bv;
        return ak.localeCompare(bk);
    });

    return summaries;
}

function formatStatusText(summaries: BalanceSummary[]): string {
    const percents: string[] = [];

    for (const s of summaries) {
        if (s.usedPercent === undefined || Number.isNaN(s.usedPercent)) {
            continue;
        }
        const p = Math.max(0, Math.min(100, Math.round(s.usedPercent)));
        percents.push(`${p}%`);
    }

    if (percents.length === 0) {
        return 'yunyi：--%';
    }

    const threshold = getWarningThresholdPercent();
    const hasWarning = summaries.some(s => s.usedPercent !== undefined && !Number.isNaN(s.usedPercent) && s.usedPercent >= threshold);
    const warningPrefix = hasWarning ? '$(warning) ' : '';

    // Example: yunyi：3%  or  yunyi：3%，1%
    return `${warningPrefix}yunyi：${percents.join('，')}`;
}

function buildTooltip(summaries: BalanceSummary[]): string {
    const blocks: string[] = [];

    for (const s of summaries) {
        const lines: string[] = [];
        if (s.service) {
            lines.push(`服务：${s.service}`);
        }
        lines.push(`可用余额：${s.balance ?? '未知'}`);
        lines.push(`总额度：${s.total ?? '未知'} · 已用余额：${s.used ?? '未知'}`);
        if (s.usedPercent !== undefined && !Number.isNaN(s.usedPercent)) {
            lines.push(`已用比例：${Math.max(0, Math.min(100, Math.round(s.usedPercent)))}%`);
        }
        if (s.status) lines.push(`状态：${translateStatus(s.status)}`);
        if (s.todayQuota) lines.push(`今日额度：${s.todayQuota}`);
        if (s.resetTime) lines.push(`重置时间：${formatResetTime(s.resetTime)}`);
        blocks.push(lines.join('\n'));
    }

    blocks.push(`当前时间：${new Date().toLocaleTimeString()}`);
    return blocks.join('\n\n');
}

export function deactivate() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
    disposeStatusBar();
}

function translateStatus(status: string): string {
    const normalized = status.trim().toLowerCase();
    if (normalized === 'active') return '已激活';
    if (normalized === 'inactive') return '未激活';
    if (normalized === 'expired') return '已过期';
    return status;
}

function formatResetTime(value: string): string {
    // Example: 2026-01-31T00:00:00+08:00 -> 00:00
    const match = value.match(/T(\d{2}:\d{2}):\d{2}/);
    return match ? match[1] : value;
}

function setupAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }

    if (!isAutoRefreshEnabled()) {
        return;
    }

    const intervalMs = getRefreshIntervalMinutes() * 60 * 1000;
    refreshTimer = setInterval(() => {
        refreshBalance(false);
    }, intervalMs);
}
