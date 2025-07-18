// File: src/extension.ts
import * as vscode from 'vscode';

/**
 * Sends a POST request to the given endpoint with the code payload,
 * including OpenAI API key in the Authorization header.
 */
async function postCodeForReview(
  endpoint: string,
  code: string,
  secretStorage: vscode.SecretStorage
): Promise<Response | undefined> {
  // Retrieve stored OpenAI API key or prompt the user
  let apiKey = await secretStorage.get('openaiKey');
  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenAI API Key',
      ignoreFocusOut: true,
      password: true
    });
    if (apiKey) {
      await secretStorage.store('openaiKey', apiKey);
      vscode.window.showInformationMessage('OpenAI API Key saved securely.');
    } else {
      vscode.window.showErrorMessage('OpenAI API Key is required.');
      return;
    }
  }

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ code })
    });
    return resp;
  } catch (err) {
    vscode.window.showErrorMessage(`Error calling review service: ${err}`);
    return;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const secretStorage = context.secrets;
  const config = vscode.workspace.getConfiguration('aiReviewer');

  // Common snippet retrieval and command runner
  const runReview = async (
    endpointKey: 'endpoint' | 'owaspEndpoint',
    title: string
  ) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return vscode.window.showWarningMessage('Open a file and select some code first');
    }
    const code = editor.document.getText(editor.selection);
    if (!code.trim()) {
      return vscode.window.showWarningMessage('Please select a non-empty code snippet');
    }

    const endpoint = config.get<string>(endpointKey)!;
    const resp = await postCodeForReview(endpoint, code, secretStorage);
    if (!resp || !resp.ok) {
      return vscode.window.showErrorMessage(`${title} service returned ${resp?.status}`);
    }

    const data = await resp.json();
    const panel = vscode.window.createWebviewPanel(
      endpointKey,
      `AI ${title}`,
      vscode.ViewColumn.Beside,
      { enableScripts: false }
    );

    // Build HTML list from results
    const html: string[] = [`<html><body><h3>${title}</h3><ul>`];
    for (const item of data) {
      const prefix = 'category' in item
        ? `<b>${item.category}</b> (Line ${item.line ?? '-'})`
        : `Line ${item.line ?? '-'}`;
      const message = item.message || JSON.stringify(item);
      html.push(`<li>${prefix}: ${message}</li>`);
    }
    html.push('</ul></body></html>');
    panel.webview.html = html.join('');
  };

  // Register Style & Best Practices command
  context.subscriptions.push(
    vscode.commands.registerCommand('aiReviewer.reviewSelection', () =>
      runReview('endpoint', 'Code Review: Style & Best Practices')
    )
  );

  // Register OWASP Security Review command
  context.subscriptions.push(
    vscode.commands.registerCommand('aiReviewer.owaspReview', () =>
      runReview('owaspEndpoint', 'Security Review (OWASP Top 10)')
    )
  );
}

export function deactivate() {
  // no cleanup needed
}
