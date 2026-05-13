import { writeFileSync } from "fs";

const FILE_KEY = "q7hQhMiFjvdqjhIDmB1R48";
const TOKEN = process.env.FIGMA_TOKEN;
const FRAME_IDS = ["106:156", "115:2"]; // Frame 34, Frame 35

if (!TOKEN) { console.error("FIGMA_TOKEN not set"); process.exit(1); }

const headers = { "X-Figma-Token": TOKEN };

async function get(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function flatten(node, acc = {}) {
  acc[node.id] = node;
  for (const child of node.children ?? []) flatten(child, acc);
  return acc;
}

function extractTexts(node, texts = []) {
  if (node.type === "TEXT") {
    texts.push({
      id: node.id,
      name: node.name,
      characters: node.characters,
      style: {
        fontFamily: node.style?.fontFamily,
        fontSize: node.style?.fontSize,
        fontWeight: node.style?.fontWeight,
        textAlign: node.style?.textAlignHorizontal,
        color: node.fills?.[0]?.color
          ? `#${["r","g","b"].map(c => Math.round(node.fills[0].color[c]*255).toString(16).padStart(2,"0")).join("")}`
          : null,
      },
      bounds: node.absoluteBoundingBox,
    });
  }
  for (const child of node.children ?? []) extractTexts(child, texts);
  return texts;
}

function extractImages(node, imgs = []) {
  if (node.type === "RECTANGLE" || node.type === "FRAME" || node.type === "VECTOR") {
    const imageFill = node.fills?.find(f => f.type === "IMAGE");
    if (imageFill) imgs.push({ id: node.id, name: node.name, imageRef: imageFill.imageRef, bounds: node.absoluteBoundingBox });
  }
  for (const child of node.children ?? []) extractImages(child, imgs);
  return imgs;
}

function summarizeLayout(node, depth = 0, summary = []) {
  if (depth > 4) return summary;
  summary.push({
    depth,
    id: node.id,
    name: node.name,
    type: node.type,
    bounds: node.absoluteBoundingBox,
    layout: node.layoutMode ?? null,
    fills: node.fills?.filter(f => f.type === "SOLID").map(f => ({
      hex: `#${["r","g","b"].map(c => Math.round(f.color[c]*255).toString(16).padStart(2,"0")).join("")}`,
      opacity: f.opacity ?? f.color.a ?? 1
    })) ?? [],
    children: node.children?.length ?? 0,
  });
  for (const child of node.children ?? []) summarizeLayout(child, depth + 1, summary);
  return summary;
}

console.log("Fetching nodes...");
const encoded = FRAME_IDS.map(id => encodeURIComponent(id)).join(",");
const { nodes } = await get(`/files/${FILE_KEY}/nodes?ids=${encoded}`);

const results = {};

for (const [id, data] of Object.entries(nodes)) {
  const node = data.document;
  const frameName = node.name;
  console.log(`\n=== ${frameName} (${id}) — ${node.absoluteBoundingBox?.width}x${node.absoluteBoundingBox?.height} ===`);

  const texts = extractTexts(node);
  const images = extractImages(node);
  const layout = summarizeLayout(node);

  console.log(`  Texts: ${texts.length}`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Layout nodes: ${layout.length}`);

  results[frameName] = { id, width: node.absoluteBoundingBox?.width, height: node.absoluteBoundingBox?.height, texts, images, layout };
}

// Fetch PNG exports
console.log("\nFetching PNG exports...");
const ids = FRAME_IDS.map(id => encodeURIComponent(id)).join(",");
const { images: pngUrls } = await get(`/images/${FILE_KEY}?ids=${FRAME_IDS.join(",")}&format=png&scale=1`);
for (const [id, url] of Object.entries(pngUrls)) {
  const frameName = Object.entries(results).find(([,v]) => v.id === id)?.[0];
  if (frameName) results[frameName].screenshotUrl = url;
}

writeFileSync("scripts/figma-frames-34-35.json", JSON.stringify(results, null, 2));
console.log("\nSaved to scripts/figma-frames-34-35.json");

// Print text content summary
for (const [name, data] of Object.entries(results)) {
  console.log(`\n--- ${name} — Texts ---`);
  data.texts.slice(0, 30).forEach(t => console.log(`  [${t.style.fontSize}px ${t.style.fontWeight}] "${t.characters?.slice(0, 80)}"`));
  if (data.screenshotUrl) console.log(`\n  Screenshot: ${data.screenshotUrl}`);
}
