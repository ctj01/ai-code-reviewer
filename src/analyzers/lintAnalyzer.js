import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { parseStringPromise } from 'xml2js';

export async function handleLintAnalysis(repoPath) {
  const comments = [];

  // Load dynamic config
  let config = {};
  const configPath = path.resolve(process.cwd(), 'config/linterRules.json');
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    console.warn('Dynamic config not found or invalid, using defaults');
  }

  // 1) JavaScript / TypeScript (ESLint)
  if (config.eslint?.enabled !== false) {
    const ruleFlags = [];
    for (const [rule, level] of Object.entries(config.eslint.rules || {})) {
      ruleFlags.push(`--rule ${rule}:${level}`);
    }
    try {
      const cmd = [
        'npx eslint',
        `"${repoPath}/src/**/*.{js,jsx,ts,tsx}"`,
        '-f json',
        ...ruleFlags
      ].join(' ');
      const eslintOut = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const eslintResults = JSON.parse(eslintOut);
      for (const fileResult of eslintResults) {
        const rel = path.relative(repoPath, fileResult.filePath);
        for (const msg of fileResult.messages) {
          comments.push({ path: rel, line: msg.line, message: `${msg.message} (${msg.ruleId})` });
        }
      }
    } catch {}
  }

  // 2) Python (Flake8)
  if (config.flake8?.enabled) {
    const ignoreFlags = config.flake8.ignore?.length
      ? `--ignore ${config.flake8.ignore.join(',')}`
      : '';
    try {
      const cmd = `flake8 "${repoPath}/src/**/*.py" --format=json ${ignoreFlags}`;
      const flakeOut = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const flakeResults = JSON.parse(flakeOut);
      for (const [filePath, errs] of Object.entries(flakeResults)) {
        const rel = path.relative(repoPath, filePath);
        for (const err of errs) {
          comments.push({ path: rel, line: err.line_number, message: `${err.code}: ${err.text}` });
        }
      }
    } catch {}
  }

  // 3) C# (dotnet format)
  if (config.dotnetFormat?.enabled) {
    try {
      const reportFile = path.join(repoPath, 'lint-report.json');
      execSync(
        `dotnet format --verify-no-changes --severity error --report ${reportFile}`,
        { stdio: 'ignore' }
      );
      const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      for (const item of report) {
        comments.push({ path: path.relative(repoPath, item.file), line: item.line, message: item.message });
      }
    } catch {}
  }

  // 4) Java (Checkstyle)
  if (config.checkstyle?.enabled) {
    const styleConfig = config.checkstyle.configFile || '/google_checks.xml';
    try {
      const cmd = `checkstyle -c ${styleConfig} -f xml "${repoPath}/src/**/*.java"`;
      const checkstyleOut = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const xml = await parseStringPromise(checkstyleOut);
      const filesXml = xml.checkstyle.file || [];
      for (const fileEntry of filesXml) {
        const fileName = fileEntry.$.name;
        const rel = path.relative(repoPath, fileName);
        for (const err of fileEntry.error || []) {
          const line = parseInt(err.$.line, 10);
          const message = `${err.$.message} (${err.$.source})`;
          comments.push({ path: rel, line, message });
        }
      }
    } catch {}
  }

  return comments;
}
