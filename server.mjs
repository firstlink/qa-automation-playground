import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createDefaultState,
  createSeedSnapshot,
  normalizeState,
  resetState
} from "./public/app-state.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const stateByClient = new Map();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function getJsonBody(req) {
  const rawBody = await getBody(req);
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const separator = entry.indexOf("=");
      if (separator === -1) {
        return cookies;
      }
      const key = entry.slice(0, separator);
      const value = entry.slice(separator + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function resolveClientId(req, parsedBody = null) {
  const cookies = parseCookies(req.headers.cookie);
  return (
    req.headers["x-qa-playground-client"] ||
    parsedBody?.clientId ||
    cookies.qa_playground_client ||
    "anonymous"
  );
}

function getClientState(clientId) {
  if (!stateByClient.has(clientId)) {
    stateByClient.set(clientId, createDefaultState());
  }
  return stateByClient.get(clientId);
}

function setClientState(clientId, nextState) {
  const normalized = normalizeState(nextState);
  stateByClient.set(clientId, normalized);
  return normalized;
}

async function serveFile(res, filePath, headers = {}) {
  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
      ...headers
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  if (pathname === "/api/seed" && req.method === "GET") {
    const clientId = resolveClientId(req);
    const snapshot = createSeedSnapshot(getClientState(clientId));
    return sendJson(res, 200, {
      ...snapshot,
      generatedAt: new Date().toISOString()
    });
  }

  if (pathname === "/api/state" && req.method === "GET") {
    const clientId = resolveClientId(req);
    return sendJson(res, 200, getClientState(clientId));
  }

  if (pathname === "/api/state" && req.method === "POST") {
    const parsed = await getJsonBody(req);
    const clientId = resolveClientId(req, parsed);
    const current = getClientState(clientId);
    const nextState = parsed.state ? parsed.state : current;
    const state = setClientState(clientId, nextState);
    return sendJson(res, 200, {
      ok: true,
      reason: parsed.reason || "sync",
      state
    });
  }

  if (pathname === "/api/notifications" && req.method === "GET") {
    const clientId = resolveClientId(req);
    return sendJson(res, 200, getClientState(clientId).notifications);
  }

  if (pathname === "/api/status/404" && req.method === "GET") {
    return sendJson(res, 404, { status: 404, message: "Simulated missing resource" });
  }

  if (pathname === "/api/status/500" && req.method === "GET") {
    return sendJson(res, 500, { status: 500, message: "Simulated server error" });
  }

  if (pathname === "/api/mutate" && req.method === "POST") {
    const parsed = await getJsonBody(req);
    const clientId = resolveClientId(req, parsed);
    const appState = getClientState(clientId);
    appState.logs = [
      {
        at: new Date().toISOString(),
        route: parsed.route || "/api/mutate",
        title: `Mutation recorded for ${parsed.action || "unknown-action"}`,
        details: parsed
      },
      ...appState.logs
    ].slice(0, 24);

    return sendJson(res, 200, {
      ok: true,
      message: `Mutation recorded for ${parsed.action || "unknown-action"}`,
      received: parsed,
      admin: appState.admin
    });
  }

  if (pathname === "/api/reset" && req.method === "POST") {
    const clientId = resolveClientId(req);
    const appState = setClientState(clientId, resetState(getClientState(clientId)));
    return sendJson(res, 200, {
      ok: true,
      message: "Server-side reset acknowledged",
      state: appState
    });
  }

  if (pathname === "/redirect-demo" && req.method === "GET") {
    res.writeHead(302, { Location: "/windows?redirected=1" });
    return res.end();
  }

  if (pathname.startsWith("/download/") && (req.method === "GET" || req.method === "HEAD")) {
    const fileName = pathname.replace("/download/", "");
    const filePath = path.join(publicDir, "downloads", fileName);
    return serveFile(res, filePath, {
      "Content-Disposition": `attachment; filename="${fileName}"`
    });
  }

  if (pathname === "/broken-image.svg" && req.method === "GET") {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Intentionally broken image");
  }

  const normalizedPath = pathname === "/" ? "/index.html" : pathname;
  const staticPath = path.join(publicDir, normalizedPath);

  if (path.extname(staticPath)) {
    return serveFile(res, staticPath);
  }

  return serveFile(res, path.join(publicDir, "index.html"));
});

server.listen(port, host, () => {
  console.log(`QA Automation Playground running at http://${host}:${port}`);
});
