# Flowchart MCP Server

A comprehensive Model Context Protocol (MCP) server for generating complex flowcharts in draw.io format. This server provides powerful tools for creating, editing, analyzing, and managing flowcharts programmatically.

## Features

### 🎨 **Diagram Management**
- Create, load, save, and delete diagrams
- Support for draw.io XML format
- Diagram cloning and merging capabilities
- Comprehensive metadata tracking

### 🔧 **Shape Management**
- 30+ shape types including rectangles, ellipses, diamonds, cylinders, and more
- Advanced styling options (colors, fonts, opacity, rotation, gradients)
- Shape positioning and sizing
- Hierarchical shape organization

### 🔗 **Connection Management**
- Create connections between shapes
- Customizable connection styles and arrows
- Waypoint support for complex paths
- Automatic connection cleanup

### 📐 **Layout Algorithms**
- **Hierarchical**: Top-down and left-right layouts
- **Force-directed**: Physics-based positioning
- **Circular**: Radial arrangements
- **Tree**: Hierarchical tree structures
- **Grid**: Regular grid layouts
- **Organic**: Natural-looking arrangements
- **Orthogonal**: Flowchart-style layouts

### 📊 **Analysis Tools**
- **Complexity Analysis**: Cyclomatic complexity, density metrics
- **Connectivity Analysis**: Graph connectivity, strongly connected components
- **Hierarchy Analysis**: Depth analysis, branching factors
- **Cycle Detection**: Find and analyze cycles
- **Path Analysis**: Longest paths, path statistics
- **Cluster Analysis**: Identify diagram clusters

### 📤 **Export Formats**
- Draw.io XML format
- Mermaid diagrams
- PlantUML diagrams
- SVG, PNG, JPG (planned)
- PDF export (planned)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd flowchart-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run the server
npm start
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test
```

## MCP Tools Reference

### Diagram Management Tools

#### `create_diagram`
Create a new flowchart diagram.

**Parameters:**
- `name` (string, required): Name of the diagram
- `description` (string, optional): Description of the diagram
- `settings` (object, optional): Diagram settings
  - `gridSize` (number): Grid size for alignment
  - `pageFormat` (string): Page format (A4, A3, A2, A1, A0, Letter, Legal, Tabloid)
  - `orientation` (string): Portrait or landscape
  - `backgroundColor` (string): Background color

#### `load_diagram`
Load a diagram from draw.io XML format.

**Parameters:**
- `xmlContent` (string, required): Draw.io XML content
- `name` (string, optional): Name for the loaded diagram

#### `save_diagram`
Save a diagram to draw.io XML format.

**Parameters:**
- `diagramId` (string, required): ID of the diagram to save

#### `list_diagrams`
List all available diagrams.

#### `delete_diagram`
Delete a diagram.

**Parameters:**
- `diagramId` (string, required): ID of the diagram to delete

### Shape Management Tools

#### `add_shape`
Add a shape to a diagram.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `type` (string, required): Shape type (rectangle, ellipse, diamond, etc.)
- `label` (string, optional): Label text for the shape
- `position` (object, required): Position coordinates
  - `x` (number): X coordinate
  - `y` (number): Y coordinate
- `size` (object, required): Shape dimensions
  - `width` (number): Width of the shape
  - `height` (number): Height of the shape
- `style` (object, optional): Style properties
  - `fillColor` (string): Fill color
  - `strokeColor` (string): Stroke color
  - `strokeWidth` (number): Stroke width
  - `fontSize` (number): Font size
  - `fontColor` (string): Font color
  - `opacity` (number): Opacity (0-1)

#### `update_shape`
Update an existing shape.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `shapeId` (string, required): ID of the shape to update
- `updates` (object, required): Updates to apply

#### `remove_shape`
Remove a shape from a diagram.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `shapeId` (string, required): ID of the shape to remove

#### `get_shape`
Get details of a specific shape.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `shapeId` (string, required): ID of the shape

### Connection Management Tools

#### `add_connection`
Add a connection between two shapes.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `sourceId` (string, required): ID of the source shape
- `targetId` (string, required): ID of the target shape
- `label` (string, optional): Label for the connection
- `style` (object, optional): Connection style
  - `strokeColor` (string): Stroke color
  - `strokeWidth` (number): Stroke width
  - `arrowStyle` (string): Arrow style (none, classic, open, block, oval, diamond)
  - `lineStyle` (string): Line style (solid, dashed, dotted, curved)

#### `remove_connection`
Remove a connection between shapes.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `connectionId` (string, required): ID of the connection to remove

### Layout Tools

#### `apply_layout`
Apply automatic layout to a diagram.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `algorithm` (string, required): Layout algorithm
  - `hierarchical`: Top-down or left-right layouts
  - `force-directed`: Physics-based positioning
  - `circular`: Radial arrangements
  - `tree`: Hierarchical tree structures
  - `grid`: Regular grid layouts
  - `organic`: Natural-looking arrangements
  - `orthogonal`: Flowchart-style layouts
- `options` (object, optional): Layout-specific options
  - `direction` (string): Direction for hierarchical layouts
  - `levelSeparation` (number): Separation between levels
  - `nodeSeparation` (number): Separation between nodes
  - `iterations` (number): Iterations for force-directed layout
  - `radius` (number): Radius for circular layout

### Analysis Tools

#### `analyze_diagram`
Analyze a diagram and return metrics.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `analysisType` (string, required): Type of analysis
  - `complexity`: Complexity metrics and scores
  - `connectivity`: Graph connectivity analysis
  - `hierarchy`: Hierarchical structure analysis
  - `cycles`: Cycle detection and analysis
  - `paths`: Path analysis and statistics
  - `clusters`: Cluster identification
  - `metrics`: Comprehensive metrics

### Export Tools

#### `export_diagram`
Export a diagram to various formats.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `format` (string, required): Export format
  - `drawio`: Draw.io XML format
  - `xml`: Raw XML format
  - `mermaid`: Mermaid diagram format
  - `plantuml`: PlantUML format
- `options` (object, optional): Export options
  - `width` (number): Export width
  - `height` (number): Export height
  - `quality` (number): Export quality (0-1)

### Advanced Tools

#### `clone_diagram`
Create a copy of an existing diagram.

**Parameters:**
- `diagramId` (string, required): ID of the diagram to clone
- `newName` (string, required): Name for the cloned diagram

#### `merge_diagrams`
Merge two diagrams into one.

**Parameters:**
- `sourceDiagramId` (string, required): ID of the source diagram
- `targetDiagramId` (string, required): ID of the target diagram
- `offset` (object, optional): Offset for source diagram
  - `x` (number): X offset
  - `y` (number): Y offset

#### `find_shapes`
Find shapes in a diagram based on criteria.

**Parameters:**
- `diagramId` (string, required): ID of the diagram
- `criteria` (object, required): Search criteria
  - `type` (string, optional): Shape type to search for
  - `label` (string, optional): Label text to search for
  - `area` (object, optional): Area to search in
    - `x` (number): X coordinate
    - `y` (number): Y coordinate
    - `width` (number): Width
    - `height` (number): Height

## Usage Examples

### Creating a Simple Flowchart

```javascript
// Create a new diagram
const createResult = await mcpClient.callTool('create_diagram', {
  name: 'Simple Process',
  description: 'A basic flowchart example'
});

