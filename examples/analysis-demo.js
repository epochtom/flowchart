#!/usr/bin/env node

/**
 * Analysis Demo Example
 * 
 * This example demonstrates the various analysis capabilities of the MCP server,
 * including complexity analysis, connectivity analysis, and diagram metrics.
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

async function createAnalysisDemo() {
  const client = new MCPClient();
  
  try {
    console.log('🚀 Connecting to MCP server...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Create a complex diagram for analysis
    console.log('\n📊 Creating complex diagram for analysis...');
    const createResult = await client.callTool('create_diagram', {
      name: 'Analysis Demo Diagram',
      description: 'A complex diagram designed to demonstrate analysis capabilities'
    });
    
    const diagramId = createResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1];
    console.log('✅ Diagram created with ID:', diagramId);

    // Create a complex network with cycles and multiple paths
    const shapes = [
      { id: 'A', type: 'rectangle', label: 'Start A', x: 100, y: 100 },
      { id: 'B', type: 'diamond', label: 'Decision B', x: 200, y: 100 },
      { id: 'C', type: 'rectangle', label: 'Process C', x: 300, y: 50 },
      { id: 'D', type: 'rectangle', label: 'Process D', x: 300, y: 150 },
      { id: 'E', type: 'diamond', label: 'Decision E', x: 400, y: 100 },
      { id: 'F', type: 'rectangle', label: 'Process F', x: 500, y: 50 },
      { id: 'G', type: 'rectangle', label: 'Process G', x: 500, y: 150 },
      { id: 'H', type: 'rectangle', label: 'Process H', x: 600, y: 100 },
      { id: 'I', type: 'diamond', label: 'Decision I', x: 700, y: 100 },
      { id: 'J', type: 'rectangle', label: 'End J', x: 800, y: 100 },
      
      // Additional nodes for complexity
      { id: 'K', type: 'rectangle', label: 'Process K', x: 200, y: 200 },
      { id: 'L', type: 'rectangle', label: 'Process L', x: 300, y: 200 },
      { id: 'M', type: 'rectangle', label: 'Process M', x: 400, y: 200 },
      { id: 'N', type: 'rectangle', label: 'Process N', x: 500, y: 200 },
      { id: 'O', type: 'rectangle', label: 'Process O', x: 600, y: 200 }
    ];

    console.log('\n🔧 Adding shapes...');
    const shapeIds = {};
    
    for (const shape of shapes) {
      const result = await client.callTool('add_shape', {
        diagramId,
        type: shape.type,
        label: shape.label,
        position: { x: shape.x, y: shape.y },
        size: { width: 100, height: 60 },
        style: {
          fillColor: '#e3f2fd',
          strokeColor: '#1976d2',
          strokeWidth: 2
        }
      });
      
      const shapeId = result.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1];
      shapeIds[shape.id] = shapeId;
    }

    // Create a complex network with cycles
    const connections = [
      // Main path
      ['A', 'B', 'Start'],
      ['B', 'C', 'Path 1'],
      ['B', 'D', 'Path 2'],
      ['C', 'E', 'Continue'],
      ['D', 'E', 'Continue'],
      ['E', 'F', 'Option 1'],
      ['E', 'G', 'Option 2'],
      ['F', 'H', 'Process'],
      ['G', 'H', 'Process'],
      ['H', 'I', 'Decision'],
      ['I', 'J', 'End'],
      
      // Cycles
      ['E', 'B', 'Loop Back'],
      ['I', 'E', 'Retry'],
      
      // Parallel branches
      ['B', 'K', 'Parallel 1'],
      ['K', 'L', 'Continue'],
      ['L', 'M', 'Continue'],
      ['M', 'N', 'Continue'],
      ['N', 'O', 'Continue'],
      ['O', 'H', 'Merge'],
      
      // Cross connections
      ['C', 'L', 'Cross'],
      ['D', 'M', 'Cross'],
      ['F', 'N', 'Cross'],
      ['G', 'O', 'Cross']
    ];

    console.log('\n🔗 Adding connections...');
    for (const [source, target, label] of connections) {
      if (shapeIds[source] && shapeIds[target]) {
        await client.callTool('add_connection', {
          diagramId,
          sourceId: shapeIds[source],
          targetId: shapeIds[target],
          label,
          style: {
            strokeColor: '#666666',
            strokeWidth: 2
          }
        });
      }
    }

    console.log('✅ Complex diagram created');

    // Perform various analyses
    console.log('\n📊 Performing comprehensive analysis...');

    // 1. Complexity Analysis
    console.log('\n🔍 1. Complexity Analysis');
    const complexityAnalysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'complexity'
    });
    console.log('📈 Complexity Results:');
    console.log(complexityAnalysis.content[0].text);

    // 2. Connectivity Analysis
    console.log('\n🔍 2. Connectivity Analysis');
    const connectivityAnalysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'connectivity'
    });
    console.log('📈 Connectivity Results:');
    console.log(connectivityAnalysis.content[0].text);

    // 3. Hierarchy Analysis
    console.log('\n🔍 3. Hierarchy Analysis');
    const hierarchyAnalysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'hierarchy'
    });
    console.log('📈 Hierarchy Results:');
    console.log(hierarchyAnalysis.content[0].text);

    // 4. Cycle Detection
    console.log('\n🔍 4. Cycle Detection');
    const cycleAnalysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'cycles'
    });
    console.log('📈 Cycle Results:');
    console.log(cycleAnalysis.content[0].text);

    // 5. Path Analysis
    console.log('\n🔍 5. Path Analysis');
    const pathAnalysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'paths'
    });
    console.log('📈 Path Results:');
    console.log(pathAnalysis.content[0].text);

    // 6. Cluster Analysis
    console.log('\n🔍 6. Cluster Analysis');
    const clusterAnalysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'clusters'
    });
    console.log('📈 Cluster Results:');
    console.log(clusterAnalysis.content[0].text);

    // 7. Comprehensive Metrics
    console.log('\n🔍 7. Comprehensive Metrics');
    const metricsAnalysis = await client.callTool('analyze_diagram', {
      diagramId,
      analysisType: 'metrics'
    });
    console.log('📈 Complete Metrics:');
    console.log(metricsAnalysis.content[0].text);

    // Test different layout algorithms
    console.log('\n📐 Testing different layout algorithms...');

    const layouts = [
      { name: 'Hierarchical', algorithm: 'hierarchical', options: { direction: 'top-down' } },
      { name: 'Force-Directed', algorithm: 'force-directed', options: { iterations: 50 } },
      { name: 'Circular', algorithm: 'circular', options: { radius: 200 } },
      { name: 'Grid', algorithm: 'grid', options: { columns: 5 } }
    ];

    for (const layout of layouts) {
      console.log(`\n🔄 Applying ${layout.name} layout...`);
      
      // Clone diagram for each layout
      const cloneResult = await client.callTool('clone_diagram', {
        diagramId,
        newName: `Analysis Demo - ${layout.name} Layout`
      });
      
      const cloneId = cloneResult.content[0].text.match(/ID: ([a-f0-9-]+)/)?.[1];
      
      // Apply layout
      await client.callTool('apply_layout', {
        diagramId: cloneId,
        algorithm: layout.algorithm,
        options: layout.options
      });
      
      // Analyze the layout
      const layoutAnalysis = await client.callTool('analyze_diagram', {
        diagramId: cloneId,
        analysisType: 'metrics'
      });
      
      console.log(`✅ ${layout.name} layout applied and analyzed`);
    }

    // Test shape finding capabilities
    console.log('\n🔍 Testing shape finding capabilities...');

    // Find all decision shapes
    const decisionShapes = await client.callTool('find_shapes', {
      diagramId,
      criteria: { type: 'diamond' }
    });
    console.log('🔷 Decision shapes:', decisionShapes.content[0].text);

    // Find shapes in a specific area
    const areaShapes = await client.callTool('find_shapes', {
      diagramId,
      criteria: { 
        area: { x: 0, y: 0, width: 400, height: 200 }
      }
    });
    console.log('📍 Shapes in area:', areaShapes.content[0].text);

    // Find shapes with specific labels
    const processShapes = await client.callTool('find_shapes', {
      diagramId,
      criteria: { label: 'Process' }
    });
    console.log('⚙️ Process shapes:', processShapes.content[0].text);

    // Export analysis results
    console.log('\n💾 Exporting analysis results...');
    
    const exportResult = await client.callTool('export_diagram', {
      diagramId,
      format: 'mermaid'
    });
    
    console.log('📄 Mermaid representation:');
    console.log(exportResult.content[1].text);

    // List all created diagrams
    console.log('\n📋 All created diagrams:');
    const listResult = await client.callTool('list_diagrams', {});
    console.log(listResult.content[0].text);

    console.log('\n🎉 Analysis demo completed successfully!');
    console.log('\nThis demo showcased:');
    console.log('• Complexity analysis and metrics');
    console.log('• Connectivity and graph analysis');
    console.log('• Hierarchy and structure analysis');
    console.log('• Cycle detection and analysis');
    console.log('• Path analysis and statistics');
    console.log('• Cluster identification');
    console.log('• Multiple layout algorithms');
    console.log('• Shape searching and filtering');
    console.log('• Comprehensive diagram metrics');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.disconnect();
  }
}

// Run the example
createAnalysisDemo();
