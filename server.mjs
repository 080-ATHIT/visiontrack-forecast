import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEOS_DIR = path.join(__dirname, "videos");
const PORT = Number(process.env.PORT || 3000);

if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

const MIME_TYPES = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".ogg": "video/ogg",
};

const EXTENSIONS = Object.keys(MIME_TYPES);

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function findZoneVideo(zoneNum) {
  const files = fs.readdirSync(VIDEOS_DIR);
  const patterns = [
    new RegExp(`^zone[_\\s-]?${zoneNum}\\.`, "i"),
    new RegExp(`^z${zoneNum}\\.`, "i"),
    new RegExp(`^${zoneNum}\\.`, "i"),
  ];
  for (const pat of patterns) {
    const match = files.find(
      (f) => pat.test(f) && EXTENSIONS.includes(path.extname(f).toLowerCase())
    );
    if (match) return match;
  }
  return null;
}

function streamVideo(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/zones") {
    const zones = [1, 2, 3, 4].map((num) => {
      const file = findZoneVideo(num);
      return {
        id: `zone${num}`,
        number: num,
        label: `Zone ${num}`,
        fileName: file,
        videoUrl: file ? `/videos/${encodeURIComponent(file)}` : null,
      };
    });
    sendJson(res, 200, { zones });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/videos/")) {
    const fileName = decodeURIComponent(url.pathname.slice("/videos/".length));
    const safeName = path.basename(fileName);
    const filePath = path.join(VIDEOS_DIR, safeName);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      streamVideo(req, res, filePath);
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`\nCafeteria 4-Zone Density Demo running at http://localhost:${PORT}`);
  console.log(`Videos folder: ${VIDEOS_DIR} (zone1.mp4 .. zone4.mp4)\n`);
});