// Add shapes
await mcpClient.callTool('add_shape', {
  diagramId: 'diagram-id',
  type: 'rectangle',
  label: 'Start',
  position: { x: 100, y: 100 },
  size: { width: 100, height: 50 }
});

await mcpClient.callTool('add_shape', {
  diagramId: 'diagram-id',
  type: 'diamond',
  label: 'Decision',
  position: { x: 100, y: 200 },
  size: { width: 100, height: 80 }
});

// Add connections
await mcpClient.callTool('add_connection', {
  diagramId: 'diagram-id',
  sourceId: 'start-shape-id',
  targetId: 'decision-shape-id',
  label: 'Process'
});

// Apply layout
await mcpClient.callTool('apply_layout', {
  diagramId: 'diagram-id',
  algorithm: 'hierarchical',
  options: { direction: 'top-down' }
});

// Export to draw.io format
const exportResult = await mcpClient.callTool('export_diagram', {
  diagramId: 'diagram-id',
  format: 'drawio'
});
```

### Analyzing Diagram Complexity

```javascript
// Analyze diagram complexity
const analysis = await mcpClient.callTool('analyze_diagram', {
  diagramId: 'diagram-id',
  analysisType: 'complexity'
});

console.log('Complexity Score:', analysis.complexityScore);
console.log('Shape Count:', analysis.shapeCount);
console.log('Connection Count:', analysis.connectionCount);
```

## Architecture

The MCP server is built with a modular architecture:

- **Core MCP Server** (`src/index.ts`): Main server implementation with tool handlers
- **Draw.io Parser** (`src/drawio-parser.ts`): XML parsing and generation
- **Layout Engine** (`src/layout-engine.ts`): Automatic layout algorithms
- **Diagram Analyzer** (`src/diagram-analyzer.ts`): Analysis and metrics
- **Type Definitions** (`src/types.ts`): TypeScript type definitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the GitHub repository.
