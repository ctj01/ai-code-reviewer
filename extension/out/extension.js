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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// File: src/extension.ts
const vscode = __importStar(require("vscode"));
function activate(context) {
    const secretStorage = context.secrets;
    const config = vscode.workspace.getConfiguration('aiReviewer');
    // Helper to get or prompt for API key
    function getApiKey() {
        return __awaiter(this, void 0, void 0, function* () {
            let apiKey = yield secretStorage.get('openaiKey');
            if (!apiKey) {
                apiKey = yield vscode.window.showInputBox({
                    prompt: 'Enter your OpenAI API Key',
                    ignoreFocusOut: true,
                    password: true
                });
                if (apiKey) {
                    yield secretStorage.store('openaiKey', apiKey);
                    vscode.window.showInformationMessage('API Key saved securely');
                }
            }
            return apiKey;
        });
    }
    // Command: AI Code Review (style)
    const styleCmd = vscode.commands.registerCommand('aiReviewer.reviewSelection', () => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const apiKey = yield getApiKey();
        if (!apiKey)
            return;
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return vscode.window.showWarningMessage('Open a file and select some code first');
        const code = editor.document.getText(editor.selection);
        if (!code.trim())
            return vscode.window.showWarningMessage('Please select a non-empty code snippet');
        const endpoint = config.get('endpoint') || 'http://localhost:3000/review';
        let resp;
        try {
            resp = yield fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ code })
            });
        }
        catch (err) {
            return vscode.window.showErrorMessage(`Error calling review service: ${err}`);
        }
        if (!resp.ok)
            return vscode.window.showErrorMessage(`Review service returned ${resp.status}`);
        const comments = yield resp.json();
        const panel = vscode.window.createWebviewPanel('aiReview', 'AI Code Review', vscode.ViewColumn.Beside, { enableScripts: false });
        const html = [`<html><body><h3>Style & Best Practices</h3><ul>`];
        for (const c of comments) {
            html.push(`<li><b>Line ${(_a = c.line) !== null && _a !== void 0 ? _a : '-'}:</b> ${c.message}</li>`);
        }
        html.push('</ul></body></html>');
        panel.webview.html = html.join('');
    }));
    context.subscriptions.push(styleCmd);
    // Command: AI Security Review (OWASP)
    const secCmd = vscode.commands.registerCommand('aiReviewer.owaspReview', () => __awaiter(this, void 0, void 0, function* () {
        var _b;
        const apiKey = yield getApiKey();
        if (!apiKey)
            return;
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return vscode.window.showWarningMessage('Open a file and select some code first');
        const code = editor.document.getText(editor.selection);
        if (!code.trim())
            return vscode.window.showWarningMessage('Please select a non-empty code snippet');
        const endpoint = config.get('owaspEndpoint') || 'http://localhost:3000/owasp-review';
        let resp;
        try {
            resp = yield fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ code })
            });
        }
        catch (err) {
            return vscode.window.showErrorMessage(`Error calling OWASP review service: ${err}`);
        }
        if (!resp.ok)
            return vscode.window.showErrorMessage(`OWASP service returned ${resp.status}`);
        const findings = yield resp.json();
        const panel = vscode.window.createWebviewPanel('owaspReview', 'AI Security Review', vscode.ViewColumn.Beside, { enableScripts: false });
        const html = ['<html><body><h3>Security Findings (OWASP Top 10)</h3><ul>'];
        for (const f of findings) {
            html.push(`<li><b>${f.category}</b> (Line ${(_b = f.line) !== null && _b !== void 0 ? _b : '-'}): ${f.message}</li>`);
        }
        html.push('</ul></body></html>');
        panel.webview.html = html.join('');
    }));
    context.subscriptions.push(secCmd);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map