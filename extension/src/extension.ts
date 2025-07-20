// File: src/extension.ts
import * as vscode from 'vscode';

/**
 * Sends a POST request to the unified review endpoint with the code payload.
 * No longer requires OpenAI API key since we use local analysis.
 */
async function postCodeForReview(
  endpoint: string,
  code: string,
  language?: string
): Promise<Response | undefined> {
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        code,
        language: language || 'javascript',
        options: {
          includeMetrics: true,
          includeSecurity: true,
          includeQuality: true
        }
      })
    });
    return resp;
  } catch (err) {
    vscode.window.showErrorMessage(`Error calling review service: ${err}`);
    return;
  }
}

/**
 * Detects the programming language based on file extension
 */
function detectLanguage(document: vscode.TextDocument): string {
  const extension = document.fileName.split('.').pop()?.toLowerCase();
  
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cs': 'csharp',
    'cpp': 'cpp',
    'c': 'c',
    'php': 'php',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby'
  };
  
  return languageMap[extension || ''] || 'javascript';
}

/**
 * Creates diagnostic items from review results
 */
function createDiagnostics(issues: any[]): vscode.Diagnostic[] {
  return issues.map(issue => {
    const line = Math.max(0, (issue.line || 1) - 1);
    const column = Math.max(0, (issue.column || 1) - 1);
    
    const range = new vscode.Range(
      new vscode.Position(line, column),
      new vscode.Position(line, column + 10) // Highlight ~10 characters
    );
    
    const severity = getSeverityLevel(issue.severity);
    const diagnostic = new vscode.Diagnostic(range, issue.message, severity);
    
    diagnostic.source = 'AI Code Reviewer';
    diagnostic.code = {
      value: issue.categoryKey || issue.category || 'general',
      target: vscode.Uri.parse('https://github.com/ctj01/ai-code-reviewer')
    };
    
    // Add related information if available
    if (issue.fix) {
      diagnostic.relatedInformation = [
        new vscode.DiagnosticRelatedInformation(
          new vscode.Location(vscode.window.activeTextEditor!.document.uri, range),
          `💡 Suggestion: ${issue.fix}`
        )
      ];
    }
    
    return diagnostic;
  });
}

/**
 * Maps severity strings to VSCode diagnostic severity levels
 */
function getSeverityLevel(severity: string): vscode.DiagnosticSeverity {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
    case 'HIGH':
      return vscode.DiagnosticSeverity.Error;
    case 'MEDIUM':
      return vscode.DiagnosticSeverity.Warning;
    case 'LOW':
      return vscode.DiagnosticSeverity.Information;
    default:
      return vscode.DiagnosticSeverity.Hint;
  }
}

/**
 * Shows a summary of the review results
 */
function showReviewSummary(data: any) {
  const summary = data.summary || {};
  const totalIssues = summary.totalIssues || data.length;
  const criticalCount = summary.criticalIssues || 0;
  const highCount = summary.highSeverityIssues || 0;
  
  let message = `🔍 AI Code Review Complete: ${totalIssues} issues found`;
  
  if (criticalCount > 0) {
    message += ` (${criticalCount} critical, ${highCount} high severity)`;
  } else if (highCount > 0) {
    message += ` (${highCount} high severity)`;
  }
  
  if (totalIssues === 0) {
    vscode.window.showInformationMessage('✅ No issues found! Code looks good.');
  } else if (criticalCount > 0 || highCount > 0) {
    vscode.window.showWarningMessage(message);
  } else {
    vscode.window.showInformationMessage(message);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('aiReviewer');
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('aiCodeReviewer');
  
  context.subscriptions.push(diagnosticCollection);

  // Unified review command that handles both quality and security
  const runUnifiedReview = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return vscode.window.showWarningMessage('Open a file and select some code first');
    }
    
    const selection = editor.selection;
    const code = selection.isEmpty 
      ? editor.document.getText() // Review entire file if no selection
      : editor.document.getText(selection);
      
    if (!code.trim()) {
      return vscode.window.showWarningMessage('Please select a non-empty code snippet or open a file with content');
    }

    const language = detectLanguage(editor.document);
    const endpoint = config.get<string>('endpoint')!;
    
    // Show progress indicator
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "AI Code Review in progress...",
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 0 });
      
      const resp = await postCodeForReview(endpoint, code, language);
      progress.report({ increment: 50 });
      
      if (!resp || !resp.ok) {
        return vscode.window.showErrorMessage(`Code review service returned ${resp?.status}`);
      }

      const data = await resp.json();
      progress.report({ increment: 100 });
      
      // Clear previous diagnostics for this document
      diagnosticCollection.delete(editor.document.uri);
      
      // Create and set new diagnostics
      const issues = data.issues || data;
      if (Array.isArray(issues) && issues.length > 0) {
        const diagnostics = createDiagnostics(issues);
        diagnosticCollection.set(editor.document.uri, diagnostics);
      }
      
      // Show summary
      showReviewSummary(data);
    });
  };

  // Register the unified review command
  context.subscriptions.push(
    vscode.commands.registerCommand('aiReviewer.reviewSelection', runUnifiedReview)
  );

  // Keep the OWASP command for backward compatibility but make it use the same endpoint
  context.subscriptions.push(
    vscode.commands.registerCommand('aiReviewer.owaspReview', runUnifiedReview)
  );

  // Command to clear all diagnostics
  context.subscriptions.push(
    vscode.commands.registerCommand('aiReviewer.clearDiagnostics', () => {
      diagnosticCollection.clear();
      vscode.window.showInformationMessage('AI Code Review diagnostics cleared');
    })
  );

  // Auto-clear diagnostics when document is modified significantly
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.contentChanges.length > 0) {
        // Clear diagnostics after a short delay to avoid flickering
        setTimeout(() => {
          diagnosticCollection.delete(event.document.uri);
        }, 2000);
      }
    })
  );
}

export function deactivate() {
  // no cleanup needed
}
