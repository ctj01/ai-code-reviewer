// File: src/analyzers/aiAnalyzer.js
import SecurityRulesEngine from '../rules-engine/securityRules.js';
import EnhancedQualityRulesEngine from '../rules-engine/enhancedQualityRules.js';
import fs from 'fs';
import path from 'path';

// Initialize the local engines
const securityEngine = new SecurityRulesEngine();
const qualityEngine = new EnhancedQualityRulesEngine();

/**
 * Analyzes a code snippet for style and best practices issues
 * Replaces previous functionality that depended on OpenAI
 * @param {string} code - Code to analyze
 * @param {string} language - Programming language (optional, maintained for compatibility)
 * @returns {Array} Array of objects with line and message
 */
export async function analyzeCodeSnippet(code, language = 'javascript') {
  try {
    console.log('🔍 Analyzing code snippet with local ML engine...');
    
    // If second parameter seems to be an API key (for compatibility), ignore it
    if (typeof language === 'string' && language.startsWith('sk-')) {
      console.warn('⚠️ API key detected but no longer needed. Using local analysis.');
      language = detectLanguage(code);
    }
    
    // Detect language if not provided or invalid
    const detectedLanguage = language && !language.startsWith('sk-') ? language : detectLanguage(code);
    
    // Analyze code quality using local engine
    const qualityIssues = await qualityEngine.analyzeCodeQuality(code, detectedLanguage, {
      includeMetrics: true,
      strictness: 'medium'
    });

    // Convert to format expected by extension
    const formattedResults = qualityIssues.map(issue => ({
      line: issue.line || 1,
      message: `${issue.category}: ${issue.message}`,
      severity: issue.severity,
      category: issue.subCategory || 'general',
      fix: issue.fix,
      confidence: issue.confidence
    }));

    console.log(`✅ Found ${formattedResults.length} code quality issues`);
    return formattedResults;
    
  } catch (error) {
    console.error('❌ Error analyzing code snippet:', error.message);
    throw new Error(`Code analysis failed: ${error.message}`);
  }
}

/**
 * Analyzes a code snippet for OWASP security vulnerabilities
 * Replaces previous functionality that depended on OpenAI
 * @param {string} code - Code to analyze  
 * @param {string} language - Programming language (optional, maintained for compatibility)
 * @returns {Array} Array of objects with category, line and message
 */
export async function analyzeOwaspSnippet(code, language = 'javascript') {
  try {
    console.log('🔒 Analyzing code for OWASP security vulnerabilities...');
    
    // If second parameter seems to be an API key (for compatibility), ignore it
    if (typeof language === 'string' && language.startsWith('sk-')) {
      console.warn('⚠️ API key detected but no longer needed. Using local analysis.');
      language = detectLanguage(code);
    }
    
    // Detect language if not provided or invalid
    const detectedLanguage = language && !language.startsWith('sk-') ? language : detectLanguage(code);
    
    // Analyze vulnerabilities using local engine
    const securityVulns = await securityEngine.analyzeSecurityVulnerabilities(code, detectedLanguage);

    // Convert to format expected by extension
    const formattedResults = securityVulns.map(vuln => ({
      category: vuln.category,
      line: vuln.line || 1,
      message: vuln.message,
      severity: vuln.severity,
      description: vuln.description,
      fix: vuln.fix,
      confidence: vuln.confidence,
      cweMapping: vuln.cweMapping
    }));

    console.log(`✅ Found ${formattedResults.length} security vulnerabilities`);
    return formattedResults;
    
  } catch (error) {
    console.error('❌ Error analyzing security vulnerabilities:', error.message);
    throw new Error(`Security analysis failed: ${error.message}`);
  }
}

/**
 * Analyzes a complete project (for webhook usage)
 * @param {string} projectPath - Project path
 * @param {Object} payload - Webhook payload
 * @returns {Array} Review comments
 */
export async function handleAIAnalysis(projectPath, payload) {
  try {
    console.log('🚀 Starting comprehensive AI analysis of project...');
    
    const comments = [];
    const files = await findCodeFiles(projectPath);
    
    for (const file of files.slice(0, 10)) { // Limit to 10 files for now
      try {
        const content = fs.readFileSync(file, 'utf8');
        const language = detectLanguageFromFile(file);
        
        // Quality analysis
        const qualityIssues = await analyzeCodeSnippet(content, language);
        qualityIssues.forEach(issue => {
          comments.push({
            path: path.relative(projectPath, file),
            line: issue.line,
            message: `Code Quality: ${issue.message}`,
            type: 'quality'
          });
        });

        // Security analysis
        const securityIssues = await analyzeOwaspSnippet(content, language);
        securityIssues.forEach(issue => {
          comments.push({
            path: path.relative(projectPath, file),
            line: issue.line,
            message: `Security: ${issue.message}`,
            type: 'security',
            severity: issue.severity
          });
        });
        
      } catch (fileError) {
        console.warn(`⚠️ Error analyzing file ${file}: ${fileError.message}`);
      }
    }
    
    console.log(`✅ Analysis complete. Generated ${comments.length} comments.`);
    return comments;
    
  } catch (error) {
    console.error('❌ Error in project analysis:', error.message);
    return [];
  }
}

/**
 * Detects programming language based on code content
 * @param {string} code - Code to analyze
 * @returns {string} Detected language
 */
function detectLanguage(code) {
  // Simple detectors based on patterns
  if (code.includes('function') && (code.includes('var ') || code.includes('let ') || code.includes('const '))) {
    return 'javascript';
  }
  if (code.includes('def ') && code.includes('import ')) {
    return 'python';
  }
  if (code.includes('public class') || code.includes('private ') || code.includes('public static void main')) {
    return 'java';
  }
  if (code.includes('using ') && code.includes('namespace ')) {
    return 'csharp';
  }
  if (code.includes('<?php')) {
    return 'php';
  }
  if (code.includes('func ') && code.includes('package ')) {
    return 'go';
  }
  
  // Default
  return 'javascript';
}

/**
 * Detects language based on file extension
 * @param {string} filePath - File path
 * @returns {string} Detected language
 */
function detectLanguageFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const langMap = {
    '.js': 'javascript',
    '.jsx': 'javascript', 
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cs': 'csharp',
    '.php': 'php',
    '.go': 'go',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.c': 'c'
  };
  
  return langMap[ext] || 'javascript';
}

/**
 * Finds code files in a project
 * @param {string} projectPath - Project path
 * @returns {Array} List of code files
 */
async function findCodeFiles(projectPath) {
  const files = [];
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.php', '.go'];
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(item))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Cannot scan directory ${dir}: ${error.message}`);
    }
  }
  
  scanDirectory(projectPath);
  return files;
}
