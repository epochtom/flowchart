import { PatternConfig, FlowchartNode, FlowchartEdge, SwimlaneConfig, PatternExample } from './types.js';

/**
 * Swimlane Pattern
 * Divides the flowchart into lanes to show responsibilities across roles or departments.
 * Use Case: Processes involving multiple stakeholders (e.g., project workflows, cross-department tasks)
 * Structure: Vertical or horizontal lanes labeled by role/department
 */

export interface SwimlaneStep {
  id: string;
  label: string;
  laneId: string;
  type: 'process' | 'decision' | 'start' | 'end' | 'input' | 'output';
  dependencies?: string[];
}

export interface SwimlanePatternConfig {
  title: string;
  lanes: {
    id: string;
    label: string;
    type: 'horizontal' | 'vertical';
    width?: number;
    height?: number;
  }[];
  steps: SwimlaneStep[];
  orientation: 'horizontal' | 'vertical';
  description?: string;
}

export function createSwimlanePattern(config: SwimlanePatternConfig): PatternConfig {
  const { title, lanes, steps, orientation, description } = config;
  
  const nodes: FlowchartNode[] = [];
  const edges: FlowchartEdge[] = [];
  
  // Calculate lane dimensions
  const laneWidth = orientation === 'horizontal' ? 300 : 200;
  const laneHeight = orientation === 'horizontal' ? 100 : 300;
  
  // Create lane nodes (for visual representation)
  lanes.forEach((lane, index) => {
    const laneNodeId = `lane_${lane.id}`;
    const x = orientation === 'horizontal' ? index * laneWidth : 0;
    const y = orientation === 'horizontal' ? 0 : index * laneHeight;
    
    nodes.push({
      id: laneNodeId,
      type: 'process',
      label: lane.label,
      x: x,
      y: y,
      width: laneWidth,
      height: laneHeight,
      metadata: {
        role: lane.label,
        department: lane.label
      }
    });
  });
  
  // Group steps by lane
  const stepsByLane = new Map<string, SwimlaneStep[]>();
  steps.forEach(step => {
    if (!stepsByLane.has(step.laneId)) {
      stepsByLane.set(step.laneId, []);
    }
    stepsByLane.get(step.laneId)!.push(step);
  });
  
  // Create step nodes
  const stepNodes = new Map<string, FlowchartNode>();
  
  stepsByLane.forEach((laneSteps, laneId) => {
    const laneIndex = lanes.findIndex(l => l.id === laneId);
    if (laneIndex === -1) return;
    
    laneSteps.forEach((step, stepIndex) => {
      const x = orientation === 'horizontal' 
        ? laneIndex * laneWidth + 50
        : 50;
      const y = orientation === 'horizontal' 
        ? 50 + stepIndex * 80
        : laneIndex * laneHeight + 50 + stepIndex * 80;
      
      const node: FlowchartNode = {
        id: step.id,
        type: step.type,
        label: step.label,
        x: x,
        y: y,
        metadata: {
          role: lanes[laneIndex].label,
          department: lanes[laneIndex].label
        }
      };
      
      nodes.push(node);
      stepNodes.set(step.id, node);
    });
  });
  
  // Create edges based on dependencies
  steps.forEach(step => {
    if (step.dependencies) {
      step.dependencies.forEach(depId => {
        const depNode = stepNodes.get(depId);
        const stepNode = stepNodes.get(step.id);
        
        if (depNode && stepNode) {
          edges.push({
            from: depId,
            to: step.id,
            type: 'normal',
            metadata: {
              crossLane: depNode.metadata?.role !== stepNode.metadata?.role
            }
          });
        }
      });
    }
  });
  
  // Add cross-lane arrows for better visualization
  edges.forEach(edge => {
    if (edge.metadata?.crossLane) {
      edge.type = 'connector';
      edge.curve = true;
    }
  });
  
  return {
    id: `swimlane_${Date.now()}`,
    title,
    description,
    nodes,
    edges,
    metadata: {
      category: 'swimlane',
      complexity: lanes.length > 3 ? 'complex' : 'medium',
      useCases: ['project workflows', 'cross-department processes', 'role-based workflows', 'collaborative processes'],
      tags: ['swimlane', 'roles', 'departments', 'collaboration', 'workflow']
    }
  };
}

