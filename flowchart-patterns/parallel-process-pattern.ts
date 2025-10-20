import { PatternConfig, FlowchartNode, FlowchartEdge, ParallelConfig, PatternExample } from './types.js';

/**
 * Parallel Process Pattern
 * Multiple processes or tasks occurring simultaneously.
 * Use Case: Multitasking workflows (e.g., concurrent project tasks, system integrations)
 * Structure: Start → Fork (split into multiple paths) → Parallel processes → Join point → End
 */

export interface ParallelGroup {
  id: string;
  label: string;
  processes: {
    id: string;
    label: string;
    type?: 'process' | 'decision' | 'input' | 'output';
    dependencies?: string[];
  }[];
  description?: string;
}

export interface ParallelProcessConfig {
  title: string;
  preForkSteps?: string[];
  parallelGroups: ParallelGroup[];
  postJoinSteps?: string[];
  forkLabel?: string;
  joinLabel?: string;
  description?: string;
}

export function createParallelProcessPattern(config: ParallelProcessConfig): PatternConfig {
  const { 
    title, 
    preForkSteps = [], 
    parallelGroups, 
    postJoinSteps = [], 
    forkLabel = 'Fork',
    joinLabel = 'Join',
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
  
  // Add pre-fork steps
  preForkSteps.forEach((step, index) => {
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
  
  // Create fork node
  const forkId = 'fork';
  nodes.push({
    id: forkId,
    type: 'fork',
    label: forkLabel,
    x: 0,
    y: currentY
  });
  
  edges.push({
    from: currentNodeId,
    to: forkId,
    type: 'normal'
  });
  
  currentY += 100;
  
  // Create parallel groups
  const groupWidth = 300;
  const groupSpacing = 50;
  const totalWidth = (parallelGroups.length * groupWidth) + ((parallelGroups.length - 1) * groupSpacing);
  const startX = -totalWidth / 2;
  
  parallelGroups.forEach((group, groupIndex) => {
    const groupX = startX + (groupIndex * (groupWidth + groupSpacing));
    
    // Add group processes
    group.processes.forEach((process, processIndex) => {
      const processId = process.id || `group_${group.id}_process_${processIndex + 1}`;
      nodes.push({
        id: processId,
        type: process.type || 'process',
        label: process.label,
        x: groupX,
        y: currentY + (processIndex * 100),
        metadata: {
          parallelGroup: group.id
        }
      });
      
      // Connect to fork
      edges.push({
        from: forkId,
        to: processId,
        type: 'parallel',
        metadata: {
          parallelGroup: group.id
        }
      });
      
      // Add dependencies within group
      if (process.dependencies) {
        process.dependencies.forEach(depId => {
          const depProcess = group.processes.find(p => p.id === depId);
          if (depProcess) {
            const depProcessId = depProcess.id || `group_${group.id}_process_${group.processes.indexOf(depProcess) + 1}`;
            edges.push({
              from: depProcessId,
              to: processId,
              type: 'normal',
              metadata: {
                parallelGroup: group.id
              }
            });
          }
        });
      }
    });
  });
  
  // Create join node
  const joinId = 'join';
  const maxGroupHeight = Math.max(...parallelGroups.map(group => group.processes.length * 100));
  const joinY = currentY + maxGroupHeight + 100;
  
  nodes.push({
    id: joinId,
    type: 'join',
    label: joinLabel,
    x: 0,
    y: joinY
  });
  
  // Connect all parallel processes to join
  parallelGroups.forEach(group => {
    group.processes.forEach(process => {
      const processId = process.id || `group_${group.id}_process_${group.processes.indexOf(process) + 1}`;
      edges.push({
        from: processId,
        to: joinId,
        type: 'parallel',
        metadata: {
          parallelGroup: group.id
        }
      });
    });
  });
  
  // Add post-join steps
  currentNodeId = joinId;
  currentY = joinY + 100;
  
  postJoinSteps.forEach((step, index) => {
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
  
  return {
    id: `parallel_process_${Date.now()}`,
    title,
    description,
    nodes,
    edges,
    metadata: {
      category: 'parallel',
      complexity: parallelGroups.length > 3 ? 'complex' : 'medium',
      useCases: ['concurrent tasks', 'system integrations', 'multitasking workflows', 'parallel processing'],
      tags: ['parallel', 'concurrent', 'multitasking', 'fork', 'join']
    }
  };
}

export function getParallelProcessExamples(): PatternExample[] {
  return [
    {
      name: 'Software Development Sprint',
      description: 'Parallel process pattern for agile development sprint',
      useCase: 'Agile development and project management',
      complexity: 'complex',
      config: createParallelProcessPattern({
        title: 'Agile Development Sprint',
        description: 'Parallel development tasks in a sprint',
        preForkSteps: ['Sprint Planning', 'Task Assignment'],
        forkLabel: 'Start Sprint',
        parallelGroups: [
          {
            id: 'frontend',
            label: 'Frontend Development',
            description: 'Client-side development tasks',
            processes: [
              { id: 'ui_design', label: 'UI Design', type: 'process' },
              { id: 'frontend_dev', label: 'Frontend Development', type: 'process', dependencies: ['ui_design'] },
              { id: 'frontend_test', label: 'Frontend Testing', type: 'process', dependencies: ['frontend_dev'] }
            ]
          },
          {
            id: 'backend',
            label: 'Backend Development',
            description: 'Server-side development tasks',
            processes: [
              { id: 'api_design', label: 'API Design', type: 'process' },
              { id: 'backend_dev', label: 'Backend Development', type: 'process', dependencies: ['api_design'] },
              { id: 'backend_test', label: 'Backend Testing', type: 'process', dependencies: ['backend_dev'] }
            ]
          },
          {
            id: 'database',
            label: 'Database Development',
            description: 'Database design and implementation',
            processes: [
              { id: 'db_design', label: 'Database Design', type: 'process' },
              { id: 'db_implementation', label: 'Database Implementation', type: 'process', dependencies: ['db_design'] },
              { id: 'db_optimization', label: 'Database Optimization', type: 'process', dependencies: ['db_implementation'] }
            ]
          },
          {
            id: 'devops',
            label: 'DevOps Tasks',
            description: 'Infrastructure and deployment tasks',
            processes: [
              { id: 'infrastructure', label: 'Infrastructure Setup', type: 'process' },
              { id: 'ci_cd', label: 'CI/CD Pipeline', type: 'process', dependencies: ['infrastructure'] },
              { id: 'monitoring', label: 'Monitoring Setup', type: 'process', dependencies: ['ci_cd'] }
            ]
          }
        ],
        postJoinSteps: ['Integration Testing', 'Sprint Review', 'Sprint Retrospective'],
        joinLabel: 'Sprint Complete'
      })
    },
    {
      name: 'Product Launch Process',
      description: 'Parallel process pattern for product launch',
      useCase: 'Product management and marketing',
      complexity: 'medium',
      config: createParallelProcessPattern({
        title: 'Product Launch Process',
        description: 'Parallel tasks for product launch',
        preForkSteps: ['Launch Planning'],
        forkLabel: 'Begin Launch Tasks',
        parallelGroups: [
          {
            id: 'marketing',
            label: 'Marketing',
            processes: [
              { id: 'campaign_design', label: 'Design Campaign', type: 'process' },
              { id: 'content_creation', label: 'Create Content', type: 'process' },
              { id: 'social_media', label: 'Social Media Setup', type: 'process' }
            ]
          },
          {
            id: 'sales',
            label: 'Sales',
            processes: [
              { id: 'sales_training', label: 'Sales Training', type: 'process' },
              { id: 'pricing_strategy', label: 'Pricing Strategy', type: 'process' },
              { id: 'sales_materials', label: 'Sales Materials', type: 'process' }
            ]
          },
          {
            id: 'operations',
            label: 'Operations',
            processes: [
              { id: 'inventory', label: 'Inventory Management', type: 'process' },
              { id: 'fulfillment', label: 'Fulfillment Setup', type: 'process' },
              { id: 'support', label: 'Support Preparation', type: 'process' }
            ]
          }
        ],
        postJoinSteps: ['Final Review', 'Launch Announcement', 'Monitor Launch'],
        joinLabel: 'Launch Ready'
      })
    },
    {
      name: 'Data Processing Pipeline',
      description: 'Parallel process pattern for data processing',
      useCase: 'Data processing and analytics',
      complexity: 'medium',
      config: createParallelProcessPattern({
        title: 'Data Processing Pipeline',
        description: 'Parallel data processing tasks',
        preForkSteps: ['Data Collection'],
        forkLabel: 'Process Data',
        parallelGroups: [
          {
            id: 'extraction',
            label: 'Data Extraction',
            processes: [
              { id: 'extract_db', label: 'Extract from Database', type: 'process' },
              { id: 'extract_api', label: 'Extract from APIs', type: 'process' },
              { id: 'extract_files', label: 'Extract from Files', type: 'process' }
            ]
          },
          {
            id: 'transformation',
            label: 'Data Transformation',
            processes: [
              { id: 'clean_data', label: 'Clean Data', type: 'process' },
              { id: 'normalize', label: 'Normalize Data', type: 'process' },
              { id: 'validate', label: 'Validate Data', type: 'process' }
            ]
          },
          {
            id: 'loading',
            label: 'Data Loading',
            processes: [
              { id: 'load_warehouse', label: 'Load to Warehouse', type: 'process' },
              { id: 'load_analytics', label: 'Load to Analytics', type: 'process' },
              { id: 'load_reports', label: 'Load to Reports', type: 'process' }
            ]
          }
        ],
        postJoinSteps: ['Generate Reports', 'Send Notifications'],
        joinLabel: 'Processing Complete'
      })
    }
  ];
}

export function createCustomParallelProcess(
  title: string,
  parallelGroups: ParallelGroup[],
  options: {
    preForkSteps?: string[];
    postJoinSteps?: string[];
    forkLabel?: string;
    joinLabel?: string;
    description?: string;
  } = {}
): PatternConfig {
  return createParallelProcessPattern({
    title,
    parallelGroups,
    preForkSteps: options.preForkSteps,
    postJoinSteps: options.postJoinSteps,
    forkLabel: options.forkLabel,
    joinLabel: options.joinLabel,
    description: options.description
  });
}

// Utility function to validate parallel process pattern
export function validateParallelProcessPattern(config: ParallelProcessConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!config.parallelGroups || config.parallelGroups.length === 0) {
    errors.push('At least one parallel group is required');
  }
  
  if (config.parallelGroups) {
    config.parallelGroups.forEach((group, groupIndex) => {
      if (!group.id || group.id.trim() === '') {
        errors.push(`Parallel group ${groupIndex + 1} must have an ID`);
      }
      if (!group.label || group.label.trim() === '') {
        errors.push(`Parallel group ${groupIndex + 1} must have a label`);
      }
      if (!group.processes || group.processes.length === 0) {
        errors.push(`Parallel group ${groupIndex + 1} must have at least one process`);
      }
      
      if (group.processes) {
        group.processes.forEach((process, processIndex) => {
          if (!process.id || process.id.trim() === '') {
            errors.push(`Process ${processIndex + 1} in group ${groupIndex + 1} must have an ID`);
          }
          if (!process.label || process.label.trim() === '') {
            errors.push(`Process ${processIndex + 1} in group ${groupIndex + 1} must have a label`);
          }
        });
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to add parallel group to existing pattern
export function addParallelGroupToPattern(
  pattern: PatternConfig,
  group: ParallelGroup
): PatternConfig {
  // This would require rebuilding the entire pattern
  // For now, return the original pattern
  return pattern;
}

// Function to create simple parallel pattern
export function createSimpleParallelPattern(
  title: string,
  groups: { [groupName: string]: string[] },
  description?: string
): PatternConfig {
  const parallelGroups: ParallelGroup[] = Object.entries(groups).map(([groupName, processes]) => ({
    id: groupName.toLowerCase().replace(/\s+/g, '_'),
    label: groupName,
    processes: processes.map((process, index) => ({
      id: `${groupName.toLowerCase()}_${index + 1}`,
      label: process
    }))
  }));
  
  return createParallelProcessPattern({
    title,
    parallelGroups,
    description
  });
}
