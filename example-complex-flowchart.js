#!/usr/bin/env node

/**
 * Example demonstrating improved Draw.io generation for complex flowcharts
 * This shows how the new routing algorithm handles loops and overlapping arrows
 */

import { createLoopPattern, createDecisionTreePattern, combinePatterns } from './flowchart-patterns/index.js';

// Create a complex flowchart that would typically have overlapping arrows
console.log('Creating complex flowchart with loops and decisions...');

// Example 1: Complex Loop Pattern (similar to the prime number algorithm)
const primeNumberFlow = createLoopPattern({
  title: 'Prime Number Processing Algorithm',
  description: 'Complex algorithm with nested loops and decisions',
  preLoopSteps: [
    'Initialize variables: rangeStart, rangeEnd, maxPrimes',
    'Define isPrime function',
    'Create empty primeArray'
  ],
  loopSteps: [
    { id: 'for_init', label: 'FOR Loop: Set num = rangeStart', type: 'process' },
    { id: 'for_condition', label: 'FOR Condition: num <= rangeEnd?', type: 'decision' },
    { id: 'check_prime', label: 'Is num prime? (Call isPrime function)', type: 'decision' },
    { id: 'check_array_length', label: 'Is length of primeArray < maxPrimes?', type: 'decision' },
    { id: 'append_prime', label: 'Append num to primeArray', type: 'process' },
    { id: 'increment_num', label: 'FOR Increment: Increment num by 1', type: 'process' }
  ],
  loopCondition: {
    question: 'Continue FOR loop?',
    continueLabel: 'Yes, next iteration',
    exitLabel: 'No, exit FOR loop'
  },
  postLoopSteps: [
    'Sort primeArray using Bubble Sort',
    'Initialize sumOfPrimes = 0',
    'Set index = 0 for WHILE loop'
  ],
  maxIterations: 1000
});

console.log(`✅ Complex Loop Pattern: ${primeNumberFlow.nodes.length} nodes, ${primeNumberFlow.edges.length} edges`);

// Example 2: Nested Decision Tree
const nestedDecisionFlow = createDecisionTreePattern({
  title: 'Complex Decision Tree with Nested Logic',
  description: 'Multi-level decision tree that would cause arrow overlaps',
  initialProcess: 'Start complex analysis',
  decisions: [
    {
      id: 'main_decision',
      question: 'What is the main category?',
      branches: [
        {
          condition: 'technical',
          label: 'Technical',
          nextDecision: {
            id: 'tech_sub_decision',
            question: 'What type of technical issue?',
            branches: [
              {
                condition: 'hardware',
                label: 'Hardware',
                nextDecision: {
                  id: 'hardware_detail',
                  question: 'Is it a critical hardware failure?',
                  branches: [
                    {
                      condition: 'yes',
                      label: 'Yes',
                      nextProcess: 'Immediate hardware replacement'
                    },
                    {
                      condition: 'no',
                      label: 'No',
                      nextProcess: 'Schedule maintenance'
                    }
                  ]
                }
              },
              {
                condition: 'software',
                label: 'Software',
                nextDecision: {
                  id: 'software_detail',
                  question: 'Is it a bug or feature request?',
                  branches: [
                    {
                      condition: 'bug',
                      label: 'Bug',
                      nextProcess: 'Create bug report and assign to dev team'
                    },
                    {
                      condition: 'feature',
                      label: 'Feature',
                      nextProcess: 'Add to product backlog'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          condition: 'business',
          label: 'Business',
          nextDecision: {
            id: 'business_sub_decision',
            question: 'What type of business issue?',
            branches: [
              {
                condition: 'financial',
                label: 'Financial',
                nextProcess: 'Escalate to finance department'
              },
              {
                condition: 'operational',
                label: 'Operational',
                nextProcess: 'Review operational procedures'
              }
            ]
          }
        }
      ]
    }
  ],
  endProcesses: [
    { id: 'resolved', label: 'Issue Resolved' },
    { id: 'escalated', label: 'Escalated to Specialist' },
    { id: 'pending', label: 'Pending Further Review' }
  ]
});

console.log(`✅ Nested Decision Tree: ${nestedDecisionFlow.nodes.length} nodes, ${nestedDecisionFlow.edges.length} edges`);

// Example 3: Combined Complex Pattern
const complexWorkflow = combinePatterns({
  title: 'Complex Business Process with Loops and Decisions',
  description: 'Combined workflow that would typically have many overlapping arrows',
  patterns: [
    { pattern: primeNumberFlow, position: { x: 0, y: 0 } },
    { pattern: nestedDecisionFlow, position: { x: 600, y: 0 } }
  ],
  globalConnections: [
    {
      from: 'primeNumberFlow_end',
      to: 'nestedDecisionFlow_start',
      fromPattern: 'primeNumberFlow',
      toPattern: 'nestedDecisionFlow'
    }
  ]
});

console.log(`✅ Combined Complex Pattern: ${complexWorkflow.nodes.length} nodes, ${complexWorkflow.edges.length} edges`);

// Display the improvements
console.log('\n🔧 Improvements for Draw.io Generation:');
console.log('   ✅ Enhanced edge routing algorithm');
console.log('   ✅ Better loop detection and spacing');
console.log('   ✅ Orthogonal routing for complex paths');
console.log('   ✅ Curved paths for loops and feedback');
console.log('   ✅ Increased node spacing to prevent overlaps');
console.log('   ✅ Smart arrow positioning based on edge types');

console.log('\n📊 Pattern Analysis:');
console.log(`   Loop Pattern Complexity: ${primeNumberFlow.metadata?.complexity || 'unknown'}`);
console.log(`   Decision Tree Complexity: ${nestedDecisionFlow.metadata?.complexity || 'unknown'}`);
console.log(`   Combined Pattern Complexity: ${complexWorkflow.metadata?.complexity || 'unknown'}`);

console.log('\n🎯 Key Features to Prevent Arrow Overlaps:');
console.log('   1. Orthogonal routing for L-shaped paths');
console.log('   2. Curved routing for loops and feedback');
console.log('   3. Increased spacing between nodes');
console.log('   4. Smart detection of loop patterns');
console.log('   5. Automatic node repositioning for clearance');
console.log('   6. Different arrow styles for different edge types');

console.log('\n✨ The improved Draw.io generation should now:');
console.log('   - Avoid overlapping arrows');
console.log('   - Provide clear visual separation');
console.log('   - Use appropriate routing for different edge types');
console.log('   - Maintain readability in complex flowcharts');
console.log('   - Handle nested loops and decisions gracefully');

console.log('\n📖 To test the improvements:');
console.log('   1. Use the MCP server to generate Draw.io format');
console.log('   2. Open the generated .drawio file in draw.io');
console.log('   3. Verify that arrows no longer overlap symbols');
console.log('   4. Check that loops are clearly visible and well-spaced');
