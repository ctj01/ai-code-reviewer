#!/usr/bin/env node

/**
 * Demo script to showcase the new local ML-based analysis
 * This demonstrates how the system works without external API dependencies
 */

import { analyzeCodeSnippet, analyzeOwaspSnippet } from '../src/analyzers/aiAnalyzerLocal.js';

console.log('🚀 AI Code Reviewer v2.0 - Local Analysis Demo\n');

// Sample JavaScript code with various issues
const javascriptSample = `
function calc(a, b) {
    if (a == null) {
        console.log("Error: a is null");
        return;
    }
    var result = a + b;
    if (result > 100) {
        if (result > 1000) {
            if (result > 10000) {
                console.log("Very large result");
            }
        }
    }
    eval("console.log('Result: " + result + "')");
    return result;
}

var password = "admin123";
var userQuery = "SELECT * FROM users WHERE id = " + userId;
`;

// Sample Python code with security issues
const pythonSample = `
import hashlib
import pickle

def authenticate(username, password):
    if password == "admin123":
        return True
    hash = hashlib.md5(password.encode()).hexdigest()
    return check_password(hash)

def process_data(user_data):
    data = pickle.loads(user_data)
    return data

def get_user(user_id):
    query = "SELECT * FROM users WHERE id = %s" % user_id
    return execute_query(query)
`;

async function runDemo() {
    try {
        console.log('📊 Analyzing JavaScript Code Quality...');
        console.log('=' .repeat(50));
        
        const jsQualityIssues = await analyzeCodeSnippet(javascriptSample, 'javascript');
        console.log(`Found ${jsQualityIssues.length} quality issues:\n`);
        
        jsQualityIssues.forEach((issue, index) => {
            console.log(`${index + 1}. Line ${issue.line}: ${issue.message}`);
            if (issue.fix) {
                console.log(`   💡 Fix: ${issue.fix}`);
            }
            console.log(`   📊 Confidence: ${(issue.confidence * 100).toFixed(1)}%\n`);
        });

        console.log('\n🔒 Analyzing JavaScript Security (OWASP)...');
        console.log('=' .repeat(50));
        
        const jsSecurityIssues = await analyzeOwaspSnippet(javascriptSample, 'javascript');
        console.log(`Found ${jsSecurityIssues.length} security issues:\n`);
        
        jsSecurityIssues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.category} (Line ${issue.line})`);
            console.log(`   ⚠️  ${issue.message}`);
            if (issue.fix) {
                console.log(`   💡 Fix: ${issue.fix}`);
            }
            console.log(`   🔒 Severity: ${issue.severity}`);
            console.log(`   📊 Confidence: ${(issue.confidence * 100).toFixed(1)}%\n`);
        });

        console.log('\n🐍 Analyzing Python Security (OWASP)...');
        console.log('=' .repeat(50));
        
        const pySecurityIssues = await analyzeOwaspSnippet(pythonSample, 'python');
        console.log(`Found ${pySecurityIssues.length} security issues:\n`);
        
        pySecurityIssues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.category} (Line ${issue.line})`);
            console.log(`   ⚠️  ${issue.message}`);
            if (issue.fix) {
                console.log(`   💡 Fix: ${issue.fix}`);
            }
            console.log(`   🔒 Severity: ${issue.severity}`);
            console.log(`   📊 Confidence: ${(issue.confidence * 100).toFixed(1)}%\n`);
        });

        console.log('\n✨ Analysis Complete!');
        console.log('\n🎯 Key Benefits of Local Analysis:');
        console.log('• ✅ No API keys required');
        console.log('• ✅ Instant analysis (no network latency)');
        console.log('• ✅ Complete privacy (code never leaves your machine)');
        console.log('• ✅ Zero cost operation');
        console.log('• ✅ Works offline');
        console.log('• ✅ Customizable rules and patterns');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        process.exit(1);
    }
}

// Run the demo
runDemo();
