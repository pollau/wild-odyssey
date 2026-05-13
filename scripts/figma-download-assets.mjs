import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = "public/assets/figma";
mkdirSync(OUT, { recursive: true });

const assets = {
  "hero-nature.png": "https://www.figma.com/api/mcp/asset/be523b98-635a-4a54-ae66-56617ccd548b",
  "hero-leaf.png": "https://www.figma.com/api/mcp/asset/144310f3-505f-482a-91c3-a2f3f4c61107",
  "logo-image.png": "https://www.figma.com/api/mcp/asset/2077d048-56a9-4e87-9da7-075ec762ef37",
  "stats-bg.png": "https://www.figma.com/api/mcp/asset/57ebe079-039d-43de-80ab-3be34704f55f",
  "cta-bg.png": "https://www.figma.com/api/mcp/asset/09116da7-c87f-4d08-a358-a862f25c9e25",
  "sdg-methodology.png": "https://www.figma.com/api/mcp/asset/7ab6a971-a4dc-46a3-bafd-65807bc06477",
  "workshop-2030.png": "https://www.figma.com/api/mcp/asset/c07e338e-d392-4dc7-8666-4e4c566daaea",
  "workshop-ocean.png": "https://www.figma.com/api/mcp/asset/fc4b4f05-c585-4e01-9492-f810cef35fc2",
  "workshop-biodiversity.png": "https://www.figma.com/api/mcp/asset/ff8ea60f-62af-4ea4-9f84-4c1c3962f90e",
  "workshop-carbon.png": "https://www.figma.com/api/mcp/asset/bf44fc56-52eb-46cd-9176-e1d80e14f933",
  "reason-memorable.png": "https://www.figma.com/api/mcp/asset/ba0e9202-bed3-4fb8-9e55-cda43bc60c66",
  "reason-awareness.png": "https://www.figma.com/api/mcp/asset/dff0314a-f1ad-4d23-806d-9657ce8a3fcb",
  "reason-talent.png": "https://www.figma.com/api/mcp/asset/723305d9-d0cf-4c63-976e-31d31538a945",
  "reason-action.png": "https://www.figma.com/api/mcp/asset/c0121f50-ad86-4e6b-97dc-4c8e3ec87883",
  "icon-clock.svg": "https://www.figma.com/api/mcp/asset/88837fc2-af26-4b05-b036-73e99c51a86a",
  "icon-organic.svg": "https://www.figma.com/api/mcp/asset/30df5da1-ab5d-437d-b633-ea2df2a2a393",
  "icon-customize.svg": "https://www.figma.com/api/mcp/asset/78eae449-a74c-427f-ad48-7c56dce6af81",
  "icon-online.svg": "https://www.figma.com/api/mcp/asset/6678873a-667d-4953-bb31-04d3b9f4116e",
  "icon-leader.svg": "https://www.figma.com/api/mcp/asset/a5813321-9d80-4b89-b95f-179586d9e142",
  "icon-organization.svg": "https://www.figma.com/api/mcp/asset/c293adad-bcca-4db5-8972-9f4ed797c142",
  "flag-fr.svg": "https://www.figma.com/api/mcp/asset/276b5dc1-e1a2-4c9a-b272-fe4dc320c2c6",
};

let ok = 0, fail = 0;
for (const [name, url] of Object.entries(assets)) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(OUT, name), buf);
    console.log(`✓ ${name}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
    fail++;
  }
}
console.log(`\nDone: ${ok} ok, ${fail} failed`);
