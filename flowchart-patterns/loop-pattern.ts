import { PatternConfig, FlowchartNode, FlowchartEdge, PatternExample } from './types.js';

/**
 * Loop Pattern
 * A process that repeats steps until a condition is met.
 * Use Case: Iterative processes (e.g., quality checks, data validation)
 * Structure: Start → Process Step → Decision (Continue?) → Loop back or proceed
 */

export interface LoopStep {
  id: string;
  label: string;
  type: 'process' | 'decision' | 'validation' | 'check';
}

export interface LoopConfig {
  title: string;
  preLoopSteps?: string[];
  loopSteps: LoopStep[];
  loopCondition: {
    question: string;
    continueLabel: string;
    exitLabel: string;
  };
  postLoopSteps?: string[];
  maxIterations?: number;
  description?: string;
}

export function createLoopPattern(config: LoopConfig): PatternConfig {
  const { 
    title, 
    preLoopSteps = [], 
    loopSteps, 
    loopCondition, 
    postLoopSteps = [], 
    maxIterations,
    description 
  } = config;
  
  const nodes: FlowchartNode[] = [];
  const edges: FlowchartEdge[] = [];
  let nodeCounter = 0;
  
  // Create start node
  nodes.push({
    id: 'start',
    type: 'start',
    label: 'Start',
    x: 0,
    y: 0
  });
  
  let currentNodeId = 'start';
  let currentY = 100;
  
  // Add pre-loop steps
  preLoopSteps.forEach((step, index) => {
    const stepId = `pre_step_${index + 1}`;
    nodes.push({
      id: stepId,
      type: 'process',
      label: step,
      x: 0,
      y: currentY
    });
    
    edges.push({
      from: currentNodeId,
      to: stepId,
      type: 'normal'
    });
    
    currentNodeId = stepId;
    currentY += 100;
  });
  
  // Create loop start marker
  const loopStartId = 'loop_start';
  nodes.push({
    id: loopStartId,
    type: 'loop',
    label: 'Loop Start',
    x: 0,
    y: currentY
  });
  
  edges.push({
    from: currentNodeId,
    to: loopStartId,
    type: 'normal'
  });
  
  currentNodeId = loopStartId;
  currentY += 100;
  
  // Add loop steps
  loopSteps.forEach((step, index) => {
    const stepId = step.id || `loop_step_${index + 1}`;
    nodes.push({
      id: stepId,
      type: step.type === 'decision' ? 'decision' : 'process',
      label: step.label,
      x: 0,
      y: currentY
    });
    
    edges.push({
      from: currentNodeId,
      to: stepId,
      type: 'normal'
    });
    
    currentNodeId = stepId;
    currentY += 100;
  });
  
  // Create loop condition decision
  const loopConditionId = 'loop_condition';
  nodes.push({
    id: loopConditionId,
    type: 'decision',
    label: loopCondition.question,
    x: 0,
    y: currentY
  });
  
  edges.push({
    from: currentNodeId,
    to: loopConditionId,
    type: 'normal'
  });
  
  // Create loop back edge
  edges.push({
    from: loopConditionId,
    to: loopStartId,
    label: loopCondition.continueLabel,
    type: 'loop',
    curve: true
  });
  
  // Add post-loop steps
  currentNodeId = loopConditionId;
  currentY += 100;
  
  postLoopSteps.forEach((step, index) => {
    const stepId = `post_step_${index + 1}`;
    nodes.push({
      id: stepId,
      type: 'process',
      label: step,
      x: 0,
      y: currentY
    });
    
    edges.push({
      from: currentNodeId,
      to: stepId,
      label: index === 0 ? loopCondition.exitLabel : undefined,
      type: 'normal'
    });
    
    currentNodeId = stepId;
    currentY += 100;
  });
  
  // Create end node
  const endId = 'end';
  nodes.push({
    id: endId,
    type: 'end',
    label: 'End',
    x: 0,
    y: currentY
  });
  
  edges.push({
    from: currentNodeId,
    to: endId,
    type: 'normal'
  });
  
  // Add metadata for max iterations if provided
  if (maxIterations) {
    nodes.find(n => n.id === loopStartId)!.metadata = {
      ...nodes.find(n => n.id === loopStartId)!.metadata,
      maxIterations
    };
  }
  
  return {
    id: `loop_pattern_${Date.now()}`,
    title,
    description,
    nodes,
    edges,
    metadata: {
      category: 'loop',
      complexity: loopSteps.length > 3 ? 'complex' : 'medium',
      useCases: ['quality checks', 'data validation', 'iterative processes', 'retry mechanisms'],
      tags: ['loop', 'iteration', 'repeat', 'conditional']
    }
  };
}

