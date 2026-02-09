import axios from 'axios';

export interface YunyiResponse {
    balance?: string | number;
    data?: {
        balance?: string | number;
        quota?: Record<string, any>;
        usage?: Record<string, any>;
    };
    user?: {
        balance?: string | number;
    };
    quota?: Record<string, any>;
    quotas?: Record<string, any>;
    usage?: Record<string, any>;
    billing_type?: string;
    service_type?: string;
    service?: string;
    status?: string;
    total?: string | number;
    used?: string | number;
    reset_at?: string;
    next_reset_at?: string;
    [key: string]: any;
}

export interface BalanceSummary {
    balance?: string;
    total?: string;
    used?: string;
    usedPercent?: number;
    status?: string;
    service?: string;
    billingType?: string;
    quotaType?: string;
    dailyQuota?: string;
    todayQuota?: string;
    message?: string;
    raw?: YunyiResponse;
    resetTime?: string;
}

export async function fetchBalance(baseUrl: string, token: string): Promise<YunyiResponse> {
    const response = await axios.get<YunyiResponse>(baseUrl, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        },
        timeout: 10000
    });

    return response.data;
}

export function describeBalance(data: YunyiResponse): BalanceSummary {
    const summary: BalanceSummary = {
        raw: data,
        status: stringifyValue(data.status),
        service: stringifyValue(data.service ?? data.service_type),
        billingType: stringifyValue(data.billing_type)
    };

    const quotaSource = data.quota ?? data.quotas ?? data.data?.quota;
    const usageSource = data.usage ?? data.data?.usage;

    if (quotaSource) {
        // Yunyi (duration) API fields:
        //   quota.daily_quota: daily total
        //   quota.daily_spent: daily used
        //   quota.daily_used: sometimes percentage (0-100)
        const dailyQuotaNum = firstDefinedNumber(quotaSource.daily_quota, quotaSource.dailyQuota);
        const dailySpentNum = firstDefinedNumber(quotaSource.daily_spent, quotaSource.daily_total_spent);

        const quotaTotal = dailyQuotaNum ?? (usageSource ? firstDefinedNumber(usageSource.daily_quota, usageSource.daily_total) : undefined);
        const quotaUsed = dailySpentNum ?? (usageSource ? firstDefinedNumber(usageSource.daily_spent, usageSource.daily_total_spent) : undefined);

        if (quotaTotal !== undefined) {
            summary.total = stringifyValue(quotaTotal);
            summary.dailyQuota = stringifyValue(quotaTotal);
            summary.todayQuota = stringifyValue(quotaTotal);
        }
        if (quotaUsed !== undefined) {
            summary.used = stringifyValue(quotaUsed);
        }
        if (quotaSource.type || quotaSource.billing_type) {
            summary.quotaType = stringifyValue(quotaSource.type ?? quotaSource.billing_type);
        }

        if (quotaTotal !== undefined && quotaUsed !== undefined) {
            summary.balance = stringifyValue(Math.max(0, quotaTotal - quotaUsed));
        }

        // Prefer provided percent if it looks like 0-100.
        const providedPercent = toNumber(quotaSource.daily_used);
        if (providedPercent !== undefined && providedPercent >= 0 && providedPercent <= 100) {
            summary.usedPercent = Math.round(providedPercent);
        } else if (quotaTotal !== undefined && quotaTotal > 0 && quotaUsed !== undefined) {
            summary.usedPercent = Math.round((quotaUsed / quotaTotal) * 100);
        }

        summary.resetTime = stringifyValue(quotaSource.next_reset_at ?? quotaSource.reset_at);
    }

    if (!summary.total) {
        summary.total = stringifyValue(data.total ?? data.capacity ?? data.limit);
    }
    if (!summary.used) {
        summary.used = stringifyValue(data.used ?? data.consume);
    }
    if (!summary.resetTime) {
        summary.resetTime = stringifyValue(data.reset_at ?? data.next_reset_at);
    }
    if (!summary.balance) {
        summary.balance = stringifyValue(data.balance ?? data.data?.balance ?? data.user?.balance);
    }
    if (!summary.balance && typeof data === 'object') {
        summary.message = JSON.stringify(data);
    }

    return summary;
}

function stringifyValue(value: any): string | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === 'number') {
        return Number.isInteger(value) ? String(value) : value.toFixed(2);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
            return undefined;
        }
        return trimmed;
    }
    return String(value);
}

function firstDefinedNumber(...values: any[]): number | undefined {
    for (const value of values) {
        const parsed = toNumber(value);
        if (parsed !== undefined) {
            return parsed;
        }
    }
    return undefined;
}

function toNumber(value: any): number | undefined {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.replace(/,/g, '').trim();
        if (normalized === '') return undefined;
        const parsed = Number(normalized);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }
    return undefined;
}
