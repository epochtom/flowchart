import { PatternConfig, FlowchartNode, FlowchartEdge, HierarchicalConfig, PatternExample } from './types.js';

/**
 * Hierarchical (Subprocess) Pattern
 * A high-level flowchart with links to detailed sub-flowcharts for complex steps.
 * Use Case: Large processes with detailed subsections (e.g., software development, manufacturing)
 * Structure: Main flowchart with subprocess symbols linked to detailed sub-flowcharts
 */

export interface SubprocessNode {
  id: string;
  label: string;
  subprocessId: string;
  description?: string;
  complexity?: 'simple' | 'medium' | 'complex';
}

export interface HierarchicalPatternConfig {
  title: string;
  mainProcess: {
    steps: (FlowchartNode | SubprocessNode)[];
    edges: FlowchartEdge[];
  };
  subprocesses: {
    [subprocessId: string]: {
      title: string;
      description?: string;
      steps: FlowchartNode[];
      edges: FlowchartEdge[];
    };
  };
  connectors: {
    from: string;
    to: string;
    subprocessId: string;
  }[];
  description?: string;
}

export function createHierarchicalPattern(config: HierarchicalPatternConfig): PatternConfig {
  const { title, mainProcess, subprocesses, connectors, description } = config;
  
  const nodes: FlowchartNode[] = [];
  const edges: FlowchartEdge[] = [];
  
  // Add main process nodes
  mainProcess.steps.forEach(step => {
    if ('subprocessId' in step) {
      // This is a subprocess node
      const subprocessNode: FlowchartNode = {
        id: step.id,
        type: 'subprocess',
        label: step.label,
        x: step.x || 0,
        y: step.y || 0,
        width: step.width || 200,
        height: step.height || 100,
        metadata: {
          subprocessId: step.subprocessId
        }
      };
      nodes.push(subprocessNode);
    } else {
      // Regular node
      nodes.push(step);
    }
  });
  
  // Add main process edges
  mainProcess.edges.forEach(edge => {
    edges.push({
      ...edge,
      type: edge.type || 'normal'
    });
  });
  
  // Add connector edges for subprocesses
  connectors.forEach(connector => {
    edges.push({
      from: connector.from,
      to: connector.to,
      type: 'subprocess',
      label: `See: ${subprocesses[connector.subprocessId]?.title || 'Subprocess'}`,
      connector: {
        id: connector.subprocessId,
        label: subprocesses[connector.subprocessId]?.title
      }
    });
  });
  
  return {
    id: `hierarchical_${Date.now()}`,
    title,
    description,
    nodes,
    edges,
    metadata: {
      category: 'hierarchical',
      complexity: Object.keys(subprocesses).length > 3 ? 'complex' : 'medium',
      useCases: ['software development', 'manufacturing', 'complex processes', 'detailed workflows'],
      tags: ['hierarchical', 'subprocess', 'detailed', 'complex', 'modular']
    }
  };
}

