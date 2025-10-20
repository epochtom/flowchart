import { PatternConfig, PatternGeneratorOptions } from './types.js';
import { createLinearFlowPattern, getLinearFlowExamples } from './linear-flow-pattern.js';
import { createDecisionTreePattern, getDecisionTreeExamples } from './decision-tree-pattern.js';
import { createLoopPattern, getLoopExamples } from './loop-pattern.js';
import { createSwimlanePattern, getSwimlaneExamples } from './swimlane-pattern.js';
import { createHierarchicalPattern, getHierarchicalExamples } from './hierarchical-pattern.js';
import { createParallelProcessPattern, getParallelProcessExamples } from './parallel-process-pattern.js';
import { createFeedbackLoopPattern, getFeedbackLoopExamples } from './feedback-loop-pattern.js';

/**
 * Pattern Generator
 * Utility functions to generate, combine, and export flowchart patterns
 */

export interface PatternLibrary {
  linear: {
    create: typeof createLinearFlowPattern;
    examples: typeof getLinearFlowExamples;
  };
  decisionTree: {
    create: typeof createDecisionTreePattern;
    examples: typeof getDecisionTreeExamples;
  };
  loop: {
    create: typeof createLoopPattern;
    examples: typeof getLoopExamples;
  };
  swimlane: {
    create: typeof createSwimlanePattern;
    examples: typeof getSwimlaneExamples;
  };
  hierarchical: {
    create: typeof createHierarchicalPattern;
    examples: typeof getHierarchicalExamples;
  };
  parallel: {
    create: typeof createParallelProcessPattern;
    examples: typeof getParallelProcessExamples;
  };
  feedback: {
    create: typeof createFeedbackLoopPattern;
    examples: typeof getFeedbackLoopExamples;
  };
}

export const patternLibrary: PatternLibrary = {
  linear: {
    create: createLinearFlowPattern,
    examples: getLinearFlowExamples
  },
  decisionTree: {
    create: createDecisionTreePattern,
    examples: getDecisionTreeExamples
  },
  loop: {
    create: createLoopPattern,
    examples: getLoopExamples
  },
  swimlane: {
    create: createSwimlanePattern,
    examples: getSwimlaneExamples
  },
  hierarchical: {
    create: createHierarchicalPattern,
    examples: getHierarchicalExamples
  },
  parallel: {
    create: createParallelProcessPattern,
    examples: getParallelProcessExamples
  },
  feedback: {
    create: createFeedbackLoopPattern,
    examples: getFeedbackLoopExamples
  }
};

export interface CombinedPatternConfig {
  title: string;
  patterns: {
    pattern: PatternConfig;
    position: { x: number; y: number };
    connections?: {
      from: string;
      to: string;
      fromPattern: string;
      toPattern: string;
    }[];
  }[];
  globalConnections?: {
    from: string;
    to: string;
    fromPattern: string;
    toPattern: string;
  }[];
  description?: string;
}

export function combinePatterns(config: CombinedPatternConfig): PatternConfig {
  const { title, patterns, globalConnections = [], description } = config;
  
  const combinedNodes: any[] = [];
  const combinedEdges: any[] = [];
  
  // Add nodes from each pattern with position offset
  patterns.forEach(({ pattern, position }) => {
    pattern.nodes.forEach(node => {
      combinedNodes.push({
        ...node,
        x: (node.x || 0) + position.x,
        y: (node.y || 0) + position.y,
        metadata: {
          ...node.metadata,
          sourcePattern: pattern.id
        }
      });
    });
    
    // Add edges from each pattern
    pattern.edges.forEach(edge => {
      combinedEdges.push({
        ...edge,
        metadata: {
          ...edge.metadata,
          sourcePattern: pattern.id
        }
      });
    });
  });
  
  // Add global connections between patterns
  globalConnections.forEach(connection => {
    combinedEdges.push({
      from: connection.from,
      to: connection.to,
      type: 'connector',
      label: `Connect to ${connection.toPattern}`,
      metadata: {
        crossPattern: true,
        fromPattern: connection.fromPattern,
        toPattern: connection.toPattern
      }
    });
  });
  
  return {
    id: `combined_${Date.now()}`,
    title,
    description,
    nodes: combinedNodes,
    edges: combinedEdges,
    metadata: {
      category: 'combined',
      complexity: patterns.length > 3 ? 'complex' : 'medium',
      useCases: ['complex workflows', 'multi-pattern processes', 'integrated systems'],
      tags: ['combined', 'multi-pattern', 'complex', 'integrated']
    }
  };
}