export function getSwimlaneExamples(): PatternExample[] {
  return [
    {
      name: 'Software Development Workflow',
      description: 'Swimlane pattern for software development process',
      useCase: 'Software development and project management',
      complexity: 'complex',
      config: createSwimlanePattern({
        title: 'Software Development Workflow',
        description: 'Cross-functional software development process',
        orientation: 'horizontal',
        lanes: [
          { id: 'product', label: 'Product Manager', type: 'horizontal' },
          { id: 'design', label: 'Designer', type: 'horizontal' },
          { id: 'development', label: 'Developer', type: 'horizontal' },
          { id: 'qa', label: 'QA Engineer', type: 'horizontal' },
          { id: 'devops', label: 'DevOps', type: 'horizontal' }
        ],
        steps: [
          { id: 'requirements', label: 'Gather requirements', laneId: 'product', type: 'start' },
          { id: 'wireframes', label: 'Create wireframes', laneId: 'design', type: 'process', dependencies: ['requirements'] },
          { id: 'mockups', label: 'Design mockups', laneId: 'design', type: 'process', dependencies: ['wireframes'] },
          { id: 'architecture', label: 'Design architecture', laneId: 'development', type: 'process', dependencies: ['requirements'] },
          { id: 'frontend', label: 'Develop frontend', laneId: 'development', type: 'process', dependencies: ['mockups', 'architecture'] },
          { id: 'backend', label: 'Develop backend', laneId: 'development', type: 'process', dependencies: ['architecture'] },
          { id: 'testing', label: 'Write tests', laneId: 'qa', type: 'process', dependencies: ['frontend', 'backend'] },
          { id: 'deployment', label: 'Deploy to staging', laneId: 'devops', type: 'process', dependencies: ['testing'] },
          { id: 'review', label: 'Code review', laneId: 'development', type: 'decision', dependencies: ['deployment'] },
          { id: 'production', label: 'Deploy to production', laneId: 'devops', type: 'process', dependencies: ['review'] },
          { id: 'monitoring', label: 'Monitor application', laneId: 'devops', type: 'process', dependencies: ['production'] },
          { id: 'end', label: 'Project complete', laneId: 'product', type: 'end', dependencies: ['monitoring'] }
        ]
      })
    },
    {
      name: 'Customer Onboarding Process',
      description: 'Swimlane pattern for customer onboarding',
      useCase: 'Customer success and onboarding',
      complexity: 'medium',
      config: createSwimlanePattern({
        title: 'Customer Onboarding Process',
        description: 'Multi-department customer onboarding workflow',
        orientation: 'vertical',
        lanes: [
          { id: 'sales', label: 'Sales Team', type: 'vertical' },
          { id: 'account', label: 'Account Manager', type: 'vertical' },
          { id: 'technical', label: 'Technical Team', type: 'vertical' },
          { id: 'support', label: 'Support Team', type: 'vertical' }
        ],
        steps: [
          { id: 'lead', label: 'Qualify lead', laneId: 'sales', type: 'start' },
          { id: 'contract', label: 'Sign contract', laneId: 'sales', type: 'process', dependencies: ['lead'] },
          { id: 'handoff', label: 'Handoff to account manager', laneId: 'account', type: 'process', dependencies: ['contract'] },
          { id: 'setup', label: 'Setup account', laneId: 'technical', type: 'process', dependencies: ['handoff'] },
          { id: 'training', label: 'Provide training', laneId: 'support', type: 'process', dependencies: ['setup'] },
          { id: 'go_live', label: 'Go live', laneId: 'account', type: 'process', dependencies: ['training'] },
          { id: 'followup', label: 'Follow up', laneId: 'account', type: 'process', dependencies: ['go_live'] },
          { id: 'end', label: 'Onboarding complete', laneId: 'support', type: 'end', dependencies: ['followup'] }
        ]
      })
    },
    {
      name: 'Content Publishing Workflow',
      description: 'Swimlane pattern for content publishing',
      useCase: 'Content management and publishing',
      complexity: 'medium',
      config: createSwimlanePattern({
        title: 'Content Publishing Workflow',
        description: 'Multi-role content publishing process',
        orientation: 'horizontal',
        lanes: [
          { id: 'writer', label: 'Content Writer', type: 'horizontal' },
          { id: 'editor', label: 'Editor', type: 'horizontal' },
          { id: 'designer', label: 'Graphic Designer', type: 'horizontal' },
          { id: 'publisher', label: 'Publisher', type: 'horizontal' }
        ],
        steps: [
          { id: 'research', label: 'Research topic', laneId: 'writer', type: 'start' },
          { id: 'draft', label: 'Write draft', laneId: 'writer', type: 'process', dependencies: ['research'] },
          { id: 'edit', label: 'Edit content', laneId: 'editor', type: 'process', dependencies: ['draft'] },
          { id: 'graphics', label: 'Create graphics', laneId: 'designer', type: 'process', dependencies: ['edit'] },
          { id: 'review', label: 'Final review', laneId: 'editor', type: 'decision', dependencies: ['graphics'] },
          { id: 'publish', label: 'Publish content', laneId: 'publisher', type: 'process', dependencies: ['review'] },
          { id: 'promote', label: 'Promote content', laneId: 'publisher', type: 'process', dependencies: ['publish'] },
          { id: 'end', label: 'Content live', laneId: 'writer', type: 'end', dependencies: ['promote'] }
        ]
      })
    }
  ];
}

