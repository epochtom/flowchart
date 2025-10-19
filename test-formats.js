// Test script to demonstrate different export formats
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const testFlowchart = {
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

const formats = ['svg', 'drawio', 'mermaid'];

console.log("Testing different export formats...\n");

for (const format of formats) {
  console.log(`Testing ${format} format...`);
  
  const testRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "create_flowchart",
      arguments: {
        flowchart: testFlowchart,
        format: format
      }
    }
  };

  try {
    const result = execSync('node dist/index.js', {
      input: JSON.stringify(testRequest) + '\n',
      encoding: 'utf8',
      timeout: 5000
    });
    
    const response = JSON.parse(result);
    const content = response.result.content[0].text;
    
    // Save to file
    const filename = `test-flowchart.${format === 'drawio' ? 'drawio' : format}`;
    writeFileSync(filename, content);
    console.log(`✓ ${format} format saved to ${filename}`);
    
    // Show first few lines
    const lines = content.split('\n');
    console.log(`  Preview: ${lines[0].substring(0, 80)}...`);
    console.log('');
    
  } catch (error) {
    console.error(`✗ Error testing ${format} format:`, error.message);
  }
}

console.log("Format testing complete!");
console.log("\nFile formats created:");
console.log("- test-flowchart.svg (SVG format - good for web display)");
console.log("- test-flowchart.drawio (draw.io native format - best for editing)");
console.log("- test-flowchart.mermaid (Mermaid format - good for documentation)");