export function getAllPatternExamples(): { [patternType: string]: any[] } {
  return {
    linear: getLinearFlowExamples(),
    decisionTree: getDecisionTreeExamples(),
    loop: getLoopExamples(),
    swimlane: getSwimlaneExamples(),
    hierarchical: getHierarchicalExamples(),
    parallel: getParallelProcessExamples(),
    feedback: getFeedbackLoopExamples()
  };
}

export function getPatternByCategory(category: string): any[] {
  const examples = getAllPatternExamples();
  return examples[category] || [];
}

export function searchPatterns(query: string): { [patternType: string]: any[] } {
  const allExamples = getAllPatternExamples();
  const results: { [patternType: string]: any[] } = {};
  
  Object.entries(allExamples).forEach(([patternType, examples]) => {
    const filtered = examples.filter(example => 
      example.name.toLowerCase().includes(query.toLowerCase()) ||
      example.description.toLowerCase().includes(query.toLowerCase()) ||
      example.useCase.toLowerCase().includes(query.toLowerCase()) ||
      example.config.metadata?.tags?.some((tag: string) => 
        tag.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    if (filtered.length > 0) {
      results[patternType] = filtered;
    }
  });
  
  return results;
}

export function getPatternsByComplexity(complexity: 'simple' | 'medium' | 'complex'): { [patternType: string]: any[] } {
  const allExamples = getAllPatternExamples();
  const results: { [patternType: string]: any[] } = {};
  
  Object.entries(allExamples).forEach(([patternType, examples]) => {
    const filtered = examples.filter(example => example.complexity === complexity);
    if (filtered.length > 0) {
      results[patternType] = filtered;
    }
  });
  
  return results;
}

export function getPatternsByUseCase(useCase: string): { [patternType: string]: any[] } {
  const allExamples = getAllPatternExamples();
  const results: { [patternType: string]: any[] } = {};
  
  Object.entries(allExamples).forEach(([patternType, examples]) => {
    const filtered = examples.filter(example => 
      example.useCase.toLowerCase().includes(useCase.toLowerCase())
    );
    if (filtered.length > 0) {
      results[patternType] = filtered;
    }
  });
  
  return results;
}

export function createPatternFromTemplate(
  patternType: keyof PatternLibrary,
  templateName: string,
  customizations: any = {}
): PatternConfig | null {
  const examples = patternLibrary[patternType].examples();
  const template = examples.find(example => example.name === templateName);
  
  if (!template) {
    return null;
  }
  
  // Apply customizations to the template
  const customizedConfig = { ...template.config };
  
  if (customizations.title) {
    customizedConfig.title = customizations.title;
  }
  
  if (customizations.description) {
    customizedConfig.description = customizations.description;
  }
  
  // Apply other customizations based on pattern type
  switch (patternType) {
    case 'linear':
      if (customizations.steps) {
        return patternLibrary.linear.create({
          ...customizedConfig,
          steps: customizations.steps
        });
      }
      break;
    case 'decisionTree':
      if (customizations.decisions) {
        return patternLibrary.decisionTree.create({
          ...customizedConfig,
          decisions: customizations.decisions
        });
      }
      break;
    case 'loop':
      if (customizations.loopSteps) {
        return patternLibrary.loop.create({
          ...customizedConfig,
          loopSteps: customizations.loopSteps
        });
      }
      break;
    case 'swimlane':
      if (customizations.lanes || customizations.steps) {
        return patternLibrary.swimlane.create({
          ...customizedConfig,
          lanes: customizations.lanes || customizedConfig.lanes,
          steps: customizations.steps || customizedConfig.steps
        });
      }
      break;
    case 'hierarchical':
      if (customizations.mainProcess || customizations.subprocesses) {
        return patternLibrary.hierarchical.create({
          ...customizedConfig,
          mainProcess: customizations.mainProcess || customizedConfig.mainProcess,
          subprocesses: customizations.subprocesses || customizedConfig.subprocesses
        });
      }
      break;
    case 'parallel':
      if (customizations.parallelGroups) {
        return patternLibrary.parallel.create({
          ...customizedConfig,
          parallelGroups: customizations.parallelGroups
        });
      }
      break;
    case 'feedback':
      if (customizations.feedbackSteps || customizations.evaluation) {
        return patternLibrary.feedback.create({
          ...customizedConfig,
          feedbackSteps: customizations.feedbackSteps || customizedConfig.feedbackSteps,
          evaluation: customizations.evaluation || customizedConfig.evaluation
        });
      }
      break;
  }
  
  return customizedConfig;
}

export function exportPattern(
  pattern: PatternConfig,
  options: PatternGeneratorOptions = {}
): { content: string; filename: string; mimeType: string } {
  const { format = 'svg', filename, includeMetadata = true } = options;
  
  // This would integrate with the main flowchart generator
  // For now, return a placeholder
  const content = `Pattern: ${pattern.title}\nFormat: ${format}\nNodes: ${pattern.nodes.length}\nEdges: ${pattern.edges.length}`;
  
  let fileExtension = '';
  let mimeType = 'text/plain';
  
  switch (format) {
    case 'svg':
      fileExtension = '.svg';
      mimeType = 'image/svg+xml';
      break;
    case 'drawio':
      fileExtension = '.drawio';
      mimeType = 'application/xml';
      break;
    case 'mermaid':
      fileExtension = '.mmd';
      mimeType = 'text/plain';
      break;
  }
  
  const finalFilename = filename || `${pattern.id}${fileExtension}`;
  
  return {
    content,
    filename: finalFilename,
    mimeType
  };
}

export function validatePattern(pattern: PatternConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!pattern.id || pattern.id.trim() === '') {
    errors.push('Pattern ID is required');
  }
  
  if (!pattern.title || pattern.title.trim() === '') {
    errors.push('Pattern title is required');
  }
  
  if (!pattern.nodes || pattern.nodes.length === 0) {
    errors.push('Pattern must have at least one node');
  }
  
  if (!pattern.edges || pattern.edges.length === 0) {
    errors.push('Pattern must have at least one edge');
  }
  
  // Validate nodes
  if (pattern.nodes) {
    pattern.nodes.forEach((node, index) => {
      if (!node.id || node.id.trim() === '') {
        errors.push(`Node ${index + 1} must have an ID`);
      }
      if (!node.label || node.label.trim() === '') {
        errors.push(`Node ${index + 1} must have a label`);
      }
    });
  }
  
  // Validate edges
  if (pattern.edges) {
    pattern.edges.forEach((edge, index) => {
      if (!edge.from || edge.from.trim() === '') {
        errors.push(`Edge ${index + 1} must have a source node`);
      }
      if (!edge.to || edge.to.trim() === '') {
        errors.push(`Edge ${index + 1} must have a target node`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getPatternStatistics(): {
  totalPatterns: number;
  patternsByType: { [type: string]: number };
  patternsByComplexity: { [complexity: string]: number };
  patternsByUseCase: { [useCase: string]: number };
} {
  const allExamples = getAllPatternExamples();
  const totalPatterns = Object.values(allExamples).reduce((sum, examples) => sum + examples.length, 0);
  
  const patternsByType: { [type: string]: number } = {};
  const patternsByComplexity: { [complexity: string]: number } = {};
  const patternsByUseCase: { [useCase: string]: number } = {};
  
  Object.entries(allExamples).forEach(([type, examples]) => {
    patternsByType[type] = examples.length;
    
    examples.forEach(example => {
      patternsByComplexity[example.complexity] = (patternsByComplexity[example.complexity] || 0) + 1;
      patternsByUseCase[example.useCase] = (patternsByUseCase[example.useCase] || 0) + 1;
    });
  });
  
  return {
    totalPatterns,
    patternsByType,
    patternsByComplexity,
    patternsByUseCase
  };
}
