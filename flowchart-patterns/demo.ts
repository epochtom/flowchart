#!/usr/bin/env tsx

/**
 * Flowchart Patterns Demo
 * This file demonstrates how to use the flowchart patterns library
 */

import { 
  createLinearFlowPattern,
  createDecisionTreePattern,
  createLoopPattern,
  createSwimlanePattern,
  createHierarchicalPattern,
  createParallelProcessPattern,
  createFeedbackLoopPattern,
  combinePatterns,
  getAllPatternExamples,
  searchPatterns,
  getPatternsByComplexity,
  patternLibrary
} from './index.js';

// Demo function to showcase all patterns
export function runPatternDemo() {
  console.log('🎯 Flowchart Patterns Demo\n');
  
  // 1. Linear Flow Pattern Demo
  console.log('1️⃣ Linear Flow Pattern');
  const onboardingFlow = createLinearFlowPattern({
    title: 'Employee Onboarding',
    description: 'Simple linear onboarding process',
    steps: [
      'Complete paperwork',
      'Attend orientation',
      'Meet with manager',
      'Set up workstation',
      'Begin training'
    ],
    startLabel: 'New Employee Arrives',
    endLabel: 'Onboarding Complete'
  });
  console.log(`✅ Created linear flow with ${onboardingFlow.nodes.length} nodes and ${onboardingFlow.edges.length} edges\n`);
  
  // 2. Decision Tree Pattern Demo
  console.log('2️⃣ Decision Tree Pattern');
  const supportFlow = createDecisionTreePattern({
    title: 'Customer Support',
    description: 'Customer support troubleshooting flow',
    initialProcess: 'Customer reports issue',
    decisions: [
      {
        id: 'issue_type',
        question: 'What type of issue?',
        branches: [
          {
            condition: 'technical',
            label: 'Technical',
            nextProcess: 'Escalate to technical team'
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
  });
  console.log(`✅ Created decision tree with ${supportFlow.nodes.length} nodes and ${supportFlow.edges.length} edges\n`);
  
  // 3. Loop Pattern Demo
  console.log('3️⃣ Loop Pattern');
  const dataValidationFlow = createLoopPattern({
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
  });
  console.log(`✅ Created loop pattern with ${dataValidationFlow.nodes.length} nodes and ${dataValidationFlow.edges.length} edges\n`);
  
  // 4. Swimlane Pattern Demo
  console.log('4️⃣ Swimlane Pattern');
  const developmentFlow = createSwimlanePattern({
    title: 'Software Development Workflow',
    description: 'Cross-functional development process',
    orientation: 'horizontal',
    lanes: [
      { id: 'product', label: 'Product Manager', type: 'horizontal' },
      { id: 'design', label: 'Designer', type: 'horizontal' },
      { id: 'development', label: 'Developer', type: 'horizontal' },
      { id: 'qa', label: 'QA Engineer', type: 'horizontal' }
    ],
    steps: [
      { id: 'requirements', label: 'Gather requirements', laneId: 'product' },
      { id: 'wireframes', label: 'Create wireframes', laneId: 'design', dependencies: ['requirements'] },
      { id: 'frontend', label: 'Develop frontend', laneId: 'development', dependencies: ['wireframes'] },
      { id: 'testing', label: 'Test application', laneId: 'qa', dependencies: ['frontend'] }
    ]
  });
  console.log(`✅ Created swimlane pattern with ${developmentFlow.nodes.length} nodes and ${developmentFlow.edges.length} edges\n`);
  
  // 5. Hierarchical Pattern Demo
  console.log('5️⃣ Hierarchical Pattern');
  const softwareLifecycle = createHierarchicalPattern({
    title: 'Software Development Lifecycle',
    description: 'High-level process with detailed subprocesses',
    mainProcess: {
      steps: [
        { id: 'start', type: 'start', label: 'Project Start' },
        { id: 'planning', type: 'process', label: 'Project Planning' },
        { id: 'development', subprocessId: 'dev_process', label: 'Development Process' },
        { id: 'testing', subprocessId: 'test_process', label: 'Testing Process' },
        { id: 'end', type: 'end', label: 'Project End' }
      ],
      edges: [
        { from: 'start', to: 'planning' },
        { from: 'planning', to: 'development' },
        { from: 'development', to: 'testing' },
        { from: 'testing', to: 'end' }
      ]
    },
    subprocesses: {
      'dev_process': {
        title: 'Development Process',
        description: 'Detailed development workflow',
        steps: [
          { id: 'dev_start', type: 'start', label: 'Start Development' },
          { id: 'design', type: 'process', label: 'System Design' },
          { id: 'code', type: 'process', label: 'Write Code' },
          { id: 'dev_end', type: 'end', label: 'Development Complete' }
        ],
        edges: [
          { from: 'dev_start', to: 'design' },
          { from: 'design', to: 'code' },
          { from: 'code', to: 'dev_end' }
        ]
      },
      'test_process': {
        title: 'Testing Process',
        description: 'Comprehensive testing workflow',
        steps: [
          { id: 'test_start', type: 'start', label: 'Start Testing' },
          { id: 'unit_test', type: 'process', label: 'Unit Testing' },
          { id: 'integration_test', type: 'process', label: 'Integration Testing' },
          { id: 'test_end', type: 'end', label: 'Testing Complete' }
        ],
        edges: [
          { from: 'test_start', to: 'unit_test' },
          { from: 'unit_test', to: 'integration_test' },
          { from: 'integration_test', to: 'test_end' }
        ]
      }
    },
    connectors: [
      { from: 'development', to: 'testing', subprocessId: 'dev_process' },
      { from: 'testing', to: 'end', subprocessId: 'test_process' }
    ]
  });
  console.log(`✅ Created hierarchical pattern with ${softwareLifecycle.nodes.length} nodes and ${softwareLifecycle.edges.length} edges\n`);
  
  // 6. Parallel Process Pattern Demo
  console.log('6️⃣ Parallel Process Pattern');
  const agileSprint = createParallelProcessPattern({
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
      }
    ],
    postJoinSteps: ['Integration Testing', 'Sprint Review'],
    joinLabel: 'Sprint Complete'
  });
  console.log(`✅ Created parallel process pattern with ${agileSprint.nodes.length} nodes and ${agileSprint.edges.length} edges\n`);
  
  // 7. Feedback Loop Pattern Demo
  console.log('7️⃣ Feedback Loop Pattern');
  const performanceReview = createFeedbackLoopPattern({
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
  });
  console.log(`✅ Created feedback loop pattern with ${performanceReview.nodes.length} nodes and ${performanceReview.edges.length} edges\n`);
  
  // 8. Combined Pattern Demo
  console.log('8️⃣ Combined Pattern');
  const complexWorkflow = combinePatterns({
    title: 'Complete Business Process',
    description: 'Combined workflow with multiple patterns',
    patterns: [
      { pattern: onboardingFlow, position: { x: 0, y: 0 } },
      { pattern: supportFlow, position: { x: 400, y: 0 } },
      { pattern: dataValidationFlow, position: { x: 0, y: 400 } }
    ],
    globalConnections: [
      {
        from: 'onboarding_end',
        to: 'support_start',
        fromPattern: 'onboarding',
        toPattern: 'support'
      }
    ]
  });
  console.log(`✅ Created combined pattern with ${complexWorkflow.nodes.length} nodes and ${complexWorkflow.edges.length} edges\n`);
  
  // 9. Pattern Library Demo
  console.log('9️⃣ Pattern Library Features');
  const allExamples = getAllPatternExamples();
  console.log(`📚 Total pattern examples available: ${Object.values(allExamples).flat().length}`);
  
  const searchResults = searchPatterns('customer');
  console.log(`🔍 Patterns matching 'customer': ${Object.values(searchResults).flat().length}`);
  
  const simplePatterns = getPatternsByComplexity('simple');
  console.log(`📊 Simple patterns available: ${Object.values(simplePatterns).flat().length}`);
  
  console.log('\n🎉 Demo completed successfully!');
  console.log('\n📖 For more information, see:');
  console.log('   - README.md: Overview and basic usage');
  console.log('   - USAGE.md: Detailed usage guide');
  console.log('   - flowchart-patterns/: Complete pattern library');
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPatternDemo();
}
