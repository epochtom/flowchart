import { PatternConfig, FlowchartNode, FlowchartEdge, PatternExample } from './types.js';

/**
 * Feedback Loop Pattern
 * A process that cycles back based on feedback or evaluation.
 * Use Case: Continuous improvement processes (e.g., agile development, performance reviews)
 * Structure: Start → Process → Evaluation → Loop back to revise or proceed to end
 */

export interface FeedbackStep {
  id: string;
  label: string;
  type: 'process' | 'decision' | 'evaluation' | 'improvement';
  description?: string;
}

export interface FeedbackLoopConfig {
  title: string;
  initialSteps?: string[];
  feedbackSteps: FeedbackStep[];
  evaluation: {
    question: string;
    continueLabel: string;
    exitLabel: string;
    improvementLabel?: string;
  };
  improvementSteps?: string[];
  finalSteps?: string[];
  maxIterations?: number;
  description?: string;
}

export function createFeedbackLoopPattern(config: FeedbackLoopConfig): PatternConfig {
  const { 
    title, 
    initialSteps = [], 
    feedbackSteps, 
    evaluation, 
    improvementSteps = [],
    finalSteps = [],
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
  
  // Add initial steps
  initialSteps.forEach((step, index) => {
    const stepId = `initial_step_${index + 1}`;
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
  
  // Create feedback loop start marker
  const feedbackStartId = 'feedback_start';
  nodes.push({
    id: feedbackStartId,
    type: 'loop',
    label: 'Feedback Loop Start',
    x: 0,
    y: currentY
  });
  
  edges.push({
    from: currentNodeId,
    to: feedbackStartId,
    type: 'normal'
  });
  
  currentNodeId = feedbackStartId;
  currentY += 100;
  
  // Add feedback steps
  feedbackSteps.forEach((step, index) => {
    const stepId = step.id || `feedback_step_${index + 1}`;
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
  
  // Create evaluation decision
  const evaluationId = 'evaluation';
  nodes.push({
    id: evaluationId,
    type: 'decision',
    label: evaluation.question,
    x: 0,
    y: currentY
  });
  
  edges.push({
    from: currentNodeId,
    to: evaluationId,
    type: 'normal'
  });
  
  // Create feedback loop back edge
  edges.push({
    from: evaluationId,
    to: feedbackStartId,
    label: evaluation.continueLabel,
    type: 'feedback',
    curve: true
  });
  
  // Add improvement steps if provided
  if (improvementSteps.length > 0) {
    const improvementStartId = 'improvement_start';
    nodes.push({
      id: improvementStartId,
      type: 'process',
      label: 'Improvement Process',
      x: 0,
      y: currentY + 100
    });
    
    edges.push({
      from: evaluationId,
      to: improvementStartId,
      label: evaluation.improvementLabel || 'Needs Improvement',
      type: 'feedback'
    });
    
    let improvementCurrentId = improvementStartId;
    let improvementY = currentY + 200;
    
    improvementSteps.forEach((step, index) => {
      const stepId = `improvement_step_${index + 1}`;
      nodes.push({
        id: stepId,
        type: 'process',
        label: step,
        x: 0,
        y: improvementY
      });
      
      edges.push({
        from: improvementCurrentId,
        to: stepId,
        type: 'normal'
      });
      
      improvementCurrentId = stepId;
      improvementY += 100;
    });
    
    // Connect improvement back to feedback loop
    edges.push({
      from: improvementCurrentId,
      to: feedbackStartId,
      type: 'feedback',
      curve: true
    });
  }
  
  // Add final steps
  currentNodeId = evaluationId;
  currentY += 200;
  
  finalSteps.forEach((step, index) => {
    const stepId = `final_step_${index + 1}`;
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
      label: index === 0 ? evaluation.exitLabel : undefined,
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
    nodes.find(n => n.id === feedbackStartId)!.metadata = {
      ...nodes.find(n => n.id === feedbackStartId)!.metadata,
      maxIterations
    };
  }
  
  return {
    id: `feedback_loop_${Date.now()}`,
    title,
    description,
    nodes,
    edges,
    metadata: {
      category: 'feedback',
      complexity: feedbackSteps.length > 3 ? 'complex' : 'medium',
      useCases: ['continuous improvement', 'agile development', 'performance reviews', 'iterative processes'],
      tags: ['feedback', 'loop', 'improvement', 'evaluation', 'iterative']
    }
  };
}

export function getFeedbackLoopExamples(): PatternExample[] {
  return [
    {
      name: 'Agile Development Sprint',
      description: 'Feedback loop pattern for agile development sprints',
      useCase: 'Agile development and continuous improvement',
      complexity: 'medium',
      config: createFeedbackLoopPattern({
        title: 'Agile Development Sprint',
        description: 'Iterative development process with feedback loops',
        initialSteps: ['Sprint Planning', 'Task Assignment'],
        feedbackSteps: [
          { id: 'development', label: 'Develop Features', type: 'process' },
          { id: 'testing', label: 'Test Features', type: 'process' },
          { id: 'code_review', label: 'Code Review', type: 'evaluation' }
        ],
        evaluation: {
          question: 'Are features ready for demo?',
          continueLabel: 'No, continue development',
          exitLabel: 'Yes, proceed to demo',
          improvementLabel: 'Needs improvement'
        },
        improvementSteps: [
          'Refactor code',
          'Fix bugs',
          'Improve performance'
        ],
        finalSteps: ['Sprint Demo', 'Sprint Retrospective'],
        maxIterations: 10
      })
    },
    {
      name: 'Performance Review Process',
      description: 'Feedback loop pattern for performance reviews',
      useCase: 'Human resources and performance management',
      complexity: 'medium',
      config: createFeedbackLoopPattern({
        title: 'Performance Review Process',
        description: 'Iterative performance review with feedback',
        initialSteps: ['Set Performance Goals'],
        feedbackSteps: [
          { id: 'work_performance', label: 'Employee Work Performance', type: 'process' },
          { id: 'self_assessment', label: 'Self Assessment', type: 'evaluation' },
          { id: 'manager_review', label: 'Manager Review', type: 'evaluation' }
        ],
        evaluation: {
          question: 'Are performance goals met?',
          continueLabel: 'No, continue working',
          exitLabel: 'Yes, goals achieved',
          improvementLabel: 'Needs improvement'
        },
        improvementSteps: [
          'Create improvement plan',
          'Provide additional training',
          'Set new milestones'
        ],
        finalSteps: ['Final Review', 'Goal Setting for Next Period'],
        maxIterations: 4
      })
    },
    {
      name: 'Product Development Iteration',
      description: 'Feedback loop pattern for product development',
      useCase: 'Product development and innovation',
      complexity: 'complex',
      config: createFeedbackLoopPattern({
        title: 'Product Development Iteration',
        description: 'Iterative product development with user feedback',
        initialSteps: ['Market Research', 'Initial Design'],
        feedbackSteps: [
          { id: 'prototype', label: 'Create Prototype', type: 'process' },
          { id: 'user_testing', label: 'User Testing', type: 'evaluation' },
          { id: 'feedback_analysis', label: 'Analyze Feedback', type: 'evaluation' }
        ],
        evaluation: {
          question: 'Does product meet user needs?',
          continueLabel: 'No, iterate further',
          exitLabel: 'Yes, ready for launch',
          improvementLabel: 'Needs refinement'
        },
        improvementSteps: [
          'Refine design',
          'Improve functionality',
          'Address user concerns'
        ],
        finalSteps: ['Final Testing', 'Product Launch', 'Post-launch Monitoring'],
        maxIterations: 8
      })
    },
    {
      name: 'Quality Improvement Process',
      description: 'Feedback loop pattern for quality improvement',
      useCase: 'Quality management and continuous improvement',
      complexity: 'medium',
      config: createFeedbackLoopPattern({
        title: 'Quality Improvement Process',
        description: 'Continuous quality improvement with feedback loops',
        initialSteps: ['Quality Assessment'],
        feedbackSteps: [
          { id: 'identify_issues', label: 'Identify Quality Issues', type: 'process' },
          { id: 'implement_fixes', label: 'Implement Fixes', type: 'process' },
          { id: 'measure_improvement', label: 'Measure Improvement', type: 'evaluation' }
        ],
        evaluation: {
          question: 'Is quality target achieved?',
          continueLabel: 'No, continue improving',
          exitLabel: 'Yes, quality target met',
          improvementLabel: 'Needs more work'
        },
        improvementSteps: [
          'Analyze root causes',
          'Implement additional fixes',
          'Train staff on improvements'
        ],
        finalSteps: ['Document Improvements', 'Update Quality Standards'],
        maxIterations: 6
      })
    }
  ];
}

export function createCustomFeedbackLoop(
  title: string,
  feedbackSteps: FeedbackStep[],
  evaluation: { question: string; continueLabel: string; exitLabel: string; improvementLabel?: string },
  options: {
    initialSteps?: string[];
    improvementSteps?: string[];
    finalSteps?: string[];
    maxIterations?: number;
    description?: string;
  } = {}
): PatternConfig {
  return createFeedbackLoopPattern({
    title,
    feedbackSteps,
    evaluation,
    initialSteps: options.initialSteps,
    improvementSteps: options.improvementSteps,
    finalSteps: options.finalSteps,
    maxIterations: options.maxIterations,
    description: options.description
  });
}

// Utility function to validate feedback loop pattern
export function validateFeedbackLoopPattern(config: FeedbackLoopConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!config.feedbackSteps || config.feedbackSteps.length === 0) {
    errors.push('At least one feedback step is required');
  }
  
  if (!config.evaluation || !config.evaluation.question) {
    errors.push('Evaluation question is required');
  }
  
  if (!config.evaluation.continueLabel || !config.evaluation.exitLabel) {
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

// Function to add steps to existing feedback loop
export function addStepsToFeedbackLoop(
  pattern: PatternConfig,
  newSteps: FeedbackStep[],
  insertPosition?: number
): PatternConfig {
  const feedbackStartNode = pattern.nodes.find(n => n.id === 'feedback_start');
  if (!feedbackStartNode) {
    throw new Error('Feedback start node not found');
  }
  
  // This would require rebuilding the entire pattern
  // For now, return the original pattern
  return pattern;
}

// Function to create simple feedback loop
export function createSimpleFeedbackLoop(
  title: string,
  processSteps: string[],
  evaluationQuestion: string,
  options: {
    continueLabel?: string;
    exitLabel?: string;
    maxIterations?: number;
    description?: string;
  } = {}
): PatternConfig {
  const feedbackSteps: FeedbackStep[] = processSteps.map((step, index) => ({
    id: `step_${index + 1}`,
    label: step,
    type: 'process'
  }));
  
  return createFeedbackLoopPattern({
    title,
    feedbackSteps,
    evaluation: {
      question: evaluationQuestion,
      continueLabel: options.continueLabel || 'Continue',
      exitLabel: options.exitLabel || 'Complete'
    },
    maxIterations: options.maxIterations,
    description: options.description
  });
}
