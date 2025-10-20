# MCP Flowchart Server

An MCP (Model Context Protocol) server that allows LLMs to create flowcharts and output them in multiple formats (SVG, Draw.io, Mermaid). Now includes comprehensive flowchart patterns for complex workflows.

## Features

- Create flowcharts with different node types: start, process, decision, end, math, loop, input, output, subprocess, fork, join
- Automatic layout positioning with intelligent spacing
- Multiple output formats: SVG, Draw.io, Mermaid
- Support for custom node positions and dimensions
- Edge labels and connections with different types (normal, loop, feedback, connector, parallel, subprocess)
- **Comprehensive Flowchart Patterns Library**:
  - Linear Flow Pattern
  - Decision Tree Pattern
  - Loop Pattern
  - Swimlane Pattern
  - Hierarchical (Subprocess) Pattern
  - Parallel Process Pattern
  - Feedback Loop Pattern

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

Or for development:
```bash
npm run dev
```

### Available Tools

#### create_flowchart

Creates a flowchart and returns it as SVG.

**Parameters:**
- `flowchart` (object): The flowchart definition
  - `title` (string, optional): Title for the flowchart
  - `nodes` (array): Array of flowchart nodes
    - `id` (string): Unique identifier
    - `type` (string): Node type - "start", "process", "decision", or "end"
    - `label` (string): Text label for the node
    - `x` (number, optional): X position (auto-layout if not provided)
    - `y` (number, optional): Y position (auto-layout if not provided)
  - `edges` (array): Array of connections between nodes
    - `from` (string): Source node ID
    - `to` (string): Target node ID
    - `label` (string, optional): Edge label

## Flowchart Patterns

The server now includes a comprehensive library of flowchart patterns that can help structure complex workflows effectively. Each pattern addresses specific types of processes and can be combined to create complete workflows.

### Available Patterns

#### 1. Linear Flow Pattern
A straightforward, sequential process with no branches or loops.
- **Use Case**: Simple processes with a clear start-to-end path (e.g., basic onboarding)
- **Structure**: Start (oval) → Process Step 1 (rectangle) → Process Step 2 (rectangle) → ... → End (oval)

#### 2. Decision Tree Pattern
A flowchart with multiple decision points leading to different paths.
- **Use Case**: Processes with multiple outcomes (e.g., troubleshooting, customer support)
- **Structure**: Start → Process Step → Decision (diamond) → Branches (Yes/No) → Different paths

#### 3. Loop Pattern
A process that repeats steps until a condition is met.
- **Use Case**: Iterative processes (e.g., quality checks, data validation)
- **Structure**: Start → Process Step → Decision (Continue?) → Loop back or proceed

#### 4. Swimlane Pattern
Divides the flowchart into lanes to show responsibilities across roles or departments.
- **Use Case**: Processes involving multiple stakeholders (e.g., project workflows, cross-department tasks)
- **Structure**: Vertical or horizontal lanes labeled by role/department

#### 5. Hierarchical (Subprocess) Pattern
A high-level flowchart with links to detailed sub-flowcharts for complex steps.
- **Use Case**: Large processes with detailed subsections (e.g., software development, manufacturing)
- **Structure**: Main flowchart with subprocess symbols linked to detailed sub-flowcharts

#### 6. Parallel Process Pattern
Multiple processes or tasks occurring simultaneously.
- **Use Case**: Multitasking workflows (e.g., concurrent project tasks, system integrations)
- **Structure**: Start → Fork (split into multiple paths) → Parallel processes → Join point → End

#### 7. Feedback Loop Pattern
A process that cycles back based on feedback or evaluation.
- **Use Case**: Continuous improvement processes (e.g., agile development, performance reviews)
- **Structure**: Start → Process → Evaluation → Loop back to revise or proceed to end

## Usage

### Basic Flowchart Creation

Here's an example of how to use the server:

```json
{
  "tool": "create_flowchart",
  "arguments": {
    "flowchart": {
      "title": "Simple Process Flow",
      "nodes": [
        {
          "id": "start",
          "type": "start",
          "label": "Start"
        },
        {
          "id": "process1",
          "type": "process",
          "label": "Do Something"
        },
        {
          "id": "decision",
          "type": "decision",
          "label": "Is it OK?"
        },
        {
          "id": "end",
          "type": "end",
          "label": "End"
        }
      ],
      "edges": [
        {
          "from": "start",
          "to": "process1"
        },
        {
          "from": "process1",
          "to": "decision"
        },
        {
          "from": "decision",
          "to": "end",
          "label": "Yes"
        }
      ]
    }
  }
}
```

### Using Flowchart Patterns

You can use the pattern library to create complex workflows:

```typescript
import { createLinearFlowPattern, createDecisionTreePattern, combinePatterns } from './flowchart-patterns';

// Create a linear flow pattern
const onboardingFlow = createLinearFlowPattern({
  title: 'Employee Onboarding',
  steps: [
    'Complete paperwork',
    'Attend orientation',
    'Meet with manager',
    'Set up workstation',
    'Begin training'
  ]
});

// Create a decision tree pattern
const supportFlow = createDecisionTreePattern({
  title: 'Customer Support',
  initialProcess: 'Customer reports issue',
  decisions: [/* decision configuration */],
  endProcesses: [/* end processes */]
});

// Combine patterns
const combinedWorkflow = combinePatterns({
  title: 'Complete Business Process',
  patterns: [
    { pattern: onboardingFlow, position: { x: 0, y: 0 } },
    { pattern: supportFlow, position: { x: 400, y: 0 } }
  ]
});
```

## Node Types

- **start**: Elliptical shape, typically the beginning of a process
- **process**: Rectangular shape, represents a process or action
- **decision**: Diamond shape, represents a decision point
- **end**: Elliptical shape, typically the end of a process
- **math**: Rectangular shape with special styling for mathematical content
- **loop**: Rounded rectangle for loop indicators
- **input**: Parallelogram for input operations
- **output**: Parallelogram for output operations
- **subprocess**: Double-lined rectangle for subprocess references
- **fork**: Special symbol for parallel process splitting
- **join**: Special symbol for parallel process joining

## Edge Types

- **normal**: Standard arrow for normal flow
- **loop**: Curved arrow for loop back connections
- **feedback**: Curved arrow for feedback loops
- **connector**: Dashed arrow for long-distance connections
- **parallel**: Special arrow for parallel process connections
- **subprocess**: Connector arrow for subprocess references

## Pattern Library Usage

The pattern library provides several utility functions:

- `createLinearFlowPattern()`: Create linear flow patterns
- `createDecisionTreePattern()`: Create decision tree patterns
- `createLoopPattern()`: Create loop patterns
- `createSwimlanePattern()`: Create swimlane patterns
- `createHierarchicalPattern()`: Create hierarchical patterns
- `createParallelProcessPattern()`: Create parallel process patterns
- `createFeedbackLoopPattern()`: Create feedback loop patterns
- `combinePatterns()`: Combine multiple patterns into one workflow
- `getAllPatternExamples()`: Get all available pattern examples
- `searchPatterns()`: Search patterns by query
- `getPatternsByComplexity()`: Get patterns by complexity level
- `getPatternsByUseCase()`: Get patterns by use case

## License

MIT
