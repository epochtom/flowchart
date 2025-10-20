// Main export file for flowchart patterns

export * from './types.js';
export * from './linear-flow-pattern.js';
export * from './decision-tree-pattern.js';
export * from './loop-pattern.js';
export * from './swimlane-pattern.js';
export * from './hierarchical-pattern.js';
export * from './parallel-process-pattern.js';
export * from './feedback-loop-pattern.js';
export * from './pattern-generator.js';
export * from './examples/index.js';

// Re-export main functions for convenience
export { createLinearFlowPattern, getLinearFlowExamples } from './linear-flow-pattern.js';
export { createDecisionTreePattern, getDecisionTreeExamples } from './decision-tree-pattern.js';
export { createLoopPattern, getLoopExamples } from './loop-pattern.js';
export { createSwimlanePattern, getSwimlaneExamples } from './swimlane-pattern.js';
export { createHierarchicalPattern, getHierarchicalExamples } from './hierarchical-pattern.js';
export { createParallelProcessPattern, getParallelProcessExamples } from './parallel-process-pattern.js';
export { createFeedbackLoopPattern, getFeedbackLoopExamples } from './feedback-loop-pattern.js';
export { 
  patternLibrary, 
  combinePatterns, 
  getAllPatternExamples, 
  getPatternByCategory, 
  searchPatterns, 
  getPatternsByComplexity, 
  getPatternsByUseCase,
  createPatternFromTemplate,
  exportPattern,
  validatePattern,
  getPatternStatistics
} from './pattern-generator.js';
export { allExamples as examples } from './examples/index.js';
