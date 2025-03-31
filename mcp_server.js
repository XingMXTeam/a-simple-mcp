import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// Handles communication via standard input/output
// This can be changed to other protocols that MCP supports
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Creates a new MCP server instance with a name and version
const server = new McpServer({
  name: "ping-pong",
  version: "1.0.0",
  // 添加 resources capability
  capabilities: {
    resources: {
      subscribe: true,
      listChanged: true,
    },
  },
});

// Define resources that can be discovered by the model
server.resource(
  "echo",
  new ResourceTemplate("echo://{message}", {
    list: () => ({
      resources: [
        {
          uri: "echo://hello",
          name: "Echo Resource",
          description: "A dynamic echo resource that responds with your message",
          mimeType: "text/plain"
        }
      ],
    }),
  }),
  async (uri, { message }) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/plain",
        text: `Resource echo: ${message}`,
      },
    ],
  })
);

server.prompt("echo", { message: z.string() }, ({ message }) => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `Please process this message: ${message}`,
      },
    },
  ],
}));

// Add ping handler
// Configures a simple tool named "ping"; when this command is typed into the Cursor chat,
// Cursor automatically knows to call this tool
// 定义tool工具，可以让大模型发现可执行的工具
// @doc https://modelcontextprotocol.io/docs/concepts/tools
server.tool(
  "ping",
  "Responds with pong",
  // The ping tool accepts any parameters
  // Logs received parameters to stderr
  // Returns a simple "pong" response
  {},
  async (params) => {
    console.log(`Received ping with params: ${JSON.stringify(params)}`);
    return {
      content: [
        {
          type: "text",
          text: "pong11",
        },
      ],
    };
  }
);
// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Echo MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    throw error;
  }
}
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
