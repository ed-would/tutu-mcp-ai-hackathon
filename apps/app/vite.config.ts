import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

type ApiHandler = (request: Request) => Promise<Response>;

const localApiRoutes: Record<string, { module: string; exportName: string }> = {
  "/api/health": { module: "/api/health.ts", exportName: "healthHandler" },
  "/api/interpret": { module: "/api/interpret.ts", exportName: "interpretHandler" },
  "/api/packages": { module: "/api/packages.ts", exportName: "packagesHandler" },
  "/api/checkout": { module: "/api/checkout.ts", exportName: "checkoutHandler" },
};

/** Run the same serverless handlers locally instead of returning Vite's HTML 404. */
function localApiPlugin(): Plugin {
  return {
    name: "tutu-local-api",
    configureServer(server) {
      const localEnv = loadEnv(server.config.mode, server.config.root, "");
      server.middlewares.use(async (request, response, next) => {
        const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
        const route = localApiRoutes[path];
        if (!route) return next();
        try {
          const module = await server.ssrLoadModule(route.module);
          const handler = module[route.exportName] as ApiHandler | undefined;
          if (!handler) throw new Error(`Missing local API handler: ${route.exportName}`);
          const appRequest = await toWebRequest(request);
          const appResponse = path === "/api/interpret"
            ? await (handler as (input: Request, options: { env: Record<string, string> }) => Promise<Response>)(appRequest, { env: localEnv })
            : await handler(appRequest);
          await sendWebResponse(response, appResponse);
        } catch {
          response.statusCode = 500;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ code: "LOCAL_API_FAILED", message: "Локальный API не смог обработать запрос." }));
        }
      });
    },
  };
}

async function toWebRequest(request: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (typeof value === "string") headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(", "));
  }
  const method = request.method ?? "GET";
  return new Request(`http://127.0.0.1${request.url ?? "/"}`, {
    method,
    headers,
    ...(method === "GET" || method === "HEAD" ? {} : { body: Buffer.concat(chunks) }),
  });
}

async function sendWebResponse(response: ServerResponse, appResponse: Response) {
  response.statusCode = appResponse.status;
  appResponse.headers.forEach((value, name) => response.setHeader(name, value));
  response.end(Buffer.from(await appResponse.arrayBuffer()));
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: { host: "127.0.0.1", port: 5173 },
  preview: { host: "127.0.0.1", port: 4173 },
});
