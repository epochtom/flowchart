// Common types for flowchart patterns

export interface PatternConfig {
  id: string;
  title: string;
  description?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  metadata?: {
    category: string;
    complexity: 'simple' | 'medium' | 'complex';
    useCases: string[];
    tags: string[];
  };
}

export interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'math' | 'loop' | 'input' | 'output' | 'subprocess' | 'fork' | 'join';
  label: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  metadata?: {
    role?: string; // For swimlane patterns
    department?: string; // For swimlane patterns
    subprocessId?: string; // For hierarchical patterns
    parallelGroup?: string; // For parallel patterns
  };
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'normal' | 'loop' | 'feedback' | 'connector' | 'parallel' | 'subprocess';
  curve?: boolean;
  connector?: {
    id: string;
    label?: string;
  };
  metadata?: {
    condition?: string; // For decision branches
    probability?: number; // For decision branches
    parallelGroup?: string; // For parallel patterns
  };
}

export interface SwimlaneConfig {
  lanes: {
    id: string;
    label: string;
    type: 'horizontal' | 'vertical';
    width?: number;
    height?: number;
  }[];
  orientation: 'horizontal' | 'vertical';
}

export interface HierarchicalConfig {
  mainProcess: PatternConfig;
  subprocesses: {
    [subprocessId: string]: PatternConfig;
  };
  connectors: {
    from: string;
    to: string;
    subprocessId: string;
  }[];
}

export interface ParallelConfig {
  mainFlow: FlowchartNode[];
  parallelGroups: {
    id: string;
    label: string;
    processes: FlowchartNode[];
  }[];
  forkNode: string;
  joinNode: string;
}

export interface PatternExample {
  name: string;
  description: string;
  config: PatternConfig;
  useCase: string;
  complexity: 'simple' | 'medium' | 'complex';
}

export interface PatternGeneratorOptions {
  format: 'svg' | 'drawio' | 'mermaid';
  outputDir?: string;
  filename?: string;
  includeMetadata?: boolean;
  autoLayout?: boolean;
}
