# MCP Flowchart Server

An MCP (Model Context Protocol) server that allows LLMs to create simple flowcharts and output them in SVG format.

## Features

- Create flowcharts with different node types: start, process, decision, end
- Automatic layout positioning
- SVG output format
- Support for custom node positions
- Edge labels and connections

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

## Example

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

## Node Types

- **start**: Elliptical shape, typically the beginning of a process
- **process**: Rectangular shape, represents a process or action
- **decision**: Diamond shape, represents a decision point
- **end**: Elliptical shape, typically the end of a process

## License

MIT
