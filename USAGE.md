# MCP Flowchart Server - Usage Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

## How to Use with an LLM

The MCP server provides a single tool called `create_flowchart` that accepts a flowchart definition and returns an SVG.

### Tool: create_flowchart

**Description:** Create a simple flowchart and return it as SVG

**Parameters:**
- `flowchart` (object): The flowchart definition containing:
  - `title` (string, optional): Title for the flowchart
  - `nodes` (array): Array of flowchart nodes
  - `edges` (array): Array of connections between nodes

### Node Types

- **start**: Elliptical shape (light blue) - beginning of process
- **process**: Rectangular shape (light purple) - action or process
- **decision**: Diamond shape (light orange) - decision point
- **end**: Elliptical shape (light blue) - end of process

### Example Usage

```json
{
  "tool": "create_flowchart",
  "arguments": {
    "flowchart": {
      "title": "User Authentication Flow",
      "nodes": [
        {
          "id": "start",
          "type": "start",
          "label": "User Login"
        },
        {
          "id": "validate",
          "type": "process",
          "label": "Validate Credentials"
        },
        {
          "id": "check",
          "type": "decision",
          "label": "Valid?"
        },
        {
          "id": "success",
          "type": "process",
          "label": "Grant Access"
        },
        {
          "id": "error",
          "type": "process",
          "label": "Show Error"
        },
        {
          "id": "end",
          "type": "end",
          "label": "Complete"
        }
      ],
      "edges": [
        {
          "from": "start",
          "to": "validate"
        },
        {
          "from": "validate",
          "to": "check"
        },
        {
          "from": "check",
          "to": "success",
          "label": "Yes"
        },
        {
          "from": "check",
          "to": "error",
          "label": "No"
        },
        {
          "from": "success",
          "to": "end"
        },
        {
          "from": "error",
          "to": "end"
        }
      ]
    }
  }
}
```

## Features

- **Automatic Layout**: If you don't specify x,y coordinates, the server will automatically position nodes
- **Custom Positioning**: You can specify exact x,y coordinates for precise control
- **Edge Labels**: Add labels to connections between nodes
- **Multiple Node Types**: Support for start, process, decision, and end nodes
- **SVG Output**: High-quality vector graphics that scale perfectly

## Integration with MCP Clients

To use this server with an MCP client, add it to your MCP configuration:

```json
{
  "mcpServers": {
    "flowchart-server": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/your/mcp-flowchart-server"
    }
  }
}
```

## Development

- **Source code**: `src/index.ts`
- **Build**: `npm run build`
- **Development mode**: `npm run dev`
- **Example**: See `example.js` for a complete example
