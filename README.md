
# AI Code Reviewer

A GitHub pull-request reviewer powered by OpenAI and multiple linters.  
Provides inline suggestions, summary comments, dynamic rule configuration, and a small metrics dashboard.

## Features

- **Multi-language linting**: ESLint (JS/TS), Flake8 (Python), dotnet-format (C#), Checkstyle (Java)  
- **Dynamic rule configuration**: adjust rules via `config/linterRules.json` without code changes  
- **AI-powered code review**: GPT-4 analyzes diffs and suggests readability, design, security, and style improvements  
- **Inline & summary comments**: posts feedback inline when the diff covers the line, or a summary fallback  
- **CLI mode**: run locally or in CI to generate `review-report.json`  
- **Metrics dashboard**: React component (`Dashboard.jsx`) visualizes comments by language and severity  
- **GitHub Actions integration**: automated PR review in your CI pipeline

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/ai-code-reviewer.git
cd ai-code-reviewer
````

### 2. Install dependencies

```bash
npm install
```

Make sure you have the following installed on your PATH:

* Node.js ≥16
* Python + flake8
* .NET SDK (for `dotnet format`)
* Java + Checkstyle CLI

### 3. Configure secrets

Create a `.env` file (or set environment variables) with:

```ini
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
```

---

## Configuration

Create or edit `config/linterRules.json`:

```json
{
  "eslint": {
    "enabled": true,
    "rules": {
      "no-console": "warn",
      "eqeqeq": "error"
    }
  },
  "flake8": {
    "enabled": true,
    "ignore": ["E203", "W503"]
  },
  "dotnetFormat": {
    "enabled": true,
    "severity": "warning",
    "reportFile": "lint-report.json"
  },
  "checkstyle": {
    "enabled": true,
    "configFile": "./config/google_checks.xml"
  }
}
```

---

## Usage

### CLI mode

```bash
node src/cli.js --payload path/to/payload.json --repo path/to/clone
```

This generates `review-report.json` with all suggested comments.

### Server / Webhook mode

```bash
npm start
# Listens on http://localhost:3000
```

Configure your GitHub webhook to POST `pull_request` events to `/webhook`.

---

## GitHub Actions

Example workflow (`.github/workflows/ai-review.yml`):

```yaml
name: AI Code Review

on: pull_request

jobs:
  review:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: npm ci
      - name: Run AI Review CLI
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          git clone https://github.com/${{ github.repository }} tmp/repo
          node src/cli.js --payload <(echo '${{ toJson(github.event) }}') --repo tmp/repo
      - name: Post Comments
        run: node scripts/postComments.js review-report.json
```

---

## Metrics Dashboard

Install Recharts:

```bash
npm install recharts
```

Render `<Dashboard />` in your React app. It reads `public/review-report.json` and shows:

* Total number of comments
* Bar chart by file extension (language)
* Pie chart by severity

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run linters & tests
4. Submit a Pull Request

---

## License

MIT © Cristian Mendoza

```
```
