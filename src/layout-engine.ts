import { Flowchart, FlowchartNode, FlowchartEdge, FlowchartOptions } from './types.js';

export class LayoutEngine {
  private static readonly DEFAULT_OPTIONS: Required<FlowchartOptions> = {
    direction: 'vertical',
    spacing: {
      horizontal: 200,
      vertical: 100
    },
    nodeSize: {
      width: 120,
      height: 60
    },
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      textColor: '#000000'
    }
  };

  layoutFlowchart(
    nodes: Array<{ type: FlowchartNode['type']; label: string; id?: string }>,
    connections: Array<{ from: string; to: string; label?: string }>,
    options: FlowchartOptions = {}
  ): Flowchart {
    const opts = { ...LayoutEngine.DEFAULT_OPTIONS, ...options };
    
    // Generate IDs for nodes that don't have them
    const nodesWithIds = nodes.map((node, index) => ({
      ...node,
      id: node.id || `node_${index}`
    }));

    // Create node map for easy lookup
    const nodeMap = new Map(nodesWithIds.map(node => [node.id, node]));

    // Validate connections
    const validConnections = connections.filter(conn => 
      nodeMap.has(conn.from) && nodeMap.has(conn.to)
    );

    // Create flowchart nodes with positions
    const flowchartNodes = this.positionNodes(nodesWithIds, validConnections, opts);
    
    // Create flowchart edges
    const flowchartEdges = validConnections.map((conn, index) => ({
      id: `edge_${index}`,
      source: conn.from,
      target: conn.to,
      label: conn.label,
      style: undefined
    }));

    // Calculate total dimensions
    const bounds = this.calculateBounds(flowchartNodes);
    
    return {
      nodes: flowchartNodes,
      edges: flowchartEdges,
      width: bounds.width + opts.spacing.horizontal,
      height: bounds.height + opts.spacing.vertical
    };
  }

  private positionNodes(
    nodes: Array<{ type: FlowchartNode['type']; label: string; id: string }>,
    connections: Array<{ from: string; to: string; label?: string }>,
    options: Required<FlowchartOptions>
  ): FlowchartNode[] {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const flowchartNodes: FlowchartNode[] = [];
    
    // Find start nodes (nodes with no incoming connections)
    const startNodes = nodes.filter(node => 
      !connections.some(conn => conn.to === node.id)
    );

    // If no clear start nodes, use the first node
    const rootNodes = startNodes.length > 0 ? startNodes : [nodes[0]];

    // Create adjacency list
    const adjacencyList = new Map<string, string[]>();
    connections.forEach(conn => {
      if (!adjacencyList.has(conn.from)) {
        adjacencyList.set(conn.from, []);
      }
      adjacencyList.get(conn.from)!.push(conn.to);
    });

    // Position nodes using a simple layered layout
    const visited = new Set<string>();
    const layers: string[][] = [];
    
    // BFS to create layers
    const queue = rootNodes.map(node => ({ node: node.id, layer: 0 }));
    const nodeToLayer = new Map<string, number>();
    
    while (queue.length > 0) {
      const { node, layer } = queue.shift()!;
      
      if (visited.has(node)) continue;
      visited.add(node);
      
      if (!layers[layer]) layers[layer] = [];
      layers[layer].push(node);
      nodeToLayer.set(node, layer);
      
      const children = adjacencyList.get(node) || [];
      children.forEach(child => {
        if (!visited.has(child)) {
          queue.push({ node: child, layer: layer + 1 });
        }
      });
    }

    // Position nodes in each layer
    layers.forEach((layerNodes, layerIndex) => {
      const layerWidth = layerNodes.length * (options.nodeSize.width + options.spacing.horizontal);
      const startX = -layerWidth / 2;
      
      layerNodes.forEach((nodeId, nodeIndex) => {
        const node = nodeMap.get(nodeId)!;
        const x = startX + nodeIndex * (options.nodeSize.width + options.spacing.horizontal);
        const y = layerIndex * (options.nodeSize.height + options.spacing.vertical);
        
        flowchartNodes.push({
          id: nodeId,
          type: node.type,
          label: node.label,
          x,
          y,
          width: options.nodeSize.width,
          height: options.nodeSize.height,
          style: this.getNodeStyle(node.type, options)
        });
      });
    });

    return flowchartNodes;
  }

  private getNodeStyle(type: FlowchartNode['type'], options: Required<FlowchartOptions>): string {
    const baseStyle = `fillColor=${options.style.backgroundColor};strokeColor=${options.style.borderColor};fontColor=${options.style.textColor};`;
    
    switch (type) {
      case 'start':
        return `${baseStyle}ellipse;whiteSpace=wrap;html=1;aspect=fixed;`;
      case 'end':
        return `${baseStyle}ellipse;whiteSpace=wrap;html=1;aspect=fixed;`;
      case 'decision':
        return `${baseStyle}rhombus;whiteSpace=wrap;html=1;`;
      case 'input':
      case 'output':
        return `${baseStyle}shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;`;
      case 'connector':
        return `${baseStyle}ellipse;whiteSpace=wrap;html=1;aspect=fixed;`;
      default:
        return `${baseStyle}rounded=1;whiteSpace=wrap;html=1;`;
    }
  }

  private calculateBounds(nodes: FlowchartNode[]): { width: number; height: number } {
    if (nodes.length === 0) return { width: 0, height: 0 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });
    
    return {
      width: maxX - minX,
      height: maxY - minY
    };
  }
}
