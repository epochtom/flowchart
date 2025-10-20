// Example: Create a complex workflow with multiple node types
const complexRequest = {
  name: "E-commerce Order Processing",
  description: "Complete order processing workflow with error handling",
  nodes: [
    { type: "start", label: "Order Received", id: "start" },
    { type: "input", label: "Customer Details", id: "customer" },
    { type: "process", label: "Validate Order", id: "validate" },
    { type: "decision", label: "Order Valid?", id: "valid_check" },
    { type: "process", label: "Check Inventory", id: "inventory" },
    { type: "decision", label: "Items Available?", id: "stock_check" },
    { type: "process", label: "Process Payment", id: "payment" },
    { type: "decision", label: "Payment Success?", id: "payment_check" },
    { type: "process", label: "Update Inventory", id: "update_stock" },
    { type: "process", label: "Send Confirmation", id: "confirm" },
    { type: "output", label: "Order Details", id: "order_details" },
    { type: "end", label: "Order Complete", id: "complete" },
    { type: "process", label: "Send Error Email", id: "error_email" },
    { type: "end", label: "Order Failed", id: "failed" }
  ],
  connections: [
    { from: "start", to: "customer" },
    { from: "customer", to: "validate" },
    { from: "validate", to: "valid_check" },
    { from: "valid_check", to: "inventory", label: "Yes" },
    { from: "valid_check", to: "error_email", label: "No" },
    { from: "inventory", to: "stock_check" },
    { from: "stock_check", to: "payment", label: "Yes" },
    { from: "stock_check", to: "error_email", label: "No" },
    { from: "payment", to: "payment_check" },
    { from: "payment_check", to: "update_stock", label: "Yes" },
    { from: "payment_check", to: "error_email", label: "No" },
    { from: "update_stock", to: "confirm" },
    { from: "confirm", to: "order_details" },
    { from: "order_details", to: "complete" },
    { from: "error_email", to: "failed" }
  ],
  options: {
    direction: "vertical",
    spacing: {
      horizontal: 180,
      vertical: 90
    },
    nodeSize: {
      width: 140,
      height: 70
    },
    style: {
      backgroundColor: "#f8f9fa",
      borderColor: "#495057",
      textColor: "#212529"
    }
  }
};

console.log("Complex Workflow Request:", JSON.stringify(complexRequest, null, 2));
