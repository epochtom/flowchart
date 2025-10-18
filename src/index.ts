#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Define the flowchart node schema
const FlowchartNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'process', 'decision', 'end']),
  label: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
});

// Define the flowchart edge schema
const FlowchartEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
});

// Define the flowchart schema
const FlowchartSchema = z.object({
  nodes: z.array(FlowchartNodeSchema),
  edges: z.array(FlowchartEdgeSchema),
  title: z.string().optional(),
});

type FlowchartNode = z.infer<typeof FlowchartNodeSchema>;
type FlowchartEdge = z.infer<typeof FlowchartEdgeSchema>;
type Flowchart = z.infer<typeof FlowchartSchema>;

class FlowchartGenerator {
  private nodeWidth = 120;
  private nodeHeight = 60;
  private spacing = 80;

  generateSVG(flowchart: Flowchart): string {
    const { nodes, edges, title } = flowchart;
    
    // Auto-layout nodes if positions not provided
    const positionedNodes = this.autoLayout(nodes);
    
    // Calculate SVG dimensions
    const padding = 40;
    const maxX = Math.max(...positionedNodes.map(n => n.x || 0)) + this.nodeWidth;
    const maxY = Math.max(...positionedNodes.map(n => n.y || 0)) + this.nodeHeight;
    const width = maxX + padding;
    const height = maxY + padding;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add title if provided
    if (title) {
      svg += `<text x="${width / 2}" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${title}</text>`;
    }

    // Add edges first (so they appear behind nodes)
    for (const edge of edges) {
      const fromNode = positionedNodes.find(n => n.id === edge.from);
      const toNode = positionedNodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        const x1 = (fromNode.x || 0) + this.nodeWidth / 2;
        const y1 = (fromNode.y || 0) + this.nodeHeight;
        const x2 = (toNode.x || 0) + this.nodeWidth / 2;
        const y2 = (toNode.y || 0);
        
        // Draw arrow line
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>`;
        
        // Add edge label if provided
        if (edge.label) {
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          svg += `<text x="${midX}" y="${midY - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">${edge.label}</text>`;
        }
      }
    }

    // Add arrow marker definition
    svg += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#333"/></marker></defs>`;

    // Add nodes
    for (const node of positionedNodes) {
      const x = node.x || 0;
      const y = node.y || 0;
      
      let shape = '';
      let textY = y + this.nodeHeight / 2;
      
      switch (node.type) {
        case 'start':
        case 'end':
          // Ellipse
          shape = `<ellipse cx="${x + this.nodeWidth / 2}" cy="${y + this.nodeHeight / 2}" rx="${this.nodeWidth / 2}" ry="${this.nodeHeight / 2}" fill="#e1f5fe" stroke="#01579b" stroke-width="2"/>`;
          break;
        case 'decision':
          // Diamond
          const centerX = x + this.nodeWidth / 2;
          const centerY = y + this.nodeHeight / 2;
          const halfWidth = this.nodeWidth / 2;
          const halfHeight = this.nodeHeight / 2;
          shape = `<polygon points="${centerX},${y} ${x + this.nodeWidth},${centerY} ${centerX},${y + this.nodeHeight} ${x},${centerY}" fill="#fff3e0" stroke="#e65100" stroke-width="2"/>`;
          break;
        case 'process':
        default:
          // Rectangle
          shape = `<rect x="${x}" y="${y}" width="${this.nodeWidth}" height="${this.nodeHeight}" fill="#f3e5f5" stroke="#4a148c" stroke-width="2" rx="5"/>`;
          break;
      }
      
      svg += shape;
      svg += `<text x="${x + this.nodeWidth / 2}" y="${textY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">${node.label}</text>`;
    }

    svg += '</svg>';
    return svg;
  }

  private autoLayout(nodes: FlowchartNode[]): FlowchartNode[] {
    const positionedNodes = [...nodes];
    const startNode = positionedNodes.find(n => n.type === 'start');
    
    if (!startNode) {
      // If no start node, position nodes in a simple grid
      positionedNodes.forEach((node, index) => {
        node.x = (index % 3) * (this.nodeWidth + this.spacing);
        node.y = Math.floor(index / 3) * (this.nodeHeight + this.spacing);
      });
      return positionedNodes;
    }

    // Start with the start node at the top
    startNode.x = 0;
    startNode.y = 0;

    // Simple layout: place nodes in levels
    const levels: FlowchartNode[][] = [[startNode]];
    const visited = new Set([startNode.id]);
    let currentLevel = 0;

    while (currentLevel < levels.length) {
      const currentLevelNodes = levels[currentLevel];
      const nextLevel: FlowchartNode[] = [];

      for (const node of currentLevelNodes) {
        // Find connected nodes (simplified - in a real implementation, you'd use the edges)
        const connectedNodes = positionedNodes.filter(n => 
          !visited.has(n.id) && n.id !== node.id
        );

        for (let i = 0; i < connectedNodes.length && i < 3; i++) {
          const connectedNode = connectedNodes[i];
          connectedNode.x = i * (this.nodeWidth + this.spacing);
          connectedNode.y = (currentLevel + 1) * (this.nodeHeight + this.spacing);
          nextLevel.push(connectedNode);
          visited.add(connectedNode.id);
        }
      }

      if (nextLevel.length > 0) {
        levels.push(nextLevel);
      }
      currentLevel++;
    }

    // Position remaining unvisited nodes
    const unvisitedNodes = positionedNodes.filter(n => !visited.has(n.id));
    unvisitedNodes.forEach((node, index) => {
      node.x = (index % 3) * (this.nodeWidth + this.spacing);
      node.y = levels.length * (this.nodeHeight + this.spacing);
    });

    return positionedNodes;
  }
}

const server = new Server({
  name: 'flowchart-server',
  version: '1.0.0',
});

const flowchartGenerator = new FlowchartGenerator();

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_flowchart',
        description: 'Create a simple flowchart and return it as SVG',
        inputSchema: {
          type: 'object',
          properties: {
            flowchart: {
              type: 'object',
              description: 'The flowchart definition',
              properties: {
                title: {
                  type: 'string',
                  description: 'Optional title for the flowchart',
                },
                nodes: {
                  type: 'array',
                  description: 'Array of flowchart nodes',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'Unique identifier for the node',
                      },
                      type: {
                        type: 'string',
                        enum: ['start', 'process', 'decision', 'end'],
                        description: 'Type of the node',
                      },
                      label: {
                        type: 'string',
                        description: 'Text label for the node',
                      },
                      x: {
                        type: 'number',
                        description: 'Optional X position (auto-layout if not provided)',
                      },
                      y: {
                        type: 'number',
                        description: 'Optional Y position (auto-layout if not provided)',
                      },
                    },
                    required: ['id', 'type', 'label'],
                  },
                },
                edges: {
                  type: 'array',
                  description: 'Array of connections between nodes',
                  items: {
                    type: 'object',
                    properties: {
                      from: {
                        type: 'string',
                        description: 'ID of the source node',
                      },
                      to: {
                        type: 'string',
                        description: 'ID of the target node',
                      },
                      label: {
                        type: 'string',
                        description: 'Optional label for the edge',
                      },
                    },
                    required: ['from', 'to'],
                  },
                },
              },
              required: ['nodes', 'edges'],
            },
          },
          required: ['flowchart'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'create_flowchart') {
    try {
      const { flowchart } = args as { flowchart: any };
      
      // Validate the flowchart data
      const validatedFlowchart = FlowchartSchema.parse(flowchart);
      
      // Generate SVG
      const svg = flowchartGenerator.generateSVG(validatedFlowchart);
      
      return {
        content: [
          {
            type: 'text',
            text: svg,
          },
        ],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid flowchart data: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to generate flowchart: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Flowchart MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
