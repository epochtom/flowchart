import { PatternConfig } from '../types.js';
import { createLinearFlowPattern } from '../linear-flow-pattern.js';
import { createDecisionTreePattern } from '../decision-tree-pattern.js';
import { createLoopPattern } from '../loop-pattern.js';
import { createSwimlanePattern } from '../swimlane-pattern.js';
import { createHierarchicalPattern } from '../hierarchical-pattern.js';
import { createParallelProcessPattern } from '../parallel-process-pattern.js';
import { createFeedbackLoopPattern } from '../feedback-loop-pattern.js';
import { combinePatterns } from '../pattern-generator.js';

/**
 * Comprehensive Examples for Flowchart Patterns
 * This file contains detailed examples of each pattern type
 */

// Linear Flow Examples
export const linearFlowExamples = {
  simpleOnboarding: createLinearFlowPattern({
    title: 'Simple Employee Onboarding',
    description: 'Basic linear onboarding process',
    steps: [
      'Complete paperwork',
      'Attend orientation',
      'Meet with manager',
      'Set up workstation',
      'Begin training'
    ],
    startLabel: 'New Employee Arrives',
    endLabel: 'Onboarding Complete'
  }),

  orderProcessing: createLinearFlowPattern({
    title: 'Order Processing Workflow',
    description: 'Sequential order processing steps',
    steps: [
      'Receive order',
      'Validate payment',
      'Check inventory',
      'Prepare shipment',
      'Send confirmation'
    ],
    startLabel: 'Order Received',
    endLabel: 'Order Shipped'
  }),

  documentApproval: createLinearFlowPattern({
    title: 'Document Approval Process',
    description: 'Linear document approval workflow',
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
};

// Decision Tree Examples
export const decisionTreeExamples = {
  customerSupport: createDecisionTreePattern({
    title: 'Customer Support Troubleshooting',
    description: 'Decision tree for customer support',
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
  }),

  medicalDiagnosis: createDecisionTreePattern({
    title: 'Medical Diagnosis Flow',
    description: 'Simplified medical diagnosis decision tree',
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
};

// Loop Examples
export const loopExamples = {
  dataValidation: createLoopPattern({
    title: 'Data Validation Process',
    description: 'Iterative data validation with loop',
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
  }),

  qualityControl: createLoopPattern({
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
};

// Swimlane Examples
export const swimlaneExamples = {
  softwareDevelopment: createSwimlanePattern({
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
      { id: 'requirements', label: 'Gather requirements', laneId: 'product' },
      { id: 'wireframes', label: 'Create wireframes', laneId: 'design', dependencies: ['requirements'] },
      { id: 'mockups', label: 'Design mockups', laneId: 'design', dependencies: ['wireframes'] },
      { id: 'architecture', label: 'Design architecture', laneId: 'development', dependencies: ['requirements'] },
      { id: 'frontend', label: 'Develop frontend', laneId: 'development', dependencies: ['mockups', 'architecture'] },
      { id: 'backend', label: 'Develop backend', laneId: 'development', dependencies: ['architecture'] },
      { id: 'testing', label: 'Write tests', laneId: 'qa', dependencies: ['frontend', 'backend'] },
      { id: 'deployment', label: 'Deploy to staging', laneId: 'devops', dependencies: ['testing'] },
      { id: 'review', label: 'Code review', laneId: 'development', dependencies: ['deployment'] },
      { id: 'production', label: 'Deploy to production', laneId: 'devops', dependencies: ['review'] },
      { id: 'monitoring', label: 'Monitor application', laneId: 'devops', dependencies: ['production'] },
      { id: 'end', label: 'Project complete', laneId: 'product', dependencies: ['monitoring'] }
    ]
  }),

  customerOnboarding: createSwimlanePattern({
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
      { id: 'lead', label: 'Qualify lead', laneId: 'sales' },
      { id: 'contract', label: 'Sign contract', laneId: 'sales', dependencies: ['lead'] },
      { id: 'handoff', label: 'Handoff to account manager', laneId: 'account', dependencies: ['contract'] },
      { id: 'setup', label: 'Setup account', laneId: 'technical', dependencies: ['handoff'] },
      { id: 'training', label: 'Provide training', laneId: 'support', dependencies: ['setup'] },
      { id: 'go_live', label: 'Go live', laneId: 'account', dependencies: ['training'] },
      { id: 'followup', label: 'Follow up', laneId: 'account', dependencies: ['go_live'] },
      { id: 'end', label: 'Onboarding complete', laneId: 'support', dependencies: ['followup'] }
    ]
  })
};

// Hierarchical Examples
export const hierarchicalExamples = {
  softwareDevelopmentLifecycle: createHierarchicalPattern({
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
};

// Parallel Process Examples
export const parallelProcessExamples = {
  agileSprint: createParallelProcessPattern({
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
      }
    ],
    postJoinSteps: ['Integration Testing', 'Sprint Review', 'Sprint Retrospective'],
    joinLabel: 'Sprint Complete'
  }),

  productLaunch: createParallelProcessPattern({
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
};

// Feedback Loop Examples
export const feedbackLoopExamples = {
  agileSprint: createFeedbackLoopPattern({
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
  }),

  performanceReview: createFeedbackLoopPattern({
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
};

// Combined Pattern Examples
export const combinedPatternExamples = {
  complexWorkflow: combinePatterns({
    title: 'Complex Business Workflow',
    description: 'Combined pattern showing multiple workflow types',
    patterns: [
      {
        pattern: linearFlowExamples.simpleOnboarding,
        position: { x: 0, y: 0 }
      },
      {
        pattern: decisionTreeExamples.customerSupport,
        position: { x: 400, y: 0 }
      },
      {
        pattern: loopExamples.dataValidation,
        position: { x: 0, y: 400 }
      },
      {
        pattern: feedbackLoopExamples.performanceReview,
        position: { x: 400, y: 400 }
      }
    ],
    globalConnections: [
      {
        from: 'simpleOnboarding',
        to: 'customerSupport',
        fromPattern: 'linear',
        toPattern: 'decisionTree'
      },
      {
        from: 'dataValidation',
        to: 'performanceReview',
        fromPattern: 'loop',
        toPattern: 'feedback'
      }
    ]
  })
};

// Export all examples
export const allExamples = {
  linear: linearFlowExamples,
  decisionTree: decisionTreeExamples,
  loop: loopExamples,
  swimlane: swimlaneExamples,
  hierarchical: hierarchicalExamples,
  parallel: parallelProcessExamples,
  feedback: feedbackLoopExamples,
  combined: combinedPatternExamples
};

export default allExamples;
