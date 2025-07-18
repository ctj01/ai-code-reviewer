// File: src/server.js
import express from 'express';
import bodyParser from 'body-parser';
import { analyzeCodeSnippet, analyzeOwaspSnippet } from './analyzers/aiAnalyzer.js';

const app = express();
app.use(bodyParser.json());

/**
 * Extracts the Bearer token from Authorization header.
 */
function getUserKey(req) {
  const auth = (req.header('Authorization') || '').match(/^Bearer\s+(.+)$/i);
  return auth ? auth[1] : null;
}

/**
 * POST /review
 * Style & Best Practices analysis of a code snippet.
 */
app.post('/review', async (req, res) => {
  const userKey = getUserKey(req);
  if (!userKey) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const { code } = req.body;
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Missing or empty code' });
  }

  try {
    const suggestions = await analyzeCodeSnippet(code, userKey);
    return res.json(suggestions);
  } catch (err) {
    console.error('Error in /review:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /owasp-review
 * OWASP Top 10 security analysis of a code snippet.
 */
app.post('/owasp-review', async (req, res) => {
  const userKey = getUserKey(req);
  if (!userKey) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const { code } = req.body;
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Missing or empty code' });
  }

  try {
    const findings = await analyzeOwaspSnippet(code, userKey);
    return res.json(findings);
  } catch (err) {
    console.error('Error in /owasp-review:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple healthcheck
app.get('/', (_req, res) => {
  res.send('AI Code Reviewer API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
