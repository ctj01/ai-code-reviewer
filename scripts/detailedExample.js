/**
 * Script para mostrar ejemplos detallados de los problemas detectados
 */

import { analyzeCodeSnippet } from '../src/analyzers/aiAnalyzerLocal.js';

// Código de ejemplo con problema específico de seguridad
const securityTestCode = `
const express = require('express');
const app = express();

// SQL Injection vulnerability - Very dangerous!
app.get('/user/:id', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.params.id;
  db.query(query, (err, result) => {
    res.send(result);
  });
});

// XSS vulnerability
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  res.send('<h1>Results for: ' + searchTerm + '</h1>');
});

// Weak crypto usage
const crypto = require('crypto');
const hash = crypto.createHash('md5').update('password').digest('hex');
`;

async function showDetailedExamples() {
  console.log('🔍 Detailed Security Analysis Example');
  console.log('=' .repeat(50));
  
  const analysis = await analyzeCodeSnippet(securityTestCode, 'javascript');
  
  console.log(`\n📊 Total issues found: ${analysis.length}`);
  
  analysis.forEach((issue, index) => {
    console.log(`\n${index + 1}. 🚨 ${issue.severity} SEVERITY`);
    console.log(`   Line ${issue.line}: ${issue.message}`);
    if (issue.fix) {
      console.log(`   💡 Suggested fix: ${issue.fix}`);
    }
    console.log(`   🎯 Confidence: ${Math.round(issue.confidence * 100)}%`);
    console.log(`   📋 Category: ${issue.category}`);
  });

  console.log('\n✨ This demonstrates the comprehensive local analysis');
  console.log('📈 Rules active: 76+ patterns covering all major security and quality issues');
  console.log('⚡ Performance: Sub-second analysis without external API calls');
}

showDetailedExamples().catch(console.error);
