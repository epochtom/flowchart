#!/usr/bin/env node

/**
 * Complex Workflow Example
 * 
 * This example demonstrates creating a complex workflow with multiple decision points,
 * parallel processes, and advanced styling. It shows the server's capability to handle
 * complex diagrams with many shapes and connections.
 */

import { spawn } from 'child_process';

class MCPClient {
  constructor() {
    this.process = null;
    this.messageId = 0;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.process = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.process.on('error', reject);
      this.process.on('spawn', resolve);

      this.process.stderr.on('data', (data) => {
        console.error('Server:', data.toString());
      });
    });
  }

  async callTool(name, args) {
    const message = {
      jsonrpc: '2.0',
      id: ++this.messageId,
      method: 'tools/call',
      params: {
        name,
        arguments: args
      }
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 15000);

      const onData = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === message.id) {
            clearTimeout(timeout);
            this.process.stdout.removeListener('data', onData);
            
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
          }
        } catch (e) {
          // Ignore non-JSON data
        }
      };

      this.process.stdout.on('data', onData);
      this.process.stdin.write(JSON.stringify(message) + '\n');
    });
  }

  disconnect() {
    if (this.process) {
      this.process.kill();
    }
  }
}

async function createComplexWorkflow() {
  const client = new MCPClient();
  
  try {
    console.log('🚀 Connecting to MCP server...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Create a complex workflow diagram
    console.log('\n📊 Creating complex workflow diagram...');
    const createResult = await client.callTool('create_diagram', {
      name: 'E-commerce Order Processing Workflow',
      description: 'A comprehensive workflow for processing e-commerce orders with multiple decision points and parallel processes',
      settings: {
        gridSize: 10,
        pageFormat: 'A3',
        orientation: 'landscape',
        backgroundColor: '#f8f9fa'
      }
    });
    
    console.log('✅ Diagram created:', createResult.content[0].text);
    const diagramId = createResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1];

    // Define workflow stages and shapes
    const workflowStages = [
      // Stage 1: Order Reception
      { id: 'order-received', type: 'ellipse', label: 'Order Received', x: 100, y: 100, color: '#e3f2fd' },
      { id: 'validate-order', type: 'diamond', label: 'Validate Order?', x: 100, y: 200, color: '#fff3e0' },
      { id: 'order-invalid', type: 'rectangle', label: 'Reject Order', x: 50, y: 300, color: '#ffebee' },
      { id: 'order-valid', type: 'rectangle', label: 'Order Valid', x: 150, y: 300, color: '#e8f5e8' },

      // Stage 2: Inventory Check
      { id: 'check-inventory', type: 'diamond', label: 'Check Inventory', x: 100, y: 400, color: '#fff3e0' },
      { id: 'in-stock', type: 'rectangle', label: 'In Stock', x: 50, y: 500, color: '#e8f5e8' },
      { id: 'out-of-stock', type: 'rectangle', label: 'Out of Stock', x: 150, y: 500, color: '#ffebee' },

      // Stage 3: Payment Processing
      { id: 'process-payment', type: 'diamond', label: 'Process Payment', x: 100, y: 600, color: '#fff3e0' },
      { id: 'payment-success', type: 'rectangle', label: 'Payment Success', x: 50, y: 700, color: '#e8f5e8' },
      { id: 'payment-failed', type: 'rectangle', label: 'Payment Failed', x: 150, y: 700, color: '#ffebee' },

      // Stage 4: Fulfillment
      { id: 'prepare-shipment', type: 'rectangle', label: 'Prepare Shipment', x: 100, y: 800, color: '#e1f5fe' },
      { id: 'notify-warehouse', type: 'rectangle', label: 'Notify Warehouse', x: 100, y: 900, color: '#e1f5fe' },
      { id: 'pick-items', type: 'rectangle', label: 'Pick Items', x: 50, y: 1000, color: '#e1f5fe' },
      { id: 'pack-order', type: 'rectangle', label: 'Pack Order', x: 150, y: 1000, color: '#e1f5fe' },

      // Stage 5: Shipping
      { id: 'generate-label', type: 'rectangle', label: 'Generate Shipping Label', x: 100, y: 1100, color: '#f3e5f5' },
      { id: 'handoff-carrier', type: 'rectangle', label: 'Handoff to Carrier', x: 100, y: 1200, color: '#f3e5f5' },
      { id: 'track-shipment', type: 'rectangle', label: 'Track Shipment', x: 100, y: 1300, color: '#f3e5f5' },

      // Stage 6: Customer Communication
      { id: 'send-confirmation', type: 'rectangle', label: 'Send Confirmation', x: 100, y: 1400, color: '#e8f5e8' },
      { id: 'send-tracking', type: 'rectangle', label: 'Send Tracking Info', x: 100, y: 1500, color: '#e8f5e8' },

      // Stage 7: Completion
      { id: 'order-complete', type: 'ellipse', label: 'Order Complete', x: 100, y: 1600, color: '#e8f5e8' },

      // Parallel processes
      { id: 'update-inventory', type: 'rectangle', label: 'Update Inventory', x: 300, y: 1000, color: '#fff8e1' },
      { id: 'update-analytics', type: 'rectangle', label: 'Update Analytics', x: 300, y: 1100, color: '#fff8e1' },
      { id: 'send-notifications', type: 'rectangle', label: 'Send Notifications', x: 300, y: 1200, color: '#fff8e1' },

      // Error handling
      { id: 'handle-error', type: 'rectangle', label: 'Handle Error', x: 400, y: 700, color: '#ffebee' },
      { id: 'notify-customer', type: 'rectangle', label: 'Notify Customer', x: 400, y: 800, color: '#ffebee' },
      { id: 'refund-process', type: 'rectangle', label: 'Process Refund', x: 400, y: 900, color: '#ffebee' }
    ];

    console.log('\n🔧 Adding workflow shapes...');
    const shapeIds = {};

    for (const stage of workflowStages) {
      const result = await client.callTool('add_shape', {
        diagramId,
        type: stage.type,
        label: stage.label,
        position: { x: stage.x, y: stage.y },
        size: { 
          width: stage.type === 'diamond' ? 120 : 100, 
          height: stage.type === 'diamond' ? 80 : 60 
        },
        style: {
          fillColor: stage.color,
          strokeColor: '#333333',
          strokeWidth: 2,
          fontSize: 11,
          fontColor: '#333333'
        }
      });

      const shapeId = result.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1];
      shapeIds[stage.id] = shapeId;
    }

    console.log('✅ All shapes added');

    // Add connections for the main workflow
    console.log('\n🔗 Adding workflow connections...');
    
    const connections = [
      // Main flow
      ['order-received', 'validate-order', 'Start Process'],
      ['validate-order', 'order-invalid', 'No'],
      ['validate-order', 'order-valid', 'Yes'],
      ['order-valid', 'check-inventory', 'Continue'],
      ['check-inventory', 'in-stock', 'Yes'],
      ['check-inventory', 'out-of-stock', 'No'],
      ['in-stock', 'process-payment', 'Proceed'],
      ['process-payment', 'payment-success', 'Success'],
      ['process-payment', 'payment-failed', 'Failed'],
      ['payment-success', 'prepare-shipment', 'Continue'],
      ['prepare-shipment', 'notify-warehouse', 'Notify'],
      ['notify-warehouse', 'pick-items', 'Pick'],
      ['notify-warehouse', 'pack-order', 'Pack'],
      ['pick-items', 'generate-label', 'Ready'],
      ['pack-order', 'generate-label', 'Ready'],
      ['generate-label', 'handoff-carrier', 'Ship'],
      ['handoff-carrier', 'track-shipment', 'Track'],
      ['track-shipment', 'send-confirmation', 'Confirm'],
      ['send-confirmation', 'send-tracking', 'Track Info'],
      ['send-tracking', 'order-complete', 'Complete'],

      // Error handling
      ['order-invalid', 'handle-error', 'Error'],
      ['out-of-stock', 'handle-error', 'Error'],
      ['payment-failed', 'handle-error', 'Error'],
      ['handle-error', 'notify-customer', 'Notify'],
      ['notify-customer', 'refund-process', 'Refund'],

      // Parallel processes
      ['prepare-shipment', 'update-inventory', 'Update'],
      ['prepare-shipment', 'update-analytics', 'Update'],
      ['prepare-shipment', 'send-notifications', 'Notify']
    ];

    for (const [source, target, label] of connections) {
      if (shapeIds[source] && shapeIds[target]) {
        await client.callTool('add_connection', {
          diagramId,
          sourceId: shapeIds[source],
          targetId: shapeIds[target],
          label,
          style: {
            strokeColor: '#666666',
            strokeWidth: 2,
            arrowStyle: 'classic',
            lineStyle: 'solid'
          }
        });
      }
    }

    console.log('✅ All connections added');

    // Apply automatic layout
    console.log('\n📐 Applying automatic layout...');
    await client.callTool('apply_layout', {
      diagramId,
      algorithm: 'hierarchical',
      options: {
        direction: 'top-down',
        levelSeparation: 150,
        nodeSeparation: 100
      }
    });
    console.log('✅ Layout applied');

    // Analyze the complex diagram
    console.log('\n📊 Analyzing complex diagram...');
    const analysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'metrics'
    });
    console.log('📈 Analysis results:', analysis.content[0].text);

    // Find shapes by criteria
    console.log('\n🔍 Finding decision shapes...');
    const decisionShapes = await client.callTool('find_shapes', {
      diagramId,
      criteria: { type: 'diamond' }
    });
    console.log('🔷 Decision shapes found:', decisionShapes.content[0].text);

    // Clone the diagram for modification
    console.log('\n📋 Cloning diagram for modification...');
    const cloneResult = await client.callTool('clone_diagram', {
      diagramId,
      newName: 'E-commerce Order Processing - Simplified'
    });
    console.log('✅ Diagram cloned:', cloneResult.content[0].text);

    // Export to multiple formats
    console.log('\n💾 Exporting to multiple formats...');
    
    const drawioResult = await client.callTool('export_diagram', {
      diagramId,
      format: 'drawio'
    });
    
    const mermaidResult = await client.callTool('export_diagram', {
      diagramId,
      format: 'mermaid'
    });

    console.log('✅ Exports completed');

    // List all diagrams
    console.log('\n📋 Listing all diagrams...');
    const listResult = await client.callTool('list_diagrams', {});
    console.log('📊 Available diagrams:', listResult.content[0].text);

    console.log('\n🎉 Complex workflow created successfully!');
    console.log('\nThis example demonstrates:');
    console.log('• Complex multi-stage workflows');
    console.log('• Multiple decision points');
    console.log('• Parallel processes');
    console.log('• Error handling paths');
    console.log('• Advanced styling and colors');
    console.log('• Automatic layout algorithms');
    console.log('• Diagram analysis and metrics');
    console.log('• Shape searching and filtering');
    console.log('• Diagram cloning and management');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.disconnect();
  }
}

// Run the example
createComplexWorkflow();
