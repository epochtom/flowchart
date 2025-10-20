#!/usr/bin/env node

/**
 * Basic Flowchart Example
 * 
 * This example demonstrates how to create a simple flowchart using the MCP server.
 * It creates a basic decision flow with start, decision, and end nodes.
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';

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
      }, 10000);

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

async function createBasicFlowchart() {
  const client = new MCPClient();
  
  try {
    console.log('🚀 Connecting to MCP server...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Create a new diagram
    console.log('\n📊 Creating diagram...');
    const createResult = await client.callTool('create_diagram', {
      name: 'Basic Decision Flow',
      description: 'A simple decision flowchart example',
      settings: {
        gridSize: 10,
        pageFormat: 'A4',
        orientation: 'portrait',
        backgroundColor: '#ffffff'
      }
    });
    
    console.log('✅ Diagram created:', createResult.content[0].text);

    // Extract diagram ID from the response
    const diagramId = createResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1];
    if (!diagramId) {
      throw new Error('Could not extract diagram ID');
    }

    console.log(`📋 Diagram ID: ${diagramId}`);

    // Add start shape
    console.log('\n🔵 Adding start node...');
    const startResult = await client.callTool('add_shape', {
      diagramId,
      type: 'ellipse',
      label: 'Start',
      position: { x: 200, y: 50 },
      size: { width: 100, height: 60 },
      style: {
        fillColor: '#e1f5fe',
        strokeColor: '#01579b',
        strokeWidth: 2,
        fontSize: 14,
        fontColor: '#01579b'
      }
    });
    console.log('✅ Start node added:', startResult.content[0].text);

    // Add decision shape
    console.log('\n🔷 Adding decision node...');
    const decisionResult = await client.callTool('add_shape', {
      diagramId,
      type: 'diamond',
      label: 'Is user logged in?',
      position: { x: 150, y: 150 },
      size: { width: 200, height: 100 },
      style: {
        fillColor: '#fff3e0',
        strokeColor: '#e65100',
        strokeWidth: 2,
        fontSize: 12,
        fontColor: '#e65100'
      }
    });
    console.log('✅ Decision node added:', decisionResult.content[0].text);

    // Add process shapes
    console.log('\n📦 Adding process nodes...');
    const loginResult = await client.callTool('add_shape', {
      diagramId,
      type: 'rectangle',
      label: 'Show login form',
      position: { x: 50, y: 300 },
      size: { width: 120, height: 60 },
      style: {
        fillColor: '#f3e5f5',
        strokeColor: '#4a148c',
        strokeWidth: 2,
        fontSize: 12,
        fontColor: '#4a148c'
      }
    });

    const dashboardResult = await client.callTool('add_shape', {
      diagramId,
      type: 'rectangle',
      label: 'Show dashboard',
      position: { x: 300, y: 300 },
      size: { width: 120, height: 60 },
      style: {
        fillColor: '#e8f5e8',
        strokeColor: '#1b5e20',
        strokeWidth: 2,
        fontSize: 12,
        fontColor: '#1b5e20'
      }
    });
    console.log('✅ Process nodes added');

    // Add end shape
    console.log('\n🔴 Adding end node...');
    const endResult = await client.callTool('add_shape', {
      diagramId,
      type: 'ellipse',
      label: 'End',
      position: { x: 200, y: 400 },
      size: { width: 100, height: 60 },
      style: {
        fillColor: '#ffebee',
        strokeColor: '#c62828',
        strokeWidth: 2,
        fontSize: 14,
        fontColor: '#c62828'
      }
    });
    console.log('✅ End node added');

    // Add connections
    console.log('\n🔗 Adding connections...');
    
    // Start to Decision
    await client.callTool('add_connection', {
      diagramId,
      sourceId: startResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      targetId: decisionResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      label: 'Begin'
    });

    // Decision to Login (No)
    await client.callTool('add_connection', {
      diagramId,
      sourceId: decisionResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      targetId: loginResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      label: 'No',
      style: {
        strokeColor: '#e65100',
        strokeWidth: 2
      }
    });

    // Decision to Dashboard (Yes)
    await client.callTool('add_connection', {
      diagramId,
      sourceId: decisionResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      targetId: dashboardResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      label: 'Yes',
      style: {
        strokeColor: '#e65100',
        strokeWidth: 2
      }
    });

    // Login to End
    await client.callTool('add_connection', {
      diagramId,
      sourceId: loginResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      targetId: endResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      label: 'After login'
    });

    // Dashboard to End
    await client.callTool('add_connection', {
      diagramId,
      sourceId: dashboardResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      targetId: endResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1],
      label: 'Continue'
    });

    console.log('✅ Connections added');

    // Apply automatic layout
    console.log('\n📐 Applying automatic layout...');
    await client.callTool('apply_layout', {
      diagramId,
      algorithm: 'hierarchical',
      options: {
        direction: 'top-down',
        levelSeparation: 120,
        nodeSeparation: 80
      }
    });
    console.log('✅ Layout applied');

    // Analyze the diagram
    console.log('\n📊 Analyzing diagram...');
    const analysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'metrics'
    });
    console.log('📈 Analysis results:', analysis.content[0].text);

    // Export to draw.io format
    console.log('\n💾 Exporting to draw.io format...');
    const exportResult = await client.callTool('export_diagram', {
      diagramId,
      format: 'drawio'
    });
    
    console.log('✅ Export completed');
    console.log('\n📄 Draw.io XML:');
    console.log(exportResult.content[1].text);

    // Export to Mermaid
    console.log('\n🌊 Exporting to Mermaid format...');
    const mermaidResult = await client.callTool('export_diagram', {
      diagramId,
      format: 'mermaid'
    });
    
    console.log('✅ Mermaid export completed');
    console.log('\n📄 Mermaid diagram:');
    console.log(mermaidResult.content[1].text);

    console.log('\n🎉 Basic flowchart created successfully!');
    console.log('\nYou can:');
    console.log('1. Copy the draw.io XML and paste it into draw.io');
    console.log('2. Copy the Mermaid code and use it in Mermaid-compatible tools');
    console.log('3. Use the diagram ID to make further modifications');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.disconnect();
  }
}

// Run the example
createBasicFlowchart();
