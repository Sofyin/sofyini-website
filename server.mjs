import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 4175;
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".png", "image/png"],
  [".webp", "image/webp"], [".gif", "image/gif"], [".avif", "image/avif"],
  [".svg", "image/svg+xml"], [".mp4", "video/mp4"], [".webm", "video/webm"],
  [".mov", "video/quicktime"], [".mp3", "audio/mpeg"], [".m4a", "audio/mp4"],
  [".aac", "audio/aac"], [".ogg", "audio/ogg"], [".wav", "audio/wav"],
  [".flac", "audio/flac"]
]);
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov"]);
const musicExtensions = new Set([".mp3", ".m4a", ".aac", ".ogg", ".wav", ".flac"]);

async function scanAssets(folder, allowedExtensions) {
  const folderPath = path.join(root, "assets", folder);
  const results = [];

  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }
      const extension = path.extname(entry.name).toLowerCase();
      if (!entry.isFile() || !allowedExtensions.has(extension)) continue;
      const fileStats = await stat(absolutePath);
      const relativePath = path.relative(folderPath, absolutePath).split(path.sep).join("/");
      const encodedPath = relativePath.split("/").map(encodeURIComponent).join("/");
      results.push({
        relativePath,
        url: `/assets/${folder}/${encodedPath}`,
        modified: Math.trunc(fileStats.mtimeMs),
        size: fileStats.size
      });
    }
  }

  await visit(folderPath);
  return results;
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (requestUrl.pathname === "/api/assets") {
    try {
      const [portfolio, legacyArtwork, videos, music] = await Promise.all([
        scanAssets("portfolio", imageExtensions),
        scanAssets("artwork", imageExtensions),
        scanAssets("video", videoExtensions),
        scanAssets("music", musicExtensions)
      ]);
      const artwork = [
        ...portfolio.map(asset => ({ ...asset, relativePath: `portfolio/${asset.relativePath}` })),
        ...legacyArtwork.map(asset => ({ ...asset, relativePath: `artwork/${asset.relativePath}` }))
      ];
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ artwork, videos, music }));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Unable to scan asset folders" }));
      console.error(error);
    }
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const file = await readFile(filePath);
    const contentType = mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
    const cacheHeaders = [".html", ".css", ".js", ".mjs"].includes(path.extname(filePath).toLowerCase())
      ? { "Cache-Control": "no-store" }
      : {};
    response.writeHead(200, {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      ...cacheHeaders
    });
    response.end(file);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error.code === "ENOENT" ? "Not found" : "Server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`SOFyini portfolio is running at http://localhost:${port}`);
  console.log("Artwork and video folders are rescanned every five seconds while the page is open.");
});
