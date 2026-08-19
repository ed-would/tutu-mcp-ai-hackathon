import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

export const TUTU_MCP_ENDPOINT = "https://mcp.tutu.ru/mcp";

export type TutuMcpConnection = {
  client: Client;
  transport: StreamableHTTPClientTransport;
};

/** Create an unconnected Tutu MCP client and its per-request transport. */
export function createTutuMcpConnection(
): TutuMcpConnection {
  const client = new Client({ name: "travel-tinder", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(
    new URL(TUTU_MCP_ENDPOINT),
  );

  return { client, transport };
}

/** Connect a fresh client. Call closeTutuMcp in a finally block. */
export async function connectTutuMcp(
): Promise<TutuMcpConnection> {
  const connection = createTutuMcpConnection();
  try {
    await connection.client.connect(connection.transport, { timeout: 12_000 });
    return connection;
  } catch (error) {
    try {
      await closeTutuMcp(connection);
    } catch {
      // Preserve the original connection failure.
    }
    throw error;
  }
}

/** Close the transport without masking the original failure. */
export async function closeTutuMcp(
  connection: TutuMcpConnection | undefined,
): Promise<void> {
  if (!connection) return;

  await connection.transport.close();
}
