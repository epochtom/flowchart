export interface FlowchartNode {
  id: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'input' | 'output' | 'connector';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: string;
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: string;
}

export interface Flowchart {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  width: number;
  height: number;
}

export interface FlowchartOptions {
  direction?: 'horizontal' | 'vertical';
  spacing?: {
    horizontal: number;
    vertical: number;
  };
  nodeSize?: {
    width: number;
    height: number;
  };
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}

export interface CreateFlowchartRequest {
  name: string;
  description?: string;
  nodes: Array<{
    type: FlowchartNode['type'];
    label: string;
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
  options?: FlowchartOptions;
}