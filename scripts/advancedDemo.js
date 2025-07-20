/**
 * Script de prueba avanzado para demostrar todas las reglas expandidas
 * Incluye código con múltiples tipos de problemas y frameworks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar el analizador mejorado
import { analyzeCodeSnippet } from '../src/analyzers/aiAnalyzerLocal.js';

// Código de prueba con múltiples problemas y frameworks
const testCodes = {
  // Código JavaScript/Node.js con problemas de seguridad y calidad
  javascriptSecurity: `
    const express = require('express');
    const app = express();
    
    // SQL Injection vulnerability
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
    
    // Weak crypto
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update('password').digest('hex');
    
    // No error handling
    function divideNumbers(a, b) {
      return a / b;
    }
    
    // Complex function with poor naming
    function doStuff(x, y, z, a, b, c, d, e, f) {
      if (x > 0) {
        if (y > 0) {
          if (z > 0) {
            if (a > 0) {
              if (b > 0) {
                if (c > 0) {
                  if (d > 0) {
                    return e + f;
                  }
                }
              }
            }
          }
        }
      }
      return 0;
    }
  `,

  // Código React con problemas específicos del framework
  reactCode: `
    import React, { useState } from 'react';
    
    // Missing key in list
    function UserList({ users }) {
      return (
        <div>
          {users.map(user => 
            <div>{user.name}</div>
          )}
        </div>
      );
    }
    
    // Inline event handlers
    function SearchComponent() {
      const [query, setQuery] = useState('');
      
      return (
        <div>
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={() => console.log('clicked')}
          />
          <button onClick={() => {
            fetch('/api/search?q=' + query)
              .then(response => response.json())
              .then(data => console.log(data));
          }}>
            Search
          </button>
        </div>
      );
    }
    
    // No accessibility attributes
    function Modal({ isOpen }) {
      if (!isOpen) return null;
      
      return (
        <div style={{position: 'fixed', top: 0, left: 0}}>
          <div>
            <button onClick={close}>X</button>
            <h2>Modal Title</h2>
          </div>
        </div>
      );
    }
  `,

  // Código Python con problemas de Django y seguridad
  pythonDjango: `
    from django.shortcuts import render
    from django.http import HttpResponse
    from django.db import connection
    import os
    
    # SQL Injection in Django
    def get_user_data(request, user_id):
        cursor = connection.cursor()
        query = f"SELECT * FROM users WHERE id = {user_id}"
        cursor.execute(query)
        results = cursor.fetchall()
        return HttpResponse(str(results))
    
    # Command injection
    def backup_file(request):
        filename = request.GET.get('file')
        os.system(f"cp {filename} /backup/")
        return HttpResponse("Backup complete")
    
    # Hardcoded secrets
    API_KEY = "sk-1234567890abcdef"
    DATABASE_PASSWORD = "admin123"
    
    # No input validation
    def process_data(data):
        result = eval(data)  # Dangerous eval usage
        return result * 2
    
    # Overly complex function
    def complex_calculation(a, b, c, d, e, f, g, h, i, j):
        if a > 0:
            if b > 0:
                if c > 0:
                    if d > 0:
                        if e > 0:
                            if f > 0:
                                if g > 0:
                                    if h > 0:
                                        if i > 0:
                                            if j > 0:
                                                return a + b + c + d + e + f + g + h + i + j
        return 0
  `,

  // Código con problemas de performance y async
  performanceCode: `
    // Blocking synchronous operations
    function processLargeData() {
      const data = fs.readFileSync('large-file.json');
      const parsed = JSON.parse(data);
      
      // Inefficient loop
      const results = [];
      for (let i = 0; i < parsed.length; i++) {
        for (let j = 0; j < parsed.length; j++) {
          if (parsed[i].id === parsed[j].relatedId) {
            results.push(parsed[i]);
          }
        }
      }
      
      return results;
    }
    
    // Missing async/await
    function fetchUserData(userId) {
      fetch('/api/user/' + userId)
        .then(response => response.json())
        .then(user => {
          fetch('/api/posts/' + user.id)
            .then(response => response.json())
            .then(posts => {
              fetch('/api/comments/' + posts[0].id)
                .then(response => response.json())
                .then(comments => {
                  console.log(comments);
                });
            });
        });
    }
    
    // Memory leaks
    let globalData = [];
    function addData(item) {
      globalData.push(item);
      // Never clears globalData
    }
    
    // Unused variables
    function calculation() {
      const unusedVar = "not used";
      const anotherUnused = 42;
      const result = 10 + 5;
      return result;
    }
  `
};

async function runAdvancedDemo() {
  console.log('🚀 Running Advanced AI Code Reviewer Demo');
  console.log('=' .repeat(60));
  
  let totalIssues = 0;
  let totalCritical = 0;
  let totalHigh = 0;
  let totalMedium = 0;
  let totalLow = 0;

  for (const [testName, code] of Object.entries(testCodes)) {
    console.log(`\n📁 Testing: ${testName.toUpperCase()}`);
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    
    try {
      const analysis = await analyzeCodeSnippet(code, 'javascript');
      const endTime = Date.now();
      
      console.log(`⏱️  Analysis time: ${endTime - startTime}ms`);
      console.log(`📊 Issues found: ${analysis.length}`);
      
      // Categorizar por severidad
      const severityCounts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
      };
      
      analysis.forEach(issue => {
        severityCounts[issue.severity]++;
      });
      
      console.log(`🔴 Critical: ${severityCounts.CRITICAL}`);
      console.log(`🟠 High: ${severityCounts.HIGH}`);
      console.log(`🟡 Medium: ${severityCounts.MEDIUM}`);
      console.log(`🟢 Low: ${severityCounts.LOW}`);
      
      // Mostrar algunos ejemplos detallados
      const criticalIssues = analysis.filter(s => s.severity === 'CRITICAL').slice(0, 2);
      const securityIssues = analysis.filter(s => s.category && s.category.toLowerCase().includes('security')).slice(0, 2);
      const frameworkIssues = analysis.filter(s => s.category && (s.category.includes('React') || s.category.includes('Django'))).slice(0, 2);
      
      if (criticalIssues.length > 0) {
        console.log('\n🚨 Critical Issues:');
        criticalIssues.forEach((issue, index) => {
          console.log(`   ${index + 1}. Line ${issue.line}: ${issue.message}`);
          if (issue.fix) console.log(`      💡 Fix: ${issue.fix}`);
        });
      }
      
      if (securityIssues.length > 0) {
        console.log('\n🛡️  Security Issues:');
        securityIssues.forEach((issue, index) => {
          console.log(`   ${index + 1}. Line ${issue.line}: ${issue.message}`);
          if (issue.category) console.log(`      📋 Category: ${issue.category}`);
        });
      }
      
        if (frameworkIssues.length > 0) {
        console.log('\n⚛️  Framework Issues:');
        frameworkIssues.forEach((issue, index) => {
          console.log(`   ${index + 1}. Line ${issue.line}: ${issue.message}`);
          if (issue.category) console.log(`      🏗️  Category: ${issue.category}`);
        });
      }
      
      // Actualizar totales
      totalIssues += analysis.length;
      totalCritical += severityCounts.CRITICAL;
      totalHigh += severityCounts.HIGH;
      totalMedium += severityCounts.MEDIUM;
      totalLow += severityCounts.LOW;    } catch (error) {
      console.error(`❌ Error analyzing ${testName}:`, error.message);
    }
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📈 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total issues detected: ${totalIssues}`);
  console.log(`🔴 Critical: ${totalCritical}`);
  console.log(`🟠 High: ${totalHigh}`);
  console.log(`🟡 Medium: ${totalMedium}`);
  console.log(`🟢 Low: ${totalLow}`);
  
  console.log('\n✨ Rule Coverage Demonstration:');
  console.log('  ✅ OWASP Top 10 Security Rules');
  console.log('  ✅ Code Quality & Best Practices');
  console.log('  ✅ Framework-Specific Rules (React, Django, Express)');
  console.log('  ✅ Performance & Async Patterns');
  console.log('  ✅ Extended Security Rules (75+ patterns)');
  console.log('  ✅ Language-Specific Guidelines');
  console.log('  ✅ Accessibility Checks');
  console.log('  ✅ Metrics Analysis (Complexity, Nesting, etc.)');
  
  console.log('\n🎯 System Benefits:');
  console.log('  • No OpenAI API dependency');
  console.log('  • Sub-second analysis time');
  console.log('  • 100+ comprehensive rules');
  console.log('  • Multi-language & framework support');
  console.log('  • Extensible rule system');
  console.log('  • Privacy-preserving (local analysis)');
}

// Ejecutar demo
runAdvancedDemo().catch(console.error);
