# Flowchart Patterns Usage Guide

This guide provides detailed instructions on how to use the flowchart patterns library to create complex workflows.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Pattern Types](#pattern-types)
3. [Creating Patterns](#creating-patterns)
4. [Combining Patterns](#combining-patterns)
5. [Advanced Features](#advanced-features)
6. [Examples](#examples)
7. [Best Practices](#best-practices)

## Getting Started

### Installation

The flowchart patterns are included in the MCP Flowchart Server. No additional installation is required.

### Basic Import

```typescript
import { 
  createLinearFlowPattern,
  createDecisionTreePattern,
  combinePatterns,
  patternLibrary
} from './flowchart-patterns';
```

## Pattern Types

### 1. Linear Flow Pattern

**Use Case**: Simple, sequential processes with no branches or loops.

```typescript
import { createLinearFlowPattern } from './flowchart-patterns';

const onboardingFlow = createLinearFlowPattern({
  title: 'Employee Onboarding',
  description: 'Step-by-step onboarding process',
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
```

**Key Features**:
- Sequential steps with no branching
- Clear start and end points
- Perfect for simple processes

### 2. Decision Tree Pattern

**Use Case**: Processes with multiple decision points and outcomes.

```typescript
import { createDecisionTreePattern } from './flowchart-patterns';

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
        }
      ]
    }
  ],
  endProcesses: [
    { id: 'resolved', label: 'Issue Resolved' },
    { id: 'escalated', label: 'Escalated to Specialist' }
  ]
});
```

**Key Features**:
- Multiple decision points
- Nested decision trees
- Clear branching logic
- Multiple end points

### 3. Loop Pattern

**Use Case**: Iterative processes that repeat until a condition is met.

```typescript
import { createLoopPattern } from './flowchart-patterns';

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
```

**Key Features**:
- Pre-loop and post-loop steps
- Configurable loop condition
- Maximum iteration limits
- Clear loop visualization

### 4. Swimlane Pattern

**Use Case**: Processes involving multiple roles or departments.

```typescript
import { createSwimlanePattern } from './flowchart-patterns';

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
    { id: 'testing', label: 'Write tests', laneId: 'qa', dependencies: ['frontend'] }
  ]
});
```

**Key Features**:
- Role-based organization
- Cross-lane dependencies
- Horizontal or vertical orientation
- Clear responsibility mapping

### 5. Hierarchical Pattern

**Use Case**: Complex processes with detailed subprocesses.

```typescript
import { createHierarchicalPattern } from './flowchart-patterns';

const softwareLifecycle = createHierarchicalPattern({
  title: 'Software Development Lifecycle',
  description: 'High-level process with detailed subprocesses',
  mainProcess: {
    steps: [
      { id: 'start', type: 'start', label: 'Project Start' },
      { id: 'planning', type: 'process', label: 'Project Planning' },
      { id: 'development', subprocessId: 'dev_process', label: 'Development Process' },
      { id: 'testing', subprocessId: 'test_process', label: 'Testing Process' },
      { id: 'deployment', subprocessId: 'deploy_process', label: 'Deployment Process' },
      { id: 'end', type: 'end', label: 'Project End' }
    ],
    edges: [
      { from: 'start', to: 'planning' },
      { from: 'planning', to: 'development' },
      { from: 'development', to: 'testing' },
      { from: 'testing', to: 'deployment' },
      { from: 'deployment', to: 'end' }
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
        { id: 'review', type: 'process', label: 'Code Review' },
        { id: 'dev_end', type: 'end', label: 'Development Complete' }
      ],
      edges: [
        { from: 'dev_start', to: 'design' },
        { from: 'design', to: 'code' },
        { from: 'code', to: 'review' },
        { from: 'review', to: 'dev_end' }
      ]
    }
    // ... more subprocesses
  },
  connectors: [
    { from: 'development', to: 'testing', subprocessId: 'dev_process' },
    { from: 'testing', to: 'deployment', subprocessId: 'test_process' }
  ]
});
```

**Key Features**:
- Main process with subprocess references
- Detailed subprocess definitions
- Connector management
- Modular design

### 6. Parallel Process Pattern

**Use Case**: Multiple processes running simultaneously.

```typescript
import { createParallelProcessPattern } from './flowchart-patterns';

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
```

**Key Features**:
- Fork and join points
- Parallel group management
- Group-specific dependencies
- Synchronization points

### 7. Feedback Loop Pattern

**Use Case**: Continuous improvement and iterative processes.

```typescript
import { createFeedbackLoopPattern } from './flowchart-patterns';

const agileSprint = createFeedbackLoopPattern({
  title: 'Agile Development Sprint',
  description: 'Iterative development with feedback loops',
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
});
```

**Key Features**:
- Feedback loop visualization
- Improvement path handling
- Iteration limits
- Evaluation points

## Combining Patterns

You can combine multiple patterns to create complex workflows:

```typescript
import { combinePatterns } from './flowchart-patterns';

const complexWorkflow = combinePatterns({
  title: 'Complete Business Process',
  description: 'Combined workflow with multiple patterns',
  patterns: [
    {
      pattern: onboardingFlow,
      position: { x: 0, y: 0 }
    },
    {
      pattern: supportFlow,
      position: { x: 400, y: 0 }
    },
    {
      pattern: dataValidationFlow,
      position: { x: 0, y: 400 }
    }
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
```

## Advanced Features

### Pattern Library Access

```typescript
import { patternLibrary, getAllPatternExamples, searchPatterns } from './flowchart-patterns';

// Get all available examples
const allExamples = getAllPatternExamples();

// Search for specific patterns
const searchResults = searchPatterns('customer support');

// Get patterns by complexity
const simplePatterns = getPatternsByComplexity('simple');

// Get patterns by use case
const hrPatterns = getPatternsByUseCase('human resources');
```

### Pattern Validation

```typescript
import { validatePattern } from './flowchart-patterns';

const validation = validatePattern(myPattern);
if (!validation.isValid) {
  console.error('Pattern validation errors:', validation.errors);
}
```

### Pattern Statistics

```typescript
import { getPatternStatistics } from './flowchart-patterns';

const stats = getPatternStatistics();
console.log('Total patterns:', stats.totalPatterns);
console.log('Patterns by type:', stats.patternsByType);
console.log('Patterns by complexity:', stats.patternsByComplexity);
```

## Examples

### Example 1: Complete Onboarding Process

```typescript
import { 
  createLinearFlowPattern, 
  createDecisionTreePattern, 
  combinePatterns 
} from './flowchart-patterns';

// Create onboarding flow
const onboarding = createLinearFlowPattern({
  title: 'Employee Onboarding',
  steps: [
    'Complete paperwork',
    'Attend orientation',
    'Meet with manager',
    'Set up workstation',
    'Begin training'
  ]
});

// Create training decision tree
const training = createDecisionTreePattern({
  title: 'Training Process',
  initialProcess: 'Start training',
  decisions: [
    {
      id: 'training_type',
      question: 'What type of training?',
      branches: [
        {
          condition: 'technical',
          label: 'Technical',
          nextProcess: 'Technical training program'
        },
        {
          condition: 'soft_skills',
          label: 'Soft Skills',
          nextProcess: 'Soft skills training'
        }
      ]
    }
  ],
  endProcesses: [
    { id: 'training_complete', label: 'Training Complete' }
  ]
});

// Combine patterns
const completeOnboarding = combinePatterns({
  title: 'Complete Onboarding Process',
  patterns: [
    { pattern: onboarding, position: { x: 0, y: 0 } },
    { pattern: training, position: { x: 0, y: 300 } }
  ],
  globalConnections: [
    {
      from: 'onboarding_end',
      to: 'training_start',
      fromPattern: 'onboarding',
      toPattern: 'training'
    }
  ]
});
```

### Example 2: Software Development Workflow

```typescript
import { 
  createSwimlanePattern, 
  createParallelProcessPattern, 
  createFeedbackLoopPattern 
} from './flowchart-patterns';

// Create development swimlane
const development = createSwimlanePattern({
  title: 'Development Process',
  orientation: 'horizontal',
  lanes: [
    { id: 'product', label: 'Product Manager', type: 'horizontal' },
    { id: 'design', label: 'Designer', type: 'horizontal' },
    { id: 'dev', label: 'Developer', type: 'horizontal' },
    { id: 'qa', label: 'QA Engineer', type: 'horizontal' }
  ],
  steps: [
    { id: 'requirements', label: 'Gather requirements', laneId: 'product' },
    { id: 'wireframes', label: 'Create wireframes', laneId: 'design', dependencies: ['requirements'] },
    { id: 'frontend', label: 'Develop frontend', laneId: 'dev', dependencies: ['wireframes'] },
    { id: 'testing', label: 'Test application', laneId: 'qa', dependencies: ['frontend'] }
  ]
});

// Create parallel testing process
const testing = createParallelProcessPattern({
  title: 'Testing Process',
  parallelGroups: [
    {
      id: 'unit_tests',
      label: 'Unit Testing',
      processes: [
        { id: 'write_tests', label: 'Write unit tests', type: 'process' },
        { id: 'run_tests', label: 'Run unit tests', type: 'process', dependencies: ['write_tests'] }
      ]
    },
    {
      id: 'integration_tests',
      label: 'Integration Testing',
      processes: [
        { id: 'setup_env', label: 'Setup test environment', type: 'process' },
        { id: 'run_integration', label: 'Run integration tests', type: 'process', dependencies: ['setup_env'] }
      ]
    }
  ]
});

// Create feedback loop for iterations
const iterations = createFeedbackLoopPattern({
  title: 'Development Iterations',
  feedbackSteps: [
    { id: 'develop', label: 'Develop feature', type: 'process' },
    { id: 'test', label: 'Test feature', type: 'process' },
    { id: 'review', label: 'Code review', type: 'evaluation' }
  ],
  evaluation: {
    question: 'Is feature ready?',
    continueLabel: 'No, continue development',
    exitLabel: 'Yes, feature complete'
  }
});
```

## Best Practices

### 1. Choose the Right Pattern

- **Linear Flow**: Use for simple, sequential processes
- **Decision Tree**: Use for processes with multiple decision points
- **Loop**: Use for iterative processes
- **Swimlane**: Use for multi-role processes
- **Hierarchical**: Use for complex processes with subprocesses
- **Parallel**: Use for concurrent processes
- **Feedback Loop**: Use for continuous improvement processes

### 2. Keep Patterns Focused

- Each pattern should have a single, clear purpose
- Avoid mixing too many concepts in one pattern
- Use hierarchical patterns for complex processes

### 3. Use Descriptive Labels

- Use clear, action-oriented labels for steps
- Include context in decision questions
- Make edge labels meaningful

### 4. Consider Your Audience

- Use swimlanes when showing role responsibilities
- Use hierarchical patterns for technical audiences
- Use linear patterns for simple explanations

### 5. Test and Validate

- Always validate patterns before using
- Test with real data and scenarios
- Get feedback from stakeholders

### 6. Document Your Patterns

- Include descriptions and use cases
- Document assumptions and constraints
- Keep examples up to date

## Troubleshooting

### Common Issues

1. **Pattern validation errors**: Check that all required fields are provided
2. **Layout issues**: Ensure proper positioning and spacing
3. **Connection problems**: Verify that node IDs match in edges
4. **Complexity issues**: Break down complex patterns into smaller ones

### Getting Help

- Check the pattern examples for reference
- Use the validation functions to identify issues
- Review the pattern library documentation
- Test with simple patterns first

## Conclusion

The flowchart patterns library provides a powerful way to create complex workflows. By understanding the different pattern types and their use cases, you can create effective visualizations for any business process. Remember to start simple and build complexity gradually, always keeping your audience in mind.