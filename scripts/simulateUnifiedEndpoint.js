/**
 * Simulación del endpoint unificado para verificar funcionalidad
 */

import { analyzeCodeSnippet, analyzeOwaspSnippet } from '../src/analyzers/aiAnalyzerLocal.js';

// Simulación del código del endpoint unificado
async function simulateUnifiedEndpoint(code, language = 'javascript') {
  console.log('🔍 Simulating unified /review endpoint...');
  
  const startTime = Date.now();
  
  try {
    // Análisis unificado: calidad + seguridad (igual que en el servidor)
    const qualityAnalysis = await analyzeCodeSnippet(code, language);
    const securityAnalysis = await analyzeOwaspSnippet(code, language);
    
    // Combinar resultados
    const allIssues = [...qualityAnalysis, ...securityAnalysis];
    
    // Organizar respuesta (igual que en el servidor)
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
        language: language,
        rules_applied: '114+ quality and security patterns',
        analysis_time: Date.now(),
        engine_version: '2.0.0-unified'
      }
    };
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return { response, responseTime };
    
  } catch (error) {
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

// Código de prueba con problemas mixtos
const testCode = `
const express = require('express');
const app = express();

// SQL Injection vulnerability (SECURITY)
app.get('/user/:id', (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.params.id;
  db.query(query, (err, result) => {
    res.send(result);
  });
});

// Poor naming and complexity (QUALITY)
function doStuff(a, b, c, d, e, f) {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        if (d > 0) {
          return e + f;
        }
      }
    }
  }
  return 0;
}

// XSS vulnerability (SECURITY)
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  res.send('<h1>Results for: ' + searchTerm + '</h1>');
});
`;

// Código C# de prueba
const csharpCode = `
// SQL Injection
command.CommandText = "SELECT * FROM Users WHERE Id = " + userId;

// Weak crypto
var hasher = new MD5CryptoServiceProvider();

// Bad naming
public class userService {
  public void getData() {
    // Empty method
  }
}
`;

async function testUnifiedAnalysis() {
  console.log('🎯 Testing Unified Analysis Endpoint');
  console.log('=' .repeat(60));
  
  // Prueba con JavaScript
  console.log('\n📋 Test 1: JavaScript Code');
  console.log('-'.repeat(30));
  
  try {
    const { response: jsResult, responseTime: jsTime } = await simulateUnifiedEndpoint(testCode, 'javascript');
    
    console.log(`⚡ Response time: ${jsTime}ms`);
    console.log(`📊 Total issues: ${jsResult.summary.total_issues}`);
    console.log(`🔧 Quality issues: ${jsResult.summary.quality_issues}`);
    console.log(`🛡️  Security issues: ${jsResult.summary.security_issues}`);
    
    console.log('\n📈 Severity breakdown:');
    console.log(`   🔴 Critical: ${jsResult.summary.by_severity.critical}`);
    console.log(`   🟠 High: ${jsResult.summary.by_severity.high}`);
    console.log(`   🟡 Medium: ${jsResult.summary.by_severity.medium}`);
    console.log(`   🟢 Low: ${jsResult.summary.by_severity.low}`);
    
    console.log('\n🐛 Top issues:');
    jsResult.issues.slice(0, 3).forEach((issue, index) => {
      console.log(`   ${index + 1}. [${issue.severity}] Line ${issue.line}: ${issue.message}`);
    });
    
  } catch (error) {
    console.error(`❌ JavaScript test failed: ${error.message}`);
  }
  
  // Prueba con C#
  console.log('\n📋 Test 2: C# Code');
  console.log('-'.repeat(30));
  
  try {
    const { response: csResult, responseTime: csTime } = await simulateUnifiedEndpoint(csharpCode, 'csharp');
    
    console.log(`⚡ Response time: ${csTime}ms`);
    console.log(`📊 Total issues: ${csResult.summary.total_issues}`);
    console.log(`🔧 Quality issues: ${csResult.summary.quality_issues}`);
    console.log(`🛡️  Security issues: ${csResult.summary.security_issues}`);
    
    console.log('\n🐛 C# specific issues:');
    csResult.issues.slice(0, 3).forEach((issue, index) => {
      console.log(`   ${index + 1}. [${issue.severity}] Line ${issue.line}: ${issue.message}`);
    });
    
  } catch (error) {
    console.error(`❌ C# test failed: ${error.message}`);
  }
  
  console.log('\n✅ Unified Endpoint Benefits:');
  console.log('   • Single API call instead of two');
  console.log('   • Combined quality + security analysis');
  console.log('   • Rich response with summary statistics');
  console.log('   • Issues pre-sorted by severity');
  console.log('   • Analysis metadata included');
  console.log('   • 114+ rules applied in one pass');
  
  console.log('\n🔧 Extension Migration Steps:');
  console.log('   1. Remove /owasp-review endpoint calls');
  console.log('   2. Use only /review endpoint');
  console.log('   3. Update response parsing to handle new format');
  console.log('   4. Utilize summary statistics for better UX');
  console.log('   5. Test with various languages (JS, C#, Python, etc.)');
}

testUnifiedAnalysis().catch(console.error);
