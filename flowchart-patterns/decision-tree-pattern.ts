import { PatternConfig, FlowchartNode, FlowchartEdge, PatternExample } from './types.js';

/**
 * Decision Tree Pattern
 * A flowchart with multiple decision points leading to different paths.
 * Use Case: Processes with multiple outcomes (e.g., troubleshooting, customer support)
 * Structure: Start → Process Step → Decision (diamond) → Branches (Yes/No) → Different paths
 */

export interface DecisionPoint {
  id: string;
  question: string;
  branches: {
    condition: string;
    label: string;
    nextNodeId?: string;
    nextProcess?: string;
    nextDecision?: DecisionPoint;
  }[];
}

export interface DecisionTreeConfig {
  title: string;
  initialProcess?: string;
  decisions: DecisionPoint[];
  endProcesses: {
    id: string;
    label: string;
    description?: string;
  }[];
  description?: string;
}

export function createDecisionTreePattern(config: DecisionTreeConfig): PatternConfig {
  const { title, initialProcess, decisions, endProcesses, description } = config;
  
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
  
  // Add initial process if provided
  if (initialProcess) {
    const initialProcessId = 'initial_process';
    nodes.push({
      id: initialProcessId,
      type: 'process',
      label: initialProcess,
      x: 0,
      y: 100
    });
    edges.push({
      from: currentNodeId,
      to: initialProcessId,
      type: 'normal'
    });
    currentNodeId = initialProcessId;
  }
  
  // Process decisions recursively
  const processDecision = (decision: DecisionPoint, parentNodeId: string, level: number = 0): void => {
    const decisionId = decision.id;
    
    // Add decision node
    nodes.push({
      id: decisionId,
      type: 'decision',
      label: decision.question,
      x: level * 200,
      y: (level + 1) * 150
    });
    
    // Connect to parent
    edges.push({
      from: parentNodeId,
      to: decisionId,
      type: 'normal'
    });
    
    // Process each branch
    decision.branches.forEach((branch, index) => {
      if (branch.nextDecision) {
        // Recursive decision
        processDecision(branch.nextDecision, decisionId, level + 1);
      } else if (branch.nextProcess) {
        // Process node
        const processId = `process_${nodeCounter++}`;
        nodes.push({
          id: processId,
          type: 'process',
          label: branch.nextProcess,
          x: (level + 1) * 200 + (index * 100),
          y: (level + 2) * 150
        });
        
        edges.push({
          from: decisionId,
          to: processId,
          label: branch.label,
          type: 'normal',
          metadata: {
            condition: branch.condition
          }
        });
      } else if (branch.nextNodeId) {
        // Connect to existing node
        edges.push({
          from: decisionId,
          to: branch.nextNodeId,
          label: branch.label,
          type: 'normal',
          metadata: {
            condition: branch.condition
          }
        });
      }
    });
  };
  
  // Process all decisions
  decisions.forEach(decision => {
    processDecision(decision, currentNodeId);
  });
  
  // Add end processes
  endProcesses.forEach((endProcess, index) => {
    const endProcessId = endProcess.id;
    nodes.push({
      id: endProcessId,
      type: 'end',
      label: endProcess.label,
      x: (decisions.length + 1) * 200 + (index * 150),
      y: (decisions.length + 2) * 150
    });
  });
  
  return {
    id: `decision_tree_${Date.now()}`,
    title,
    description,
    nodes,
    edges,
    metadata: {
      category: 'decision',
      complexity: decisions.length > 2 ? 'complex' : 'medium',
      useCases: ['troubleshooting', 'customer support', 'diagnostic processes', 'decision making'],
      tags: ['decision', 'branching', 'conditional', 'troubleshooting']
    }
  };
}

