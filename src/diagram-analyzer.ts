import { Diagram, Shape, Connection, AnalysisType } from './types.js';

export class DiagramAnalyzer {
  /**
   * Analyze a diagram and return metrics
   */
  analyzeDiagram(diagram: Diagram, analysisType: AnalysisType): any {
    switch (analysisType) {
      case 'complexity':
        return this.analyzeComplexity(diagram);
      case 'connectivity':
        return this.analyzeConnectivity(diagram);
      case 'hierarchy':
        return this.analyzeHierarchy(diagram);
      case 'cycles':
        return this.analyzeCycles(diagram);
      case 'paths':
        return this.analyzePaths(diagram);
      case 'clusters':
        return this.analyzeClusters(diagram);
      case 'metrics':
        return this.analyzeMetrics(diagram);
      default:
        return {};
    }
  }

  /**
   * Analyze diagram complexity
   */
  private analyzeComplexity(diagram: Diagram): any {
    const shapeCount = diagram.shapes.length;
    const connectionCount = diagram.connections.length;
    const density = connectionCount / Math.max(1, shapeCount * (shapeCount - 1) / 2);
    
    // Calculate cyclomatic complexity
    const cyclomaticComplexity = connectionCount - shapeCount + 2;
    
    // Calculate average connections per shape
    const avgConnectionsPerShape = shapeCount > 0 ? connectionCount / shapeCount : 0;
    
    // Calculate shape type diversity
    const shapeTypes = new Set(diagram.shapes.map(s => s.type));
    const shapeTypeDiversity = shapeTypes.size / Math.max(1, shapeCount);

    return {
      shapeCount,
      connectionCount,
      density: Math.round(density * 100) / 100,
      cyclomaticComplexity,
      avgConnectionsPerShape: Math.round(avgConnectionsPerShape * 100) / 100,
      shapeTypeDiversity: Math.round(shapeTypeDiversity * 100) / 100,
      complexityScore: this.calculateComplexityScore(diagram)
    };
  }

  /**
   * Analyze connectivity patterns
   */
  private analyzeConnectivity(diagram: Diagram): any {
    const shapeMap = new Map(diagram.shapes.map(s => [s.id, s]));
    const adjacencyList = new Map<string, string[]>();
    
    // Build adjacency list
    diagram.shapes.forEach(shape => {
      adjacencyList.set(shape.id, []);
    });
    
    diagram.connections.forEach(conn => {
      const sourceList = adjacencyList.get(conn.source) || [];
      sourceList.push(conn.target);
      adjacencyList.set(conn.source, sourceList);
    });

    // Calculate connectivity metrics
    const inDegrees = new Map<string, number>();
    const outDegrees = new Map<string, number>();
    
    diagram.shapes.forEach(shape => {
      inDegrees.set(shape.id, 0);
      outDegrees.set(shape.id, 0);
    });
    
    diagram.connections.forEach(conn => {
      inDegrees.set(conn.target, (inDegrees.get(conn.target) || 0) + 1);
      outDegrees.set(conn.source, (outDegrees.get(conn.source) || 0) + 1);
    });

    const maxInDegree = Math.max(...Array.from(inDegrees.values()));
    const maxOutDegree = Math.max(...Array.from(outDegrees.values()));
    const avgInDegree = diagram.shapes.length > 0 ? 
      Array.from(inDegrees.values()).reduce((a, b) => a + b, 0) / diagram.shapes.length : 0;
    const avgOutDegree = diagram.shapes.length > 0 ? 
      Array.from(outDegrees.values()).reduce((a, b) => a + b, 0) / diagram.shapes.length : 0;

    // Find strongly connected components
    const sccs = this.findStronglyConnectedComponents(adjacencyList);

    return {
      maxInDegree,
      maxOutDegree,
      avgInDegree: Math.round(avgInDegree * 100) / 100,
      avgOutDegree: Math.round(avgOutDegree * 100) / 100,
      stronglyConnectedComponents: sccs.length,
      isConnected: this.isConnected(adjacencyList),
      hasIsolatedNodes: this.hasIsolatedNodes(adjacencyList)
    };
  }