export function getHierarchicalExamples(): PatternExample[] {
  return [
    {
      name: 'Software Development Lifecycle',
      description: 'Hierarchical pattern for software development with detailed subprocesses',
      useCase: 'Software development and project management',
      complexity: 'complex',
      config: createHierarchicalPattern({
        title: 'Software Development Lifecycle',
        description: 'High-level software development process with detailed subprocesses',
        mainProcess: {
          steps: [
            { id: 'start', type: 'start', label: 'Project Start', x: 0, y: 0 },
            { id: 'planning', type: 'process', label: 'Project Planning', x: 0, y: 100 },
            { id: 'development', subprocessId: 'dev_process', label: 'Development Process', x: 0, y: 200 },
            { id: 'testing', subprocessId: 'test_process', label: 'Testing Process', x: 0, y: 300 },
            { id: 'deployment', subprocessId: 'deploy_process', label: 'Deployment Process', x: 0, y: 400 },
            { id: 'maintenance', type: 'process', label: 'Maintenance', x: 0, y: 500 },
            { id: 'end', type: 'end', label: 'Project End', x: 0, y: 600 }
          ],
          edges: [
            { from: 'start', to: 'planning' },
            { from: 'planning', to: 'development' },
            { from: 'development', to: 'testing' },
            { from: 'testing', to: 'deployment' },
            { from: 'deployment', to: 'maintenance' },
            { from: 'maintenance', to: 'end' }
          ]
        },
        subprocesses: {
          'dev_process': {
            title: 'Development Process',
            description: 'Detailed development workflow',
            steps: [
              { id: 'dev_start', type: 'start', label: 'Start Development', x: 0, y: 0 },
              { id: 'design', type: 'process', label: 'System Design', x: 0, y: 100 },
              { id: 'code', type: 'process', label: 'Write Code', x: 0, y: 200 },
              { id: 'review', type: 'process', label: 'Code Review', x: 0, y: 300 },
              { id: 'dev_end', type: 'end', label: 'Development Complete', x: 0, y: 400 }
            ],
            edges: [
              { from: 'dev_start', to: 'design' },
              { from: 'design', to: 'code' },
              { from: 'code', to: 'review' },
              { from: 'review', to: 'dev_end' }
            ]
          },
          'test_process': {
            title: 'Testing Process',
            description: 'Comprehensive testing workflow',
            steps: [
              { id: 'test_start', type: 'start', label: 'Start Testing', x: 0, y: 0 },
              { id: 'unit_test', type: 'process', label: 'Unit Testing', x: 0, y: 100 },
              { id: 'integration_test', type: 'process', label: 'Integration Testing', x: 0, y: 200 },
              { id: 'system_test', type: 'process', label: 'System Testing', x: 0, y: 300 },
              { id: 'test_end', type: 'end', label: 'Testing Complete', x: 0, y: 400 }
            ],
            edges: [
              { from: 'test_start', to: 'unit_test' },
              { from: 'unit_test', to: 'integration_test' },
              { from: 'integration_test', to: 'system_test' },
              { from: 'system_test', to: 'test_end' }
            ]
          },
          'deploy_process': {
            title: 'Deployment Process',
            description: 'Deployment and release workflow',
            steps: [
              { id: 'deploy_start', type: 'start', label: 'Start Deployment', x: 0, y: 0 },
              { id: 'build', type: 'process', label: 'Build Application', x: 0, y: 100 },
              { id: 'staging', type: 'process', label: 'Deploy to Staging', x: 0, y: 200 },
              { id: 'production', type: 'process', label: 'Deploy to Production', x: 0, y: 300 },
              { id: 'deploy_end', type: 'end', label: 'Deployment Complete', x: 0, y: 400 }
            ],
            edges: [
              { from: 'deploy_start', to: 'build' },
              { from: 'build', to: 'staging' },
              { from: 'staging', to: 'production' },
              { from: 'production', to: 'deploy_end' }
            ]
          }
        },
        connectors: [
          { from: 'development', to: 'testing', subprocessId: 'dev_process' },
          { from: 'testing', to: 'deployment', subprocessId: 'test_process' },
          { from: 'deployment', to: 'maintenance', subprocessId: 'deploy_process' }
        ]
      })
    },
    {
      name: 'Manufacturing Process',
      description: 'Hierarchical pattern for manufacturing with detailed subprocesses',
      useCase: 'Manufacturing and production',
      complexity: 'complex',
      config: createHierarchicalPattern({
        title: 'Manufacturing Process',
        description: 'High-level manufacturing process with detailed subprocesses',
        mainProcess: {
          steps: [
            { id: 'start', type: 'start', label: 'Production Start', x: 0, y: 0 },
            { id: 'planning', type: 'process', label: 'Production Planning', x: 0, y: 100 },
            { id: 'materials', subprocessId: 'material_process', label: 'Material Preparation', x: 0, y: 200 },
            { id: 'assembly', subprocessId: 'assembly_process', label: 'Assembly Process', x: 0, y: 300 },
            { id: 'quality', subprocessId: 'quality_process', label: 'Quality Control', x: 0, y: 400 },
            { id: 'packaging', type: 'process', label: 'Packaging', x: 0, y: 500 },
            { id: 'end', type: 'end', label: 'Production Complete', x: 0, y: 600 }
          ],
          edges: [
            { from: 'start', to: 'planning' },
            { from: 'planning', to: 'materials' },
            { from: 'materials', to: 'assembly' },
            { from: 'assembly', to: 'quality' },
            { from: 'quality', to: 'packaging' },
            { from: 'packaging', to: 'end' }
          ]
        },
        subprocesses: {
          'material_process': {
            title: 'Material Preparation',
            description: 'Detailed material preparation workflow',
            steps: [
              { id: 'mat_start', type: 'start', label: 'Start Material Prep', x: 0, y: 0 },
              { id: 'order', type: 'process', label: 'Order Materials', x: 0, y: 100 },
              { id: 'receive', type: 'process', label: 'Receive Materials', x: 0, y: 200 },
              { id: 'inspect', type: 'process', label: 'Inspect Materials', x: 0, y: 300 },
              { id: 'mat_end', type: 'end', label: 'Materials Ready', x: 0, y: 400 }
            ],
            edges: [
              { from: 'mat_start', to: 'order' },
              { from: 'order', to: 'receive' },
              { from: 'receive', to: 'inspect' },
              { from: 'inspect', to: 'mat_end' }
            ]
          },
          'assembly_process': {
            title: 'Assembly Process',
            description: 'Detailed assembly workflow',
            steps: [
              { id: 'asm_start', type: 'start', label: 'Start Assembly', x: 0, y: 0 },
              { id: 'prepare', type: 'process', label: 'Prepare Components', x: 0, y: 100 },
              { id: 'assemble', type: 'process', label: 'Assemble Product', x: 0, y: 200 },
              { id: 'test', type: 'process', label: 'Test Assembly', x: 0, y: 300 },
              { id: 'asm_end', type: 'end', label: 'Assembly Complete', x: 0, y: 400 }
            ],
            edges: [
              { from: 'asm_start', to: 'prepare' },
              { from: 'prepare', to: 'assemble' },
              { from: 'assemble', to: 'test' },
              { from: 'test', to: 'asm_end' }
            ]
          },
          'quality_process': {
            title: 'Quality Control',
            description: 'Comprehensive quality control workflow',
            steps: [
              { id: 'qc_start', type: 'start', label: 'Start Quality Control', x: 0, y: 0 },
              { id: 'inspect', type: 'process', label: 'Inspect Product', x: 0, y: 100 },
              { id: 'test', type: 'process', label: 'Test Product', x: 0, y: 200 },
              { id: 'approve', type: 'decision', label: 'Approve Quality?', x: 0, y: 300 },
              { id: 'qc_end', type: 'end', label: 'Quality Approved', x: 0, y: 400 }
            ],
            edges: [
              { from: 'qc_start', to: 'inspect' },
              { from: 'inspect', to: 'test' },
              { from: 'test', to: 'approve' },
              { from: 'approve', to: 'qc_end' }
            ]
          }
        },
        connectors: [
          { from: 'materials', to: 'assembly', subprocessId: 'material_process' },
          { from: 'assembly', to: 'quality', subprocessId: 'assembly_process' },
          { from: 'quality', to: 'packaging', subprocessId: 'quality_process' }
        ]
      })
    }
  ];
}

