import { Flowchart, FlowchartNode, FlowchartEdge } from './types.js';

export class DrawIOGenerator {
  private static readonly NODE_STYLES = {
    start: 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#d5e8d4;strokeColor=#82b366;',
    end: 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#f8cecc;strokeColor=#b85450;',
    process: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;',
    decision: 'rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;',
    input: 'shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;',
    output: 'shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;',
    connector: 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#f5f5f5;strokeColor=#666666;'
  };

  private static readonly EDGE_STYLES = {
    default: 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;startArrow=none;',
    dashed: 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;endArrow=classic;startArrow=none;'
  };

  generateXML(flowchart: Flowchart): string {
    const mxfile = this.createMxFile(flowchart);
    return `<?xml version="1.0" encoding="UTF-8"?>
${mxfile}`;
  }

  private createMxFile(flowchart: Flowchart): string {
    const diagram = this.createDiagram(flowchart);
    return `<mxfile host="app.diagrams.net" modified="${this.escapeAllSymbols(new Date().toISOString())}" agent="MCP Flowchart Server" etag="1" version="22.1.16" type="device">
  <diagram name="Flowchart" id="${this.generateId()}">
    ${diagram}
  </diagram>
</mxfile>`;
  }

  private createDiagram(flowchart: Flowchart): string {
    const cells = this.createCells(flowchart);
    return `<mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    ${cells}
  </root>
</mxGraphModel>`;
  }

  private createCells(flowchart: Flowchart): string {
    const nodeCells = flowchart.nodes.map(node => this.createNodeCell(node)).join('\n    ');
    const edgeCells = flowchart.edges.map(edge => this.createEdgeCell(edge)).join('\n    ');
    return `${nodeCells}
    ${edgeCells}`;
  }

  private createNodeCell(node: FlowchartNode): string {
    // Use the predefined style for the node type, or the custom style if provided
    const style = node.style || (DrawIOGenerator.NODE_STYLES[node.type] || DrawIOGenerator.NODE_STYLES.process);
    
    return `<mxCell id="${this.escapeAllAttributes(node.id)}" value="${this.escapeAllAttributes(node.label)}" style="${this.escapeStyleAttribute(style)}" vertex="1" parent="1">
      <mxGeometry x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" as="geometry" />
    </mxCell>`;
  }

  private createEdgeCell(edge: FlowchartEdge): string {
    const style = edge.style || DrawIOGenerator.EDGE_STYLES.default;
    const label = edge.label ? ` value="${this.escapeAllAttributes(edge.label)}"` : '';
    
    return `<mxCell id="${this.escapeAllAttributes(edge.id)}"${label} style="${this.escapeStyleAttribute(style)}" edge="1" parent="1" source="${this.escapeAllAttributes(edge.source)}" target="${this.escapeAllAttributes(edge.target)}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>`;
  }

  private escapeXml(text: string): string {
    if (!text) return '';
    return this.escapeAllSymbols(text);
  }

  private escapeStyleAttribute(style: string): string {
    if (!style) return '';
    return this.escapeAllSymbols(style);
  }

  private escapeAllAttributes(text: string): string {
    if (!text) return '';
    return this.escapeAllSymbols(text);
  }

  private escapeAllSymbols(text: string): string {
    if (!text) return '';
    
    // Check if already escaped to avoid double escaping
    if (text.includes('&#') || text.includes('&amp;') || text.includes('&lt;') || text.includes('&gt;') || text.includes('&quot;')) {
      return text;
    }
    
    return String(text)
      // Essential XML entities (must be first)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      // Key symbols that commonly cause issues
      .replace(/;/g, '&#59;')   // Semicolon
      .replace(/:/g, '&#58;')   // Colon
      .replace(/=/g, '&#61;')   // Equals
      .replace(/\(/g, '&#40;')  // Left parenthesis
      .replace(/\)/g, '&#41;')  // Right parenthesis
      .replace(/\[/g, '&#91;')  // Left square bracket
      .replace(/\]/g, '&#93;')  // Right square bracket
      .replace(/\{/g, '&#123;') // Left curly brace
      .replace(/\}/g, '&#125;') // Right curly brace
      .replace(/\+/g, '&#43;')  // Plus sign
      .replace(/-/g, '&#45;')   // Hyphen/minus
      .replace(/\*/g, '&#42;')  // Asterisk
      .replace(/\//g, '&#47;')  // Forward slash
      .replace(/\\/g, '&#92;')  // Backslash
      .replace(/\|/g, '&#124;') // Pipe
      .replace(/\^/g, '&#94;')  // Caret
      .replace(/~/g, '&#126;')  // Tilde
      .replace(/`/g, '&#96;')   // Backtick
      .replace(/!/g, '&#33;')   // Exclamation
      .replace(/\?/g, '&#63;')  // Question mark
      .replace(/@/g, '&#64;')   // At symbol
      .replace(/#/g, '&#35;')   // Hash/pound
      .replace(/\$/g, '&#36;')  // Dollar sign
      .replace(/%/g, '&#37;');  // Percent
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}