  /**
   * Analyze hierarchical structure
   */
  private analyzeHierarchy(diagram: Diagram): any {
    const levels = this.calculateHierarchyLevels(diagram);
    const maxDepth = levels.length;
    const avgShapesPerLevel = diagram.shapes.length / Math.max(1, maxDepth);
    
    // Find root shapes (no incoming connections)
    const rootShapes = diagram.shapes.filter(shape => 
      !diagram.connections.some(conn => conn.target === shape.id)
    );
    
    // Find leaf shapes (no outgoing connections)
    const leafShapes = diagram.shapes.filter(shape => 
      !diagram.connections.some(conn => conn.source === shape.id)
    );

    // Calculate branching factor
    const branchingFactors = levels.map(level => 
      level.length > 0 ? level.reduce((sum, shape) => {
        const outgoing = diagram.connections.filter(conn => conn.source === shape.id).length;
        return sum + outgoing;
      }, 0) / level.length : 0
    );
    const avgBranchingFactor = branchingFactors.length > 0 ? 
      branchingFactors.reduce((a, b) => a + b, 0) / branchingFactors.length : 0;

    return {
      maxDepth,
      avgShapesPerLevel: Math.round(avgShapesPerLevel * 100) / 100,
      rootShapesCount: rootShapes.length,
      leafShapesCount: leafShapes.length,
      avgBranchingFactor: Math.round(avgBranchingFactor * 100) / 100,
      isBalanced: this.isHierarchyBalanced(levels)
    };
  }

  /**
   * Detect cycles in the diagram
   */
  private analyzeCycles(diagram: Diagram): any {
    const shapeMap = new Map(diagram.shapes.map(s => [s.id, s]));
    const adjacencyList = new Map<string, string[]>();
    
    diagram.shapes.forEach(shape => {
      adjacencyList.set(shape.id, []);
    });
    
    diagram.connections.forEach(conn => {
      const sourceList = adjacencyList.get(conn.source) || [];
      sourceList.push(conn.target);
      adjacencyList.set(conn.source, sourceList);
    });

    const cycles = this.findCycles(adjacencyList);
    const hasCycles = cycles.length > 0;
    const cycleCount = cycles.length;

    return {
      hasCycles,
      cycleCount,
      cycles: cycles.map(cycle => ({
        length: cycle.length,
        nodes: cycle
      })),
      isAcyclic: !hasCycles
    };
  }

  /**
   * Analyze paths in the diagram
   */
  private analyzePaths(diagram: Diagram): any {
    const shapeMap = new Map(diagram.shapes.map(s => [s.id, s]));
    const adjacencyList = new Map<string, string[]>();
    
    diagram.shapes.forEach(shape => {
      adjacencyList.set(shape.id, []);
    });
    
    diagram.connections.forEach(conn => {
      const sourceList = adjacencyList.get(conn.source) || [];
      sourceList.push(conn.target);
      adjacencyList.set(conn.source, sourceList);
    });

    const allPaths: string[][] = [];
    const rootShapes = diagram.shapes.filter(shape => 
      !diagram.connections.some(conn => conn.target === shape.id)
    );

    rootShapes.forEach(root => {
      this.findAllPaths(adjacencyList, root.id, [], allPaths);
    });

    const pathLengths = allPaths.map(path => path.length);
    const maxPathLength = pathLengths.length > 0 ? Math.max(...pathLengths) : 0;
    const avgPathLength = pathLengths.length > 0 ? 
      pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length : 0;

    return {
      totalPaths: allPaths.length,
      maxPathLength,
      avgPathLength: Math.round(avgPathLength * 100) / 100,
      longestPaths: allPaths.filter(path => path.length === maxPathLength)
    };
  }

  /**
   * Analyze clusters in the diagram
   */
  private analyzeClusters(diagram: Diagram): any {
    const shapeMap = new Map(diagram.shapes.map(s => [s.id, s]));
    const adjacencyList = new Map<string, string[]>();
    
    diagram.shapes.forEach(shape => {
      adjacencyList.set(shape.id, []);
    });
    
    diagram.connections.forEach(conn => {
      const sourceList = adjacencyList.get(conn.source) || [];
      sourceList.push(conn.target);
      adjacencyList.set(conn.source, sourceList);
    });

    const clusters = this.findClusters(adjacencyList);
    const clusterSizes = clusters.map(cluster => cluster.length);
    const maxClusterSize = clusterSizes.length > 0 ? Math.max(...clusterSizes) : 0;
    const avgClusterSize = clusterSizes.length > 0 ? 
      clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length : 0;

    return {
      clusterCount: clusters.length,
      maxClusterSize,
      avgClusterSize: Math.round(avgClusterSize * 100) / 100,
      clusters: clusters.map((cluster, index) => ({
        id: `cluster-${index}`,
        size: cluster.length,
        nodes: cluster
      }))
    };
  }

  /**
   * Calculate general metrics
   */
  private analyzeMetrics(diagram: Diagram): any {
    const complexity = this.analyzeComplexity(diagram);
    const connectivity = this.analyzeConnectivity(diagram);
    const hierarchy = this.analyzeHierarchy(diagram);
    const cycles = this.analyzeCycles(diagram);
    const paths = this.analyzePaths(diagram);
    const clusters = this.analyzeClusters(diagram);

    return {
      ...complexity,
      ...connectivity,
      ...hierarchy,
      ...cycles,
      ...paths,
      ...clusters,
      overallScore: this.calculateOverallScore(diagram)
    };
  }

