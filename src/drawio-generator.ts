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
    default: 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;',
    dashed: 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;'
  };

  generateXML(flowchart: Flowchart): string {
    const mxfile = this.createMxFile(flowchart);
    return `<?xml version="1.0" encoding="UTF-8"?>
${mxfile}`;
  }

  private createMxFile(flowchart: Flowchart): string {
    const diagram = this.createDiagram(flowchart);
    return `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="MCP Flowchart Server" etag="1" version="22.1.16" type="device">
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
    const style = DrawIOGenerator.NODE_STYLES[node.type] || DrawIOGenerator.NODE_STYLES.process;
    const customStyle = node.style ? `;${node.style}` : '';
    
    return `<mxCell id="${node.id}" value="${this.escapeXml(node.label)}" style="${style}${customStyle}" vertex="1" parent="1">
      <mxGeometry x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" as="geometry" />
    </mxCell>`;
  }

  private createEdgeCell(edge: FlowchartEdge): string {
    const style = edge.style || DrawIOGenerator.EDGE_STYLES.default;
    const label = edge.label ? ` value="${this.escapeXml(edge.label)}"` : '';
    
    return `<mxCell id="${edge.id}"${label} style="${style}" edge="1" parent="1" source="${edge.source}" target="${edge.target}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}