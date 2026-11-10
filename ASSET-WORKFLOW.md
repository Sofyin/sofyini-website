# Automatic portfolio assets

The portfolio reads its image and video files from these folders:

- `assets/portfolio/` — `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, and `.avif` portfolio images
- `assets/artwork/` — optional artwork images, scanned into the same gallery
- `assets/video/` — `.mp4`, `.webm`, and `.mov` videos
- `assets/music/` — `.mp3`, `.m4a`, `.aac`, `.ogg`, `.wav`, and `.flac` audio tracks

You can place image files directly in `assets/portfolio/`. Subfolders are scanned too; their names become category filters. New audio files are added to the music player's playlist automatically. The page checks for changes every five seconds while it is open. Unsupported files and empty folders do not create cards or tracks.

## Start the local portfolio

Run `node server.mjs` from this project folder, then open `http://localhost:4175`. Keep the terminal running while you use the page. Opening `index.html` directly or using a static-only preview cannot scan local folders; the small local server provides the asset index.
