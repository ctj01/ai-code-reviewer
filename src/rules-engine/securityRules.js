/**
 * Security Rules Engine
 * Analiza código en busca de vulnerabilidades de seguridad basándose en patrones OWASP
 */

import fs from 'fs';
import path from 'path';

class SecurityRulesEngine {
  constructor() {
    this.owaspPatterns = null;
    this.loadOwaspPatterns();
  }

  /**
   * Carga los patrones OWASP desde la base de conocimientos
   */
  loadOwaspPatterns() {
    try {
      const owaspPath = path.join(process.cwd(), 'src/knowledge-base/owasp/owasp-top-10.json');
      const owaspData = JSON.parse(fs.readFileSync(owaspPath, 'utf8'));
      this.owaspPatterns = owaspData.owasp_top_10_2021;
      console.log('✅ OWASP patterns loaded successfully');
    } catch (error) {
      console.error('❌ Error loading OWASP patterns:', error.message);
      this.owaspPatterns = {};
    }
  }

  /**
   * Analiza código en busca de vulnerabilidades de seguridad
   * @param {string} code - Código a analizar
   * @param {string} language - Lenguaje de programación
   * @returns {Array} Lista de vulnerabilidades encontradas
   */
  async analyzeSecurityVulnerabilities(code, language = 'javascript') {
    const vulnerabilities = [];

    if (!this.owaspPatterns) {
      throw new Error('OWASP patterns not loaded');
    }

    // Iterar sobre cada categoría OWASP
    for (const [categoryKey, category] of Object.entries(this.owaspPatterns)) {
      // Analizar cada patrón en la categoría
      for (const pattern of category.patterns || []) {
        if (this.isPatternApplicable(pattern, language)) {
          const matches = this.findPatternMatches(code, pattern);
          
          for (const match of matches) {
            vulnerabilities.push({
              category: category.title,
              categoryKey: categoryKey,
              severity: category.severity,
              line: match.line,
              column: match.column,
              message: this.buildVulnerabilityMessage(pattern, category),
              description: pattern.description,
              example: pattern.example,
              fix: pattern.fix,
              cweMapping: category.cwe_mappings,
              confidence: this.calculateConfidence(match, pattern)
            });
          }
        }
      }
    }

    return this.prioritizeVulnerabilities(vulnerabilities);
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
    } else if (pattern.type === 'ast') {
      matches.push(...this.findAstMatches(code, pattern));
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
          confidence: 0.8 // Base confidence for regex matches
        });
      }
      regex.lastIndex = 0; // Reset regex for next line
    });

    return matches;
  }

  /**
   * Busca coincidencias usando análisis AST (Abstract Syntax Tree)
   * Nota: Implementación básica, se puede expandir con parsers específicos
   */
  findAstMatches(code, pattern) {
    // Por ahora implementamos una versión simplificada
    // En el futuro se puede integrar con tree-sitter o parsers específicos
    return [];
  }

  /**
   * Construye el mensaje de vulnerabilidad
   */
  buildVulnerabilityMessage(pattern, category) {
    return `${category.title}: ${pattern.description}`;
  }

  /**
   * Calcula el nivel de confianza de una detección
   */
  calculateConfidence(match, pattern) {
    let confidence = match.confidence || 0.7;

    // Ajustar confianza basado en contexto
    if (pattern.type === 'regex' && match.matchedText) {
      // Patrones más específicos tienen mayor confianza
      if (match.matchedText.length > 20) confidence += 0.1;
      if (pattern.pattern.includes('\\w+')) confidence += 0.1;
    }

    return Math.min(0.95, Math.max(0.3, confidence));
  }

  /**
   * Prioriza vulnerabilidades por severidad y confianza
   */
  prioritizeVulnerabilities(vulnerabilities) {
    const severityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    
    return vulnerabilities.sort((a, b) => {
      // Primero por severidad
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Luego por confianza
      return b.confidence - a.confidence;
    });
  }

  /**
   * Genera un reporte de seguridad detallado
   */
  generateSecurityReport(vulnerabilities, options = {}) {
    const report = {
      summary: {
        total: vulnerabilities.length,
        high: vulnerabilities.filter(v => v.severity === 'HIGH').length,
        medium: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
        low: vulnerabilities.filter(v => v.severity === 'LOW').length
      },
      vulnerabilities: vulnerabilities,
      recommendations: this.generateRecommendations(vulnerabilities),
      metadata: {
        analyzedAt: new Date().toISOString(),
        engine: 'SecurityRulesEngine',
        version: '1.0.0'
      }
    };

    return report;
  }

  /**
   * Genera recomendaciones basadas en las vulnerabilidades encontradas
   */
  generateRecommendations(vulnerabilities) {
    const recommendations = [];
    const categoryCounts = {};

    // Contar vulnerabilidades por categoría
    vulnerabilities.forEach(vuln => {
      categoryCounts[vuln.categoryKey] = (categoryCounts[vuln.categoryKey] || 0) + 1;
    });

    // Generar recomendaciones basadas en las categorías más problemáticas
    Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([categoryKey, count]) => {
        recommendations.push(this.getCategoryRecommendation(categoryKey, count));
      });

    return recommendations;
  }

  /**
   * Obtiene recomendaciones específicas para una categoría
   */
  getCategoryRecommendation(categoryKey, count) {
    const recommendations = {
      'A01_broken_access_control': 'Implementa controles de acceso robustos y valida permisos en cada endpoint',
      'A02_cryptographic_failures': 'Usa algoritmos criptográficos fuertes y maneja las claves de forma segura',
      'A03_injection': 'Utiliza consultas parametrizadas y valida/sanitiza todas las entradas de usuario',
      'A04_insecure_design': 'Implementa controles de seguridad desde el diseño y usa principios de seguridad',
      'A05_security_misconfiguration': 'Revisa y endurece la configuración de seguridad en todos los componentes',
      'A06_vulnerable_components': 'Mantén actualizadas todas las dependencias y escanea vulnerabilidades regularmente',
      'A07_identification_authentication_failures': 'Implementa autenticación robusta y gestión segura de sesiones',
      'A08_software_data_integrity_failures': 'Valida la integridad de datos y usa mecanismos de verificación',
      'A09_security_logging_monitoring_failures': 'Implementa logging comprehensivo y monitoreo de seguridad',
      'A10_server_side_request_forgery': 'Valida y filtra URLs antes de realizar peticiones del servidor'
    };

    return {
      category: categoryKey,
      count: count,
      priority: count > 3 ? 'HIGH' : count > 1 ? 'MEDIUM' : 'LOW',
      recommendation: recommendations[categoryKey] || 'Revisa y mejora las prácticas de seguridad en esta área'
    };
  }
}

export default SecurityRulesEngine;
