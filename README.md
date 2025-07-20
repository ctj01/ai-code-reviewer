# AI Code Reviewer

A comprehensive solution for AI-powered code reviews, combining an Express-based API and a Visual Studio Code extension.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Local Setup](#local-setup)

   * [API (Express)](#api-express)
   * [Extension (VS Code)](#extension-vs-code)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [Deployment](#deployment)

   * [Deploy API to Render](#deploy-api-to-render)
8. [Publishing the Extension](#publishing-the-extension)
9. [License](#license)

---

## Overview

This project provides:

* **API (Express)**: A server that receives code snippets, forwards them to OpenAI for analysis (style review or OWASP Top 10 security review), and returns structured JSON suggestions.
* **VS Code Extension**: Seamless integration into Visual Studio Code, allowing developers to select code and invoke AI-driven reviews directly from the editor.

---

## Architecture

```
+----------------------+      +-------------------------+
| VS Code Extension    | <--> | Express API             |
| - Sends selected code|      | - Receives snippet      |
|   + OpenAI API Key   |      | - Calls OpenAI with key |
| - Displays feedback  |      | - Returns JSON          |
+----------------------+      +-------------------------+
```

Optional: Deploy the API to a serverless platform (e.g., Render) for public access.

---

## Prerequisites

* **Node.js** v14+ installed
* **npm** or **yarn**
* **Visual Studio Code**
* OpenAI account with API Key

---

## Local Setup

### API (Express)

1. Navigate to project root:

   ```bash
   cd ai-code-reviewer
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the server:

   ```bash
   npm start
   ```
4. The API listens on [http://localhost:3000](http://localhost:3000). Endpoints:

   * `POST /review`           (style & best practices)
   * `POST /owasp-review`     (OWASP Top 10 security)

### Extension (VS Code)

1. Open the `extension/` folder:

   ```bash
   cd extension
   ```
2. Install dev dependencies:

   ```bash
   npm install
   ```
3. Compile TypeScript:

   ```bash
   npm run compile
   ```
4. Launch Extension Development Host in VS Code:

   * Open `extension/` in VS Code.
   * Press **F5** to start debugging.

---

## Configuration

In VS Code settings (`Ctrl+,`), search for **AI Code Reviewer**:

* **AI Code Reviewer › Endpoint**: URL for style review API (default `http://localhost:3000/review`).
* **AI Code Reviewer › Owasp Endpoint**: URL for security review API (default `http://localhost:3000/owasp-review`).

When invoking a review, the extension prompts once for your **OpenAI API Key** and stores it securely.

---

## Usage

1. Open a code file in the Extension Host.
2. Select a snippet.
3. Open the Command Palette (`Ctrl+Shift+P`).
4. Run one of the commands:

   * **AI Code Review: Style & Best Practices**
   * **AI Security Review (OWASP)**
5. View results in the side panel Webview.

---

## Deployment

### Deploy API to Render

1. Push your code to GitHub.
2. In Render dashboard, create a new **Web Service**.
3. Connect your repo and select branch `main`.
4. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
5. Choose the **Free** plan.
6. Deploy and copy the public URL (e.g., `https://<your-service>.onrender.com`).
7. Update extension settings to point to this URL.

---

## Publishing the Extension

1. Install `vsce`:

   ```bash
   npm install -g vsce
   ```
2. In `extension/`, bump version in `package.json`.
3. Publish package:

   ```bash
   vsce package
   vsce publish
   ```
4. Users can install via Marketplace or:

   ```bash
   code --install-extension <publisher>.ai-code-reviewer-extension
   ```

---

## License

This project is released under the **MIT License**. See [LICENSE](LICENSE) for details.
