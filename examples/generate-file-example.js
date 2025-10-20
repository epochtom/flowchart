// Example: Generate a draw.io file using the MCP server
const flowchartRequest = {
  name: "User Authentication Flow",
  description: "Complete user authentication process with error handling",
  nodes: [
    { type: "start", label: "User Login", id: "start" },
    { type: "input", label: "Enter Credentials", id: "input" },
    { type: "process", label: "Validate Credentials", id: "validate" },
    { type: "decision", label: "Valid Credentials?", id: "decision1" },
    { type: "process", label: "Check Permissions", id: "permissions" },
    { type: "decision", label: "Has Access?", id: "decision2" },
    { type: "process", label: "Grant Access", id: "grant" },
    { type: "output", label: "Welcome Message", id: "welcome" },
    { type: "process", label: "Log Error", id: "log_error" },
    { type: "output", label: "Error Message", id: "error" },
    { type: "end", label: "End", id: "end" }
  ],
  connections: [
    { from: "start", to: "input" },
    { from: "input", to: "validate" },
    { from: "validate", to: "decision1" },
    { from: "decision1", to: "permissions", label: "Yes" },
    { from: "decision1", to: "log_error", label: "No" },
    { from: "permissions", to: "decision2" },
    { from: "decision2", to: "grant", label: "Yes" },
    { from: "decision2", to: "log_error", label: "No" },
    { from: "grant", to: "welcome" },
    { from: "welcome", to: "end" },
    { from: "log_error", to: "error" },
    { from: "error", to: "end" }
  ],
  outputPath: "./output/user-auth-flow.drawio",
  options: {
    direction: "vertical",
    spacing: {
      horizontal: 200,
      vertical: 100
    },
    nodeSize: {
      width: 140,
      height: 70
    }
  }
};

console.log("Example: Generate draw.io file");
console.log("================================");
console.log("Tool: generate_drawio_file");
console.log("Arguments:", JSON.stringify(flowchartRequest, null, 2));
console.log("\nThis will create a file at: ./output/user-auth-flow.drawio");
console.log("The file can be opened in draw.io or any compatible tool.");
