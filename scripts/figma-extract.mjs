import { writeFileSync } from "fs";

const FILE_KEY = "q7hQhMiFjvdqjhIDmB1R48";
const TOKEN = process.env.FIGMA_TOKEN;

if (!TOKEN) {
  console.error("FIGMA_TOKEN env var not set");
  process.exit(1);
}

const headers = { "X-Figma-Token": TOKEN };

async function get(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json();
}

// Flatten all nodes recursively
function flatten(node, acc = {}) {
  acc[node.id] = node;
  for (const child of node.children ?? []) flatten(child, acc);
  return acc;
}

// Extract unique colors
function extractColors(nodes) {
  const colors = new Map();
  for (const node of Object.values(nodes)) {
    for (const fill of node.fills ?? []) {
      if (fill.type === "SOLID" && fill.visible !== false) {
        const { r, g, b, a = 1 } = fill.color;
        const hex = `#${[r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")}`;
        colors.set(hex, { hex, opacity: fill.opacity ?? a, name: node.name });
      }
    }
  }
  return [...colors.values()];
}

// Extract text styles
function extractTypography(nodes) {
  const styles = new Map();
  for (const node of Object.values(nodes)) {
    if (node.type === "TEXT" && node.style) {
      const key = `${node.style.fontFamily}-${node.style.fontSize}-${node.style.fontWeight}`;
      if (!styles.has(key)) {
        styles.set(key, {
          name: node.name,
          fontFamily: node.style.fontFamily,
          fontSize: node.style.fontSize,
          fontWeight: node.style.fontWeight,
          lineHeight: node.style.lineHeightPx,
          letterSpacing: node.style.letterSpacing,
          textCase: node.style.textCase,
        });
      }
    }
  }
  return [...styles.values()];
}

// Extract top-level frames (pages/screens)
function extractFrames(nodes) {
  return Object.values(nodes)
    .filter((n) => n.type === "FRAME" || n.type === "COMPONENT")
    .map((n) => ({ id: n.id, name: n.name, width: n.absoluteBoundingBox?.width, height: n.absoluteBoundingBox?.height }));
}

console.log("Fetching file metadata...");
const file = await get(`/files/${FILE_KEY}`);

const allNodes = {};
for (const page of file.document.children) {
  flatten(page, allNodes);
}

const result = {
  fileName: file.name,
  lastModified: file.lastModified,
  pages: file.document.children.map((p) => ({ id: p.id, name: p.name })),
  colors: extractColors(allNodes),
  typography: extractTypography(allNodes),
  frames: extractFrames(allNodes),
};

// Fetch image exports for top-level frames
console.log(`Found ${result.frames.length} frames. Fetching export URLs...`);
if (result.frames.length > 0) {
  const ids = result.frames.slice(0, 20).map((f) => f.id).join(",");
  const images = await get(`/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=2`);
  result.frameImages = images.images;
}

const outPath = "scripts/figma-design.json";
writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`\nExtracted to ${outPath}`);
console.log(`  Pages: ${result.pages.map((p) => p.name).join(", ")}`);
console.log(`  Colors: ${result.colors.length}`);
console.log(`  Text styles: ${result.typography.length}`);
console.log(`  Frames: ${result.frames.length}`);
