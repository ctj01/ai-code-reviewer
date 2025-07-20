/**
 * Script de prueba específico para demostrar las reglas de C#
 */

import { analyzeCodeSnippet } from '../src/analyzers/aiAnalyzerLocal.js';

// Código C# de prueba con múltiples problemas
const csharpTestCode = `
using System;
using System.Data.SqlClient;
using System.Web.Mvc;
using System.Security.Cryptography;

namespace TestApp
{
    public class userService  // Naming convention issue
    {
        private string ConnectionString = "Server=srv;Database=db;Password=123456;";  // Password in connection string
        
        // SQL Injection vulnerability
        public User GetUser(int userId)
        {
            var connection = new SqlConnection(ConnectionString);  // No using statement
            var command = new SqlCommand();
            command.CommandText = "SELECT * FROM Users WHERE Id = " + userId;  // SQL injection
            
            var result = command.ExecuteReader();
            return null;
        }
        
        // Weak crypto
        public string hashPassword(string password)  // Method naming issue
        {
            var hasher = new MD5CryptoServiceProvider();  // Weak hash algorithm
            var bytes = hasher.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
        
        // Async issues
        public async void ProcessData()  // async void issue
        {
            var data = await GetDataAsync();
            var result = SomeAsyncMethod().Result;  // Blocking async call
        }
        
        // Exception handling issues
        public void DoSomething()
        {
            try
            {
                RiskyOperation();
            }
            catch (Exception ex)  // Empty catch
            {
                
            }
        }
        
        // LINQ performance issues
        public bool HasUsers(List<User> users)
        {
            return users.Count() > 0;  // Should use Any()
        }
        
        // String performance issues
        public string BuildString(List<string> items)
        {
            string result = "";
            foreach (var item in items)
            {
                result += item;  // Should use StringBuilder
            }
            return result;
        }
        
        // Pattern matching opportunity
        public string ProcessObject(object obj)
        {
            if (obj is string)
            {
                var str = (string)obj;  // Can use pattern matching
                return str.ToUpper();
            }
            return "";
        }
    }
    
    // MVC Security issues
    public class HomeController : Controller
    {
        [HttpPost]  // Missing ValidateAntiForgeryToken
        public ActionResult Create(UserModel model)
        {
            return View();
        }
        
        public ActionResult Display(string userInput)
        {
            ViewBag.Message = Html.Raw(userInput);  // XSS vulnerability
            return View();
        }
        
        [AllowAnonymous]
        [HttpPost]  // Anonymous POST endpoint
        public ActionResult Submit(string data)
        {
            return Json("OK");
        }
    }
}
`;

async function testCSharpRules() {
  console.log('🔍 Testing C# Specific Rules');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    const analysis = await analyzeCodeSnippet(csharpTestCode, 'csharp');
    const endTime = Date.now();
    
    console.log(`⏱️  Analysis time: ${endTime - startTime}ms`);
    console.log(`📊 Total issues found: ${analysis.length}`);
    
    // Categorizar por tipo y severidad
    const typeStats = {};
    const severityStats = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    
    analysis.forEach(issue => {
      // Contar por tipo
      const type = issue.category || 'other';
      typeStats[type] = (typeStats[type] || 0) + 1;
      
      // Contar por severidad
      severityStats[issue.severity]++;
    });
    
    console.log('\n📈 Issues by Severity:');
    console.log(`🔴 Critical: ${severityStats.CRITICAL}`);
    console.log(`🟠 High: ${severityStats.HIGH}`);
    console.log(`🟡 Medium: ${severityStats.MEDIUM}`);
    console.log(`🟢 Low: ${severityStats.LOW}`);
    
    console.log('\n📋 Issues by Category:');
    Object.entries(typeStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`);
      });
    
    // Mostrar ejemplos de cada tipo de regla de C#
    console.log('\n🛡️  Security Issues Found:');
    const securityIssues = analysis.filter(issue => 
      issue.category && (
        issue.category.includes('SQL') || 
        issue.category.includes('Crypto') || 
        issue.category.includes('XSS') ||
        issue.category.includes('Security')
      )
    ).slice(0, 5);
    
    securityIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. Line ${issue.line}: ${issue.message}`);
      if (issue.fix) console.log(`      💡 Fix: ${issue.fix}`);
    });
    
    console.log('\n⚡ Performance & Quality Issues:');
    const qualityIssues = analysis.filter(issue => 
      issue.category && (
        issue.category.includes('LINQ') || 
        issue.category.includes('String') || 
        issue.category.includes('Async') ||
        issue.category.includes('Naming')
      )
    ).slice(0, 5);
    
    qualityIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. Line ${issue.line}: ${issue.message}`);
      if (issue.fix) console.log(`      💡 Fix: ${issue.fix}`);
    });
    
    console.log('\n🏗️  ASP.NET MVC Security Issues:');
    const mvcIssues = analysis.filter(issue => 
      issue.category && (
        issue.category.includes('MVC') ||
        issue.message.includes('ValidateAntiForgeryToken') ||
        issue.message.includes('Html.Raw') ||
        issue.message.includes('Anonymous')
      )
    );
    
    mvcIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. Line ${issue.line}: ${issue.message}`);
      if (issue.fix) console.log(`      💡 Fix: ${issue.fix}`);
    });
    
  } catch (error) {
    console.error(`❌ Error testing C# rules:`, error.message);
  }
  
  console.log('\n✨ C# Rules Coverage:');
  console.log('  ✅ SQL Injection Prevention');
  console.log('  ✅ Cryptographic Security');
  console.log('  ✅ Async/Await Best Practices');
  console.log('  ✅ LINQ Performance Optimization');
  console.log('  ✅ Exception Handling');
  console.log('  ✅ Naming Conventions');
  console.log('  ✅ Resource Management');
  console.log('  ✅ ASP.NET MVC Security');
  console.log('  ✅ Modern C# Features');
  console.log('  ✅ String Performance');
}

// Ejecutar prueba
testCSharpRules().catch(console.error);
