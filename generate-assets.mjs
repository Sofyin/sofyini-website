import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov"]);
const musicExtensions = new Set([".mp3", ".m4a", ".aac", ".ogg", ".wav", ".flac"]);

async function scan(folder, extensions) {
  const folderPath = path.join(root, "assets", folder);
  const assets = [];

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
      if (!entry.isFile() || !extensions.has(extension)) continue;
      const fileStats = await stat(absolutePath);
      const relativePath = path.relative(folderPath, absolutePath).split(path.sep).join("/");
      const encodedPath = relativePath.split("/").map(encodeURIComponent).join("/");
      assets.push({
        relativePath,
        url: `/assets/${folder}/${encodedPath}`,
        modified: Math.trunc(fileStats.mtimeMs),
        size: fileStats.size
      });
    }
  }

  await visit(folderPath);
  return assets;
}

const [portfolio, legacyArtwork, videos, music] = await Promise.all([
  scan("portfolio", imageExtensions),
  scan("artwork", imageExtensions),
  scan("video", videoExtensions),
  scan("music", musicExtensions)
]);

const data = {
  artwork: [
    ...portfolio.map(asset => ({ ...asset, relativePath: `portfolio/${asset.relativePath}` })),
    ...legacyArtwork.map(asset => ({ ...asset, relativePath: `artwork/${asset.relativePath}` }))
  ],
  videos,
  music
};

await writeFile(path.join(root, "assets-index.json"), `${JSON.stringify(data, null, 2)}\n`);
console.log(`Generated asset index: ${data.artwork.length} images, ${videos.length} videos, ${music.length} tracks.`);
