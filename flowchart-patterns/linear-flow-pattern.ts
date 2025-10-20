import { PatternConfig, FlowchartNode, FlowchartEdge, PatternExample } from './types.js';

/**
 * Linear Flow Pattern
 * A straightforward, sequential process with no branches or loops.
 * Use Case: Simple processes with a clear start-to-end path (e.g., basic onboarding)
 * Structure: Start (oval) → Process Step 1 (rectangle) → Process Step 2 (rectangle) → ... → End (oval)
 */

export interface LinearFlowConfig {
  title: string;
  steps: string[];
  startLabel?: string;
  endLabel?: string;
  description?: string;
}

export function createLinearFlowPattern(config: LinearFlowConfig): PatternConfig {
  const { title, steps, startLabel = 'Start', endLabel = 'End', description } = config;
  
  const nodes: FlowchartNode[] = [];
  const edges: FlowchartEdge[] = [];
  
  // Create start node
  nodes.push({
    id: 'start',
    type: 'start',
    label: startLabel,
    x: 0,
    y: 0
  });
  
  // Create process steps
  steps.forEach((step, index) => {
    const nodeId = `step_${index + 1}`;
    nodes.push({
      id: nodeId,
      type: 'process',
      label: step,
      x: 0,
      y: (index + 1) * 100
    });
    
    // Create edge from previous node
    const fromNode = index === 0 ? 'start' : `step_${index}`;
    edges.push({
      from: fromNode,
      to: nodeId,
      type: 'normal'
    });
  });
  
  // Create end node
  const endNodeId = 'end';
  nodes.push({
    id: endNodeId,
    type: 'end',
    label: endLabel,
    x: 0,
    y: (steps.length + 1) * 100
  });
  
  // Create edge from last step to end
  const lastStepId = `step_${steps.length}`;
  edges.push({
    from: lastStepId,
    to: endNodeId,
    type: 'normal'
  });
  
  return {
    id: `linear_flow_${Date.now()}`,
    title,
    description,
    nodes,
    edges,
    metadata: {
      category: 'linear',
      complexity: 'simple',
      useCases: ['onboarding', 'simple processes', 'sequential workflows'],
      tags: ['linear', 'sequential', 'simple', 'straightforward']
    }
  };
}

export function getLinearFlowExamples(): PatternExample[] {
  return [
    {
      name: 'Basic Onboarding Process',
      description: 'A simple linear onboarding process for new employees',
      useCase: 'HR and employee onboarding',
      complexity: 'simple',
      config: createLinearFlowPattern({
        title: 'Employee Onboarding Process',
        description: 'Step-by-step onboarding process for new employees',
        steps: [
          'Complete paperwork',
          'Attend orientation',
          'Meet with manager',
          'Set up workstation',
          'Begin training'
        ],
        startLabel: 'New Employee Arrives',
        endLabel: 'Onboarding Complete'
      })
    },
    {
      name: 'Order Processing',
      description: 'Linear order processing workflow',
      useCase: 'E-commerce and order management',
      complexity: 'simple',
      config: createLinearFlowPattern({
        title: 'Order Processing Workflow',
        description: 'Sequential steps for processing customer orders',
        steps: [
          'Receive order',
          'Validate payment',
          'Check inventory',
          'Prepare shipment',
          'Send confirmation'
        ],
        startLabel: 'Order Received',
        endLabel: 'Order Shipped'
      })
    },
    {
      name: 'Document Approval',
      description: 'Simple document approval process',
      useCase: 'Document management and approval workflows',
      complexity: 'simple',
      config: createLinearFlowPattern({
        title: 'Document Approval Process',
        description: 'Linear workflow for document approval',
        steps: [
          'Submit document',
          'Initial review',
          'Manager approval',
          'Final review',
          'Document published'
        ],
        startLabel: 'Document Submitted',
        endLabel: 'Approval Complete'
      })
    },
    {
      name: 'Product Launch',
      description: 'Sequential product launch process',
      useCase: 'Product management and marketing',
      complexity: 'medium',
      config: createLinearFlowPattern({
        title: 'Product Launch Process',
        description: 'Step-by-step product launch workflow',
        steps: [
          'Market research',
          'Product development',
          'Quality testing',
          'Marketing campaign',
          'Sales training',
          'Product launch',
          'Post-launch review'
        ],
        startLabel: 'Launch Planning',
        endLabel: 'Launch Complete'
      })
    }
  ];
}

export function createCustomLinearFlow(
  title: string,
  steps: string[],
  options: {
    startLabel?: string;
    endLabel?: string;
    description?: string;
  } = {}
): PatternConfig {
  return createLinearFlowPattern({
    title,
    steps,
    startLabel: options.startLabel,
    endLabel: options.endLabel,
    description: options.description
  });
}

// Utility function to validate linear flow
export function validateLinearFlow(config: LinearFlowConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!config.steps || config.steps.length === 0) {
    errors.push('At least one step is required');
  }
  
  if (config.steps && config.steps.some(step => !step || step.trim() === '')) {
    errors.push('All steps must have non-empty labels');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to add steps to existing linear flow
export function addStepsToLinearFlow(
  pattern: PatternConfig,
  newSteps: string[],
  insertPosition?: number
): PatternConfig {
  const currentSteps = pattern.nodes
    .filter(node => node.type === 'process')
    .map(node => node.label);
  
  const stepsToInsert = insertPosition !== undefined 
    ? [...currentSteps.slice(0, insertPosition), ...newSteps, ...currentSteps.slice(insertPosition)]
    : [...currentSteps, ...newSteps];
  
  return createLinearFlowPattern({
    title: pattern.title,
    description: pattern.description,
    steps: stepsToInsert,
    startLabel: pattern.nodes.find(n => n.type === 'start')?.label || 'Start',
    endLabel: pattern.nodes.find(n => n.type === 'end')?.label || 'End'
  });
}
