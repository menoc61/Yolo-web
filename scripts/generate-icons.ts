/**
 * Generate YOLO PWA icons as raw PNG (no dependencies — uses only Node/zlib).
 * Run once: bun run scripts/generate-icons.ts
 */
import { deflateSync, inflateSync } from "zlib";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT = join(import.meta.dir, "..", "public", "icons");
mkdirSync(OUT, { recursive: true });

// ── Geometry ──
function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

type Bitmap = { W: number; H: number; buf: Uint8Array };

function readPNG(file: string): Bitmap {
  const input = readFileSync(file);
  if (input.readUInt32BE(0) !== 0x89504e47) throw new Error(`${file} is not a PNG`);

  let offset = 8;
  let width = 0;
  let height = 0;
  const idat: Buffer[] = [];
  while (offset < input.length) {
    const length = input.readUInt32BE(offset);
    const type = input.toString("ascii", offset + 4, offset + 8);
    const data = input.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) throw new Error(`${file} must be an 8-bit RGBA PNG`);
    } else if (type === "IDAT") {
      idat.push(data);
    }
    offset += 12 + length;
  }

  const rowBytes = width * 4;
  const inflated = inflateSync(Buffer.concat(idat));
  const pixels = new Uint8Array(width * height * 4);
  let sourceOffset = 0;
  for (let y = 0; y < height; y++) {
    const filter = inflated[sourceOffset++];
    const rowOffset = y * rowBytes;
    for (let x = 0; x < rowBytes; x++) {
      const left = x >= 4 ? pixels[rowOffset + x - 4] : 0;
      const above = y > 0 ? pixels[rowOffset - rowBytes + x] : 0;
      const upperLeft = y > 0 && x >= 4 ? pixels[rowOffset - rowBytes + x - 4] : 0;
      const value = inflated[sourceOffset++];
      let reconstructed = value;
      if (filter === 1) reconstructed = value + left;
      if (filter === 2) reconstructed = value + above;
      if (filter === 3) reconstructed = value + Math.floor((left + above) / 2);
      if (filter === 4) {
        const estimate = left + above - upperLeft;
        const pa = Math.abs(estimate - left);
        const pb = Math.abs(estimate - above);
        const pc = Math.abs(estimate - upperLeft);
        reconstructed = value + (pa <= pb && pa <= pc ? left : pb <= pc ? above : upperLeft);
      }
      pixels[rowOffset + x] = reconstructed & 0xff;
    }
  }
  return { W: width, H: height, buf: pixels };
}

// ── Nearest-neighbour downscale ──
function scale(src: { W: number; H: number; buf: Uint8Array }, tw: number, th: number): Uint8Array {
  const out = new Uint8Array(tw * th * 4);
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    const sx = Math.min(Math.floor((x / tw) * src.W), src.W - 1);
    const sy = Math.min(Math.floor((y / th) * src.H), src.H - 1);
    const si = (sy * src.W + sx) * 4;
    const di = (y * tw + x) * 4;
    out[di] = src.buf[si]; out[di + 1] = src.buf[si + 1]; out[di + 2] = src.buf[si + 2]; out[di + 3] = src.buf[si + 3];
  }
  return out;
}

// ── PNG encoder (RGBA → IHDR + IDAT + IEND) ──
function crc32(buf: Uint8Array): number {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1;
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ -1) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const len = new Uint8Array(4);
  len[0] = (data.length >>> 24) & 0xff; len[1] = (data.length >>> 16) & 0xff;
  len[2] = (data.length >>> 8) & 0xff;  len[3] = data.length & 0xff;
  const typeBytes = new TextEncoder().encode(type);
  const body = new Uint8Array(4 + typeBytes.length + data.length);
  body.set(len); body.set(typeBytes, 4); body.set(data, 4 + typeBytes.length);
  const crcBytes = new Uint8Array(4);
  const c = crc32(body.slice(4));
  crcBytes[0] = (c >>> 24) & 0xff; crcBytes[1] = (c >>> 16) & 0xff;
  crcBytes[2] = (c >>> 8) & 0xff;  crcBytes[3] = c & 0xff;
  const out = new Uint8Array(body.length + 4);
  out.set(body); out.set(crcBytes, body.length);
  return out;
}

