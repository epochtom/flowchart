import { z } from 'zod';

// Basic shape types
export const ShapeType = z.enum([
  'rectangle',
  'ellipse',
  'diamond',
  'cylinder',
  'hexagon',
  'triangle',
  'parallelogram',
  'trapezoid',
  'star',
  'arrow',
  'line',
  'text',
  'image',
  'group',
  'swimlane',
  'note',
  'actor',
  'database',
  'cloud',
  'document',
  'folder',
  'gear',
  'lock',
  'key',
  'flag',
  'heart',
  'lightning',
  'cross',
  'check',
  'times',
  'question',
  'exclamation',
  'info',
  'warning',
  'error',
  'success'
]);

export type ShapeType = z.infer<typeof ShapeType>;

// Position and size
export const Position = z.object({
  x: z.number(),
  y: z.number()
});

export const Size = z.object({
  width: z.number(),
  height: z.number()
});

export const Bounds = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number()
});

// Style properties
export const Style = z.object({
  fillColor: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().optional(),
  strokeStyle: z.enum(['solid', 'dashed', 'dotted']).optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().optional(),
  fontColor: z.string().optional(),
  fontStyle: z.enum(['normal', 'bold', 'italic', 'bolditalic']).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
  opacity: z.number().min(0).max(1).optional(),
  rotation: z.number().optional(),
  shadow: z.boolean().optional(),
  gradient: z.object({
    type: z.enum(['linear', 'radial']),
    colors: z.array(z.string()),
    direction: z.string().optional()
  }).optional()
});

// Shape definition
export const Shape = z.object({
  id: z.string(),
  type: ShapeType,
  label: z.string().optional(),
  position: Position,
  size: Size,
  style: Style.optional(),
  data: z.record(z.any()).optional(),
  children: z.array(z.lazy(() => Shape)).optional()
});

// Connection/Edge definition
export const Connection = z.object({
  id: z.string(),
  source: z.string(), // source shape id
  target: z.string(), // target shape id
  label: z.string().optional(),
  style: Style.optional(),
  waypoints: z.array(Position).optional(),
  arrowStyle: z.enum(['none', 'classic', 'open', 'block', 'oval', 'diamond']).optional(),
  lineStyle: z.enum(['solid', 'dashed', 'dotted', 'curved']).optional()
});

// Diagram definition
export const Diagram = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  shapes: z.array(Shape),
  connections: z.array(Connection),
  metadata: z.object({
    created: z.string().optional(),
    modified: z.string().optional(),
    version: z.string().optional(),
    author: z.string().optional()
  }).optional(),
  settings: z.object({
    gridSize: z.number().optional(),
    gridVisible: z.boolean().optional(),
    pageFormat: z.enum(['A4', 'A3', 'A2', 'A1', 'A0', 'Letter', 'Legal', 'Tabloid']).optional(),
    orientation: z.enum(['portrait', 'landscape']).optional(),
    backgroundColor: z.string().optional()
  }).optional()
});

// Layout algorithms
export const LayoutAlgorithm = z.enum([
  'hierarchical',
  'force-directed',
  'circular',
  'tree',
  'grid',
  'organic',
  'orthogonal',
  'sugiyama',
  'elk'
]);

// Export formats
export const ExportFormat = z.enum([
  'drawio',
  'xml',
  'svg',
  'png',
  'jpg',
  'pdf',
  'mermaid',
  'plantuml'
]);

// Analysis types
export const AnalysisType = z.enum([
  'complexity',
  'connectivity',
  'hierarchy',
  'cycles',
  'paths',
  'clusters',
  'metrics'
]);

export type Position = z.infer<typeof Position>;
export type Size = z.infer<typeof Size>;
export type Bounds = z.infer<typeof Bounds>;
export type Style = z.infer<typeof Style>;
export type Shape = z.infer<typeof Shape>;
export type Connection = z.infer<typeof Connection>;
export type Diagram = z.infer<typeof Diagram>;
export type LayoutAlgorithm = z.infer<typeof LayoutAlgorithm>;
export type ExportFormat = z.infer<typeof ExportFormat>;
export type AnalysisType = z.infer<typeof AnalysisType>;