  /**
   * Calculate complexity score (0-100)
   */
  private calculateComplexityScore(diagram: Diagram): number {
    const shapeCount = diagram.shapes.length;
    const connectionCount = diagram.connections.length;
    const density = connectionCount / Math.max(1, shapeCount * (shapeCount - 1) / 2);
    
    // Normalize to 0-100 scale
    const shapeScore = Math.min(shapeCount / 50 * 100, 100);
    const connectionScore = Math.min(connectionCount / 100 * 100, 100);
    const densityScore = Math.min(density * 100, 100);
    
    return Math.round((shapeScore + connectionScore + densityScore) / 3);
  }

  /**
   * Calculate overall diagram score
   */
  private calculateOverallScore(diagram: Diagram): number {
    const complexity = this.calculateComplexityScore(diagram);
    const connectivity = this.analyzeConnectivity(diagram);
    const hierarchy = this.analyzeHierarchy(diagram);
    
    // Weighted average
    const score = (
      complexity * 0.4 +
      (connectivity.isConnected ? 100 : 50) * 0.3 +
      (hierarchy.isBalanced ? 100 : 70) * 0.3
    );
    
    return Math.round(score);
  }

  /**
   * Helper methods
   */
  private calculateHierarchyLevels(diagram: Diagram): Shape[][] {
    const levels: Shape[][] = [];
    const visited = new Set<string>();
    const shapeMap = new Map(diagram.shapes.map(s => [s.id, s]));

    const rootShapes = diagram.shapes.filter(shape => 
      !diagram.connections.some(conn => conn.target === shape.id)
    );

    const queue = rootShapes.map(shape => ({ shape, level: 0 }));

    while (queue.length > 0) {
      const { shape, level } = queue.shift()!;
      
      if (visited.has(shape.id)) continue;
      visited.add(shape.id);

      if (!levels[level]) levels[level] = [];
      levels[level].push(shape);

      const children = diagram.connections
        .filter(conn => conn.source === shape.id)
        .map(conn => shapeMap.get(conn.target))
        .filter(Boolean) as Shape[];

      children.forEach(child => {
        if (!visited.has(child.id)) {
          queue.push({ shape: child, level: level + 1 });
        }
      });
    }

    return levels;
  }

  private isHierarchyBalanced(levels: Shape[][]): boolean {
    if (levels.length <= 1) return true;
    
    const levelSizes = levels.map(level => level.length);
    const avgSize = levelSizes.reduce((a, b) => a + b, 0) / levelSizes.length;
    const variance = levelSizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / levelSizes.length;
    
    return variance < avgSize * 0.5; // Low variance indicates balanced hierarchy
  }

  private findCycles(adjacencyList: Map<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = adjacencyList.get(node) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor, [...path]);
      }

      recursionStack.delete(node);
    };

    for (const node of adjacencyList.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  private findAllPaths(adjacencyList: Map<string, string[]>, start: string, currentPath: string[], allPaths: string[][]) {
    const newPath = [...currentPath, start];
    
    const neighbors = adjacencyList.get(start) || [];
    if (neighbors.length === 0) {
      allPaths.push(newPath);
      return;
    }

    for (const neighbor of neighbors) {
      this.findAllPaths(adjacencyList, neighbor, newPath, allPaths);
    }
  }

  private findClusters(adjacencyList: Map<string, string[]>): string[][] {
    const clusters: string[][] = [];
    const visited = new Set<string>();

    const dfs = (node: string, cluster: string[]) => {
      if (visited.has(node)) return;
      
      visited.add(node);
      cluster.push(node);
      
      const neighbors = adjacencyList.get(node) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor, cluster);
      }
    };

    for (const node of adjacencyList.keys()) {
      if (!visited.has(node)) {
        const cluster: string[] = [];
        dfs(node, cluster);
        if (cluster.length > 0) {
          clusters.push(cluster);
        }
      }
    }

    return clusters;
  }

  private findStronglyConnectedComponents(adjacencyList: Map<string, string[]>): string[][] {
    // Simplified implementation - in practice, you'd use Tarjan's algorithm
    return this.findClusters(adjacencyList);
  }

  private isConnected(adjacencyList: Map<string, string[]>): boolean {
    const clusters = this.findClusters(adjacencyList);
    return clusters.length === 1;
  }

  private hasIsolatedNodes(adjacencyList: Map<string, string[]>): boolean {
    for (const [node, neighbors] of adjacencyList) {
      if (neighbors.length === 0) {
        // Check if this node has any incoming connections
        let hasIncoming = false;
        for (const [otherNode, otherNeighbors] of adjacencyList) {
          if (otherNeighbors.includes(node)) {
            hasIncoming = true;
            break;
          }
        }
        if (!hasIncoming) return true;
      }
    }
    return false;
  }
}
