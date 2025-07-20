/**
 * Enhanced Quality Rules Engine
 * Automatically loads multiple rule sources in a scalable way
 */

import fs from 'fs';
import path from 'path';

class EnhancedQualityRulesEngine {
  constructor() {
    this.allRules = {
      core: null,
      extended: null,
      frameworks: null,
      csharp: null
    };
    this.loadAllRules();
  }

  /**
   * Loads all rules from multiple sources
   */
  loadAllRules() {
    try {
      // Load core rules
      this.loadCoreRules();
      
      // Load extended rules
      this.loadExtendedRules();
      
      // Load framework rules
      this.loadFrameworkRules();
      
      // Load C# specific rules
      this.loadCSharpRules();
      
      console.log('✅ All quality rules loaded successfully');
      this.logRulesStats();
      
    } catch (error) {
      console.error('❌ Error loading quality rules:', error.message);
      this.allRules = { core: {}, extended: {}, frameworks: {}, csharp: {} };
    }
  }

  /**
   * Loads core rules (original code base)
   */
  loadCoreRules() {
    const corePath = path.join(process.cwd(), 'src/knowledge-base/best-practices/code-quality-rules.json');
    this.allRules.core = JSON.parse(fs.readFileSync(corePath, 'utf8'));
  }

  /**
   * Loads extended rules
   */
  loadExtendedRules() {
    const extendedPath = path.join(process.cwd(), 'src/knowledge-base/best-practices/extended-rules.json');
    if (fs.existsSync(extendedPath)) {
      this.allRules.extended = JSON.parse(fs.readFileSync(extendedPath, 'utf8'));
    }
  }

  /**
   * Loads framework specific rules
   */
  loadFrameworkRules() {
    const frameworkPath = path.join(process.cwd(), 'src/knowledge-base/frameworks/framework-rules.json');
    if (fs.existsSync(frameworkPath)) {
      this.allRules.frameworks = JSON.parse(fs.readFileSync(frameworkPath, 'utf8'));
    }
  }

  /**
   * Loads C# specific rules
   */
  loadCSharpRules() {
    const csharpPath = path.join(process.cwd(), 'src/knowledge-base/languages/csharp-rules.json');
    if (fs.existsSync(csharpPath)) {
      this.allRules.csharp = JSON.parse(fs.readFileSync(csharpPath, 'utf8'));
    }
  }

  /**
   * Detects framework based on code and project files
   */
  detectFramework(code, filePath = '') {
    const frameworks = [];

    // Detection based on imports/requires
    if (code.includes('from react') || code.includes('import React')) {
      frameworks.push('react');
    }
    if (code.includes('from django') || code.includes('import django')) {
      frameworks.push('django');
    }
    if (code.includes('express()') || code.includes('require(\'express\')')) {
      frameworks.push('node_express');
    }
    if (code.includes('@RestController') || code.includes('@SpringBootApplication')) {
      frameworks.push('spring');
    }

    // Detection based on file extension
    if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
      frameworks.push('react');
    }
    if (filePath.endsWith('.cs')) {
      frameworks.push('csharp');
    }

