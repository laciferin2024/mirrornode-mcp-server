#!/usr/bin/env node

import { mcpServer } from './mcpServer';

// Start the server when the CLI is invoked
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;
const host = process.env.HOST || 'localhost';

// Start the FastMCP server using the correct method
mcpServer.start({
  transportType: "sse",
  sse: {
    endpoint: "/mcp",
    port: port
  }
}).then(() => {
  console.log(`Hedera Mirror MCP Server running at http://${host}:${port}/mcp`);
}).catch(error => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});