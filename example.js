// Example usage of the MCP Flowchart Server
// This is a simple test script to demonstrate the server functionality

const flowchartExample = {
  title: "User Login Process",
  nodes: [
    {
      id: "start",
      type: "start",
      label: "User visits site"
    },
    {
      id: "login_form",
      type: "process",
      label: "Show login form"
    },
    {
      id: "validate",
      type: "process",
      label: "Validate credentials"
    },
    {
      id: "valid_check",
      type: "decision",
      label: "Valid credentials?"
    },
    {
      id: "success",
      type: "process",
      label: "Redirect to dashboard"
    },
    {
      id: "error",
      type: "process",
      label: "Show error message"
    },
    {
      id: "end",
      type: "end",
      label: "End"
    }
  ],
  edges: [
    {
      from: "start",
      to: "login_form"
    },
    {
      from: "login_form",
      to: "validate"
    },
    {
      from: "validate",
      to: "valid_check"
    },
    {
      from: "valid_check",
      to: "success",
      label: "Yes"
    },
    {
      from: "valid_check",
      to: "error",
      label: "No"
    },
    {
      from: "success",
      to: "end"
    },
    {
      from: "error",
      to: "login_form"
    }
  ]
};

console.log("Example flowchart definition:");
console.log(JSON.stringify(flowchartExample, null, 2));

console.log("\nTo test this with the MCP server, send this as a tool call:");
console.log(JSON.stringify({
  tool: "create_flowchart",
  arguments: {
    flowchart: flowchartExample
  }
}, null, 2));
