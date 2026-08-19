import { createHash } from "node:crypto";
import {
  closeTutuMcp,
  connectTutuMcp,
  TUTU_MCP_ENDPOINT,
} from "../server/mcp/client.js";

const REQUIRED_TOOLS = [
  "search_multitransport",
  "search_hotels",
  "create_checkout_link",
] as const;

export async function runMcpSmoke(): Promise<void> {
  let connection;

  try {
    connection = await connectTutuMcp();
    const result = await connection.client.listTools(undefined, { timeout: 12_000 });
    const names = result.tools
      .map((tool) => tool.name)
      .filter((name): name is string => typeof name === "string")
      .sort();
    const missing = REQUIRED_TOOLS.filter((name) => !names.includes(name));

    if (missing.length > 0) {
      throw new Error(`required tools missing: ${missing.join(", ")}`);
    }

    const fingerprint = createHash("sha256")
      .update(names.join("\n"))
      .digest("hex")
      .slice(0, 12);

    console.log(
      `Tutu MCP smoke: ok endpoint=${new URL(TUTU_MCP_ENDPOINT).host} ` +
        `tools=${names.length} search_avia=${names.includes("search_avia")} ` +
        `fingerprint=${fingerprint}`,
    );
  } finally {
    await closeTutuMcp(connection);
  }
}

const isEntryPoint =
  typeof process.argv[1] === "string" &&
  new URL(`file://${process.argv[1]}`).href === import.meta.url;

if (isEntryPoint) {
  runMcpSmoke().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`Tutu MCP smoke: failed (${message})`);
    process.exitCode = 1;
  });
}
