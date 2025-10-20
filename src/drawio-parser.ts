import { parseString, Builder } from 'xml2js';
import { Diagram, Shape, Connection, Position, Size, Style } from './types.js';

export class DrawIOParser {
  private xmlBuilder: Builder;

  constructor() {
    this.xmlBuilder = new Builder({
      renderOpts: { pretty: true, indent: '  ', newline: '\n' },
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
  }

  /**
   * Parse draw.io XML content into a Diagram object
   */
  async parseDrawIO(xmlContent: string): Promise<Diagram> {
    try {
      const result = await parseString(xmlContent, {
        explicitArray: false,
        mergeAttrs: true
      });

      const mxfile = result.mxfile;
      if (!mxfile || !mxfile.diagram) {
        throw new Error('Invalid draw.io file format');
      }

      const diagram = Array.isArray(mxfile.diagram) ? mxfile.diagram[0] : mxfile.diagram;
      const mxGraphModel = diagram.mxGraphModel;
      
      if (!mxGraphModel || !mxGraphModel.root) {
        throw new Error('Invalid diagram structure');
      }

      const root = mxGraphModel.root;
      const cells = Array.isArray(root.mxCell) ? root.mxCell : [root.mxCell];
      
      const shapes: Shape[] = [];
      const connections: Connection[] = [];
      const shapeMap = new Map<string, Shape>();

      // First pass: create shapes
      for (const cell of cells) {
        if (cell.vertex === '1' || cell.vertex === true) {
          const shape = this.parseShape(cell);
          shapes.push(shape);
          shapeMap.set(shape.id, shape);
        }
      }

      // Second pass: create connections
      for (const cell of cells) {
        if (cell.edge === '1' || cell.edge === true) {
          const connection = this.parseConnection(cell, shapeMap);
          if (connection) {
            connections.push(connection);
          }
        }
      }

      return {
        id: diagram.id || 'diagram-1',
        name: diagram.name || 'Untitled Diagram',
        description: diagram.description,
        shapes,
        connections,
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: '1.0'
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse draw.io XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert a Diagram object to draw.io XML format
   */
  generateDrawIO(diagram: Diagram): string {
    const mxfile = {
      $: {
        host: 'app.diagrams.net',
        modified: new Date().toISOString(),
        agent: 'flowchart-mcp-server',
        etag: '1.0',
        version: '24.7.17',
        type: 'device'
      },
      diagram: {
        $: {
          id: diagram.id,
          name: diagram.name,
          type: 'flowchart'
        },
        mxGraphModel: {
          $: {
            dx: '1422',
            dy: '754',
            grid: '1',
            gridSize: '10',
            guides: '1',
            tooltips: '1',
            connect: '1',
            arrows: '1',
            fold: '1',
            page: '1',
            pageScale: '1',
            pageWidth: '827',
            pageHeight: '1169',
            math: '0',
            shadow: '0'
          },
          root: {
            mxCell: [
              {
                $: { id: '0' }
              },
              {
                $: { id: '1', parent: '0' }
              },
              ...this.generateShapes(diagram.shapes),
              ...this.generateConnections(diagram.connections)
            ]
          }
        }
      }
    };

    return this.xmlBuilder.buildObject(mxfile);
  }

  private parseShape(cell: any): Shape {
    const id = cell.id || this.generateId();
    const geometry = cell.mxGeometry;
    
    let position: Position = { x: 0, y: 0 };
    let size: Size = { width: 100, height: 50 };

    if (geometry) {
      position = {
        x: parseFloat(geometry.x) || 0,
        y: parseFloat(geometry.y) || 0
      };
      size = {
        width: parseFloat(geometry.width) || 100,
        height: parseFloat(geometry.height) || 50
      };
    }

    const style = this.parseStyle(cell.style);
    const shapeType = this.determineShapeType(cell.style, cell.value);

    return {
      id,
      type: shapeType,
      label: cell.value || '',
      position,
      size,
      style,
      data: {
        parent: cell.parent,
        vertex: cell.vertex,
        ...cell
      }
    };
  }

  private parseConnection(cell: any, shapeMap: Map<string, Shape>): Connection | null {
    const id = cell.id || this.generateId();
    const source = cell.source;
    const target = cell.target;

    if (!source || !target || !shapeMap.has(source) || !shapeMap.has(target)) {
      return null;
    }

    const style = this.parseStyle(cell.style);
    const waypoints = this.parseWaypoints(cell.mxGeometry);

    return {
      id,
      source,
      target,
      label: cell.value || '',
      style,
      waypoints,
      arrowStyle: this.determineArrowStyle(cell.style),
      lineStyle: this.determineLineStyle(cell.style)
    };
  }

  private parseStyle(styleString?: string): Style {
    if (!styleString) return {};

    const styles: Style = {};
    const pairs = styleString.split(';');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (!key || !value) continue;

      switch (key) {
        case 'fillColor':
          styles.fillColor = value;
          break;
        case 'strokeColor':
          styles.strokeColor = value;
          break;
        case 'strokeWidth':
          styles.strokeWidth = parseFloat(value);
          break;
        case 'fontSize':
          styles.fontSize = parseFloat(value);
          break;
        case 'fontColor':
          styles.fontColor = value;
          break;
        case 'fontStyle':
          styles.fontStyle = value as any;
          break;
        case 'textAlign':
          styles.textAlign = value as any;
          break;
        case 'verticalAlign':
          styles.verticalAlign = value as any;
          break;
        case 'opacity':
          styles.opacity = parseFloat(value);
          break;
        case 'rotation':
          styles.rotation = parseFloat(value);
          break;
      }
    }

    return styles;
  }

  private determineShapeType(style?: string, value?: string): any {
    if (!style) return 'rectangle';

    if (style.includes('ellipse')) return 'ellipse';
    if (style.includes('diamond')) return 'diamond';
    if (style.includes('cylinder')) return 'cylinder';
    if (style.includes('hexagon')) return 'hexagon';
    if (style.includes('triangle')) return 'triangle';
    if (style.includes('parallelogram')) return 'parallelogram';
    if (style.includes('trapezoid')) return 'trapezoid';
    if (style.includes('star')) return 'star';
    if (style.includes('swimlane')) return 'swimlane';
    if (style.includes('note')) return 'note';
    if (style.includes('actor')) return 'actor';
    if (style.includes('database')) return 'database';
    if (style.includes('cloud')) return 'cloud';
    if (style.includes('document')) return 'document';
    if (style.includes('folder')) return 'folder';
    if (style.includes('gear')) return 'gear';
    if (style.includes('lock')) return 'lock';
    if (style.includes('key')) return 'key';
    if (style.includes('flag')) return 'flag';
    if (style.includes('heart')) return 'heart';
    if (style.includes('lightning')) return 'lightning';
    if (style.includes('cross')) return 'cross';
    if (style.includes('check')) return 'check';
    if (style.includes('times')) return 'times';
    if (style.includes('question')) return 'question';
    if (style.includes('exclamation')) return 'exclamation';
    if (style.includes('info')) return 'info';
    if (style.includes('warning')) return 'warning';
    if (style.includes('error')) return 'error';
    if (style.includes('success')) return 'success';

    return 'rectangle';
  }

  private determineArrowStyle(style?: string): any {
    if (!style) return 'classic';
    if (style.includes('arrow=none')) return 'none';
    if (style.includes('arrow=open')) return 'open';
    if (style.includes('arrow=block')) return 'block';
    if (style.includes('arrow=oval')) return 'oval';
    if (style.includes('arrow=diamond')) return 'diamond';
    return 'classic';
  }

  private determineLineStyle(style?: string): any {
    if (!style) return 'solid';
    if (style.includes('dashed')) return 'dashed';
    if (style.includes('dotted')) return 'dotted';
    if (style.includes('curved')) return 'curved';
    return 'solid';
  }

  private parseWaypoints(geometry?: any): Position[] {
    if (!geometry || !geometry.mxPoint) return [];

    const points = Array.isArray(geometry.mxPoint) ? geometry.mxPoint : [geometry.mxPoint];
    return points.map((point: any) => ({
      x: parseFloat(point.x) || 0,
      y: parseFloat(point.y) || 0
    }));
  }

  private generateShapes(shapes: Shape[]): any[] {
    return shapes.map(shape => ({
      $: {
        id: shape.id,
        value: shape.label || '',
        style: this.generateStyleString(shape.style),
        vertex: '1',
        parent: '1'
      },
      mxGeometry: {
        $: {
          x: shape.position.x.toString(),
          y: shape.position.y.toString(),
          width: shape.size.width.toString(),
          height: shape.size.height.toString(),
          as: 'geometry'
        }
      }
    }));
  }

  private generateConnections(connections: Connection[]): any[] {
    return connections.map(conn => ({
      $: {
        id: conn.id,
        value: conn.label || '',
        style: this.generateStyleString(conn.style),
        edge: '1',
        parent: '1',
        source: conn.source,
        target: conn.target
      },
      mxGeometry: {
        $: {
          relative: '1',
          as: 'geometry'
        },
        ...(conn.waypoints && conn.waypoints.length > 0 ? {
          mxPoint: conn.waypoints.map(wp => ({
            $: {
              x: wp.x.toString(),
              y: wp.y.toString()
            }
          }))
        } : {})
      }
    }));
  }

  private generateStyleString(style?: Style): string {
    if (!style) return '';

    const parts: string[] = [];
    
    if (style.fillColor) parts.push(`fillColor=${style.fillColor}`);
    if (style.strokeColor) parts.push(`strokeColor=${style.strokeColor}`);
    if (style.strokeWidth) parts.push(`strokeWidth=${style.strokeWidth}`);
    if (style.fontSize) parts.push(`fontSize=${style.fontSize}`);
    if (style.fontColor) parts.push(`fontColor=${style.fontColor}`);
    if (style.fontStyle) parts.push(`fontStyle=${style.fontStyle}`);
    if (style.textAlign) parts.push(`textAlign=${style.textAlign}`);
    if (style.verticalAlign) parts.push(`verticalAlign=${style.verticalAlign}`);
    if (style.opacity) parts.push(`opacity=${style.opacity}`);
    if (style.rotation) parts.push(`rotation=${style.rotation}`);

    return parts.join(';');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
