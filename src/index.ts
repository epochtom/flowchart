#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { LayoutEngine } from './layout-engine.js';
import { DrawIOGenerator } from './drawio-generator.js';
import { CreateFlowchartRequest, FlowchartOptions, FlowchartNode } from './types.js';

class FlowchartMCPServer {
  private server: Server;
  private layoutEngine: LayoutEngine;
  private drawIOGenerator: DrawIOGenerator;

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

    this.layoutEngine = new LayoutEngine();
    this.drawIOGenerator = new DrawIOGenerator();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_flowchart',
            description: 'Create a simple flowchart in draw.io format',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the flowchart',
                },
                description: {
                  type: 'string',
                  description: 'Description of the flowchart',
                },
                nodes: {
                  type: 'array',
                  description: 'List of nodes in the flowchart',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['start', 'end', 'process', 'decision', 'input', 'output', 'connector'],
                        description: 'Type of the node',
                      },
                      label: {
                        type: 'string',
                        description: 'Label text for the node',
                      },
                      id: {
                        type: 'string',
                        description: 'Optional unique ID for the node',
                      },
                    },
                    required: ['type', 'label'],
                  },
                },
                connections: {
                  type: 'array',
                  description: 'Connections between nodes',
                  items: {
                    type: 'object',
                    properties: {
                      from: {
                        type: 'string',
                        description: 'Source node ID',
                      },
                      to: {
                        type: 'string',
                        description: 'Target node ID',
                      },
                      label: {
                        type: 'string',
                        description: 'Optional label for the connection',
                      },
                    },
                    required: ['from', 'to'],
                  },
                },
                options: {
                  type: 'object',
                  description: 'Layout and styling options',
                  properties: {
                    direction: {
                      type: 'string',
                      enum: ['horizontal', 'vertical'],
                      description: 'Layout direction',
                    },
                    spacing: {
                      type: 'object',
                      properties: {
                        horizontal: { type: 'number' },
                        vertical: { type: 'number' },
                      },
                    },
                    nodeSize: {
                      type: 'object',
                      properties: {
                        width: { type: 'number' },
                        height: { type: 'number' },
                      },
                    },
                    style: {
                      type: 'object',
                      properties: {
                        backgroundColor: { type: 'string' },
                        borderColor: { type: 'string' },
                        textColor: { type: 'string' },
                      },
                    },
                  },
                },
              },
              required: ['name', 'nodes', 'connections'],
            },
          },
          {
            name: 'create_simple_flowchart',
            description: 'Create a simple linear flowchart with start, process, and end nodes',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the flowchart',
                },
                steps: {
                  type: 'array',
                  description: 'List of process steps',
                  items: {
                    type: 'string',
                  },
                },
                options: {
                  type: 'object',
                  description: 'Layout and styling options',
                  properties: {
                    direction: {
                      type: 'string',
                      enum: ['horizontal', 'vertical'],
                    },
                    spacing: {
                      type: 'object',
                      properties: {
                        horizontal: { type: 'number' },
                        vertical: { type: 'number' },
                      },
                    },
                  },
                },
              },
              required: ['name', 'steps'],
            },
          },
          {
            name: 'create_decision_flowchart',
            description: 'Create a flowchart with decision points and branching',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the flowchart',
                },
                startLabel: {
                  type: 'string',
                  description: 'Label for the start node',
                  default: 'Start',
                },
                endLabel: {
                  type: 'string',
                  description: 'Label for the end node',
                  default: 'End',
                },
                decisions: {
                  type: 'array',
                  description: 'Decision points in the flowchart',
                  items: {
                    type: 'object',
                    properties: {
                      question: {
                        type: 'string',
                        description: 'The decision question',
                      },
                      yesAction: {
                        type: 'string',
                        description: 'Action to take if yes',
                      },
                      noAction: {
                        type: 'string',
                        description: 'Action to take if no',
                      },
                    },
                    required: ['question', 'yesAction', 'noAction'],
                  },
                },
                options: {
                  type: 'object',
                  description: 'Layout and styling options',
                },
              },
              required: ['name', 'decisions'],
            },
          },
          {
            name: 'create_find_max_flowchart',
            description: 'Create a flowchart for finding maximum value algorithm',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the flowchart',
                },
                inputVariables: {
                  type: 'array',
                  description: 'List of input variables (e.g., ["num1", "num2", "num3"])',
                  items: {
                    type: 'string',
                  },
                },
                outputMessage: {
                  type: 'string',
                  description: 'Output message template',
                  default: 'The maximum number is: ',
                },
                options: {
                  type: 'object',
                  description: 'Layout and styling options',
                },
              },
              required: ['name', 'inputVariables'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_flowchart':
            return await this.handleCreateFlowchart(args as CreateFlowchartRequest);

          case 'create_simple_flowchart':
            return await this.handleCreateSimpleFlowchart(args as any);

          case 'create_decision_flowchart':
            return await this.handleCreateDecisionFlowchart(args as any);

          case 'create_find_max_flowchart':
            return await this.handleCreateFindMaxFlowchart(args as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async handleCreateFlowchart(args: CreateFlowchartRequest) {
    const flowchart = this.layoutEngine.layoutFlowchart(
      args.nodes,
      args.connections,
      args.options
    );

    const xml = this.drawIOGenerator.generateXML(flowchart);

    return {
      content: [
        {
          type: 'text',
          text: `Created flowchart "${args.name}"${args.description ? ` - ${args.description}` : ''}\n\nDraw.io XML:\n\`\`\`xml\n${xml}\n\`\`\``,
        },
      ],
    };
  }

  private async handleCreateSimpleFlowchart(args: {
    name: string;
    steps: string[];
    options?: FlowchartOptions;
  }) {
    const nodes = [
      { type: 'start' as const, label: 'Start' },
      ...args.steps.map(step => ({ type: 'process' as const, label: step })),
      { type: 'end' as const, label: 'End' },
    ];

    const connections = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        from: `node_${i}`,
        to: `node_${i + 1}`,
      });
    }

    return this.handleCreateFlowchart({
      name: args.name,
      nodes,
      connections,
      options: args.options,
    });
  }

  private async handleCreateDecisionFlowchart(args: {
    name: string;
    startLabel?: string;
    endLabel?: string;
    decisions: Array<{
      question: string;
      yesAction: string;
      noAction: string;
    }>;
    options?: FlowchartOptions;
  }) {
    const nodes: Array<{ type: FlowchartNode['type']; label: string; id: string }> = [
      { type: 'start', label: args.startLabel || 'Start', id: 'start' },
    ];

    const connections: Array<{ from: string; to: string; label?: string }> = [];

    args.decisions.forEach((decision, index) => {
      const decisionId = `decision_${index}`;
      const yesProcessId = `yes_${index}`;
      const noProcessId = `no_${index}`;

      nodes.push(
        { type: 'decision', label: decision.question, id: decisionId },
        { type: 'process', label: decision.yesAction, id: yesProcessId },
        { type: 'process', label: decision.noAction, id: noProcessId }
      );

      // Connect to decision
      if (index === 0) {
        connections.push({ from: 'start', to: decisionId });
      } else {
        connections.push({ from: `yes_${index - 1}`, to: decisionId });
        connections.push({ from: `no_${index - 1}`, to: decisionId });
      }

      // Connect from decision
      connections.push({ from: decisionId, to: yesProcessId, label: 'Yes' });
      connections.push({ from: decisionId, to: noProcessId, label: 'No' });
    });

    // Add end node
    const endId = 'end';
    nodes.push({ type: 'end', label: args.endLabel || 'End', id: endId });

    // Connect last processes to end
    const lastDecisionIndex = args.decisions.length - 1;
    connections.push({ from: `yes_${lastDecisionIndex}`, to: endId });
    connections.push({ from: `no_${lastDecisionIndex}`, to: endId });

    return this.handleCreateFlowchart({
      name: args.name,
      nodes,
      connections,
      options: args.options,
    });
  }

  private async handleCreateFindMaxFlowchart(args: {
    name: string;
    inputVariables: string[];
    outputMessage?: string;
    options?: FlowchartOptions;
  }) {
    const nodes: Array<{ type: FlowchartNode['type']; label: string; id: string }> = [
      { type: 'start', label: 'Start', id: 'start' },
    ];

    const connections: Array<{ from: string; to: string; label?: string }> = [];

    // Add input nodes for each variable
    args.inputVariables.forEach((variable, index) => {
      const inputId = `input_${index}`;
      nodes.push({ type: 'input', label: `Input ${variable}`, id: inputId });
      
      if (index === 0) {
        connections.push({ from: 'start', to: inputId });
      } else {
        connections.push({ from: `input_${index - 1}`, to: inputId });
      }
    });

    // Add initialization node
    const initId = 'init';
    nodes.push({ type: 'process', label: `Set max = ${args.inputVariables[0]}`, id: initId });
    connections.push({ from: `input_${args.inputVariables.length - 1}`, to: initId });

    // Add decision nodes for each comparison (except the first variable)
    let lastNodeId = initId;
    for (let i = 1; i < args.inputVariables.length; i++) {
      const decisionId = `decision_${i}`;
      const updateId = `update_${i}`;
      const variable = args.inputVariables[i];
      
      nodes.push(
        { type: 'decision', label: `Is ${variable} > max?`, id: decisionId },
        { type: 'process', label: `Set max = ${variable}`, id: updateId }
      );

      connections.push({ from: lastNodeId, to: decisionId });
      connections.push({ from: decisionId, to: updateId, label: 'Yes' });
      
      // The "No" path continues to the next decision or output
      lastNodeId = decisionId;
    }

    // Add output and end nodes
    const outputId = 'output';
    const endId = 'end';
    nodes.push(
      { type: 'output', label: `${args.outputMessage || 'The maximum number is: '} + max`, id: outputId },
      { type: 'end', label: 'End', id: endId }
    );

    // Connect the last decision to output (both Yes and No paths)
    const lastDecisionId = `decision_${args.inputVariables.length - 1}`;
    connections.push({ from: lastDecisionId, to: outputId, label: 'No' });
    connections.push({ from: `update_${args.inputVariables.length - 1}`, to: outputId });
    connections.push({ from: outputId, to: endId });

    return this.handleCreateFlowchart({
      name: args.name,
      nodes,
      connections,
      options: {
        direction: 'vertical',
        ...args.options,
      },
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Flowchart MCP server running on stdio');
  }
}

const server = new FlowchartMCPServer();
server.run().catch(console.error);