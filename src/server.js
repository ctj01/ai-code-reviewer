// File: src/server.js
import express from 'express';
import bodyParser from 'body-parser';
import { analyzeCodeSnippet, analyzeOwaspSnippet } from './analyzers/aiAnalyzerLocal.js';

const app = express();

// Enable CORS for all origins (allows VS Code extensions to make requests)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json());

/**
 * Extracts the Bearer token from Authorization header (maintained for compatibility).
 * Note: Token is no longer required but maintained to avoid breaking existing clients.
 */
function getUserKey(req) {
  const auth = (req.header('Authorization') || '').match(/^Bearer\s+(.+)$/i);
  return auth ? auth[1] : 'local-analysis'; // Return placeholder
}

/**
 * POST /review
 * Comprehensive code analysis including style, best practices, and security (OWASP Top 10).
 * Unified endpoint that performs both quality and security analysis locally.
 */
app.post('/review', async (req, res) => {
  const userKey = getUserKey(req);
  
  // Log for debugging but no longer required
  if (!userKey || userKey === 'local-analysis') {
    console.log('ℹ️ Request without API key - using local analysis');
  }
  
  const { code, language } = req.body;
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Missing or empty code' });
  }

  try {
    // Unified analysis: quality + security
    const qualityAnalysis = await analyzeCodeSnippet(code, language || 'javascript');
    const securityAnalysis = await analyzeOwaspSnippet(code, language || 'javascript');
    
    // Combine results
    const allIssues = [...qualityAnalysis, ...securityAnalysis];
    
    // Organize response
    const response = {
      summary: {
        total_issues: allIssues.length,
        quality_issues: qualityAnalysis.length,
        security_issues: securityAnalysis.length,
        by_severity: {
          critical: allIssues.filter(i => i.severity === 'CRITICAL').length,
          high: allIssues.filter(i => i.severity === 'HIGH').length,
          medium: allIssues.filter(i => i.severity === 'MEDIUM').length,
          low: allIssues.filter(i => i.severity === 'LOW').length
        }
      },
      issues: allIssues.sort((a, b) => {
        const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      analysis_info: {
        language: language || 'javascript',
        rules_applied: '114+ quality and security patterns',
        analysis_time: Date.now(),
        engine_version: '2.0.0-unified'
      }
    };
    
    return res.json(response);
  } catch (err) {
    console.error('Error in /review:', err);
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

/**
 * GET /health
 * Health check endpoint with system information
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0-unified',
    endpoints: {
      '/review': 'POST - Unified code quality and security analysis',
      '/health': 'GET - System health and configuration info'
    },
    features: {
      'unified_analysis': true,
      'quality_and_security': true,
      'local_analysis': true,
      'owasp_security': true,
      'code_quality': true,
      'multi_language': true,
      'no_api_key_required': true,
      'csharp_support': true,
      'framework_detection': true
    },
    supported_languages: [
      'javascript', 'typescript', 'python', 'java', 'csharp', 'php', 'go', 'rust', 'cpp', 'c'
    ],
    rules_stats: {
      'total_rules': '114+',
      'core_rules': 27,
      'extended_rules': 30,
      'framework_rules': 19,
      'csharp_rules': 38
    }
  });
});

// Simple healthcheck (maintain for compatibility)
app.get('/', (req, res) => {
  res.json({
    message: 'AI Code Reviewer API v2.0 - Unified Analysis',
    documentation: '/health',
    features: 'Local unified code quality and security analysis',
    endpoints: {
      '/review': 'POST - Complete code analysis (quality + security)',
      '/health': 'GET - System status and configuration'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AI Code Reviewer Server v2.0 listening on port ${PORT}`);
  console.log(`✨ Features: Unified Analysis (Quality + Security), No API Keys Required`);
  console.log(`🔍 Supported: 114+ Rules, 6+ Languages, Multiple Frameworks`);
  console.log(`📖 Endpoints: /review (POST), /health (GET)`);
  console.log(`📖 Health Check: http://localhost:${PORT}/health`);
});
