# MCP Flowchart Server

An MCP (Model Context Protocol) server that generates simple flowcharts in draw.io format. This server provides tools to create various types of flowcharts programmatically.

## Features

- **Multiple Node Types**: Start, End, Process, Decision, Input, Output, and Connector nodes
- **Automatic Layout**: Intelligent positioning of nodes with customizable spacing
- **Draw.io Compatible**: Generates XML that can be imported directly into draw.io
- **Multiple Tools**: Create simple linear flowcharts, decision trees, or custom complex flowcharts
- **Customizable Styling**: Control colors, sizes, and layout options

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the server:
```bash
npm start
```

## MCP Tools

### 1. create_flowchart
Create a custom flowchart with full control over nodes and connections.

**Parameters:**
- `name` (string): Name of the flowchart
- `description` (string, optional): Description of the flowchart
- `nodes` (array): List of nodes with type, label, and optional ID
- `connections` (array): Connections between nodes with from, to, and optional label
- `options` (object, optional): Layout and styling options

**Example:**
```json
{
  "name": "User Registration Process",
  "nodes": [
    {"type": "start", "label": "Start"},
    {"type": "input", "label": "Enter Email"},
    {"type": "process", "label": "Validate Email"},
    {"type": "decision", "label": "Email Valid?"},
    {"type": "process", "label": "Send Confirmation"},
    {"type": "end", "label": "End"}
  ],
  "connections": [
    {"from": "node_0", "to": "node_1"},
    {"from": "node_1", "to": "node_2"},
    {"from": "node_2", "to": "node_3"},
    {"from": "node_3", "to": "node_4", "label": "Yes"},
    {"from": "node_3", "to": "node_1", "label": "No"},
    {"from": "node_4", "to": "node_5"}
  ]
}
```

### 2. create_simple_flowchart
Create a linear flowchart with start, process steps, and end.

**Parameters:**
- `name` (string): Name of the flowchart
- `steps` (array): List of process steps
- `options` (object, optional): Layout options

**Example:**
```json
{
  "name": "Simple Process",
  "steps": [
    "Initialize",
    "Process Data",
    "Generate Report",
    "Save Results"
  ]
}
```

### 3. create_decision_flowchart
Create a flowchart with decision points and branching logic.

**Parameters:**
- `name` (string): Name of the flowchart
- `startLabel` (string, optional): Label for start node (default: "Start")
- `endLabel` (string, optional): Label for end node (default: "End")
- `decisions` (array): Decision points with question, yesAction, and noAction
- `options` (object, optional): Layout options

**Example:**
```json
{
  "name": "Approval Process",
  "decisions": [
    {
      "question": "Is user authenticated?",
      "yesAction": "Check permissions",
      "noAction": "Redirect to login"
    },
    {
      "question": "Has required permissions?",
      "yesAction": "Grant access",
      "noAction": "Show error message"
    }
  ]
}
```

## Node Types

- **start**: Oval node with green background (beginning of process)
- **end**: Oval node with red background (end of process)
- **process**: Rounded rectangle with blue background (action/process)
- **decision**: Diamond shape with yellow background (decision point)
- **input**: Parallelogram with purple background (data input)
- **output**: Parallelogram with purple background (data output)
- **connector**: Small circle (connection point)

## Layout Options

- `direction`: "horizontal" or "vertical" (default: "vertical")
- `spacing.horizontal`: Horizontal spacing between nodes (default: 200)
- `spacing.vertical`: Vertical spacing between nodes (default: 100)
- `nodeSize.width`: Node width (default: 120)
- `nodeSize.height`: Node height (default: 60)
- `style.backgroundColor`: Background color (default: "#ffffff")
- `style.borderColor`: Border color (default: "#000000")
- `style.textColor`: Text color (default: "#000000")

## Usage with MCP Clients

This server can be used with any MCP-compatible client. The server communicates via stdio and provides the tools listed above.

## Output Format

The server generates draw.io XML format that can be:
1. Copied and pasted into draw.io
2. Saved as a .drawio file
3. Imported into other diagramming tools that support draw.io format

## Development

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Watch mode for development
- `npm run clean`: Remove build artifacts
- `npm start`: Run the compiled server

## License

MIT