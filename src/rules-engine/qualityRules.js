/**
 * Quality Rules Engine
 * Analiza código en busca de problemas de calidad y mejores prácticas
 */

import fs from 'fs';
import path from 'path';

class QualityRulesEngine {
  constructor() {
    this.qualityRules = null;
    this.loadQualityRules();
  }

  /**
   * Carga las reglas de calidad desde la base de conocimientos
   */
  loadQualityRules() {
    try {
      const rulesPath = path.join(process.cwd(), 'src/knowledge-base/best-practices/code-quality-rules.json');
      const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
      this.qualityRules = rulesData;
      console.log('✅ Quality rules loaded successfully');
    } catch (error) {
      console.error('❌ Error loading quality rules:', error.message);
      this.qualityRules = { code_quality_rules: {}, best_practices: {}, language_specific: {} };
    }
  }

  /**
   * Analiza código en busca de problemas de calidad
   * @param {string} code - Código a analizar
   * @param {string} language - Lenguaje de programación
   * @param {Object} options - Opciones de análisis
   * @returns {Array} Lista de problemas de calidad encontrados
   */
  async analyzeCodeQuality(code, language = 'javascript', options = {}) {
    const issues = [];

    if (!this.qualityRules) {
      throw new Error('Quality rules not loaded');
    }

    // Analizar reglas generales de calidad
    issues.push(...this.analyzeGeneralQuality(code, language));

    // Analizar mejores prácticas
    issues.push(...this.analyzeBestPractices(code, language));

    // Analizar reglas específicas del lenguaje
    issues.push(...this.analyzeLanguageSpecific(code, language));

    // Análisis de métricas de código
    issues.push(...this.analyzeCodeMetrics(code, language));

    return this.prioritizeQualityIssues(issues);
  }

