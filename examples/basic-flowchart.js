// Example: Create a basic linear flowchart
const flowchartRequest = {
  name: "Basic Process Flow",
  description: "A simple linear process with start, steps, and end",
  nodes: [
    { type: "start", label: "Start" },
    { type: "process", label: "Initialize System" },
    { type: "process", label: "Load Configuration" },
    { type: "process", label: "Start Services" },
    { type: "end", label: "System Ready" }
  ],
  connections: [
    { from: "node_0", to: "node_1" },
    { from: "node_1", to: "node_2" },
    { from: "node_2", to: "node_3" },
    { from: "node_3", to: "node_4" }
  ],
  options: {
    direction: "vertical",
    spacing: {
      horizontal: 150,
      vertical: 80
    }
  }
};

console.log("Basic Flowchart Request:", JSON.stringify(flowchartRequest, null, 2));
