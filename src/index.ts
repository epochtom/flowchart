#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
  ImageContent,
  BlobContent
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';
import { DrawIOParser } from './drawio-parser.js';
import { LayoutEngine } from './layout-engine.js';
import { DiagramAnalyzer } from './diagram-analyzer.js';
import { Diagram, Shape, Connection, LayoutAlgorithm, ExportFormat, AnalysisType } from './types.js';

class FlowchartMCPServer {
  private server: Server;
  private parser: DrawIOParser;
  private layoutEngine: LayoutEngine;
  private analyzer: DiagramAnalyzer;
  private diagrams: Map<string, Diagram>;

  constructor() {
    this.server = new Server(
      {
        name: 'flowchart-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.parser = new DrawIOParser();
    this.layoutEngine = new LayoutEngine();
    this.analyzer = new DiagramAnalyzer();
    this.diagrams = new Map();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;
      
      try {
        const result = await this.handleToolCall(name, args);
        return result;
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      // Diagram Management Tools
      {
        name: 'create_diagram',
        description: 'Create a new flowchart diagram',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the diagram' },
            description: { type: 'string', description: 'Description of the diagram' },
            settings: {
              type: 'object',
              properties: {
                gridSize: { type: 'number', description: 'Grid size for alignment' },
                pageFormat: { type: 'string', enum: ['A4', 'A3', 'A2', 'A1', 'A0', 'Letter', 'Legal', 'Tabloid'] },
                orientation: { type: 'string', enum: ['portrait', 'landscape'] },
                backgroundColor: { type: 'string', description: 'Background color' }
              }
            }
          },
          required: ['name']
        }
      },
      {
        name: 'load_diagram',
        description: 'Load a diagram from draw.io XML format',
        inputSchema: {
          type: 'object',
          properties: {
            xmlContent: { type: 'string', description: 'Draw.io XML content' },
            name: { type: 'string', description: 'Name for the loaded diagram' }
          },
          required: ['xmlContent']
        }
      },
      {
        name: 'save_diagram',
        description: 'Save a diagram to draw.io XML format',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram to save' }
          },
          required: ['diagramId']
        }
      },
      {
        name: 'list_diagrams',
        description: 'List all available diagrams',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'delete_diagram',
        description: 'Delete a diagram',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram to delete' }
          },
          required: ['diagramId']
        }
      },

      // Shape Management Tools
      {
        name: 'add_shape',
        description: 'Add a shape to a diagram',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            type: { 
              type: 'string', 
              enum: ['rectangle', 'ellipse', 'diamond', 'cylinder', 'hexagon', 'triangle', 'parallelogram', 'trapezoid', 'star', 'arrow', 'line', 'text', 'image', 'group', 'swimlane', 'note', 'actor', 'database', 'cloud', 'document', 'folder', 'gear', 'lock', 'key', 'flag', 'heart', 'lightning', 'cross', 'check', 'times', 'question', 'exclamation', 'info', 'warning', 'error', 'success'],
              description: 'Type of shape to add'
            },
            label: { type: 'string', description: 'Label text for the shape' },
            position: {
              type: 'object',
              properties: {
                x: { type: 'number', description: 'X coordinate' },
                y: { type: 'number', description: 'Y coordinate' }
              },
              required: ['x', 'y']
            },
            size: {
              type: 'object',
              properties: {
                width: { type: 'number', description: 'Width of the shape' },
                height: { type: 'number', description: 'Height of the shape' }
              },
              required: ['width', 'height']
            },
            style: {
              type: 'object',
              properties: {
                fillColor: { type: 'string', description: 'Fill color' },
                strokeColor: { type: 'string', description: 'Stroke color' },
                strokeWidth: { type: 'number', description: 'Stroke width' },
                fontSize: { type: 'number', description: 'Font size' },
                fontColor: { type: 'string', description: 'Font color' },
                opacity: { type: 'number', minimum: 0, maximum: 1, description: 'Opacity' }
              }
            }
          },
          required: ['diagramId', 'type', 'position', 'size']
        }
      },
      {
        name: 'update_shape',
        description: 'Update an existing shape',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            shapeId: { type: 'string', description: 'ID of the shape to update' },
            updates: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'New label text' },
                position: {
                  type: 'object',
                  properties: {
                    x: { type: 'number', description: 'X coordinate' },
                    y: { type: 'number', description: 'Y coordinate' }
                  }
                },
                size: {
                  type: 'object',
                  properties: {
                    width: { type: 'number', description: 'Width of the shape' },
                    height: { type: 'number', description: 'Height of the shape' }
                  }
                },
                style: {
                  type: 'object',
                  properties: {
                    fillColor: { type: 'string', description: 'Fill color' },
                    strokeColor: { type: 'string', description: 'Stroke color' },
                    strokeWidth: { type: 'number', description: 'Stroke width' },
                    fontSize: { type: 'number', description: 'Font size' },
                    fontColor: { type: 'string', description: 'Font color' },
                    opacity: { type: 'number', minimum: 0, maximum: 1, description: 'Opacity' }
                  }
                }
              }
            }
          },
          required: ['diagramId', 'shapeId', 'updates']
        }
      },
      {
        name: 'remove_shape',
        description: 'Remove a shape from a diagram',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            shapeId: { type: 'string', description: 'ID of the shape to remove' }
          },
          required: ['diagramId', 'shapeId']
        }
      },
      {
        name: 'get_shape',
        description: 'Get details of a specific shape',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            shapeId: { type: 'string', description: 'ID of the shape' }
          },
          required: ['diagramId', 'shapeId']
        }
      },

      // Connection Management Tools
      {
        name: 'add_connection',
        description: 'Add a connection between two shapes',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            sourceId: { type: 'string', description: 'ID of the source shape' },
            targetId: { type: 'string', description: 'ID of the target shape' },
            label: { type: 'string', description: 'Label for the connection' },
            style: {
              type: 'object',
              properties: {
                strokeColor: { type: 'string', description: 'Stroke color' },
                strokeWidth: { type: 'number', description: 'Stroke width' },
                arrowStyle: { type: 'string', enum: ['none', 'classic', 'open', 'block', 'oval', 'diamond'] },
                lineStyle: { type: 'string', enum: ['solid', 'dashed', 'dotted', 'curved'] }
              }
            }
          },
          required: ['diagramId', 'sourceId', 'targetId']
        }
      },
      {
        name: 'remove_connection',
        description: 'Remove a connection between shapes',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            connectionId: { type: 'string', description: 'ID of the connection to remove' }
          },
          required: ['diagramId', 'connectionId']
        }
      },

      // Layout Tools
      {
        name: 'apply_layout',
        description: 'Apply automatic layout to a diagram',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            algorithm: { 
              type: 'string', 
              enum: ['hierarchical', 'force-directed', 'circular', 'tree', 'grid', 'organic', 'orthogonal'],
              description: 'Layout algorithm to apply'
            },
            options: {
              type: 'object',
              properties: {
                direction: { type: 'string', enum: ['top-down', 'left-right'] },
                levelSeparation: { type: 'number', description: 'Separation between levels' },
                nodeSeparation: { type: 'number', description: 'Separation between nodes' },
                iterations: { type: 'number', description: 'Number of iterations for force-directed layout' },
                radius: { type: 'number', description: 'Radius for circular layout' }
              }
            }
          },
          required: ['diagramId', 'algorithm']
        }
      },

      // Analysis Tools
      {
        name: 'analyze_diagram',
        description: 'Analyze a diagram and return metrics',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            analysisType: { 
              type: 'string', 
              enum: ['complexity', 'connectivity', 'hierarchy', 'cycles', 'paths', 'clusters', 'metrics'],
              description: 'Type of analysis to perform'
            }
          },
          required: ['diagramId', 'analysisType']
        }
      },

      // Export Tools
      {
        name: 'export_diagram',
        description: 'Export a diagram to various formats',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            format: { 
              type: 'string', 
              enum: ['drawio', 'xml', 'svg', 'png', 'jpg', 'pdf', 'mermaid', 'plantuml'],
              description: 'Export format'
            },
            options: {
              type: 'object',
              properties: {
                width: { type: 'number', description: 'Export width' },
                height: { type: 'number', description: 'Export height' },
                quality: { type: 'number', minimum: 0, maximum: 1, description: 'Export quality' }
              }
            }
          },
          required: ['diagramId', 'format']
        }
      },

      // Advanced Tools
      {
        name: 'clone_diagram',
        description: 'Create a copy of an existing diagram',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram to clone' },
            newName: { type: 'string', description: 'Name for the cloned diagram' }
          },
          required: ['diagramId', 'newName']
        }
      },
      {
        name: 'merge_diagrams',
        description: 'Merge two diagrams into one',
        inputSchema: {
          type: 'object',
          properties: {
            sourceDiagramId: { type: 'string', description: 'ID of the source diagram' },
            targetDiagramId: { type: 'string', description: 'ID of the target diagram' },
            offset: {
              type: 'object',
              properties: {
                x: { type: 'number', description: 'X offset for source diagram' },
                y: { type: 'number', description: 'Y offset for source diagram' }
              }
            }
          },
          required: ['sourceDiagramId', 'targetDiagramId']
        }
      },
      {
        name: 'find_shapes',
        description: 'Find shapes in a diagram based on criteria',
        inputSchema: {
          type: 'object',
          properties: {
            diagramId: { type: 'string', description: 'ID of the diagram' },
            criteria: {
              type: 'object',
              properties: {
                type: { type: 'string', description: 'Shape type to search for' },
                label: { type: 'string', description: 'Label text to search for' },
                area: {
                  type: 'object',
                  properties: {
                    x: { type: 'number', description: 'X coordinate' },
                    y: { type: 'number', description: 'Y coordinate' },
                    width: { type: 'number', description: 'Width' },
                    height: { type: 'number', description: 'Height' }
                  }
                }
              }
            }
          },
          required: ['diagramId', 'criteria']
        }
      }
    ];
  }

  private async handleToolCall(name: string, args: any): Promise<CallToolResult> {
    switch (name) {
      case 'create_diagram':
        return this.createDiagram(args);
      case 'load_diagram':
        return this.loadDiagram(args);
      case 'save_diagram':
        return this.saveDiagram(args);
      case 'list_diagrams':
        return this.listDiagrams(args);
      case 'delete_diagram':
        return this.deleteDiagram(args);
      case 'add_shape':
        return this.addShape(args);
      case 'update_shape':
        return this.updateShape(args);
      case 'remove_shape':
        return this.removeShape(args);
      case 'get_shape':
        return this.getShape(args);
      case 'add_connection':
        return this.addConnection(args);
      case 'remove_connection':
        return this.removeConnection(args);
      case 'apply_layout':
        return this.applyLayout(args);
      case 'analyze_diagram':
        return this.analyzeDiagram(args);
      case 'export_diagram':
        return this.exportDiagram(args);
      case 'clone_diagram':
        return this.cloneDiagram(args);
      case 'merge_diagrams':
        return this.mergeDiagrams(args);
      case 'find_shapes':
        return this.findShapes(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // Tool implementations
  private async createDiagram(args: any): Promise<CallToolResult> {
    const { name, description, settings } = args;
    const diagramId = uuidv4();
    
    const diagram: Diagram = {
      id: diagramId,
      name,
      description,
      shapes: [],
      connections: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '1.0'
      },
      settings: settings || {}
    };

    this.diagrams.set(diagramId, diagram);

    return {
      content: [
        {
          type: 'text',
          text: `Created diagram "${name}" with ID: ${diagramId}`,
        },
      ],
    };
  }

  private async loadDiagram(args: any): Promise<CallToolResult> {
    const { xmlContent, name } = args;
    
    try {
      const diagram = await this.parser.parseDrawIO(xmlContent);
      const diagramId = uuidv4();
      
      if (name) {
        diagram.name = name;
      }
      
      diagram.id = diagramId;
      this.diagrams.set(diagramId, diagram);

      return {
        content: [
          {
            type: 'text',
            text: `Loaded diagram "${diagram.name}" with ID: ${diagramId}. Found ${diagram.shapes.length} shapes and ${diagram.connections.length} connections.`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to load diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async saveDiagram(args: any): Promise<CallToolResult> {
    const { diagramId } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const xmlContent = this.parser.generateDrawIO(diagram);

    return {
      content: [
        {
          type: 'text',
          text: `Diagram "${diagram.name}" saved successfully.`,
        },
        {
          type: 'text',
          text: xmlContent,
        },
      ],
    };
  }

  private async listDiagrams(args: any): Promise<CallToolResult> {
    const diagramList = Array.from(this.diagrams.values()).map((diagram: Diagram) => ({
      id: diagram.id,
      name: diagram.name,
      description: diagram.description,
      shapeCount: diagram.shapes.length,
      connectionCount: diagram.connections.length,
      created: diagram.metadata?.created,
      modified: diagram.metadata?.modified
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${diagramList.length} diagrams:\n\n${diagramList.map(d => 
            `• ${d.name} (ID: ${d.id})\n  Shapes: ${d.shapeCount}, Connections: ${d.connectionCount}\n  Created: ${d.created}\n`
          ).join('\n')}`,
        },
      ],
    };
  }

  private async deleteDiagram(args: any): Promise<CallToolResult> {
    const { diagramId } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    this.diagrams.delete(diagramId);

    return {
      content: [
        {
          type: 'text',
          text: `Deleted diagram "${diagram.name}" (ID: ${diagramId})`,
        },
      ],
    };
  }

  private async addShape(args: any): Promise<CallToolResult> {
    const { diagramId, type, label, position, size, style } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const shapeId = uuidv4();
    const shape: Shape = {
      id: shapeId,
      type,
      label,
      position,
      size,
      style,
      data: {}
    };

    diagram.shapes.push(shape);
    diagram.metadata!.modified = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: `Added ${type} shape "${label || 'unnamed'}" with ID: ${shapeId}`,
        },
      ],
    };
  }

  private async updateShape(args: any): Promise<CallToolResult> {
    const { diagramId, shapeId, updates } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const shapeIndex = diagram.shapes.findIndex((s: Shape) => s.id === shapeId);
    if (shapeIndex === -1) {
      throw new Error(`Shape with ID ${shapeId} not found`);
    }

    const shape = diagram.shapes[shapeIndex];
    diagram.shapes[shapeIndex] = { ...shape, ...updates };
    diagram.metadata!.modified = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: `Updated shape ${shapeId}`,
        },
      ],
    };
  }

  private async removeShape(args: any): Promise<CallToolResult> {
    const { diagramId, shapeId } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const shapeIndex = diagram.shapes.findIndex((s: Shape) => s.id === shapeId);
    if (shapeIndex === -1) {
      throw new Error(`Shape with ID ${shapeId} not found`);
    }

    // Remove all connections involving this shape
    diagram.connections = diagram.connections.filter(
      (conn: Connection) => conn.source !== shapeId && conn.target !== shapeId
    );

    diagram.shapes.splice(shapeIndex, 1);
    diagram.metadata!.modified = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: `Removed shape ${shapeId} and all its connections`,
        },
      ],
    };
  }

  private async getShape(args: any): Promise<CallToolResult> {
    const { diagramId, shapeId } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const shape = diagram.shapes.find((s: Shape) => s.id === shapeId);
    if (!shape) {
      throw new Error(`Shape with ID ${shapeId} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Shape Details:\n${JSON.stringify(shape, null, 2)}`,
        },
      ],
    };
  }

  private async addConnection(args: any): Promise<CallToolResult> {
    const { diagramId, sourceId, targetId, label, style } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    // Verify shapes exist
    const sourceShape = diagram.shapes.find((s: Shape) => s.id === sourceId);
    const targetShape = diagram.shapes.find((s: Shape) => s.id === targetId);
    
    if (!sourceShape) {
      throw new Error(`Source shape with ID ${sourceId} not found`);
    }
    if (!targetShape) {
      throw new Error(`Target shape with ID ${targetId} not found`);
    }

    const connectionId = uuidv4();
    const connection: Connection = {
      id: connectionId,
      source: sourceId,
      target: targetId,
      label,
      style,
      arrowStyle: 'classic',
      lineStyle: 'solid'
    };

    diagram.connections.push(connection);
    diagram.metadata!.modified = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: `Added connection from ${sourceId} to ${targetId} with ID: ${connectionId}`,
        },
      ],
    };
  }

  private async removeConnection(args: any): Promise<CallToolResult> {
    const { diagramId, connectionId } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const connectionIndex = diagram.connections.findIndex((c: Connection) => c.id === connectionId);
    if (connectionIndex === -1) {
      throw new Error(`Connection with ID ${connectionId} not found`);
    }

    diagram.connections.splice(connectionIndex, 1);
    diagram.metadata!.modified = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: `Removed connection ${connectionId}`,
        },
      ],
    };
  }

  private async applyLayout(args: any): Promise<CallToolResult> {
    const { diagramId, algorithm, options = {} } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const updatedDiagram = this.layoutEngine.applyLayout(diagram, algorithm as LayoutAlgorithm, options);
    this.diagrams.set(diagramId, updatedDiagram);

    return {
      content: [
        {
          type: 'text',
          text: `Applied ${algorithm} layout to diagram "${diagram.name}"`,
        },
      ],
    };
  }

  private async analyzeDiagram(args: any): Promise<CallToolResult> {
    const { diagramId, analysisType } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const analysis = this.analyzer.analyzeDiagram(diagram, analysisType as AnalysisType);

    return {
      content: [
        {
          type: 'text',
          text: `Analysis Results (${analysisType}):\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
    };
  }

  private async exportDiagram(args: any): Promise<CallToolResult> {
    const { diagramId, format, options = {} } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    let exportContent: string;
    let mimeType: string;

    switch (format) {
      case 'drawio':
      case 'xml':
        exportContent = this.parser.generateDrawIO(diagram);
        mimeType = 'application/xml';
        break;
      case 'mermaid':
        exportContent = this.generateMermaid(diagram);
        mimeType = 'text/plain';
        break;
      case 'plantuml':
        exportContent = this.generatePlantUML(diagram);
        mimeType = 'text/plain';
        break;
      default:
        throw new Error(`Export format ${format} not yet implemented`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Exported diagram "${diagram.name}" to ${format} format`,
        },
        {
          type: 'text',
          text: exportContent,
        },
      ],
    };
  }

  private async cloneDiagram(args: any): Promise<CallToolResult> {
    const { diagramId, newName } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    const clonedDiagram: Diagram = {
      ...diagram,
      id: uuidv4(),
      name: newName,
      metadata: {
        ...diagram.metadata,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    };

    // Update shape and connection IDs to avoid conflicts
    const idMap = new Map<string, string>();
    clonedDiagram.shapes.forEach((shape: Shape) => {
      const newId = uuidv4();
      idMap.set(shape.id, newId);
      shape.id = newId;
    });

    clonedDiagram.connections.forEach((connection: Connection) => {
      connection.id = uuidv4();
      connection.source = idMap.get(connection.source) || connection.source;
      connection.target = idMap.get(connection.target) || connection.target;
    });

    this.diagrams.set(clonedDiagram.id, clonedDiagram);

    return {
      content: [
        {
          type: 'text',
          text: `Cloned diagram "${diagram.name}" as "${newName}" with ID: ${clonedDiagram.id}`,
        },
      ],
    };
  }

  private async mergeDiagrams(args: any): Promise<CallToolResult> {
    const { sourceDiagramId, targetDiagramId, offset = { x: 0, y: 0 } } = args;
    const sourceDiagram = this.diagrams.get(sourceDiagramId);
    const targetDiagram = this.diagrams.get(targetDiagramId);
    
    if (!sourceDiagram) {
      throw new Error(`Source diagram with ID ${sourceDiagramId} not found`);
    }
    if (!targetDiagram) {
      throw new Error(`Target diagram with ID ${targetDiagramId} not found`);
    }

    // Create ID mapping for source diagram
    const idMap = new Map<string, string>();
    
    // Add shapes from source diagram with offset
    sourceDiagram.shapes.forEach((shape: Shape) => {
      const newId = uuidv4();
      idMap.set(shape.id, newId);
      
      const newShape: Shape = {
        ...shape,
        id: newId,
        position: {
          x: shape.position.x + offset.x,
          y: shape.position.y + offset.y
        }
      };
      
      targetDiagram.shapes.push(newShape);
    });

    // Add connections from source diagram with updated IDs
    sourceDiagram.connections.forEach((connection: Connection) => {
      const newConnection: Connection = {
        ...connection,
        id: uuidv4(),
        source: idMap.get(connection.source) || connection.source,
        target: idMap.get(connection.target) || connection.target
      };
      
      targetDiagram.connections.push(newConnection);
    });

    targetDiagram.metadata!.modified = new Date().toISOString();

    return {
      content: [
        {
          type: 'text',
          text: `Merged diagram "${sourceDiagram.name}" into "${targetDiagram.name}". Added ${sourceDiagram.shapes.length} shapes and ${sourceDiagram.connections.length} connections.`,
        },
      ],
    };
  }

  private async findShapes(args: any): Promise<CallToolResult> {
    const { diagramId, criteria } = args;
    const diagram = this.diagrams.get(diagramId);
    
    if (!diagram) {
      throw new Error(`Diagram with ID ${diagramId} not found`);
    }

    let matchingShapes = diagram.shapes;

    if (criteria.type) {
      matchingShapes = matchingShapes.filter((shape: Shape) => shape.type === criteria.type);
    }

    if (criteria.label) {
      const labelPattern = new RegExp(criteria.label, 'i');
      matchingShapes = matchingShapes.filter((shape: Shape) => 
        shape.label && labelPattern.test(shape.label)
      );
    }

    if (criteria.area) {
      const { x, y, width, height } = criteria.area;
      matchingShapes = matchingShapes.filter((shape: Shape) => 
        shape.position.x >= x && 
        shape.position.x <= x + width &&
        shape.position.y >= y && 
        shape.position.y <= y + height
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: `Found ${matchingShapes.length} shapes matching criteria:\n${matchingShapes.map((shape: Shape) => 
            `• ${shape.type} "${shape.label || 'unnamed'}" (ID: ${shape.id}) at (${shape.position.x}, ${shape.position.y})`
          ).join('\n')}`,
        },
      ],
    };
  }

  // Helper methods for export formats
  private generateMermaid(diagram: Diagram): string {
    let mermaid = 'graph TD\n';
    
    // Add shapes as nodes
    diagram.shapes.forEach((shape: Shape) => {
      const label = shape.label || shape.id;
      const shapeType = this.getMermaidShapeType(shape.type);
      mermaid += `  ${shape.id}${shapeType}"${label}"\n`;
    });
    
    // Add connections
    diagram.connections.forEach((conn: Connection) => {
      const label = conn.label ? `|"${conn.label}"|` : '';
      mermaid += `  ${conn.source} -->${label} ${conn.target}\n`;
    });
    
    return mermaid;
  }

  private getMermaidShapeType(type: string): string {
    switch (type) {
      case 'diamond': return '{{';
      case 'ellipse': return '([';
      case 'cylinder': return '[(';
      case 'hexagon': return '{{';
      case 'triangle': return '[/';
      default: return '[';
    }
  }

  private generatePlantUML(diagram: Diagram): string {
    let plantuml = '@startuml\n';
    
    // Add shapes as components
    diagram.shapes.forEach((shape: Shape) => {
      const label = shape.label || shape.id;
      plantuml += `component "${label}" as ${shape.id}\n`;
    });
    
    // Add connections
    diagram.connections.forEach((conn: Connection) => {
      const label = conn.label ? ` : ${conn.label}` : '';
      plantuml += `${conn.source} --> ${conn.target}${label}\n`;
    });
    
    plantuml += '@enduml\n';
    return plantuml;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Flowchart MCP Server running on stdio');
  }
}

// Start the server
const server = new FlowchartMCPServer();
server.run().catch(console.error);
