# Flowchart Patterns

This directory contains implementations of common flowchart patterns that can help structure complex flowcharts effectively. Each pattern addresses specific types of processes or decisions and can be adapted to various scenarios.

## Available Patterns

### 1. Linear Flow Pattern
A straightforward, sequential process with no branches or loops.
- **Use Case**: Simple processes with a clear start-to-end path (e.g., basic onboarding)
- **Structure**: Start (oval) → Process Step 1 (rectangle) → Process Step 2 (rectangle) → ... → End (oval)
- **File**: `linear-flow-pattern.ts`

### 2. Decision Tree Pattern
A flowchart with multiple decision points leading to different paths.
- **Use Case**: Processes with multiple outcomes (e.g., troubleshooting, customer support)
- **Structure**: Start → Process Step → Decision (diamond) → Branches (Yes/No) → Different paths
- **File**: `decision-tree-pattern.ts`

### 3. Loop Pattern
A process that repeats steps until a condition is met.
- **Use Case**: Iterative processes (e.g., quality checks, data validation)
- **Structure**: Start → Process Step → Decision (Continue?) → Loop back or proceed
- **File**: `loop-pattern.ts`

### 4. Swimlane Pattern
Divides the flowchart into lanes to show responsibilities across roles or departments.
- **Use Case**: Processes involving multiple stakeholders (e.g., project workflows, cross-department tasks)
- **Structure**: Vertical or horizontal lanes labeled by role/department
- **File**: `swimlane-pattern.ts`

### 5. Hierarchical (Subprocess) Pattern
A high-level flowchart with links to detailed sub-flowcharts for complex steps.
- **Use Case**: Large processes with detailed subsections (e.g., software development, manufacturing)
- **Structure**: Main flowchart with subprocess symbols linked to detailed sub-flowcharts
- **File**: `hierarchical-pattern.ts`

### 6. Parallel Process Pattern
Multiple processes or tasks occurring simultaneously.
- **Use Case**: Multitasking workflows (e.g., concurrent project tasks, system integrations)
- **Structure**: Start → Fork (split into multiple paths) → Parallel processes → Join point → End
- **File**: `parallel-process-pattern.ts`

### 7. Feedback Loop Pattern
A process that cycles back based on feedback or evaluation.
- **Use Case**: Continuous improvement processes (e.g., agile development, performance reviews)
- **Structure**: Start → Process → Evaluation → Loop back to revise or proceed to end
- **File**: `feedback-loop-pattern.ts`

## Usage

Each pattern file exports:
- `createPattern()`: Function to generate the pattern with custom parameters
- `getPatternExamples()`: Function to get example implementations
- `PatternConfig`: TypeScript interface for pattern configuration

## Pattern Generator

The `pattern-generator.ts` file provides utility functions to:
- Combine multiple patterns
- Generate complex workflows
- Export patterns in multiple formats (SVG, Draw.io, Mermaid)

## Examples

See the `examples/` directory for comprehensive examples of each pattern in action.