function encodePNG(width: number, height: number, rgba: Uint8Array): Buffer {
  const header = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = new Uint8Array(13);
  ihdr[0] = (width >>> 24) & 0xff; ihdr[1] = (width >>> 16) & 0xff; ihdr[2] = (width >>> 8) & 0xff; ihdr[3] = width & 0xff;
  ihdr[4] = (height >>> 24) & 0xff; ihdr[5] = (height >>> 16) & 0xff; ihdr[6] = (height >>> 8) & 0xff; ihdr[7] = height & 0xff;
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  const rowBytes = 1 + width * 4;
  const raw = new Uint8Array(height * rowBytes);
  for (let y = 0; y < height; y++) {
    raw[y * rowBytes] = 0; // filter none
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * rowBytes + 1);
  }
  const idat = deflateSync(raw);

  const parts = [
    header,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", new Uint8Array(idat)),
    pngChunk("IEND", new Uint8Array(0)),
  ];
  let total = 0; for (const p of parts) total += p.length;
  const out = Buffer.alloc(total);
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  return out;
}

function composeIcon(source: Bitmap, size: number, background: [number, number, number]): Uint8Array {
  const output = new Uint8Array(size * size * 4);
  output.fill(255);
  for (let i = 0; i < size * size; i++) {
    output[i * 4] = background[0];
    output[i * 4 + 1] = background[1];
    output[i * 4 + 2] = background[2];
  }
  const scaleFactor = Math.min((size * 0.82) / source.W, (size * 0.82) / source.H);
  const targetW = Math.max(1, Math.round(source.W * scaleFactor));
  const targetH = Math.max(1, Math.round(source.H * scaleFactor));
  const startX = Math.floor((size - targetW) / 2);
  const startY = Math.floor((size - targetH) / 2);
  const resized = scale(source, targetW, targetH);
  for (let y = 0; y < targetH; y++) for (let x = 0; x < targetW; x++) {
    const sourceIndex = (y * targetW + x) * 4;
    const targetIndex = ((startY + y) * size + startX + x) * 4;
    const alpha = resized[sourceIndex + 3] / 255;
    output[targetIndex] = Math.round(resized[sourceIndex] * alpha + background[0] * (1 - alpha));
    output[targetIndex + 1] = Math.round(resized[sourceIndex + 1] * alpha + background[1] * (1 - alpha));
    output[targetIndex + 2] = Math.round(resized[sourceIndex + 2] * alpha + background[2] * (1 - alpha));
  }
  return output;
}

const publicDir = join(import.meta.dir, "..", "public");
const logos = [
  { name: "logo-dark", source: readPNG(join(publicDir, "logo-dark.png")), background: [255, 255, 255] as [number, number, number] },
  { name: "logo-white", source: readPNG(join(publicDir, "logo-white.png")), background: [11, 11, 11] as [number, number, number] },
];
for (const logo of logos) {
  for (const size of [32, 192, 512]) {
    writeFileSync(join(OUT, `${logo.name}-${size}.png`), encodePNG(size, size, composeIcon(logo.source, size, logo.background)));
  }
}

console.log("✓ Generated logo-dark/logo-white favicon and 192px/512px icon variants");

// ── OG social card 1200×630 ──
const OG_W = 1200, OG_H = 630;
const og = new Uint8Array(OG_W * OG_H * 4);
for (let i = 0; i < OG_W * OG_H; i++) { og[i * 4] = 11; og[i * 4 + 1] = 11; og[i * 4 + 2] = 11; og[i * 4 + 3] = 255; }

// White Y logo centered-left
const YC = 300, YR = 150, thickY = 16;
const oy = {
  tr: [YC - YR * 0.42, YC - YR * 0.62, YC, YC + YR * 0.28],
  tl: [YC + YR * 0.42, YC - YR * 0.62, YC, YC + YR * 0.28],
  vm: [YC, YC + YR * 0.28, YC, YC + YR * 0.72],
};
for (let y = 0; y < OG_H; y++) for (let x = 0; x < OG_W; x++) {
  let inside = false;
  for (const [ax, ay, bx, by] of [oy.tr, oy.tl, oy.vm]) {
    if (distToSegment(x, y, ax, ay, bx, by) <= thickY) { inside = true; break; }
  }
  if (inside) { const i = (y * OG_W + x) * 4; og[i] = 255; og[i + 1] = 255; og[i + 2] = 255; og[i + 3] = 255; }
}

writeFileSync(join(join(import.meta.dir, "..", "public"), "og.png"), encodePNG(OG_W, OG_H, og));
console.log("✓ public/og.png (1200×630)");