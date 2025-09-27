# Hedera Mirror Node MCP Server

An MCP (Model-Context-Protocol) server for Hedera powered by mirror nodes. This package provides a TypeScript implementation for interacting with Hedera's testnet mirror node API.

## Installation

```bash
npm install @laciferin/hedera-mirror-mcp
```

## Features

- TypeScript support with full type definitions
- Zod schema validation for API requests and responses
- SSE (Server-Sent Events) transport support
- Built-in Hedera testnet mirror node API integration

## Usage

```typescript
import { mcpServer } from '@laciferin/hedera-mirror-mcp';

// The server is pre-configured to connect to Hedera's testnet mirror node
// It will start listening on port 3333 by default

// To start the server:
mcpServer.start({
  transportType: 'sse',
  sse: {
    endpoint: '/hedera-testnet-mirror-node-api/sse',
    port: '3333',
  },
});
```

## Development

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/hedera-dev/hedera-mcp-server.git
cd hedera-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Scripts

- `npm run build` - Compiles the TypeScript code
- `npm run clean` - Removes the dist directory
- `npm run prepare` - Cleans and builds the project (runs automatically before publish)

## License

MIT
