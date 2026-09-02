/**
 * Generate YOLO PWA icons as raw PNG (no dependencies — uses only Node/zlib).
 * Run once: bun run scripts/generate-icons.ts
 */
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";
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

// ── Draw Y on a transparent RGBA bitmap ──
function drawY(size: number): Uint8Array {
  const W = size, H = size;
  const buf = new Uint8Array(W * H * 4);

  // Background #0b0b0b
  for (let i = 0; i < W * H; i++) { buf[i * 4] = 11; buf[i * 4 + 1] = 11; buf[i * 4 + 2] = 11; buf[i * 4 + 3] = 255; }

  const thick = size * 0.055;
  const arms: [number, number, number, number][] = [
    [W * 0.28, H * 0.20, W * 0.5, H * 0.60],
    [W * 0.72, H * 0.20, W * 0.5, H * 0.60],
    [W * 0.50, H * 0.60, W * 0.50, H * 0.88],
  ];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let inside = false;
      for (const [ax, ay, bx, by] of arms) {
        if (distToSegment(x, y, ax, ay, bx, by) <= thick) { inside = true; break; }
      }
      if (inside) {
        const idx = (y * W + x) * 4;
        buf[idx] = 255; buf[idx + 1] = 255; buf[idx + 2] = 255; buf[idx + 3] = 255;
      }
    }
  }
  return buf;
}

// ── Maskable: white circle + inverted Y ──
function drawMaskable(size: number): Uint8Array {
  const W = size, H = size;
  const buf = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) { buf[i * 4] = 11; buf[i * 4 + 1] = 11; buf[i * 4 + 2] = 11; buf[i * 4 + 3] = 255; }

  // White circle (60% radius centered)
  const cx = W / 2, cy = H / 2, r = W * 0.38;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (Math.hypot(x - cx, y - cy) <= r) {
      const i = (y * W + x) * 4; buf[i] = 255; buf[i + 1] = 255; buf[i + 2] = 255; buf[i + 3] = 255;
    }
  }

  // Dark Y inside
  const thick = size * 0.048;
  const arms: [number, number, number, number][] = [
    [W * 0.34, H * 0.30, W * 0.5, H * 0.60],
    [W * 0.66, H * 0.30, W * 0.5, H * 0.60],
    [W * 0.50, H * 0.60, W * 0.50, H * 0.80],
  ];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let inside = false;
    for (const [ax, ay, bx, by] of arms) { if (distToSegment(x, y, ax, ay, bx, by) <= thick) { inside = true; break; } }
    if (inside) { const i = (y * W + x) * 4; buf[i] = 11; buf[i + 1] = 11; buf[i + 2] = 11; buf[i + 3] = 255; }
  }
  return buf;
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

// ── Generate ──
const src = { W: 512, H: 512, buf: drawY(512) };
const mask = { W: 512, H: 512, buf: drawMaskable(512) };

writeFileSync(join(OUT, "icon-192.png"), encodePNG(192, 192, scale(src, 192, 192)));
writeFileSync(join(OUT, "icon-512.png"), encodePNG(512, 512, scale(src, 512, 512)));
writeFileSync(join(OUT, "icon-512-maskable.png"), encodePNG(512, 512, mask.buf));

console.log("✓ public/icons/icon-192.png, icon-512.png, icon-512-maskable.png");

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