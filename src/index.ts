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
  private nodeWidth = 140;
  private nodeHeight = 70;
  private spacing = 100;
  private levelSpacing = 120;

  generateSVG(flowchart: Flowchart): string {
    const { nodes, edges, title } = flowchart;
    
    // Auto-layout nodes if positions not provided
    const positionedNodes = this.autoLayout(nodes, edges);
    
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
        const fromX = (fromNode.x || 0) + this.nodeWidth / 2;
        const fromY = (fromNode.y || 0) + this.nodeHeight;
        const toX = (toNode.x || 0) + this.nodeWidth / 2;
        const toY = (toNode.y || 0);
        
        // Calculate if we need a curved path to avoid crossings
        const deltaY = toY - fromY;
        const deltaX = toX - fromX;
        
        let path = '';
        if (Math.abs(deltaX) < this.nodeWidth && deltaY > 0) {
          // Direct vertical connection
          path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
        } else if (Math.abs(deltaX) > this.nodeWidth) {
          // Horizontal then vertical path to avoid crossings
          const midY = fromY + deltaY / 2;
          path = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
        } else {
          // Direct diagonal connection
          path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
        }
        
        // Draw arrow path
        svg += `<path d="${path}" stroke="#333" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>`;
        
        // Add edge label if provided
        if (edge.label) {
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;
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

  private autoLayout(nodes: FlowchartNode[], edges: FlowchartEdge[]): FlowchartNode[] {
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

    // Build adjacency list for better flow analysis
    const adjacencyList = new Map<string, string[]>();
    const reverseAdjacencyList = new Map<string, string[]>();
    
    for (const edge of edges) {
      if (!adjacencyList.has(edge.from)) {
        adjacencyList.set(edge.from, []);
      }
      if (!reverseAdjacencyList.has(edge.to)) {
        reverseAdjacencyList.set(edge.to, []);
      }
      adjacencyList.get(edge.from)!.push(edge.to);
      reverseAdjacencyList.get(edge.to)!.push(edge.from);
    }

    // Use topological sort to determine proper levels
    const levels: FlowchartNode[][] = [];
    const visited = new Set<string>();
    const inProgress = new Set<string>();

    const visit = (nodeId: string, level: number) => {
      if (inProgress.has(nodeId)) {
        return; // Avoid cycles
      }
      if (visited.has(nodeId)) {
        return;
      }

      inProgress.add(nodeId);
      const node = positionedNodes.find(n => n.id === nodeId);
      if (!node) return;

      // Ensure we have enough levels
      while (levels.length <= level) {
        levels.push([]);
      }
      levels[level].push(node);
      visited.add(nodeId);

      // Visit children
      const children = adjacencyList.get(nodeId) || [];
      for (const childId of children) {
        visit(childId, level + 1);
      }

      inProgress.delete(nodeId);
    };

    // Start from the start node
    visit(startNode.id, 0);

    // Position nodes in levels
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      const levelNodes = levels[levelIndex];
      const levelWidth = levelNodes.length * (this.nodeWidth + this.spacing) - this.spacing;
      const startX = -levelWidth / 2;

      for (let i = 0; i < levelNodes.length; i++) {
        const node = levelNodes[i];
        node.x = startX + i * (this.nodeWidth + this.spacing);
        node.y = levelIndex * this.levelSpacing;
      }
    }

    // Handle any remaining unvisited nodes (cycles, disconnected components)
    const unvisitedNodes = positionedNodes.filter(n => !visited.has(n.id));
    if (unvisitedNodes.length > 0) {
      const lastLevel = levels.length;
      const levelWidth = unvisitedNodes.length * (this.nodeWidth + this.spacing) - this.spacing;
      const startX = -levelWidth / 2;

      unvisitedNodes.forEach((node, index) => {
        node.x = startX + index * (this.nodeWidth + this.spacing);
        node.y = lastLevel * this.levelSpacing;
      });
    }

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
