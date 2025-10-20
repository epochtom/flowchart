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
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Define the flowchart node schema
const FlowchartNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'process', 'decision', 'end', 'math', 'loop', 'input', 'output']),
  label: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Define the flowchart edge schema
const FlowchartEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  type: z.enum(['normal', 'loop', 'feedback', 'connector']).optional(),
  curve: z.boolean().optional(),
  connector: z.object({
    id: z.string(),
    label: z.string().optional(),
  }).optional(),
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
  // Standard symbol dimensions following best practices
  private nodeWidth = 180;
  private nodeHeight = 60;
  private spacing = 150;  // Increased for better arrow clearance
  private levelSpacing = 180;  // Increased for better vertical spacing
  private mathNodeWidth = 250;
  private mathNodeHeight = 80;
  
  // Layout configuration for better structure
  private maxNodesPerLevel = 3;  // Reduced to prevent overcrowding
  private minSpacing = 150;  // Increased minimum spacing for better arrow clearance
  private groupSpacing = 80;  // Increased group spacing
  private arrowClearance = 80;  // Increased space reserved for arrows
  private loopClearance = 120;  // Extra space for loop arrows

  // Utility function to escape XML characters
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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

    // Start with XML declaration and proper SVG structure
    let svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
    svg += `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n`;
    
    // Add definitions section first (required for draw.io compatibility)
    svg += '  <defs>\n';
    // Standard arrow for normal flow
    svg += '    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">\n';
    svg += '      <polygon points="0 0, 10 3.5, 0 7" fill="#2c3e50" stroke="#2c3e50" stroke-width="1"/>\n';
    svg += '    </marker>\n';
    // Loop arrow for feedback
    svg += '    <marker id="loop-arrow" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">\n';
    svg += '      <polygon points="0 0, 12 4, 0 8" fill="#e74c3c" stroke="#e74c3c" stroke-width="1"/>\n';
    svg += '    </marker>\n';
    // Dashed arrow for alternative paths
    svg += '    <marker id="dashed-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">\n';
    svg += '      <polygon points="0 0, 10 3.5, 0 7" fill="#7f8c8d" stroke="#7f8c8d" stroke-width="1"/>\n';
    svg += '    </marker>\n';
    svg += '  </defs>\n';
    
    // Add title if provided
    if (title) {
      svg += `  <text x="${width / 2}" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${this.escapeXml(title)}</text>\n`;
    }

    // Add edges first (so they appear behind nodes)
    for (const edge of edges) {
      const fromNode = positionedNodes.find(n => n.id === edge.from);
      const toNode = positionedNodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        const fromWidth = fromNode.width || (fromNode.type === 'math' ? this.mathNodeWidth : this.nodeWidth);
        const fromHeight = fromNode.height || (fromNode.type === 'math' ? this.mathNodeHeight : this.nodeHeight);
        const toWidth = toNode.width || (toNode.type === 'math' ? this.mathNodeWidth : this.nodeWidth);
        const toHeight = toNode.height || (toNode.type === 'math' ? this.mathNodeHeight : this.nodeHeight);
        
        const fromX = (fromNode.x || 0) + fromWidth / 2;
        const fromY = (fromNode.y || 0) + fromHeight;
        const toX = (toNode.x || 0) + toWidth / 2;
        const toY = (toNode.y || 0);
        
        // Use improved edge routing for better clarity
        const path = this.calculateEdgePath(fromNode, toNode, edge);
        let strokeColor = '#2c3e50';
        let strokeWidth = '2';
        let strokeDasharray = 'none';
        let markerEnd = 'url(#arrowhead)';
        
        // Handle different edge types with appropriate styling
        if (edge.type === 'loop' || edge.type === 'feedback') {
          strokeColor = '#e74c3c';
          strokeWidth = '3';
          markerEnd = 'url(#loop-arrow)';
        } else if (edge.type === 'connector') {
          strokeColor = '#95a5a6';
          strokeWidth = '1.5';
          strokeDasharray = '3,3';
          markerEnd = 'url(#dashed-arrow)';
        } else if (edge.type === 'normal') {
          strokeColor = '#2c3e50';
          strokeWidth = '2';
          markerEnd = 'url(#arrowhead)';
        } else {
          // Alternative paths
          strokeColor = '#7f8c8d';
          strokeWidth = '2';
          strokeDasharray = '5,5';
          markerEnd = 'url(#dashed-arrow)';
        }
        
        // Draw arrow path with appropriate styling
        svg += `  <path d="${path}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-dasharray="${strokeDasharray}" marker-end="${markerEnd}"/>\n`;
        
        // Add edge label if provided with improved positioning
        if (edge.label) {
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;
          
          // Position labels based on edge type for better readability
          let labelY = midY - 5;
          let fontSize = '11';
          let fontWeight = 'normal';
          
          if (edge.type === 'loop' || edge.type === 'feedback') {
            labelY = midY - 25;
            fontSize = '10';
            fontWeight = 'bold';
          } else if (edge.type === 'normal') {
            labelY = midY - 8;
            fontSize = '11';
          } else {
            labelY = midY - 5;
            fontSize = '10';
            fontWeight = 'italic';
          }
          
          // Add background for better readability
          svg += `  <rect x="${midX - 15}" y="${labelY - 12}" width="30" height="16" fill="white" stroke="none" rx="3"/>\n`;
          svg += `  <text x="${midX}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${strokeColor}">${this.escapeXml(edge.label)}</text>\n`;
        }
      }
    }

    // Add nodes
    for (const node of positionedNodes) {
      const x = node.x || 0;
      const y = node.y || 0;
      const width = node.width || (node.type === 'math' ? this.mathNodeWidth : this.nodeWidth);
      const height = node.height || (node.type === 'math' ? this.mathNodeHeight : this.nodeHeight);
      
      let shape = '';
      let textY = y + height / 2;
      let fontSize = '12';
      
      // Adjust font size for math nodes
      if (node.type === 'math') {
        fontSize = '10';
      }
      
      switch (node.type) {
        case 'start':
        case 'end':
          // Ellipse
          shape = `  <ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2}" ry="${height / 2}" fill="#e1f5fe" stroke="#01579b" stroke-width="2"/>\n`;
          break;
        case 'decision':
          // Diamond
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const halfWidth = width / 2;
          const halfHeight = height / 2;
          shape = `  <polygon points="${centerX},${y} ${x + width},${centerY} ${centerX},${y + height} ${x},${centerY}" fill="#fff3e0" stroke="#e65100" stroke-width="2"/>\n`;
          break;
        case 'math':
          // Rectangle with different styling for mathematical content
          shape = `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#f8f9fa" stroke="#6c757d" stroke-width="2" rx="8"/>\n`;
          break;
        case 'loop':
          // Rounded rectangle for loop indicators
          shape = `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#fff2cc" stroke="#d6b656" stroke-width="2" rx="15"/>\n`;
          break;
        case 'input':
        case 'output':
          // Parallelogram for input/output
          const skew = 20;
          const points = `${x + skew},${y} ${x + width},${y} ${x + width - skew},${y + height} ${x},${y + height}`;
          shape = `  <polygon points="${points}" fill="#e8f5e8" stroke="#2e7d32" stroke-width="2"/>\n`;
          break;
        case 'process':
        default:
          // Rectangle
          shape = `  <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#f3e5f5" stroke="#4a148c" stroke-width="2" rx="5"/>\n`;
          break;
      }
      
      svg += shape;
      
      // Handle text wrapping for better clarity and readability
      const words = node.label.split(' ');
      let maxWordsPerLine = 6;
      
      // Adjust line length based on node type for better readability
      switch (node.type) {
        case 'math':
          maxWordsPerLine = 6;
          break;
        case 'decision':
          maxWordsPerLine = 4;
          break;
        case 'input':
        case 'output':
          maxWordsPerLine = 5;
          break;
        case 'process':
        default:
          maxWordsPerLine = 6;
          break;
      }
      
      const lines = [];
      for (let i = 0; i < words.length; i += maxWordsPerLine) {
        const line = words.slice(i, i + maxWordsPerLine).join(' ');
        // Ensure lines don't get too long
        if (line.length > 25) {
          lines.push(line.substring(0, 22) + '...');
        } else {
          lines.push(line);
        }
      }
      
      const lineHeight = parseInt(fontSize) + 2;
      const startY = textY - ((lines.length - 1) * lineHeight) / 2;
      
      for (let i = 0; i < lines.length; i++) {
        const lineY = startY + (i * lineHeight);
        svg += `  <text x="${x + width / 2}" y="${lineY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#333">${this.escapeXml(lines[i])}</text>\n`;
      }
    }

    svg += '</svg>';
    return svg;
  }

  generateDrawIO(flowchart: Flowchart): string {
    const { nodes, edges, title } = flowchart;
    
    // Auto-layout nodes if positions not provided
    const positionedNodes = this.autoLayout(nodes, edges);
    
    // Apply additional spacing adjustments for complex flowcharts
    const adjustedNodes = this.adjustSpacingForComplexFlowcharts(positionedNodes, edges);
    
    // Calculate canvas dimensions using adjusted nodes
    const padding = 40;
    const maxX = Math.max(...adjustedNodes.map(n => n.x || 0)) + this.nodeWidth;
    const maxY = Math.max(...adjustedNodes.map(n => n.y || 0)) + this.nodeHeight;
    const width = maxX + padding;
    const height = maxY + padding;

    let drawio = '<?xml version="1.0" encoding="UTF-8"?>\n';
    drawio += '<mxfile host="app.diagrams.net" modified="2024-01-01T00:00:00.000Z" agent="MCP-Flowchart-Server" version="1.0.0" etag="test" type="device">\n';
    drawio += '  <diagram name="Flowchart" id="flowchart">\n';
    drawio += `    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" math="0" shadow="0">\n`;
    drawio += '      <root>\n';
    drawio += '        <mxCell id="0"/>\n';
    drawio += '        <mxCell id="1" parent="0"/>\n';

    // Add title if provided
    if (title) {
      const titleX = width / 2;
      const titleY = 20;
      drawio += `        <mxCell id="title" value="${this.escapeXml(title)}" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">\n`;
      drawio += `          <mxGeometry x="${titleX - 50}" y="${titleY - 10}" width="100" height="20" as="geometry"/>\n`;
      drawio += '        </mxCell>\n';
    }

    // Add nodes using adjusted positions
    for (const node of adjustedNodes) {
      const x = node.x || 0;
      const y = node.y || 0;
      
      let style = '';
      let geometry = '';
      
      switch (node.type) {
        case 'start':
        case 'end':
          style = 'ellipse;whiteSpace=wrap;html=1;fillColor=#e1f5fe;strokeColor=#01579b;';
          geometry = `x="${x}" y="${y}" width="${this.nodeWidth}" height="${this.nodeHeight}"`;
          break;
        case 'decision':
          style = 'rhombus;whiteSpace=wrap;html=1;fillColor=#fff3e0;strokeColor=#e65100;';
          geometry = `x="${x}" y="${y}" width="${this.nodeWidth}" height="${this.nodeHeight}"`;
          break;
        case 'math':
          style = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f8f9fa;strokeColor=#6c757d;';
          geometry = `x="${x}" y="${y}" width="${this.mathNodeWidth}" height="${this.mathNodeHeight}"`;
          break;
        case 'loop':
          style = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;';
          geometry = `x="${x}" y="${y}" width="${this.nodeWidth}" height="${this.nodeHeight}"`;
          break;
        case 'input':
        case 'output':
          style = 'shape=parallelogram;whiteSpace=wrap;html=1;fillColor=#e8f5e8;strokeColor=#2e7d32;';
          geometry = `x="${x}" y="${y}" width="${this.nodeWidth}" height="${this.nodeHeight}"`;
          break;
        case 'process':
        default:
          style = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#f3e5f5;strokeColor=#4a148c;';
          geometry = `x="${x}" y="${y}" width="${this.nodeWidth}" height="${this.nodeHeight}"`;
          break;
      }
      
      drawio += `        <mxCell id="${node.id}" value="${this.escapeXml(node.label)}" style="${style}" vertex="1" parent="1">\n`;
      drawio += `          <mxGeometry ${geometry} as="geometry"/>\n`;
      drawio += '        </mxCell>\n';
    }

    // Add edges with improved routing to avoid overlaps
    for (const edge of edges) {
      const fromNode = adjustedNodes.find(n => n.id === edge.from);
      const toNode = adjustedNodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        const edgeId = `edge_${edge.from}_${edge.to}`;
        const edgeStyle = this.generateDrawIOEdgeStyle(edge, fromNode, toNode);
        
        drawio += `        <mxCell id="${edgeId}" value="${this.escapeXml(edge.label || '')}" style="${edgeStyle}" edge="1" parent="1" source="${edge.from}" target="${edge.to}">\n`;
        drawio += `          <mxGeometry width="50" height="50" relative="1" as="geometry">\n`;
        drawio += `            <mxPoint x="${(toNode.x || 0) + this.nodeWidth / 2}" y="${(toNode.y || 0)}" as="sourcePoint"/>\n`;
        drawio += `            <mxPoint x="${(fromNode.x || 0) + this.nodeWidth / 2}" y="${(fromNode.y || 0) + this.nodeHeight}" as="targetPoint"/>\n`;
        drawio += '          </mxGeometry>\n';
        drawio += '        </mxCell>\n';
      }
    }

    drawio += '      </root>\n';
    drawio += '    </mxGraphModel>\n';
    drawio += '  </diagram>\n';
    drawio += '</mxfile>';
    
    return drawio;
  }

  generateMermaid(flowchart: Flowchart): string {
    const { nodes, edges, title } = flowchart;
    
    let mermaid = 'flowchart TD\n';
    
    if (title) {
      mermaid += `    title ${title}\n`;
    }
    
    // Add nodes
    for (const node of nodes) {
      let shape = '';
      switch (node.type) {
        case 'start':
          shape = `[${node.label}]`;
          break;
        case 'end':
          shape = `[${node.label}]`;
          break;
        case 'decision':
          shape = `{${node.label}}`;
          break;
        case 'process':
        default:
          shape = `[${node.label}]`;
          break;
      }
      mermaid += `    ${node.id}${shape}\n`;
    }
    
    // Add edges
    for (const edge of edges) {
      const label = edge.label ? `|${edge.label}|` : '';
      mermaid += `    ${edge.from} -->${label} ${edge.to}\n`;
    }
    
    return mermaid;
  }

  private autoLayout(nodes: FlowchartNode[], edges: FlowchartEdge[]): FlowchartNode[] {
    // First, detect and handle loops to avoid overlaps
    const { nodes: adjustedNodes, edges: adjustedEdges } = this.detectAndHandleLoops(nodes, edges);
    const positionedNodes = [...adjustedNodes];
    const startNode = positionedNodes.find(n => n.type === 'start');
    
    if (!startNode) {
      // If no start node, position nodes in a logical grid following best practices
      const nodesPerRow = Math.min(this.maxNodesPerLevel, Math.ceil(Math.sqrt(positionedNodes.length)));
      positionedNodes.forEach((node, index) => {
        const row = Math.floor(index / nodesPerRow);
        const col = index % nodesPerRow;
        node.x = col * (this.nodeWidth + this.spacing) - (nodesPerRow - 1) * (this.nodeWidth + this.spacing) / 2;
        node.y = row * (this.nodeHeight + this.levelSpacing);
      });
      return positionedNodes;
    }

    // Build adjacency list for better flow analysis
    const adjacencyList = new Map<string, string[]>();
    const reverseAdjacencyList = new Map<string, string[]>();
    
    for (const edge of adjustedEdges) {
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

    // Position nodes in levels with better structure and grouping
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      const levelNodes = levels[levelIndex];
      
      // Group nodes by type for better visual organization
      const groupedNodes = this.groupNodesByType(levelNodes);
      
      let currentX = 0;
      const levelY = levelIndex * this.levelSpacing;
      
      for (const group of groupedNodes) {
        if (group.length === 0) continue;
        
        // Calculate group width with proper spacing
        const groupWidth = group.length * (this.nodeWidth + this.minSpacing) - this.minSpacing;
        const groupStartX = currentX - groupWidth / 2;
        
        for (let i = 0; i < group.length; i++) {
          const node = group[i];
          node.x = groupStartX + i * (this.nodeWidth + this.minSpacing);
          node.y = levelY;
        }
        
        // Add extra spacing for arrow clearance
        currentX += groupWidth + this.groupSpacing + this.arrowClearance;
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

  // Adjust spacing for complex flowcharts to prevent arrow overlaps
  private adjustSpacingForComplexFlowcharts(nodes: FlowchartNode[], edges: FlowchartEdge[]): FlowchartNode[] {
    const adjustedNodes = [...nodes];
    
    // Identify complex patterns that need extra spacing
    const loopEdges = edges.filter(edge => edge.type === 'loop' || edge.type === 'feedback');
    const decisionNodes = adjustedNodes.filter(node => node.type === 'decision');
    const processNodes = adjustedNodes.filter(node => node.type === 'process');
    
    // Increase spacing around decision nodes to prevent arrow overlaps
    decisionNodes.forEach(decisionNode => {
      const decisionX = decisionNode.x || 0;
      const decisionY = decisionNode.y || 0;
      
      // Find nodes that might interfere with decision arrows
      adjustedNodes.forEach(node => {
        if (node.id === decisionNode.id) return;
        
        const nodeX = node.x || 0;
        const nodeY = node.y || 0;
        
        // If node is too close to decision node, move it
        const distance = Math.sqrt(Math.pow(nodeX - decisionX, 2) + Math.pow(nodeY - decisionY, 2));
        if (distance < this.nodeWidth * 1.5) {
          // Move node to provide more clearance
          const angle = Math.atan2(nodeY - decisionY, nodeX - decisionX);
          const newDistance = this.nodeWidth * 2;
          node.x = decisionX + Math.cos(angle) * newDistance;
          node.y = decisionY + Math.sin(angle) * newDistance;
        }
      });
    });
    
    // Handle loop edges with extra clearance
    loopEdges.forEach(loopEdge => {
      const fromNode = adjustedNodes.find(n => n.id === loopEdge.from);
      const toNode = adjustedNodes.find(n => n.id === loopEdge.to);
      
      if (fromNode && toNode) {
        const fromX = fromNode.x || 0;
        const fromY = fromNode.y || 0;
        const toX = toNode.x || 0;
        const toY = toNode.y || 0;
        
        // Create a clear path for the loop arrow
        const centerX = (fromX + toX) / 2;
        const centerY = (fromY + toY) / 2;
        const loopRadius = Math.max(this.loopClearance, Math.abs(toX - fromX) / 2 + 50);
        
        // Move any nodes that might interfere with the loop path
        adjustedNodes.forEach(node => {
          if (node.id === fromNode.id || node.id === toNode.id) return;
          
          const nodeX = node.x || 0;
          const nodeY = node.y || 0;
          
          // Check if node is in the loop path area
          const distanceFromCenter = Math.sqrt(Math.pow(nodeX - centerX, 2) + Math.pow(nodeY - centerY, 2));
          if (distanceFromCenter < loopRadius) {
            // Move node outside the loop path
            const angle = Math.atan2(nodeY - centerY, nodeX - centerX);
            node.x = centerX + Math.cos(angle) * (loopRadius + this.nodeWidth);
            node.y = centerY + Math.sin(angle) * (loopRadius + this.nodeWidth);
          }
        });
      }
    });
    
    return adjustedNodes;
  }

  // Detect loop patterns and adjust layout accordingly
  private detectAndHandleLoops(nodes: FlowchartNode[], edges: FlowchartEdge[]): { nodes: FlowchartNode[], edges: FlowchartEdge[] } {
    const loopEdges = edges.filter(edge => edge.type === 'loop' || edge.type === 'feedback');
    const adjustedNodes = [...nodes];
    const adjustedEdges = [...edges];
    
    // For each loop edge, ensure there's enough clearance
    loopEdges.forEach(loopEdge => {
      const fromNode = adjustedNodes.find(n => n.id === loopEdge.from);
      const toNode = adjustedNodes.find(n => n.id === loopEdge.to);
      
      if (fromNode && toNode) {
        // Add extra spacing for loop arrows
        const fromY = fromNode.y || 0;
        const toY = toNode.y || 0;
        const minY = Math.min(fromY, toY);
        
        // Adjust nodes that might interfere with the loop
        adjustedNodes.forEach(node => {
          if (node.y !== undefined && node.y > minY && node.y < Math.max(fromY, toY)) {
            // Move interfering nodes to the side
            const currentX = node.x || 0;
            const fromX = fromNode.x || 0;
            const toX = toNode.x || 0;
            const centerX = (fromX + toX) / 2;
            
            if (Math.abs(currentX - centerX) < this.nodeWidth * 2) {
              // Move node to the side to avoid loop path
              node.x = centerX + (currentX > centerX ? this.loopClearance : -this.loopClearance);
            }
          }
        });
      }
    });
    
    return { nodes: adjustedNodes, edges: adjustedEdges };
  }

  // Group nodes by type for better visual organization
  private groupNodesByType(nodes: FlowchartNode[]): FlowchartNode[][] {
    const groups: { [key: string]: FlowchartNode[] } = {
      start: [],
      input: [],
      process: [],
      decision: [],
      math: [],
      loop: [],
      output: [],
      end: []
    };

    nodes.forEach(node => {
      if (groups[node.type]) {
        groups[node.type].push(node);
      } else {
        groups.process.push(node); // Default to process group
      }
    });

    // Return groups in logical order
    return [
      groups.start,
      groups.input,
      groups.process,
      groups.math,
      groups.decision,
      groups.loop,
      groups.output,
      groups.end
    ].filter(group => group.length > 0);
  }

  // Generate Draw.io edge style with improved routing to avoid overlaps
  private generateDrawIOEdgeStyle(edge: FlowchartEdge, fromNode: FlowchartNode, toNode: FlowchartNode): string {
    const fromX = (fromNode.x || 0) + this.nodeWidth / 2;
    const fromY = (fromNode.y || 0) + this.nodeHeight;
    const toX = (toNode.x || 0) + this.nodeWidth / 2;
    const toY = (toNode.y || 0);
    
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Base style for all edges
    let style = 'endArrow=classic;html=1;rounded=0;';
    
    // Handle different edge types with appropriate routing
    if (edge.type === 'loop' || edge.type === 'feedback') {
      // Curved path for loops with better control points
      const controlY = Math.min(fromY, toY) - 120; // Increased clearance
      const offsetX = Math.max(100, Math.abs(deltaX) / 2 + 50); // Increased offset
      const controlX1 = fromX + (deltaX > 0 ? offsetX : -offsetX);
      const controlX2 = toX + (deltaX > 0 ? offsetX : -offsetX);
      
      style += `curved=1;curvature=0.3;`;
      style += `exitX=0.5;exitY=1;exitDx=0;exitDy=0;`;
      style += `entryX=0.5;entryY=0;entryDx=0;entryDy=0;`;
      style += `strokeColor=#e74c3c;strokeWidth=3;`;
    } else if (edge.type === 'connector') {
      // Dashed line for connectors
      style += `dashed=1;dashPattern=5 5;`;
      style += `exitX=0.5;exitY=1;exitDx=0;exitDy=0;`;
      style += `entryX=0.5;entryY=0;entryDx=0;entryDy=0;`;
      style += `strokeColor=#95a5a6;strokeWidth=2;`;
    } else if (edge.type === 'parallel') {
      // Special styling for parallel processes
      style += `exitX=0.5;exitY=1;exitDx=0;exitDy=0;`;
      style += `entryX=0.5;entryY=0;entryDx=0;entryDy=0;`;
      style += `strokeColor=#3498db;strokeWidth=2;`;
    } else {
      // Normal edges with improved routing
      if (Math.abs(deltaX) < this.nodeWidth && deltaY > 0) {
        // Direct vertical connection for aligned nodes
        style += `exitX=0.5;exitY=1;exitDx=0;exitDy=0;`;
        style += `entryX=0.5;entryY=0;entryDx=0;entryDy=0;`;
      } else if (Math.abs(deltaX) > this.nodeWidth) {
        // L-shaped path to avoid crossings
        style += `exitX=0.5;exitY=1;exitDx=0;exitDy=0;`;
        style += `entryX=0.5;entryY=0;entryDx=0;entryDy=0;`;
        style += `orthogonal=1;`;
      } else if (deltaY < 0) {
        // Upward connection - use curved path
        style += `curved=1;curvature=0.2;`;
        style += `exitX=0.5;exitY=0;exitDx=0;exitDy=0;`;
        style += `entryX=0.5;entryY=1;entryDx=0;entryDy=0;`;
      } else {
        // Direct diagonal connection for nearby nodes
        style += `exitX=0.5;exitY=1;exitDx=0;exitDy=0;`;
        style += `entryX=0.5;entryY=0;entryDx=0;entryDy=0;`;
      }
      style += `strokeColor=#2c3e50;strokeWidth=2;`;
    }
    
    return style;
  }

  // Improve edge routing to minimize crossings and improve clarity
  private calculateEdgePath(fromNode: FlowchartNode, toNode: FlowchartNode, edge: FlowchartEdge): string {
    const fromWidth = fromNode.width || this.nodeWidth;
    const fromHeight = fromNode.height || this.nodeHeight;
    const toWidth = toNode.width || this.nodeWidth;
    const toHeight = toNode.height || this.nodeHeight;
    
    // Calculate connection points on shape edges
    const fromX = (fromNode.x || 0) + fromWidth / 2;
    const fromY = (fromNode.y || 0) + fromHeight;
    const toX = (toNode.x || 0) + toWidth / 2;
    const toY = (toNode.y || 0);
    
    const deltaY = toY - fromY;
    const deltaX = toX - fromX;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Handle different edge types with improved routing
    if (edge.type === 'loop' || edge.type === 'feedback') {
      // Create smooth curved path for loops with better control points
      const controlY = Math.min(fromY, toY) - 100;  // Increased clearance
      const offsetX = Math.max(80, Math.abs(deltaX) / 2);  // Increased offset
      const controlX1 = fromX + (deltaX > 0 ? offsetX : -offsetX);
      const controlX2 = toX + (deltaX > 0 ? offsetX : -offsetX);
      return `M ${fromX} ${fromY} Q ${controlX1} ${controlY} ${controlX2} ${controlY} Q ${controlX2} ${controlY} ${toX} ${toY}`;
    } else if (edge.type === 'connector') {
      // Use connector for long paths - simplified straight line
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else if (Math.abs(deltaX) < Math.max(fromWidth, toWidth) && deltaY > 0) {
      // Direct vertical connection for aligned nodes
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else if (Math.abs(deltaX) > Math.max(fromWidth, toWidth)) {
      // L-shaped path to avoid crossings with proper spacing
      const midY = fromY + deltaY / 2;
      const spacing = Math.max(30, Math.min(60, Math.abs(deltaX) / 3));  // Increased spacing
      return `M ${fromX} ${fromY} L ${fromX} ${midY - spacing} L ${toX} ${midY - spacing} L ${toX} ${toY}`;
    } else if (deltaY < 0) {
      // Upward connection - use curved path with more clearance
      const controlY = Math.min(fromY, toY) - 60;  // Increased clearance
      const controlX = (fromX + toX) / 2;
      return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
    } else if (distance < 100) {
      // Very close nodes - use curved path to avoid overlap
      const controlY = (fromY + toY) / 2;
      const controlX = (fromX + toX) / 2 + (deltaX > 0 ? 30 : -30);
      return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
    } else {
      // Direct diagonal connection for nearby nodes
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }
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
        description: 'Create a flowchart in multiple formats (SVG, draw.io, Mermaid)',
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
                        enum: ['start', 'process', 'decision', 'end', 'math', 'loop', 'input', 'output'],
                        description: 'Type of the node (start, process, decision, end, math, loop)',
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
                      width: {
                        type: 'number',
                        description: 'Optional width (auto-calculated if not provided)',
                      },
                      height: {
                        type: 'number',
                        description: 'Optional height (auto-calculated if not provided)',
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
                      type: {
                        type: 'string',
                        enum: ['normal', 'loop', 'feedback', 'connector'],
                        description: 'Type of the edge (normal, loop, feedback)',
                      },
                      curve: {
                        type: 'boolean',
                        description: 'Whether to draw the edge as a curve',
                      },
                    },
                    required: ['from', 'to'],
                  },
                },
              },
              required: ['nodes', 'edges'],
            },
            format: {
              type: 'string',
              enum: ['svg', 'drawio', 'mermaid'],
              description: 'Output format for the flowchart (default: svg)',
              default: 'svg',
            },
          },
          required: ['flowchart'],
        },
      },
      {
        name: 'export_flowchart_file',
        description: 'Export flowchart as a file with VSCode-friendly format',
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
                        enum: ['start', 'process', 'decision', 'end', 'math', 'loop', 'input', 'output'],
                        description: 'Type of the node (start, process, decision, end, math, loop)',
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
                      width: {
                        type: 'number',
                        description: 'Optional width (auto-calculated if not provided)',
                      },
                      height: {
                        type: 'number',
                        description: 'Optional height (auto-calculated if not provided)',
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
                      type: {
                        type: 'string',
                        enum: ['normal', 'loop', 'feedback', 'connector'],
                        description: 'Type of the edge (normal, loop, feedback)',
                      },
                      curve: {
                        type: 'boolean',
                        description: 'Whether to draw the edge as a curve',
                      },
                    },
                    required: ['from', 'to'],
                  },
                },
              },
              required: ['nodes', 'edges'],
            },
            format: {
              type: 'string',
              enum: ['svg', 'drawio', 'mermaid'],
              description: 'Output format for the flowchart (default: svg)',
              default: 'svg',
            },
            filename: {
              type: 'string',
              description: 'Optional filename (without extension)',
            },
          },
          required: ['flowchart'],
        },
      },
      {
        name: 'write_flowchart_file',
        description: 'Write flowchart directly to file system (bypasses Cline write_to_file issues)',
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
                        enum: ['start', 'process', 'decision', 'end', 'math', 'loop', 'input', 'output'],
                        description: 'Type of the node (start, process, decision, end, math, loop)',
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
                      width: {
                        type: 'number',
                        description: 'Optional width (auto-calculated if not provided)',
                      },
                      height: {
                        type: 'number',
                        description: 'Optional height (auto-calculated if not provided)',
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
                      type: {
                        type: 'string',
                        enum: ['normal', 'loop', 'feedback', 'connector'],
                        description: 'Type of the edge (normal, loop, feedback)',
                      },
                      curve: {
                        type: 'boolean',
                        description: 'Whether to draw the edge as a curve',
                      },
                    },
                    required: ['from', 'to'],
                  },
                },
              },
              required: ['nodes', 'edges'],
            },
            format: {
              type: 'string',
              enum: ['svg', 'drawio', 'mermaid'],
              description: 'Output format for the flowchart (default: svg)',
              default: 'svg',
            },
            filename: {
              type: 'string',
              description: 'Filename (without extension)',
            },
            outputDir: {
              type: 'string',
              description: 'Output directory (default: current directory)',
              default: '.',
            },
          },
          required: ['flowchart', 'filename'],
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
      const { flowchart, format = 'svg' } = args as { flowchart: any; format?: string };
      
      // Validate the flowchart data
      const validatedFlowchart = FlowchartSchema.parse(flowchart);
      
      let output = '';
      let mimeType = 'text/plain';
      
      switch (format) {
        case 'drawio':
          output = flowchartGenerator.generateDrawIO(validatedFlowchart);
          mimeType = 'application/xml';
          break;
        case 'mermaid':
          output = flowchartGenerator.generateMermaid(validatedFlowchart);
          mimeType = 'text/plain';
          break;
        case 'svg':
        default:
          output = flowchartGenerator.generateSVG(validatedFlowchart);
          mimeType = 'image/svg+xml';
          break;
      }
      
      // Provide multiple content options for better VSCode Cline compatibility
      const content = [
        {
          type: 'text',
          text: output,
          mimeType: mimeType,
        },
        {
          type: 'text',
          text: `File generated successfully!\n\nFormat: ${format}\nMIME Type: ${mimeType}\nSize: ${output.length} characters\n\nTo save this file, copy the content above and save it with the appropriate extension:\n- SVG: .svg\n- Draw.io: .drawio\n- Mermaid: .md or .mmd`,
        }
      ];

      // Add file metadata for better VSCode integration
      if (format === 'svg') {
        content.push({
          type: 'text',
          text: `<!-- SVG File Metadata -->
<!-- Generated by MCP Flowchart Server -->
<!-- Format: SVG -->
<!-- Compatible with: draw.io, web browsers, image viewers -->
<!-- File size: ${output.length} characters -->`,
        });
      } else if (format === 'drawio') {
        content.push({
          type: 'text',
          text: `<!-- Draw.io File Metadata -->
<!-- Generated by MCP Flowchart Server -->
<!-- Format: Draw.io XML -->
<!-- Compatible with: draw.io, diagrams.net -->
<!-- File size: ${output.length} characters -->
<!-- To open: Use draw.io or diagrams.net -->`,
        });
      } else if (format === 'mermaid') {
        content.push({
          type: 'text',
          text: `<!-- Mermaid File Metadata -->
<!-- Generated by MCP Flowchart Server -->
<!-- Format: Mermaid -->
<!-- Compatible with: GitHub, GitLab, Mermaid Live Editor -->
<!-- File size: ${output.length} characters -->
<!-- To render: Use Mermaid Live Editor or GitHub -->`,
        });
      }

      return {
        content: content,
        isError: false,
        metadata: {
          format: format,
          mimeType: mimeType,
          size: output.length,
          filename: `flowchart.${format === 'drawio' ? 'drawio' : format}`,
        }
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

  if (name === 'export_flowchart_file') {
    try {
      const { flowchart, format = 'svg', filename } = args as { flowchart: any; format?: string; filename?: string };
      
      // Validate the flowchart data
      const validatedFlowchart = FlowchartSchema.parse(flowchart);
      
      let output = '';
      let mimeType = 'text/plain';
      let fileExtension = '';
      
      switch (format) {
        case 'drawio':
          output = flowchartGenerator.generateDrawIO(validatedFlowchart);
          mimeType = 'application/xml';
          fileExtension = '.drawio';
          break;
        case 'mermaid':
          output = flowchartGenerator.generateMermaid(validatedFlowchart);
          mimeType = 'text/plain';
          fileExtension = '.mmd';
          break;
        case 'svg':
        default:
          output = flowchartGenerator.generateSVG(validatedFlowchart);
          mimeType = 'image/svg+xml';
          fileExtension = '.svg';
          break;
      }
      
      const finalFilename = filename ? `${filename}${fileExtension}` : `flowchart${fileExtension}`;
      
      // Return content in a VSCode-friendly format
      return {
        content: [
          {
            type: 'text',
            text: `# Flowchart Export\n\n**File:** ${finalFilename}\n**Format:** ${format.toUpperCase()}\n**Size:** ${output.length} characters\n\n## Content:\n\n\`\`\`${format === 'svg' ? 'xml' : format === 'drawio' ? 'xml' : 'text'}\n${output}\n\`\`\`\n\n## Instructions:\n\n1. Copy the content from the code block above\n2. Save it as \`${finalFilename}\`\n3. Open with appropriate application:\n   - **SVG**: Web browser, draw.io, image viewers\n   - **Draw.io**: diagrams.net or draw.io application\n   - **Mermaid**: GitHub, GitLab, or Mermaid Live Editor`,
          },
        ],
        isError: false,
        metadata: {
          filename: finalFilename,
          format: format,
          mimeType: mimeType,
          size: output.length,
        }
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
        `Failed to export flowchart: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  if (name === 'write_flowchart_file') {
    try {
      const { flowchart, format = 'svg', filename, outputDir = '.' } = args as { 
        flowchart: any; 
        format?: string; 
        filename: string; 
        outputDir?: string; 
      };
      
      // Validate the flowchart data
      const validatedFlowchart = FlowchartSchema.parse(flowchart);
      
      let output = '';
      let fileExtension = '';
      
      switch (format) {
        case 'drawio':
          output = flowchartGenerator.generateDrawIO(validatedFlowchart);
          fileExtension = '.drawio';
          break;
        case 'mermaid':
          output = flowchartGenerator.generateMermaid(validatedFlowchart);
          fileExtension = '.mmd';
          break;
        case 'svg':
        default:
          output = flowchartGenerator.generateSVG(validatedFlowchart);
          fileExtension = '.svg';
          break;
      }
      
      // Ensure output directory exists
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      // Create full file path
      const fullFilename = `${filename}${fileExtension}`;
      const filePath = join(outputDir, fullFilename);
      
      // Write file directly to filesystem
      writeFileSync(filePath, output, 'utf8');
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Flowchart file created successfully!

📁 **File:** ${filePath}
📊 **Format:** ${format.toUpperCase()}
📏 **Size:** ${output.length} characters
📅 **Created:** ${new Date().toISOString()}

🎯 **Next Steps:**
${format === 'svg' ? 
  '- Open in web browser, draw.io, or any image viewer' :
  format === 'drawio' ? 
  '- Open in draw.io or diagrams.net' :
  '- Open in GitHub, GitLab, or Mermaid Live Editor'}

The file has been written directly to your filesystem, bypassing any Cline file handling issues.`,
          },
        ],
        isError: false,
        metadata: {
          filePath: filePath,
          filename: fullFilename,
          format: format,
          size: output.length,
          created: new Date().toISOString(),
        }
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
        `Failed to write flowchart file: ${error instanceof Error ? error.message : 'Unknown error'}`
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
