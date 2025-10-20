import { Diagram, Shape, Connection, Position, LayoutAlgorithm } from './types.js';

export class LayoutEngine {
  /**
   * Apply automatic layout to a diagram
   */
  applyLayout(diagram: Diagram, algorithm: LayoutAlgorithm, options: any = {}): Diagram {
    switch (algorithm) {
      case 'hierarchical':
        return this.hierarchicalLayout(diagram, options);
      case 'force-directed':
        return this.forceDirectedLayout(diagram, options);
      case 'circular':
        return this.circularLayout(diagram, options);
      case 'tree':
        return this.treeLayout(diagram, options);
      case 'grid':
        return this.gridLayout(diagram, options);
      case 'organic':
        return this.organicLayout(diagram, options);
      case 'orthogonal':
        return this.orthogonalLayout(diagram, options);
      default:
        return diagram;
    }
  }

  /**
   * Hierarchical layout (top-down or left-right)
   */
  private hierarchicalLayout(diagram: Diagram, options: any): Diagram {
    const { direction = 'top-down', levelSeparation = 100, nodeSeparation = 50 } = options;
    const levels = this.calculateLevels(diagram);
    const updatedShapes = [...diagram.shapes];

    levels.forEach((levelShapes, levelIndex) => {
      const y = direction === 'top-down' ? levelIndex * levelSeparation : 0;
      const xOffset = direction === 'left-right' ? levelIndex * levelSeparation : 0;

      levelShapes.forEach((shape, shapeIndex) => {
        const x = direction === 'top-down' 
          ? shapeIndex * (200 + nodeSeparation) 
          : xOffset;
        const finalY = direction === 'left-right' 
          ? shapeIndex * (100 + nodeSeparation) 
          : y;

        const shapeIndexInArray = updatedShapes.findIndex(s => s.id === shape.id);
        if (shapeIndexInArray !== -1) {
          updatedShapes[shapeIndexInArray] = {
            ...updatedShapes[shapeIndexInArray],
            position: { x, y: finalY }
          };
        }
      });
    });

    return { ...diagram, shapes: updatedShapes };
  }

  /**
   * Force-directed layout using physics simulation
   */
  private forceDirectedLayout(diagram: Diagram, options: any): Diagram {
    const { iterations = 100, k = 100, c = 0.01 } = options;
    const shapes = [...diagram.shapes];
    const connections = diagram.connections;

    // Initialize positions randomly if not set
    shapes.forEach(shape => {
      if (shape.position.x === 0 && shape.position.y === 0) {
        shape.position = {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100
        };
      }
    });

    // Force-directed algorithm
    for (let iter = 0; iter < iterations; iter++) {
      const forces = new Map<string, { x: number; y: number }>();

      // Initialize forces
      shapes.forEach(shape => {
        forces.set(shape.id, { x: 0, y: 0 });
      });

      // Repulsive forces between all pairs
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const shape1 = shapes[i];
          const shape2 = shapes[j];
          const dx = shape2.position.x - shape1.position.x;
          const dy = shape2.position.y - shape1.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const force = k * k / distance;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          const force1 = forces.get(shape1.id)!;
          const force2 = forces.get(shape2.id)!;
          force1.x -= fx;
          force1.y -= fy;
          force2.x += fx;
          force2.y += fy;
        }
      }

      // Attractive forces for connected nodes
      connections.forEach(conn => {
        const sourceShape = shapes.find(s => s.id === conn.source);
        const targetShape = shapes.find(s => s.id === conn.target);
        
        if (sourceShape && targetShape) {
          const dx = targetShape.position.x - sourceShape.position.x;
          const dy = targetShape.position.y - sourceShape.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const force = distance * distance / k;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          const sourceForce = forces.get(sourceShape.id)!;
          const targetForce = forces.get(targetShape.id)!;
          sourceForce.x += fx;
          sourceForce.y += fy;
          targetForce.x -= fx;
          targetForce.y -= fy;
        }
      });

