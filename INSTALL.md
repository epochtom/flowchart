# Installation Guide

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

## Installation Steps

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd flowchart-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Verify installation**
   ```bash
   npm start
   ```
   You should see: `Flowchart MCP Server running on stdio`

## Development Setup

For development with hot reloading:

```bash
npm run dev
```

## Running Examples

The project includes several example scripts:

```bash
# Basic flowchart example
npm run basic

# Complex workflow example  
npm run complex

# Analysis demo
npm run analysis

# Run all examples
npm run all
```

## MCP Client Integration

To use this server with an MCP client, configure your client to connect to the server:

```json
{
  "mcpServers": {
    "flowchart": {
      "command": "node",
      "args": ["/path/to/flowchart-mcp-server/dist/index.js"]
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure all dependencies are installed: `npm install`
   - Rebuild the project: `npm run build`

2. **TypeScript compilation errors**
   - Check Node.js version (requires 18+)
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

3. **MCP connection issues**
   - Verify the server is running: `npm start`
   - Check client configuration
   - Ensure proper file paths in MCP client config

### Getting Help

- Check the README.md for detailed documentation
- Review example files in the `examples/` directory
- Create an issue in the GitHub repository

## Next Steps

After installation:

1. Read the [README.md](README.md) for comprehensive documentation
2. Try the [examples](examples/) to see the server in action
3. Integrate with your MCP client
4. Start creating complex flowcharts programmatically!