export function getDecisionTreeExamples(): PatternExample[] {
  return [
    {
      name: 'Customer Support Troubleshooting',
      description: 'Decision tree for customer support troubleshooting',
      useCase: 'Customer service and technical support',
      complexity: 'medium',
      config: createDecisionTreePattern({
        title: 'Customer Support Troubleshooting',
        description: 'Decision tree for resolving customer issues',
        initialProcess: 'Customer reports issue',
        decisions: [
          {
            id: 'issue_type',
            question: 'What type of issue?',
            branches: [
              {
                condition: 'technical',
                label: 'Technical',
                nextDecision: {
                  id: 'technical_issue',
                  question: 'Is it a login problem?',
                  branches: [
                    {
                      condition: 'yes',
                      label: 'Yes',
                      nextProcess: 'Reset password and verify credentials'
                    },
                    {
                      condition: 'no',
                      label: 'No',
                      nextProcess: 'Escalate to technical team'
                    }
                  ]
                }
              },
              {
                condition: 'billing',
                label: 'Billing',
                nextProcess: 'Transfer to billing department'
              },
              {
                condition: 'general',
                label: 'General',
                nextProcess: 'Provide general assistance'
              }
            ]
          }
        ],
        endProcesses: [
          { id: 'resolved', label: 'Issue Resolved' },
          { id: 'escalated', label: 'Escalated to Specialist' }
        ]
      })
    },
    {
      name: 'Medical Diagnosis Flow',
      description: 'Simplified medical diagnosis decision tree',
      useCase: 'Healthcare and medical diagnosis',
      complexity: 'complex',
      config: createDecisionTreePattern({
        title: 'Medical Diagnosis Flow',
        description: 'Decision tree for initial medical assessment',
        initialProcess: 'Patient presents symptoms',
        decisions: [
          {
            id: 'symptom_severity',
            question: 'How severe are the symptoms?',
            branches: [
              {
                condition: 'mild',
                label: 'Mild',
                nextProcess: 'Schedule routine appointment'
              },
              {
                condition: 'moderate',
                label: 'Moderate',
                nextDecision: {
                  id: 'fever_present',
                  question: 'Is fever present?',
                  branches: [
                    {
                      condition: 'yes',
                      label: 'Yes',
                      nextProcess: 'Immediate assessment required'
                    },
                    {
                      condition: 'no',
                      label: 'No',
                      nextProcess: 'Schedule urgent appointment'
                    }
                  ]
                }
              },
              {
                condition: 'severe',
                label: 'Severe',
                nextProcess: 'Emergency treatment'
              }
            ]
          }
        ],
        endProcesses: [
          { id: 'routine_care', label: 'Routine Care' },
          { id: 'urgent_care', label: 'Urgent Care' },
          { id: 'emergency_care', label: 'Emergency Care' }
        ]
      })
    },
    {
      name: 'Product Return Process',
      description: 'Decision tree for product return processing',
      useCase: 'E-commerce and retail',
      complexity: 'medium',
      config: createDecisionTreePattern({
        title: 'Product Return Process',
        description: 'Decision tree for processing product returns',
        initialProcess: 'Customer requests return',
        decisions: [
          {
            id: 'return_reason',
            question: 'What is the return reason?',
            branches: [
              {
                condition: 'defective',
                label: 'Defective Product',
                nextProcess: 'Process warranty claim'
              },
              {
                condition: 'wrong_item',
                label: 'Wrong Item',
                nextDecision: {
                  id: 'within_window',
                  question: 'Within return window?',
                  branches: [
                    {
                      condition: 'yes',
                      label: 'Yes',
                      nextProcess: 'Process standard return'
                    },
                    {
                      condition: 'no',
                      label: 'No',
                      nextProcess: 'Review case by case'
                    }
                  ]
                }
              },
              {
                condition: 'change_mind',
                label: 'Changed Mind',
                nextDecision: {
                  id: 'return_window',
                  question: 'Within 30-day window?',
                  branches: [
                    {
                      condition: 'yes',
                      label: 'Yes',
                      nextProcess: 'Process return with restocking fee'
                    },
                    {
                      condition: 'no',
                      label: 'No',
                      nextProcess: 'Deny return request'
                    }
                  ]
                }
              }
            ]
          }
        ],
        endProcesses: [
          { id: 'return_approved', label: 'Return Approved' },
          { id: 'return_denied', label: 'Return Denied' },
          { id: 'warranty_claim', label: 'Warranty Claim Processed' }
        ]
      })
    }
  ];
}

export function createCustomDecisionTree(
  title: string,
  decisions: DecisionPoint[],
  options: {
    initialProcess?: string;
    endProcesses?: { id: string; label: string; description?: string }[];
    description?: string;
  } = {}
): PatternConfig {
  return createDecisionTreePattern({
    title,
    decisions,
    initialProcess: options.initialProcess,
    endProcesses: options.endProcesses || [{ id: 'end', label: 'End' }],
    description: options.description
  });
}

// Utility function to validate decision tree
export function validateDecisionTree(config: DecisionTreeConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.title || config.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!config.decisions || config.decisions.length === 0) {
    errors.push('At least one decision point is required');
  }
  
  if (config.decisions) {
    config.decisions.forEach((decision, index) => {
      if (!decision.id || decision.id.trim() === '') {
        errors.push(`Decision ${index + 1} must have an ID`);
      }
      if (!decision.question || decision.question.trim() === '') {
        errors.push(`Decision ${index + 1} must have a question`);
      }
      if (!decision.branches || decision.branches.length === 0) {
        errors.push(`Decision ${index + 1} must have at least one branch`);
      }
      decision.branches.forEach((branch, branchIndex) => {
        if (!branch.condition || branch.condition.trim() === '') {
          errors.push(`Decision ${index + 1}, Branch ${branchIndex + 1} must have a condition`);
        }
        if (!branch.label || branch.label.trim() === '') {
          errors.push(`Decision ${index + 1}, Branch ${branchIndex + 1} must have a label`);
        }
      });
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to add decision to existing tree
export function addDecisionToTree(
  pattern: PatternConfig,
  decision: DecisionPoint,
  parentNodeId: string
): PatternConfig {
  // This would require more complex logic to rebuild the entire tree
  // For now, return the original pattern
  return pattern;
}
