import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | null = null;

function ensureStatusBar() {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.command = 'yunyi.checkBalance';
    }
    return statusBarItem;
}

export function updateStatusBar(text: string, tooltip?: string) {
    const item = ensureStatusBar();
    // Caller supplies the full text so we can support different formats without double-prefixes.
    item.text = text;
    item.tooltip = tooltip;
    item.show();
}

export function disposeStatusBar() {
    if (statusBarItem) {
        statusBarItem.dispose();
        statusBarItem = null;
    }
}
