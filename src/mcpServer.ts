#!/usr/bin/env bun

import { endpointDefinitions, createApiClient } from './openApiZod';
import { Method } from '@zodios/core';

type ApiEndpoint = {
  method: Method;
  path: string;
  alias: string;
  description?: string;
  parameters?: Array<{
    name: string;
    type: 'Path' | 'Query' | 'Body';
    schema: z.ZodType<any>;
  }>;
  response: z.ZodType<any>;
  errors?: Array<{
    status: number;
    description?: string;
    schema: z.ZodType<any>;
  }>;
};
import { FastMCP } from "fastmcp"
import { z } from "zod"

interface Tool<P, R> {
  name: string
  description: string
  parameters: z.ZodType<P>
  execute: (inputs: P) => Promise<R>
}

type EndpointParameter = {
  name: string
  type: "Path" | "Query" | "Body"
  schema: z.ZodTypeAny
  description?: string
}

interface ZodiosRequest {
  params?: Record<string, unknown>
  queries?: Record<string, unknown>
}

const mcpServer = new FastMCP({
  name: "hederaTestnetMirrorNodeApi",
  version: "0.0.0",
})

const zodiosApiClient = createApiClient(
  "https://testnet.mirrornode.hedera.com",
  { validate: "request" }
)
convertZodiosToMcp(endpointDefinitions[0])

mcpServer.start({
  transportType: "sse",
  sse: {
    endpoint: "/hedera-testnet-mirror-node-api/sse",
    port: 3333,
  },
})

console.log("MCP server started")

function convertZodiosToMcp(endpoint: ApiEndpoint): void {
  const { method, alias, description, parameters } = endpoint
  if (method !== "get" || typeof alias !== "string") {
    return
  }
  console.log("converting:", alias)

  const fastMcpParameters: Record<string, z.ZodTypeAny> = {}
  parameters?.forEach((parameter: EndpointParameter) => {
    const { name, schema } = parameter
    fastMcpParameters[name] = schema
  })

  const fastMcpExecute = async function (
    inputs: Record<string, unknown>
  ): Promise<string> {
    const params: Record<string, unknown> = {}
    const queries: Record<string, unknown> = {}

    parameters?.forEach((parameter: EndpointParameter) => {
      const { name, type } = parameter
      if (type === "Path") {
        params[name] = inputs[name]
      } else if (type === "Query") {
        queries[name] = inputs[name]
      }
    })

    const zodiosReq: ZodiosRequest = { params, queries }
    console.log(alias, zodiosReq)
    const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
    const result = await (zodiosApiClient as any)[method](endpoint.path, zodiosReq.params ?? {}, {
      queries: zodiosReq.queries ?? {}
    })
    return JSON.stringify(result, undefined, 1)
  }

  const parameterSchema = z.object(fastMcpParameters)
  type Params = z.infer<typeof parameterSchema>
  const fastMcpTool: Tool<Params, string> = {
    name: alias,
    description: description || "",
    parameters: parameterSchema,
    execute: fastMcpExecute,
  }

  mcpServer.addTool(fastMcpTool)
}
