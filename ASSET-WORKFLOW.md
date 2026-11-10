# Automatic portfolio assets

The portfolio reads its image and video files from these folders:

- `assets/portfolio/` — `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, and `.avif` portfolio images
- `assets/artwork/` — optional artwork images, scanned into the same gallery
- `assets/video/` — `.mp4`, `.webm`, and `.mov` videos
- `assets/music/` — `.mp3`, `.m4a`, `.aac`, `.ogg`, `.wav`, and `.flac` audio tracks

You can place image files directly in `assets/portfolio/`. Subfolders are scanned too; their names become category filters. New audio files are added to the music player's playlist automatically. Unsupported files and empty folders do not create cards or tracks.

## Deploy on Vercel

Vercel builds `assets-index.json` automatically from the asset folders on every deployment. Push new assets to the connected Git repository to trigger a deployment and refresh the gallery, video showcase, and music playlist. The deployed page reads this generated index; it does not run `start-portfolio.bat` or the local `server.mjs`.

## Start the local portfolio

Run `start-portfolio.bat` on Windows, or run `node server.mjs` from this project folder and open `http://localhost:4175`. Keep the terminal running while you use the page. The local server rescans asset folders every five seconds; on Vercel, the index is refreshed during deployment instead.
