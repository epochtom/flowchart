#!/usr/bin/env node

/**
 * Example demonstrating flowchart patterns with the MCP server
 * This shows how to use the patterns to create complex flowcharts
 */

import { 
  createLinearFlowPattern,
  createDecisionTreePattern,
  createSwimlanePattern,
  createParallelProcessPattern,
  combinePatterns
} from './flowchart-patterns/index.js';

// Example 1: Simple Linear Flow
console.log('Creating Linear Flow Pattern...');
const onboardingFlow = createLinearFlowPattern({
  title: 'Employee Onboarding Process',
  description: 'Step-by-step onboarding for new employees',
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

console.log(`✅ Linear Flow: ${onboardingFlow.nodes.length} nodes, ${onboardingFlow.edges.length} edges`);

// Example 2: Decision Tree for Customer Support
console.log('\nCreating Decision Tree Pattern...');
const supportFlow = createDecisionTreePattern({
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
});

console.log(`✅ Decision Tree: ${supportFlow.nodes.length} nodes, ${supportFlow.edges.length} edges`);

// Example 3: Swimlane for Software Development
console.log('\nCreating Swimlane Pattern...');
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
    { id: 'mockups', label: 'Design mockups', laneId: 'design', dependencies: ['wireframes'] },
    { id: 'frontend', label: 'Develop frontend', laneId: 'development', dependencies: ['mockups'] },
    { id: 'backend', label: 'Develop backend', laneId: 'development', dependencies: ['requirements'] },
    { id: 'testing', label: 'Test application', laneId: 'qa', dependencies: ['frontend', 'backend'] },
    { id: 'deployment', label: 'Deploy to staging', laneId: 'development', dependencies: ['testing'] }
  ]
});

console.log(`✅ Swimlane: ${developmentFlow.nodes.length} nodes, ${developmentFlow.edges.length} edges`);

// Example 4: Parallel Process for Agile Sprint
console.log('\nCreating Parallel Process Pattern...');
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
});

console.log(`✅ Parallel Process: ${agileSprint.nodes.length} nodes, ${agileSprint.edges.length} edges`);

// Example 5: Combined Pattern
console.log('\nCreating Combined Pattern...');
const complexWorkflow = combinePatterns({
  title: 'Complete Business Process',
  description: 'Combined workflow with multiple patterns',
  patterns: [
    { pattern: onboardingFlow, position: { x: 0, y: 0 } },
    { pattern: supportFlow, position: { x: 400, y: 0 } },
    { pattern: developmentFlow, position: { x: 0, y: 400 } },
    { pattern: agileSprint, position: { x: 400, y: 400 } }
  ],
  globalConnections: [
    {
      from: 'onboarding_end',
      to: 'support_start',
      fromPattern: 'onboarding',
      toPattern: 'support'
    },
    {
      from: 'development_end',
      to: 'agile_start',
      fromPattern: 'development',
      toPattern: 'agile'
    }
  ]
});

console.log(`✅ Combined Pattern: ${complexWorkflow.nodes.length} nodes, ${complexWorkflow.edges.length} edges`);

// Display pattern information
console.log('\n📊 Pattern Summary:');
console.log(`   Linear Flow: ${onboardingFlow.metadata?.complexity || 'unknown'} complexity`);
console.log(`   Decision Tree: ${supportFlow.metadata?.complexity || 'unknown'} complexity`);
console.log(`   Swimlane: ${developmentFlow.metadata?.complexity || 'unknown'} complexity`);
console.log(`   Parallel Process: ${agileSprint.metadata?.complexity || 'unknown'} complexity`);
console.log(`   Combined: ${complexWorkflow.metadata?.complexity || 'unknown'} complexity`);

console.log('\n🎯 Use Cases:');
console.log(`   Linear Flow: ${onboardingFlow.metadata?.useCases?.join(', ') || 'N/A'}`);
console.log(`   Decision Tree: ${supportFlow.metadata?.useCases?.join(', ') || 'N/A'}`);
console.log(`   Swimlane: ${developmentFlow.metadata?.useCases?.join(', ') || 'N/A'}`);
console.log(`   Parallel Process: ${agileSprint.metadata?.useCases?.join(', ') || 'N/A'}`);

console.log('\n✨ All patterns created successfully!');
console.log('\n📖 Next steps:');
console.log('   1. Use these patterns with the MCP server to generate flowcharts');
console.log('   2. Export to SVG, Draw.io, or Mermaid format');
console.log('   3. Customize patterns for your specific use cases');
console.log('   4. Combine patterns to create complex workflows');

// Example of how to use with MCP server (commented out as it requires the server to be running)
/*
console.log('\n🔧 To use with MCP server:');
console.log('   const { create_flowchart } = await mcpClient.callTool("create_flowchart", {');
console.log('     flowchart: onboardingFlow,');
console.log('     format: "svg"');
console.log('   });');
*/
