import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const seedPayload = {
  users: [{ username: "student", password: "Password123!" }],
  products: [
    { id: 1, name: "Laptop", price: 999 },
    { id: 2, name: "Phone", price: 599 },
    { id: 3, name: "Headphones", price: 149 },
    { id: 4, name: "Monitor", price: 329 }
  ],
  orders: [],
  notifications: ["Welcome!", "Order placed successfully"]
};

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
    return sendJson(res, 200, {
      ...seedPayload,
      generatedAt: new Date().toISOString()
    });
  }

  if (pathname === "/api/notifications" && req.method === "GET") {
    return sendJson(res, 200, seedPayload.notifications);
  }

  if (pathname === "/api/status/404" && req.method === "GET") {
    return sendJson(res, 404, { status: 404, message: "Simulated missing resource" });
  }

  if (pathname === "/api/status/500" && req.method === "GET") {
    return sendJson(res, 500, { status: 500, message: "Simulated server error" });
  }

  if (pathname === "/api/mutate" && req.method === "POST") {
    const rawBody = await getBody(req);
    const parsed = rawBody ? JSON.parse(rawBody) : {};
    return sendJson(res, 200, {
      ok: true,
      message: `Mutation recorded for ${parsed.action || "unknown-action"}`,
      received: parsed
    });
  }

  if (pathname === "/api/reset" && req.method === "POST") {
    return sendJson(res, 200, { ok: true, message: "Server-side reset acknowledged" });
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
