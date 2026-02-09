"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguration = getConfiguration;
exports.getBaseUrl = getBaseUrl;
exports.getTokens = getTokens;
exports.ensureLegacyToken = ensureLegacyToken;
exports.isAutoRefreshEnabled = isAutoRefreshEnabled;
exports.getRefreshIntervalMinutes = getRefreshIntervalMinutes;
exports.getWarningThresholdPercent = getWarningThresholdPercent;
const vscode = __importStar(require("vscode"));
function getConfiguration() {
    return vscode.workspace.getConfiguration('yunyi');
}
function getBaseUrl() {
    return getConfiguration().get('baseUrl') || 'https://yunyi.cfd/user/api/v1/me';
}
function readNonEmptyString(key) {
    const value = getConfiguration().get(key);
    return value && value.trim() ? value.trim() : undefined;
}
function getTokens() {
    const api1 = readNonEmptyString('api-1');
    const api2 = readNonEmptyString('api-2');
    const api3 = readNonEmptyString('api-3');
    const legacy = readNonEmptyString('apiToken');
    // If user configured explicit tokens, use them; otherwise fall back to legacy single key.
    if (api1 || api2 || api3) {
        const list = [];
        if (api1)
            list.push({ label: 'api-1', token: api1 });
        if (api2)
            list.push({ label: 'api-2', token: api2 });
        if (api3)
            list.push({ label: 'api-3', token: api3 });
        return list;
    }
    return legacy ? [{ label: 'yunyi', token: legacy }] : [];
}
async function ensureLegacyToken(prompt = true) {
    const config = getConfiguration();
    let token = config.get('apiToken');
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
function isAutoRefreshEnabled() {
    return getConfiguration().get('autoRefresh') ?? true;
}
function getRefreshIntervalMinutes() {
    const value = getConfiguration().get('refreshIntervalMinutes');
    return value && value > 0 ? value : 10;
}
function getWarningThresholdPercent() {
    const value = getConfiguration().get('warningThresholdPercent');
    if (value === undefined || value === null || Number.isNaN(value)) {
        return 80;
    }
    return Math.max(0, Math.min(100, value));
}
//# sourceMappingURL=config.js.map