export function createCustomSwimlane(
  title: string,
  lanes: { id: string; label: string; type: 'horizontal' | 'vertical' }[],
  steps: SwimlaneStep[],
  options: {
    orientation?: 'horizontal' | 'vertical';
    description?: string;
  } = {}
): PatternConfig {
  return createSwimlanePattern({
    title,
    lanes,
    steps,
    orientation: options.orientation || 'horizontal',
    description: options.description
  });
}

// Utility function to validate swimlane pattern
export function validateSwimlanePattern(config: SwimlanePatternConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!config.lanes || config.lanes.length === 0) {
    errors.push('At least one lane is required');
  }
  
  if (!config.steps || config.steps.length === 0) {
    errors.push('At least one step is required');
  }
  
  if (config.steps) {
    const laneIds = new Set(config.lanes.map(l => l.id));
    config.steps.forEach((step, index) => {
      if (!step.id || step.id.trim() === '') {
        errors.push(`Step ${index + 1} must have an ID`);
      }
      if (!step.label || step.label.trim() === '') {
        errors.push(`Step ${index + 1} must have a label`);
      }
      if (!step.laneId || !laneIds.has(step.laneId)) {
        errors.push(`Step ${index + 1} must have a valid lane ID`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to add step to existing swimlane
export function addStepToSwimlane(
  pattern: PatternConfig,
  step: SwimlaneStep
): PatternConfig {
  // This would require rebuilding the entire pattern
  // For now, return the original pattern
  return pattern;
}

// Function to create vertical swimlane
export function createVerticalSwimlane(
  title: string,
  lanes: { id: string; label: string }[],
  steps: SwimlaneStep[],
  description?: string
): PatternConfig {
  return createSwimlanePattern({
    title,
    lanes: lanes.map(lane => ({ ...lane, type: 'vertical' as const })),
    steps,
    orientation: 'vertical',
    description
  });
}

// Function to create horizontal swimlane
export function createHorizontalSwimlane(
  title: string,
  lanes: { id: string; label: string }[],
  steps: SwimlaneStep[],
  description?: string
): PatternConfig {
  return createSwimlanePattern({
    title,
    lanes: lanes.map(lane => ({ ...lane, type: 'horizontal' as const })),
    steps,
    orientation: 'horizontal',
    description
  });
}