export function getLoopExamples(): PatternExample[] {
  return [
    {
      name: 'Data Validation Loop',
      description: 'Loop pattern for validating data until all records are valid',
      useCase: 'Data processing and validation',
      complexity: 'medium',
      config: createLoopPattern({
        title: 'Data Validation Process',
        description: 'Iterative process to validate data records',
        preLoopSteps: ['Load data file'],
        loopSteps: [
          { id: 'validate_record', label: 'Validate current record', type: 'validation' },
          { id: 'check_errors', label: 'Check for validation errors', type: 'check' }
        ],
        loopCondition: {
          question: 'Are there more records to validate?',
          continueLabel: 'Yes',
          exitLabel: 'No'
        },
        postLoopSteps: ['Generate validation report', 'Save processed data'],
        maxIterations: 1000
      })
    },
    {
      name: 'Quality Control Loop',
      description: 'Loop pattern for quality control checks',
      useCase: 'Manufacturing and quality assurance',
      complexity: 'medium',
      config: createLoopPattern({
        title: 'Quality Control Process',
        description: 'Iterative quality control checks',
        preLoopSteps: ['Start production batch'],
        loopSteps: [
          { id: 'produce_item', label: 'Produce item', type: 'process' },
          { id: 'quality_check', label: 'Perform quality check', type: 'validation' },
          { id: 'check_quality', label: 'Does item meet standards?', type: 'decision' }
        ],
        loopCondition: {
          question: 'Continue with next item?',
          continueLabel: 'Yes',
          exitLabel: 'No'
        },
        postLoopSteps: ['Package batch', 'Update quality records']
      })
    },
    {
      name: 'User Input Validation',
      description: 'Loop pattern for validating user input',
      useCase: 'User interface and form validation',
      complexity: 'simple',
      config: createLoopPattern({
        title: 'User Input Validation',
        description: 'Loop to validate user input until correct',
        loopSteps: [
          { id: 'get_input', label: 'Get user input', type: 'process' },
          { id: 'validate_input', label: 'Validate input format', type: 'validation' }
        ],
        loopCondition: {
          question: 'Is input valid?',
          continueLabel: 'No, try again',
          exitLabel: 'Yes, proceed'
        },
        postLoopSteps: ['Process valid input', 'Display success message']
      })
    },
    {
      name: 'Retry Mechanism',
      description: 'Loop pattern for retry mechanisms with exponential backoff',
      useCase: 'Network operations and API calls',
      complexity: 'complex',
      config: createLoopPattern({
        title: 'API Retry Mechanism',
        description: 'Retry failed API calls with exponential backoff',
        preLoopSteps: ['Initialize API client'],
        loopSteps: [
          { id: 'make_request', label: 'Make API request', type: 'process' },
          { id: 'check_response', label: 'Check response status', type: 'check' },
          { id: 'handle_error', label: 'Handle error if failed', type: 'process' },
          { id: 'wait_backoff', label: 'Wait with exponential backoff', type: 'process' }
        ],
        loopCondition: {
          question: 'Should retry?',
          continueLabel: 'Yes',
          exitLabel: 'No'
        },
        postLoopSteps: ['Log final result', 'Return response'],
        maxIterations: 5
      })
    }
  ];
}

export function createCustomLoop(
  title: string,
  loopSteps: LoopStep[],
  loopCondition: { question: string; continueLabel: string; exitLabel: string },
  options: {
    preLoopSteps?: string[];
    postLoopSteps?: string[];
    maxIterations?: number;
    description?: string;
  } = {}
): PatternConfig {
  return createLoopPattern({
    title,
    loopSteps,
    loopCondition,
    preLoopSteps: options.preLoopSteps,
    postLoopSteps: options.postLoopSteps,
    maxIterations: options.maxIterations,
    description: options.description
  });
}

// Utility function to validate loop pattern
export function validateLoopPattern(config: LoopConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!config.loopSteps || config.loopSteps.length === 0) {
    errors.push('At least one loop step is required');
  }
  
  if (!config.loopCondition || !config.loopCondition.question) {
    errors.push('Loop condition question is required');
  }
  
  if (!config.loopCondition.continueLabel || !config.loopCondition.exitLabel) {
    errors.push('Both continue and exit labels are required');
  }
  
  if (config.maxIterations && config.maxIterations <= 0) {
    errors.push('Max iterations must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to add steps to existing loop
export function addStepsToLoop(
  pattern: PatternConfig,
  newSteps: LoopStep[],
  insertPosition?: number
): PatternConfig {
  const loopStartNode = pattern.nodes.find(n => n.id === 'loop_start');
  if (!loopStartNode) {
    throw new Error('Loop start node not found');
  }
  
  // This would require rebuilding the entire pattern
  // For now, return the original pattern
  return pattern;
}

// Function to create nested loops
export function createNestedLoopPattern(
  title: string,
  outerLoop: LoopConfig,
  innerLoop: LoopConfig,
  description?: string
): PatternConfig {
  // This would create a more complex pattern with nested loops
  // Implementation would require careful positioning and edge management
  return createLoopPattern(outerLoop);
}
