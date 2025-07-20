# AI Code Reviewer Extension v0.0.5

🚀 **Now with Production Server!** No setup required - works out of the box.

A powerful VS Code extension that provides intelligent code review with inline diagnostics. Analyzes your code for quality issues, security vulnerabilities, and best practices using a comprehensive rules-based engine.

## ✨ Key Features

- **🔍 Unified Analysis**: Single command analyzes both code quality and security
- **📝 Inline Diagnostics**: Shows issues directly in your code with squiggly underlines
- **💡 Smart Suggestions**: Provides actionable fix recommendations
- **🛡️ Security Focus**: OWASP Top 10 and security best practices
- **🌍 Multi-Language**: JavaScript, TypeScript, Python, Java, C#, PHP, Go, and more
- **⚡ Cloud-Powered**: Uses production server (no local setup needed)
- **🔒 Privacy-First**: Local analysis engine, no external API dependencies

## Installation & Usage

### Install Extension
1. **From VS Code Marketplace**: Search "AI Code Reviewer(ictj01)" and install
2. **From VSIX File**: Download and install `ai-code-reviewer-extension-0.0.5.vsix`

### Immediate Usage (No Setup Required!)
1. **Open any code file** in VS Code
2. **Select code** or leave entire file selected
3. **Open Command Palette**: `Ctrl+Shift+P`
4. **Run**: "🔍 AI Code Review (Quality + Security)"
5. **See results**: Inline squiggly lines and Problems panel

**That's it!** Extension connects to production server automatically.

## ⚙️ Configuration (Optional)

The extension works out-of-the-box with smart defaults. Advanced users can customize:

```json
{
  "aiReviewer.endpoint": "https://ai-code-reviewer-2b4k.onrender.com/review",
  "aiReviewer.autoReview": false,
  "aiReviewer.maxIssuesPerFile": 50
}
```

## Setup

### OpenAI API Key Configuration
1. The first time you use the extension, you'll be prompted to enter your OpenAI API Key
2. The key is stored securely using VS Code's secret storage
3. You can get your API key from [OpenAI's website](https://platform.openai.com/api-keys)

### Endpoint Configuration (Optional)
You can configure custom endpoints in VS Code settings:

1. Open VS Code Settings (Ctrl+, / Cmd+,)
2. Search for "AI Code Reviewer"
3. Configure the following settings:
   - **AI Reviewer: Endpoint**: URL for code review service (default: https://ai-code-reviewer-2b4k.onrender.com/review)
   - **AI Reviewer: OWASP Endpoint**: URL for OWASP security review service (default: https://ai-code-reviewer-2b4k.onrender.com/owasp-review)

## Usage

### Code Style & Best Practices Review

1. Open a code file in VS Code
2. Select the code you want to review
3. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
4. Type "AI Code Review: Style & Best Practices" and select it
5. The review results will appear in a side panel

**Alternative method:**
- Right-click on selected code and choose "AI Code Review: Style & Best Practices" from the context menu

### Security Review (OWASP)

1. Open a code file in VS Code
2. Select the code you want to analyze for security issues
3. Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
4. Type "AI Security Review (OWASP)" and select it
5. The security analysis results will appear in a side panel

**Alternative method:**
- Right-click on selected code and choose "AI Security Review (OWASP)" from the context menu

## Review Results

The extension displays review results in a dedicated webview panel with:
- **Category**: Type of issue or suggestion
- **Line Number**: Specific line where the issue was found
- **Message**: Detailed description of the issue and recommendations

### Example Output

**Style & Best Practices Review:**
- **Performance** (Line 15): Consider using const instead of let for variables that don't change
- **Naming** (Line 22): Function name should be more descriptive
- **Code Quality** (Line 8): Consider extracting this logic into a separate function

**Security Review (OWASP):**
- **Injection** (Line 45): SQL query vulnerable to injection attacks
- **Authentication** (Line 12): Password validation is too weak
- **Data Exposure** (Line 33): Sensitive information logged to console

## Supported Languages

The extension works with any programming language supported by VS Code, including:
- JavaScript/TypeScript
- Python
- Java
- C#
- PHP
- Go
- Rust
- And many more!

## Requirements

- Visual Studio Code 1.50.0 or higher
- OpenAI API key
- Internet connection for API calls

## Extension Settings

This extension contributes the following settings:

- `aiReviewer.endpoint`: URL of the code review (style) endpoint
- `aiReviewer.owaspEndpoint`: URL of the OWASP security review endpoint

## Known Issues

- The extension requires an active internet connection to communicate with the AI service
- Large code selections may take longer to process
- API rate limits may apply based on your OpenAI plan

## Privacy & Security

- Your OpenAI API key is stored securely using VS Code's built-in secret storage
- Code is sent to the configured endpoints for analysis
- No code is stored permanently on external servers
- All communication is encrypted via HTTPS

## Contributing

If you'd like to contribute to this extension:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/ctj01/ai-code-reviewer/issues) page
2. Create a new issue with detailed information about the problem
3. Include your VS Code version and extension version

## Changelog

### 0.0.2
- Current version with AI code review and OWASP security analysis

### 0.0.1
- Initial release

## License

This project is licensed under the terms specified in the LICENSE.md file.

## Acknowledgments

- Built with VS Code Extension API
- Powered by OpenAI's language models
- Security analysis based on OWASP Top 10

---

**Enjoy coding with AI-powered reviews!** 🚀
