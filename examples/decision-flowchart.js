// Example: Create a decision flowchart
const decisionRequest = {
  name: "User Authentication Flow",
  startLabel: "User Login",
  endLabel: "Access Granted",
  decisions: [
    {
      question: "Valid credentials?",
      yesAction: "Check permissions",
      noAction: "Show error message"
    },
    {
      question: "Has admin rights?",
      yesAction: "Grant full access",
      noAction: "Grant limited access"
    }
  ],
  options: {
    direction: "vertical",
    spacing: {
      horizontal: 200,
      vertical: 100
    }
  }
};

console.log("Decision Flowchart Request:", JSON.stringify(decisionRequest, null, 2));