    return frameworks;
  }

  /**
   * Analyzes code with all available rules
   */
  async analyzeCodeQuality(code, language = 'javascript', options = {}) {
    const issues = [];
    const detectedFrameworks = this.detectFramework(code, options.filePath);

    // Analyze core rules
    if (this.allRules.core) {
      issues.push(...this.analyzeWithRuleSet(code, language, this.allRules.core.code_quality_rules, 'core'));
      issues.push(...this.analyzeWithRuleSet(code, language, this.allRules.core.best_practices, 'best_practices'));
      issues.push(...this.analyzeWithRuleSet(code, language, this.allRules.core.language_specific, 'language_specific'));
    }

    // Analyze extended rules
    if (this.allRules.extended) {
      issues.push(...this.analyzeWithRuleSet(code, language, this.allRules.extended.security_rules_extended, 'security_extended'));
      issues.push(...this.analyzeWithRuleSet(code, language, this.allRules.extended.code_quality_extended, 'quality_extended'));
      issues.push(...this.analyzeWithRuleSet(code, language, this.allRules.extended.language_specific_extended, 'language_extended'));
    }

    // Analyze detected framework rules
    if (this.allRules.frameworks && detectedFrameworks.length > 0) {
      for (const framework of detectedFrameworks) {
        if (this.allRules.frameworks.framework_specific_rules[framework]) {
          issues.push(...this.analyzeFrameworkRules(code, language, framework));
        }
      }
      
      // Database pattern analysis if applicable
      if (this.containsDatabaseCode(code)) {
        issues.push(...this.analyzeWithRuleSet(code, language, this.allRules.frameworks.database_patterns, 'database'));
      }
    }

    // C# specific analysis if applicable
    if ((language === 'csharp' || language === 'c#' || detectedFrameworks.includes('csharp')) && this.allRules.csharp) {
      issues.push(...this.analyzeCSharpRules(code, language));
    }

    // Enhanced code metrics analysis (improved)
    issues.push(...this.analyzeEnhancedMetrics(code, language));

    return this.prioritizeAndDeduplicateIssues(issues);
  }

  /**
   * Analyzes a specific rule set
   */
  analyzeWithRuleSet(code, language, ruleSet, ruleType) {
    const issues = [];
    
    if (!ruleSet) return issues;

    for (const [categoryKey, category] of Object.entries(ruleSet)) {
      if (category.patterns) {
        for (const pattern of category.patterns) {
          if (this.isPatternApplicable(pattern, language)) {
            const matches = this.findPatternMatches(code, pattern);
            
            for (const match of matches) {
              issues.push({
                type: ruleType,
                category: category.title,
                categoryKey: categoryKey,
                severity: category.severity || 'MEDIUM',
                subCategory: pattern.category,
                line: match.line,
                column: match.column,
                message: pattern.description,
                example: pattern.example,
                fix: pattern.fix,
                confidence: this.calculateConfidence(match, pattern),
                impact: this.assessQualityImpact(categoryKey),
                ruleSource: ruleType
              });
            }
          }
        }
      }
    }

    return issues;
  }

  /**
   * Analyzes framework specific rules
   */
  analyzeFrameworkRules(code, language, framework) {
    const issues = [];
    const frameworkRules = this.allRules.frameworks.framework_specific_rules[framework];
    
    if (!frameworkRules || !frameworkRules.patterns) return issues;

    for (const pattern of frameworkRules.patterns) {
      if (this.isPatternApplicable(pattern, language)) {
        const matches = this.findPatternMatches(code, pattern);
        
        for (const match of matches) {
          issues.push({
            type: 'framework',
            category: `${frameworkRules.title}`,
            framework: framework,
            severity: 'MEDIUM',
            subCategory: pattern.category,
            line: match.line,
            column: match.column,
            message: pattern.description,
            example: pattern.example,
            fix: pattern.fix,
            confidence: this.calculateConfidence(match, pattern),
            impact: 'framework_specific',
            ruleSource: 'framework'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Detects if code contains database operations
   */
  containsDatabaseCode(code) {
    const dbPatterns = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE',
      'query', 'execute', 'findOne', 'findMany',
      'User.objects', 'Model.find', 'repository'
    ];
    
    return dbPatterns.some(pattern => 
      code.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Analyzes C# specific rules
   */
  analyzeCSharpRules(code, language) {
    const issues = [];
    
    if (!this.allRules.csharp) return issues;

    // Analyze C# security rules
    for (const [categoryKey, category] of Object.entries(this.allRules.csharp.csharp_security_rules || {})) {
      if (category.patterns) {
        for (const pattern of category.patterns) {
          const matches = this.findPatternMatches(code, pattern);
          
          for (const match of matches) {
            issues.push({
              type: 'csharp_security',
              category: category.title,
              categoryKey: categoryKey,
              severity: category.severity || 'HIGH',
              subCategory: pattern.category,
              line: match.line,
              column: match.column,
              message: pattern.description,
              example: pattern.example,
              fix: pattern.fix,
              confidence: this.calculateConfidence(match, pattern),
              impact: 'security',
              ruleSource: 'csharp'
            });
          }
        }
      }
    }

    // Analyze C# quality rules
    for (const [categoryKey, category] of Object.entries(this.allRules.csharp.csharp_quality_rules || {})) {
      if (category.patterns) {
        for (const pattern of category.patterns) {
          const matches = this.findPatternMatches(code, pattern);
          
          for (const match of matches) {
            issues.push({
              type: 'csharp_quality',
              category: category.title,
              categoryKey: categoryKey,
              severity: category.severity || 'MEDIUM',
              subCategory: pattern.category,
              line: match.line,
              column: match.column,
              message: pattern.description,
              example: pattern.example,
              fix: pattern.fix,
              confidence: this.calculateConfidence(match, pattern),
              impact: this.assessQualityImpact(categoryKey),
              ruleSource: 'csharp'
            });
          }
        }
      }
    }

    // Analyze C# modern features
    for (const [categoryKey, category] of Object.entries(this.allRules.csharp.csharp_modern_features || {})) {
      if (category.patterns) {
        for (const pattern of category.patterns) {
          const matches = this.findPatternMatches(code, pattern);
          
          for (const match of matches) {
            issues.push({
              type: 'csharp_modern',
              category: category.title,
              categoryKey: categoryKey,
              severity: category.severity || 'LOW',
              subCategory: pattern.category,
              line: match.line,
              column: match.column,
              message: pattern.description,
              example: pattern.example,
              fix: pattern.fix,
              confidence: this.calculateConfidence(match, pattern),
              impact: 'modernization',
              ruleSource: 'csharp'
            });
          }
        }
      }
    }

    // Analyze C# web security
    for (const [categoryKey, category] of Object.entries(this.allRules.csharp.csharp_web_security || {})) {
      if (category.patterns) {
        for (const pattern of category.patterns) {
          const matches = this.findPatternMatches(code, pattern);
          
          for (const match of matches) {
            issues.push({
              type: 'csharp_web_security',
              category: category.title,
              categoryKey: categoryKey,
              severity: category.severity || 'HIGH',
              subCategory: pattern.category,
              line: match.line,
              column: match.column,
              message: pattern.description,
              example: pattern.example,
              fix: pattern.fix,
              confidence: this.calculateConfidence(match, pattern),
              impact: 'web_security',
              ruleSource: 'csharp'
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Enhanced code metrics analysis
   */
  analyzeEnhancedMetrics(code, language) {
    const issues = [];
    const lines = code.split('\n');
    const metrics = this.calculateEnhancedMetrics(code, lines);

    // High cyclomatic complexity
    if (metrics.cyclomaticComplexity > 15) {
      issues.push(this.createMetricIssue('CRITICAL', 'Extremely High Complexity', 
        `Cyclomatic complexity of ${metrics.cyclomaticComplexity} is extremely high`, 
        'Break down into smaller functions immediately'));
    } else if (metrics.cyclomaticComplexity > 10) {
      issues.push(this.createMetricIssue('HIGH', 'High Complexity', 
        `Cyclomatic complexity of ${metrics.cyclomaticComplexity} is high`, 
        'Consider refactoring into smaller functions'));
    }

    // Lines of code per function
    if (metrics.averageLinesPerFunction > 100) {
      issues.push(this.createMetricIssue('HIGH', 'Very Long Functions', 
        `Functions average ${metrics.averageLinesPerFunction} lines`, 
        'Break large functions into smaller, focused functions'));
    }

    // Nesting depth
    if (metrics.maxNestingDepth > 6) {
      issues.push(this.createMetricIssue('HIGH', 'Deep Nesting', 
        `Maximum nesting depth of ${metrics.maxNestingDepth}`, 
        'Use early returns and extract methods'));
    }

    // Code duplication
    if (metrics.duplicatedLines > metrics.totalLines * 0.1) {
      issues.push(this.createMetricIssue('MEDIUM', 'Code Duplication', 
        `${Math.round(metrics.duplicatedLines / metrics.totalLines * 100)}% code duplication detected`, 
        'Extract common code into reusable functions'));
    }

    // Lack of comments
    if (metrics.commentRatio < 0.05 && metrics.totalLines > 50) {
      issues.push(this.createMetricIssue('LOW', 'Insufficient Comments', 
        `Only ${Math.round(metrics.commentRatio * 100)}% of code is commented`, 
        'Add explanatory comments for complex logic'));
    }

    return issues;
  }

  /**
   * Calculates enhanced code metrics
   */
  calculateEnhancedMetrics(code, lines) {
    const metrics = {
      totalLines: lines.length,
      codeLines: lines.filter(line => line.trim() && !this.isCommentLine(line)).length,
      commentLines: lines.filter(line => this.isCommentLine(line)).length,
      cyclomaticComplexity: this.calculateCyclomaticComplexity(code),
      averageLinesPerFunction: this.calculateAverageLinesPerFunction(code),
      maxNestingDepth: this.calculateMaxNestingDepth(code),
      functionCount: this.countFunctions(code),
      duplicatedLines: this.estimateDuplicatedLines(lines),
      commentRatio: 0
    };

    metrics.commentRatio = metrics.commentLines / metrics.totalLines;
    return metrics;
  }

  /**
   * Determines if a line is a comment
   */
  isCommentLine(line) {
    const trimmed = line.trim();
    return trimmed.startsWith('//') || 
           trimmed.startsWith('/*') || 
           trimmed.startsWith('*') || 
           trimmed.startsWith('#') ||
           trimmed.startsWith('"""') ||
           trimmed.startsWith("'''");
  }

  /**
   * Estimates duplicated lines using simple hashing
   */
  estimateDuplicatedLines(lines) {
    const lineHashes = new Map();
    let duplicatedCount = 0;

    lines.forEach(line => {
      const normalized = line.trim().toLowerCase();
      if (normalized.length > 10) { // Only consider significant lines
        const count = lineHashes.get(normalized) || 0;
        lineHashes.set(normalized, count + 1);
        if (count > 0) duplicatedCount++;
      }
    });

    return duplicatedCount;
  }

  /**
   * Counts functions in the code
   */
  countFunctions(code) {
    const patterns = [
      /function\s+\w+/g,
      /=\s*\([^)]*\)\s*=>/g,
      /def\s+\w+/g,
      /public\s+\w+\s+\w+\s*\(/g
    ];

    let count = 0;
    patterns.forEach(pattern => {
      const matches = code.match(pattern) || [];
      count += matches.length;
    });

    return count;
  }

  /**
   * Creates a metric issue
   */
  createMetricIssue(severity, category, message, fix) {
    return {
      type: 'metrics',
      category: category,
      severity: severity,
      line: 1,
      column: 1,
      message: message,
      fix: fix,
      confidence: 0.9,
      impact: 'maintainability',
      ruleSource: 'metrics'
    };
  }

  /**
   * Prioritizes and deduplicates issues
   */
  prioritizeAndDeduplicateIssues(issues) {
    // Remove duplicates based on line and message
    const uniqueIssues = issues.filter((issue, index, self) => 
      index === self.findIndex(i => 
        i.line === issue.line && 
        i.message === issue.message
      )
    );

    // Prioritize by severity and confidence
    const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    
    return uniqueIssues.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Logging of loaded rules statistics
   */
  logRulesStats() {
    let totalRules = 0;
    const stats = {};

    // Count core rules
    if (this.allRules.core) {
      const coreCount = this.countRulesInRuleSet(this.allRules.core);
      stats.core = coreCount;
      totalRules += coreCount;
    }

    // Count extended rules
    if (this.allRules.extended) {
      const extendedCount = this.countRulesInRuleSet(this.allRules.extended);
      stats.extended = extendedCount;
      totalRules += extendedCount;
    }

    // Count framework rules
    if (this.allRules.frameworks) {
      const frameworkCount = this.countRulesInRuleSet(this.allRules.frameworks);
      stats.frameworks = frameworkCount;
      totalRules += frameworkCount;
    }

    // Count C# rules
    if (this.allRules.csharp) {
      const csharpCount = this.countRulesInRuleSet(this.allRules.csharp);
      stats.csharp = csharpCount;
      totalRules += csharpCount;
    }

    console.log('📊 Rules Statistics:');
    console.log(`   Core rules: ${stats.core || 0}`);
    console.log(`   Extended rules: ${stats.extended || 0}`);
    console.log(`   Framework rules: ${stats.frameworks || 0}`);
    console.log(`   C# rules: ${stats.csharp || 0}`);
    console.log(`   Total rules: ${totalRules}`);
  }

  /**
   * Counts rules in a rule set
   */
  countRulesInRuleSet(ruleSet) {
    let count = 0;
    
    function countInObject(obj) {
      for (const value of Object.values(obj)) {
        if (value && typeof value === 'object') {
          if (value.patterns && Array.isArray(value.patterns)) {
            count += value.patterns.length;
          } else {
            countInObject(value);
          }
        }
      }
    }
    
    countInObject(ruleSet);
    return count;
  }

  // Methods inherited from original class (simplified for brevity)
  isPatternApplicable(pattern, language) {
    // Normalize language names
    const normalizedLanguage = language === 'c#' ? 'csharp' : language;
    const patternLang = pattern.language === 'c#' ? 'csharp' : pattern.language;
    
    return patternLang === 'all' || 
           patternLang === normalizedLanguage ||
           (Array.isArray(pattern.language) && pattern.language.includes(normalizedLanguage)) ||
           (Array.isArray(pattern.language) && pattern.language.includes(language));
  }

  findPatternMatches(code, pattern) {
    const matches = [];
    const regex = new RegExp(pattern.pattern, 'gi');
    const lines = code.split('\n');

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        matches.push({
          line: lineIndex + 1,
          column: match.index + 1,
          matchedText: match[0],
          confidence: 0.8
        });
      }
      regex.lastIndex = 0;
    });

    return matches;
  }

  calculateConfidence(match, pattern) {
    let confidence = match.confidence || 0.7;
    if (pattern.category === 'security') confidence += 0.2;
    if (pattern.category === 'performance') confidence += 0.1;
    return Math.min(0.95, Math.max(0.3, confidence));
  }

  assessQualityImpact(categoryKey) {
    const impactMap = {
      'naming_conventions': 'readability',
      'function_complexity': 'maintainability',
      'error_handling': 'reliability',
      'performance': 'performance',
      'security': 'security',
      'accessibility': 'usability'
    };
    return impactMap[categoryKey] || 'general';
  }

  calculateCyclomaticComplexity(code) {
    const complexityKeywords = [
      /\bif\b/g, /\belse\s+if\b/g, /\bwhile\b/g, /\bfor\b/g,
      /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /&&/g, /\|\|/g, /\?.*:/g
    ];

    let complexity = 1;
    complexityKeywords.forEach(pattern => {
      const matches = code.match(pattern) || [];
      complexity += matches.length;
    });
    return complexity;
  }

  calculateAverageLinesPerFunction(code) {
    const functionMatches = code.match(/function[^{]*\{[^}]*\}|=>[^{]*\{[^}]*\}|def[^:]*:[^def]*/g) || [];
    if (functionMatches.length === 0) return 0;
    
    const totalLines = functionMatches.reduce((sum, func) => sum + func.split('\n').length, 0);
    return Math.round(totalLines / functionMatches.length);
  }

  calculateMaxNestingDepth(code) {
    let maxDepth = 0;
    let currentDepth = 0;

    for (let i = 0; i < code.length; i++) {
      if (code[i] === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (code[i] === '}') {
        currentDepth--;
      }
    }
    return maxDepth;
  }
}

export default EnhancedQualityRulesEngine;
