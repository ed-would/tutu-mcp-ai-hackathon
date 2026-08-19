import {
  closeTutuMcp,
  connectTutuMcp,
  TUTU_MCP_ENDPOINT,
} from "../server/mcp/client.js";
import { buildPackagesResponse } from "../server/packages/orchestrator.js";
import {
  type PackageCallResult,
  type PackageCallTool,
} from "../server/packages/contracts.js";

const DEPARTURE_DATE = "2026-08-27";
const RETURN_DATE = "2026-08-30";

/** Run the smallest live package path, without invoking an LLM or checkout. */
export async function runPackagesSmoke(): Promise<void> {
  let connection;

  try {
    connection = await connectTutuMcp();
    const callTool: PackageCallTool = async (name, args, timeoutMs) => {
      const result = await connection!.client.callTool(
        { name, arguments: args },
        { timeout: timeoutMs },
      );
      return result as PackageCallResult;
    };

    const response = await buildPackagesResponse(
      {
        intent: {
          origin: "Москва",
          departureDate: DEPARTURE_DATE,
          returnDate: RETURN_DATE,
          adults: 1,
          hotelPreferences: { mode: "choose_self" },
        },
        idea: {
          id: "smoke-spb",
          title: "Санкт-Петербург",
          destination: "Санкт-Петербург",
        },
        preferences: {},
        sessionSeed: "packages-smoke-2026-08-19",
      },
      {
        requestId: "packages-smoke",
        now: () => new Date("2026-08-19T12:00:00.000Z"),
        callTool,
      },
    );

    if (response.sources.length === 0) {
      throw new Error("live package response has no source evidence");
    }
    const expectedTools = new Set(["search_multitransport", "search_avia", "search_hotels", "search_bus"]);
    if (
      response.sources.some((source) => !expectedTools.has(source.tool)) ||
      !response.sources.some((source) => source.tool === "search_avia") ||
      !response.sources.some((source) => source.tool === "search_hotels")
    ) {
      throw new Error("live package response contains an unknown source tool");
    }

    for (const packageResult of response.packages) {
      if (packageResult.source !== "Tutu MCP") {
        throw new Error("package is missing the Tutu MCP source marker");
      }
      if (packageResult.price.confidence === "exact_round_trip") {
        const outbound = packageResult.transport.outbound;
        const checkoutRef = packageResult.transport.checkoutRef;
        const outboundRecord = typeof outbound === "object" && outbound !== null ? outbound as Record<string, unknown> : undefined;
        const checkoutRecord = typeof checkoutRef === "object" && checkoutRef !== null ? checkoutRef as Record<string, unknown> : undefined;
        const exact = checkoutRecord?.is_round_trip === true || outboundRecord?.is_round_trip === true;
        if (!exact) {
          throw new Error("fabricated exact_round_trip from one-way transport legs");
        }
      }
    }

    const hasUsablePackage = response.packages.length > 0;
    const hasLiveSource = response.sources.some((source) => source.status !== "unavailable");
    if (!hasUsablePackage || !hasLiveSource) {
      throw new Error("live Tutu returned no usable package or all sources were unavailable");
    }

    const sourceSummary = response.sources
      .map((source) => `${source.tool}:${source.status}/${source.variants}`)
      .join(",");
    console.log(
      `Tutu packages smoke: ok endpoint=${new URL(TUTU_MCP_ENDPOINT).host} ` +
        `packages=${response.packages.length} warnings=${response.warnings.length} ` +
        `sources=${sourceSummary}`,
    );
  } finally {
    await closeTutuMcp(connection);
  }
}

const isEntryPoint =
  typeof process.argv[1] === "string" &&
  new URL(`file://${process.argv[1]}`).href === import.meta.url;

if (isEntryPoint) {
  runPackagesSmoke().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`Tutu packages smoke: failed (${message})`);
    process.exitCode = 1;
  });
}