      // Update positions
      shapes.forEach(shape => {
        const force = forces.get(shape.id)!;
        const displacement = Math.sqrt(force.x * force.x + force.y * force.y);
        
        if (displacement > 0) {
          const limitedForce = Math.min(displacement, 10);
          shape.position.x += (force.x / displacement) * limitedForce * c;
          shape.position.y += (force.y / displacement) * limitedForce * c;
        }
      });
    }

    return { ...diagram, shapes };
  }

  /**
   * Circular layout
   */
  private circularLayout(diagram: Diagram, options: any): Diagram {
    const { radius = 200, centerX = 400, centerY = 300 } = options;
    const shapes = [...diagram.shapes];
    const angleStep = (2 * Math.PI) / shapes.length;

    shapes.forEach((shape, index) => {
      const angle = index * angleStep;
      shape.position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    return { ...diagram, shapes };
  }

  /**
   * Tree layout
   */
  private treeLayout(diagram: Diagram, options: any): Diagram {
    const { direction = 'top-down', levelSeparation = 100, siblingSeparation = 50 } = options;
    const rootShapes = this.findRootShapes(diagram);
    const updatedShapes = [...diagram.shapes];

    rootShapes.forEach((rootShape, rootIndex) => {
      const tree = this.buildTree(diagram, rootShape.id);
      this.layoutTree(tree, rootIndex * 300, 0, direction, levelSeparation, siblingSeparation, updatedShapes);
    });

    return { ...diagram, shapes: updatedShapes };
  }

  /**
   * Grid layout
   */
  private gridLayout(diagram: Diagram, options: any): Diagram {
    const { columns = 4, cellWidth = 150, cellHeight = 100, padding = 20 } = options;
    const shapes = [...diagram.shapes];

    shapes.forEach((shape, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      shape.position = {
        x: col * (cellWidth + padding),
        y: row * (cellHeight + padding)
      };
    });

    return { ...diagram, shapes };
  }

  /**
   * Organic layout (similar to force-directed but with different parameters)
   */
  private organicLayout(diagram: Diagram, options: any): Diagram {
    return this.forceDirectedLayout(diagram, {
      iterations: 150,
      k: 150,
      c: 0.02,
      ...options
    });
  }

  /**
   * Orthogonal layout (for flowcharts and process diagrams)
   */
  private orthogonalLayout(diagram: Diagram, options: any): Diagram {
    const { direction = 'top-down', levelSeparation = 120, nodeSeparation = 80 } = options;
    return this.hierarchicalLayout(diagram, { direction, levelSeparation, nodeSeparation });
  }

  /**
   * Calculate hierarchical levels for shapes
   */
  private calculateLevels(diagram: Diagram): Shape[][] {
    const levels: Shape[][] = [];
    const visited = new Set<string>();
    const shapeMap = new Map(diagram.shapes.map(s => [s.id, s]));

    // Find root shapes (shapes with no incoming connections)
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

      // Add children to next level
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

  /**
   * Find root shapes (shapes with no incoming connections)
   */
  private findRootShapes(diagram: Diagram): Shape[] {
    return diagram.shapes.filter(shape => 
      !diagram.connections.some(conn => conn.target === shape.id)
    );
  }

  /**
   * Build a tree structure from connections
   */
  private buildTree(diagram: Diagram, rootId: string): any {
    const shapeMap = new Map(diagram.shapes.map(s => [s.id, s]));
    const children = diagram.connections
      .filter(conn => conn.source === rootId)
      .map(conn => this.buildTree(diagram, conn.target))
      .filter(Boolean);

    return {
      id: rootId,
      shape: shapeMap.get(rootId),
      children
    };
  }

  /**
   * Layout a tree structure
   */
  private layoutTree(
    tree: any, 
    startX: number, 
    startY: number, 
    direction: string, 
    levelSeparation: number, 
    siblingSeparation: number,
    shapes: Shape[]
  ): number {
    if (!tree.shape) return 0;

    const shapeIndex = shapes.findIndex(s => s.id === tree.id);
    if (shapeIndex !== -1) {
      shapes[shapeIndex] = {
        ...shapes[shapeIndex],
        position: { x: startX, y: startY }
      };
    }

    if (tree.children.length === 0) return 1;

    const totalWidth = tree.children.reduce((width: number, child: any) => {
      return width + this.layoutTree(
        child, 
        startX + width * siblingSeparation, 
        startY + (direction === 'top-down' ? levelSeparation : 0),
        direction,
        levelSeparation,
        siblingSeparation,
        shapes
      );
    }, 0);

    return Math.max(1, totalWidth);
  }
}