  /**
   * Analiza reglas generales de calidad de código
   */
  analyzeGeneralQuality(code, language) {
    const issues = [];
    const rules = this.qualityRules.code_quality_rules;

    for (const [categoryKey, category] of Object.entries(rules)) {
      for (const pattern of category.patterns || []) {
        if (this.isPatternApplicable(pattern, language)) {
          const matches = this.findPatternMatches(code, pattern);
          
          for (const match of matches) {
            issues.push({
              type: 'quality',
              category: category.title,
              categoryKey: categoryKey,
              severity: category.severity,
              subCategory: pattern.category,
              line: match.line,
              column: match.column,
              message: pattern.description,
              example: pattern.example,
              fix: pattern.fix,
              confidence: this.calculateConfidence(match, pattern),
              impact: this.assessQualityImpact(categoryKey)
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Analiza mejores prácticas
   */
  analyzeBestPractices(code, language) {
    const issues = [];
    const practices = this.qualityRules.best_practices;

    for (const [practiceKey, practice] of Object.entries(practices)) {
      for (const pattern of practice.patterns || []) {
        if (this.isPatternApplicable(pattern, language)) {
          const matches = this.findPatternMatches(code, pattern);
          
          for (const match of matches) {
            issues.push({
              type: 'best_practice',
              category: practice.title,
              categoryKey: practiceKey,
              severity: 'MEDIUM',
              subCategory: pattern.category,
              line: match.line,
              column: match.column,
              message: pattern.description,
              example: pattern.example,
              fix: pattern.fix,
              confidence: this.calculateConfidence(match, pattern),
              impact: 'maintainability'
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Analiza reglas específicas del lenguaje
   */
  analyzeLanguageSpecific(code, language) {
    const issues = [];
    const langRules = this.qualityRules.language_specific[language];

    if (!langRules) return issues;

    for (const pattern of langRules.patterns || []) {
      const matches = this.findPatternMatches(code, pattern);
      
      for (const match of matches) {
        issues.push({
          type: 'language_specific',
          category: langRules.title,
          categoryKey: language,
          severity: 'LOW',
          subCategory: pattern.category,
          line: match.line,
          column: match.column,
          message: pattern.description,
          example: pattern.example,
          fix: pattern.fix,
          confidence: this.calculateConfidence(match, pattern),
          impact: 'performance'
        });
      }
    }

    return issues;
  }

  /**
   * Analiza métricas de código
   */
  analyzeCodeMetrics(code, language) {
    const issues = [];
    const lines = code.split('\n');
    const metrics = this.calculateCodeMetrics(code, lines);

    // Complejidad ciclomática alta
    if (metrics.cyclomaticComplexity > 10) {
      issues.push({
        type: 'metrics',
        category: 'Code Complexity',
        severity: 'HIGH',
        line: 1,
        column: 1,
        message: `High cyclomatic complexity (${metrics.cyclomaticComplexity}). Consider breaking down into smaller functions.`,
        fix: 'Refactor complex functions into smaller, more focused functions',
        confidence: 0.9,
        impact: 'maintainability'
      });
    }

    // Líneas de código por función
    if (metrics.averageLinesPerFunction > 50) {
      issues.push({
        type: 'metrics',
        category: 'Function Length',
        severity: 'MEDIUM',
        line: 1,
        column: 1,
        message: `Functions are too long on average (${metrics.averageLinesPerFunction} lines). Consider smaller functions.`,
        fix: 'Break large functions into smaller, single-purpose functions',
        confidence: 0.8,
        impact: 'readability'
      });
    }

    // Profundidad de anidamiento
    if (metrics.maxNestingDepth > 4) {
      issues.push({
        type: 'metrics',
        category: 'Nesting Depth',
        severity: 'MEDIUM',
        line: 1,
        column: 1,
        message: `Deep nesting detected (${metrics.maxNestingDepth} levels). Consider refactoring.`,
        fix: 'Use early returns, guard clauses, or extract methods to reduce nesting',
        confidence: 0.85,
        impact: 'readability'
      });
    }

    return issues;
  }

  /**
   * Calcula métricas básicas del código
   */
  calculateCodeMetrics(code, lines) {
    const metrics = {
      totalLines: lines.length,
      codeLines: lines.filter(line => line.trim() && !line.trim().startsWith('//')).length,
      commentLines: lines.filter(line => line.trim().startsWith('//')).length,
      cyclomaticComplexity: this.calculateCyclomaticComplexity(code),
      averageLinesPerFunction: this.calculateAverageLinesPerFunction(code),
      maxNestingDepth: this.calculateMaxNestingDepth(code),
      functionCount: (code.match(/function\s+\w+|=>\s*{|def\s+\w+/g) || []).length
    };

    return metrics;
  }

  /**
   * Calcula la complejidad ciclomática
   */
  calculateCyclomaticComplexity(code) {
    const complexityKeywords = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /&&/g,
      /\|\|/g,
      /\?.*:/g // ternary operator
    ];

    let complexity = 1; // Base complexity
    complexityKeywords.forEach(pattern => {
      const matches = code.match(pattern) || [];
      complexity += matches.length;
    });

    return complexity;
  }

  /**
   * Calcula el promedio de líneas por función
   */
  calculateAverageLinesPerFunction(code) {
    const functionPatterns = [
      /function\s+\w+[^{]*\{[^}]*\}/g,
      /\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*\}/g,
      /def\s+\w+[^:]*:[^def]*/g
    ];

    let totalFunctionLines = 0;
    let functionCount = 0;

    functionPatterns.forEach(pattern => {
      const matches = code.match(pattern) || [];
      matches.forEach(match => {
        totalFunctionLines += match.split('\n').length;
        functionCount++;
      });
    });

    return functionCount > 0 ? Math.round(totalFunctionLines / functionCount) : 0;
  }

  /**
   * Calcula la profundidad máxima de anidamiento
   */
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

  /**
   * Verifica si un patrón es aplicable al lenguaje actual
   */
  isPatternApplicable(pattern, language) {
    return pattern.language === 'all' || 
           pattern.language === language ||
           (Array.isArray(pattern.language) && pattern.language.includes(language));
  }

  /**
   * Busca coincidencias de un patrón en el código
   */
  findPatternMatches(code, pattern) {
    const matches = [];
    
    if (pattern.type === 'regex') {
      matches.push(...this.findRegexMatches(code, pattern));
    }

    return matches;
  }

  /**
   * Busca coincidencias usando expresiones regulares
   */
  findRegexMatches(code, pattern) {
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

  /**
   * Calcula el nivel de confianza de una detección
   */
  calculateConfidence(match, pattern) {
    let confidence = match.confidence || 0.7;

    // Ajustar confianza basado en el tipo de patrón
    if (pattern.category === 'naming' && match.matchedText.length < 3) {
      confidence += 0.2;
    }
    if (pattern.category === 'performance') {
      confidence += 0.1;
    }

    return Math.min(0.95, Math.max(0.3, confidence));
  }

  /**
   * Evalúa el impacto de un problema de calidad
   */
  assessQualityImpact(categoryKey) {
    const impactMap = {
      'naming_conventions': 'readability',
      'function_complexity': 'maintainability',
      'code_duplication': 'maintainability',
      'error_handling': 'reliability',
      'performance': 'performance',
      'maintainability': 'maintainability',
      'code_style': 'readability',
      'documentation': 'maintainability'
    };

    return impactMap[categoryKey] || 'general';
  }

  /**
   * Prioriza problemas de calidad
   */
  prioritizeQualityIssues(issues) {
    const severityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const impactOrder = { 
      'reliability': 4, 
      'maintainability': 3, 
      'performance': 2, 
      'readability': 1,
      'general': 0
    };
    
    return issues.sort((a, b) => {
      // Primero por severidad
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Luego por impacto
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      if (impactDiff !== 0) return impactDiff;
      
      // Finalmente por confianza
      return b.confidence - a.confidence;
    });
  }

  /**
   * Genera un reporte de calidad detallado
   */
  generateQualityReport(issues, options = {}) {
    const report = {
      summary: {
        total: issues.length,
        high: issues.filter(i => i.severity === 'HIGH').length,
        medium: issues.filter(i => i.severity === 'MEDIUM').length,
        low: issues.filter(i => i.severity === 'LOW').length,
        byCategory: this.groupByCategory(issues),
        byImpact: this.groupByImpact(issues)
      },
      issues: issues,
      suggestions: this.generateImprovementSuggestions(issues),
      metadata: {
        analyzedAt: new Date().toISOString(),
        engine: 'QualityRulesEngine',
        version: '1.0.0'
      }
    };

    return report;
  }

  /**
   * Agrupa issues por categoría
   */
  groupByCategory(issues) {
    const grouped = {};
    issues.forEach(issue => {
      grouped[issue.category] = (grouped[issue.category] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Agrupa issues por impacto
   */
  groupByImpact(issues) {
    const grouped = {};
    issues.forEach(issue => {
      const impact = issue.impact || 'general';
      grouped[impact] = (grouped[impact] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Genera sugerencias de mejora
   */
  generateImprovementSuggestions(issues) {
    const suggestions = [];
    const categoryCount = this.groupByCategory(issues);
    
    // Top 3 categorías con más problemas
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([category, count]) => {
        suggestions.push(this.getCategorySuggestion(category, count));
      });

    return suggestions;
  }

  /**
   * Obtiene sugerencias específicas para una categoría
   */
  getCategorySuggestion(category, count) {
    const suggestions = {
      'Naming Conventions': 'Adopta una guía de estilo consistente para nombres de variables y funciones',
      'Function Complexity': 'Refactoriza funciones grandes en funciones más pequeñas y enfocadas',
      'Error Handling': 'Implementa manejo de errores robusto y logging apropiado',
      'Performance Issues': 'Optimiza el código identificando y eliminando cuellos de botella',
      'Maintainability': 'Mejora la legibilidad del código y reduce la deuda técnica',
      'Code Style': 'Usa herramientas de formateo automático como Prettier o Black',
      'Documentation': 'Añade documentación clara para funciones y clases públicas'
    };

    return {
      category: category,
      count: count,
      priority: count > 5 ? 'HIGH' : count > 2 ? 'MEDIUM' : 'LOW',
      suggestion: suggestions[category] || 'Revisa y mejora las prácticas en esta área'
    };
  }
}

export default QualityRulesEngine;
