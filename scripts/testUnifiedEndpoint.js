/**
 * Test script for the unified /review endpoint
 */

import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3000';

// Test code with quality and security issues
const testCode = `
const express = require('express');
const app = express();

// SQL Injection vulnerability
app.get('/user/:id', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.params.id;
  db.query(query, (err, result) => {
    res.send(result);
  });
});

// Poor naming and no error handling
function doStuff(a, b, c, d, e, f) {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        return d + e + f;
      }
    }
  }
  return 0;
}

// XSS vulnerability
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  res.send('<h1>Results for: ' + searchTerm + '</h1>');
});
`;

async function testUnifiedEndpoint() {
  console.log('🧪 Testing Unified /review Endpoint');
  console.log('=' .repeat(50));
  
  try {
    console.log('📡 Sending request to /review...');
    const startTime = Date.now();
    
    const response = await fetch(`${SERVER_URL}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Optional for compatibility
      },
      body: JSON.stringify({
        code: testCode,
        language: 'javascript'
      })
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`⚡ Response time: ${responseTime}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    // Show summary
    if (result.summary) {
      console.log('\n📈 Analysis Summary:');
      console.log(`   Total Issues: ${result.summary.total_issues}`);
      console.log(`   Quality Issues: ${result.summary.quality_issues}`);
      console.log(`   Security Issues: ${result.summary.security_issues}`);
      console.log('\n   By Severity:');
      console.log(`   🔴 Critical: ${result.summary.by_severity.critical}`);
      console.log(`   🟠 High: ${result.summary.by_severity.high}`);
      console.log(`   🟡 Medium: ${result.summary.by_severity.medium}`);
      console.log(`   🟢 Low: ${result.summary.by_severity.low}`);
    }
    
    // Show analysis information
    if (result.analysis_info) {
      console.log('\n🔍 Analysis Info:');
      console.log(`   Language: ${result.analysis_info.language}`);
      console.log(`   Rules Applied: ${result.analysis_info.rules_applied}`);
      console.log(`   Engine Version: ${result.analysis_info.engine_version}`);
    }
    
    // Show some example issues
    if (result.issues && result.issues.length > 0) {
      console.log('\n🐛 Top Issues Found:');
      result.issues.slice(0, 5).forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.severity}] Line ${issue.line}: ${issue.message}`);
        if (issue.fix) {
          console.log(`      💡 Fix: ${issue.fix}`);
        }
      });
    }
    
    console.log('\n✅ Unified endpoint test successful!');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    
    // If server is not running, suggest starting it
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure the server is running with:');
      console.log('   node src/server.js');
    }
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing /health Endpoint');
  console.log('-'.repeat(30));
  
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const health = await response.json();
    
    console.log(`✅ Health Status: ${health.status}`);
    console.log(`📅 Version: ${health.version}`);
    console.log(`🔧 Available Endpoints:`);
    
    if (health.endpoints) {
      Object.entries(health.endpoints).forEach(([endpoint, description]) => {
        console.log(`   ${endpoint}: ${description}`);
      });
    }
    
    if (health.rules_stats) {
      console.log(`📏 Rules Statistics: ${health.rules_stats.total_rules} total rules`);
    }
    
  } catch (error) {
    console.error(`❌ Health check failed: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  await testUnifiedEndpoint();
  await testHealthEndpoint();
  
  console.log('\n🎯 Migration Notes for Extension:');
  console.log('   • Use only /review endpoint (POST)');
  console.log('   • Response now includes summary and analysis_info');
  console.log('   • Issues are pre-sorted by severity');
  console.log('   • Both quality and security analysis in single call');
  console.log('   • /owasp-review endpoint removed (functionality merged)');
}

runTests().catch(console.error);