export function createCustomHierarchical(
  title: string,
  mainProcess: { steps: (FlowchartNode | SubprocessNode)[]; edges: FlowchartEdge[] },
  subprocesses: { [subprocessId: string]: { title: string; description?: string; steps: FlowchartNode[]; edges: FlowchartEdge[] } },
  connectors: { from: string; to: string; subprocessId: string }[],
  description?: string
): PatternConfig {
  return createHierarchicalPattern({
    title,
    mainProcess,
    subprocesses,
    connectors,
    description
  });
}

// Utility function to validate hierarchical pattern
export function validateHierarchicalPattern(config: HierarchicalPatternConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!config.mainProcess || !config.mainProcess.steps || config.mainProcess.steps.length === 0) {
    errors.push('Main process must have at least one step');
  }
  
  if (!config.subprocesses || Object.keys(config.subprocesses).length === 0) {
    errors.push('At least one subprocess is required');
  }
  
  if (!config.connectors || config.connectors.length === 0) {
    errors.push('At least one connector is required');
  }
  
  // Validate subprocess references
  if (config.mainProcess && config.subprocesses) {
    const subprocessIds = new Set(Object.keys(config.subprocesses));
    config.mainProcess.steps.forEach((step, index) => {
      if ('subprocessId' in step && !subprocessIds.has(step.subprocessId)) {
        errors.push(`Step ${index + 1} references non-existent subprocess: ${step.subprocessId}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to add subprocess to existing hierarchical pattern
export function addSubprocessToHierarchical(
  pattern: PatternConfig,
  subprocessId: string,
  subprocess: { title: string; description?: string; steps: FlowchartNode[]; edges: FlowchartEdge[] }
): PatternConfig {
  // This would require rebuilding the entire pattern
  // For now, return the original pattern
  return pattern;
}

// Function to create simple hierarchical pattern
export function createSimpleHierarchical(
  title: string,
  mainSteps: string[],
  subprocesses: { [key: string]: string[] },
  description?: string
): PatternConfig {
  const mainProcessSteps: (FlowchartNode | SubprocessNode)[] = [
    { id: 'start', type: 'start', label: 'Start', x: 0, y: 0 }
  ];
  
  const mainProcessEdges: FlowchartEdge[] = [];
  const connectors: { from: string; to: string; subprocessId: string }[] = [];
  
  let currentY = 100;
  let previousId = 'start';
  
  mainSteps.forEach((step, index) => {
    const stepId = `step_${index + 1}`;
    const isSubprocess = subprocesses[step];
    
    if (isSubprocess) {
      mainProcessSteps.push({
        id: stepId,
        subprocessId: step,
        label: step.replace(/_/g, ' ').toUpperCase(),
        x: 0,
        y: currentY
      });
    } else {
      mainProcessSteps.push({
        id: stepId,
        type: 'process',
        label: step,
        x: 0,
        y: currentY
      });
    }
    
    mainProcessEdges.push({
      from: previousId,
      to: stepId
    });
    
    if (isSubprocess) {
      connectors.push({
        from: stepId,
        to: `step_${index + 2}`,
        subprocessId: step
      });
    }
    
    previousId = stepId;
    currentY += 100;
  });
  
  mainProcessSteps.push({
    id: 'end',
    type: 'end',
    label: 'End',
    x: 0,
    y: currentY
  });
  
  mainProcessEdges.push({
    from: previousId,
    to: 'end'
  });
  
  const subprocessConfigs: { [subprocessId: string]: { title: string; description?: string; steps: FlowchartNode[]; edges: FlowchartEdge[] } } = {};
  
  Object.entries(subprocesses).forEach(([subprocessId, steps]) => {
    const subprocessSteps: FlowchartNode[] = [
      { id: `${subprocessId}_start`, type: 'start', label: 'Start', x: 0, y: 0 }
    ];
    const subprocessEdges: FlowchartEdge[] = [];
    
    let subY = 100;
    let subPreviousId = `${subprocessId}_start`;
    
    steps.forEach((step, index) => {
      const stepId = `${subprocessId}_step_${index + 1}`;
      subprocessSteps.push({
        id: stepId,
        type: 'process',
        label: step,
        x: 0,
        y: subY
      });
      
      subprocessEdges.push({
        from: subPreviousId,
        to: stepId
      });
      
      subPreviousId = stepId;
      subY += 100;
    });
    
    subprocessSteps.push({
      id: `${subprocessId}_end`,
      type: 'end',
      label: 'End',
      x: 0,
      y: subY
    });
    
    subprocessEdges.push({
      from: subPreviousId,
      to: `${subprocessId}_end`
    });
    
    subprocessConfigs[subprocessId] = {
      title: subprocessId.replace(/_/g, ' ').toUpperCase(),
      steps: subprocessSteps,
      edges: subprocessEdges
    };
  });
  
  return createHierarchicalPattern({
    title,
    mainProcess: {
      steps: mainProcessSteps,
      edges: mainProcessEdges
    },
    subprocesses: subprocessConfigs,
    connectors,
    description
  });
}
