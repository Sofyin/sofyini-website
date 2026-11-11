import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

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

async function createPreviews(folder, assets) {
  for (const asset of assets) {
    const originalPath = path.join(root, "assets", folder, asset.relativePath);
    const previewRelativePath = asset.relativePath.replace(/\.[^.]+$/, ".webp");
    const galleryPath = path.join(root, "assets", "previews", "gallery", folder, previewRelativePath);
    const viewerPath = path.join(root, "assets", "previews", "full", folder, previewRelativePath);
    const encodedPath = previewRelativePath.split("/").map(encodeURIComponent).join("/");
    const previewUrl = `/assets/previews/gallery/${folder}/${encodedPath}`;
    const viewerUrl = `/assets/previews/full/${folder}/${encodedPath}`;
    await Promise.all([
      mkdir(path.dirname(galleryPath), { recursive: true }),
      mkdir(path.dirname(viewerPath), { recursive: true })
    ]);
    const image = sharp(originalPath).rotate();
    await Promise.all([
      image.clone()
        .resize({ width: 960, height: 960, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78, effort: 4 })
        .toFile(galleryPath),
      image.clone()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 76, effort: 4 })
        .toFile(viewerPath)
    ]);
    asset.previewUrl = previewUrl;
    asset.viewerUrl = viewerUrl;
  }
}

const [portfolio, legacyArtwork, videos, music] = await Promise.all([
  scan("portfolio", imageExtensions),
  scan("artwork", imageExtensions),
  scan("video", videoExtensions),
  scan("music", musicExtensions)
]);

await Promise.all([
  createPreviews("portfolio", portfolio),
  createPreviews("artwork", legacyArtwork)
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
