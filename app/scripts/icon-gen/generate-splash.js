const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const RES_DIR = path.resolve(__dirname, '../../android/app/src/main/res');

// Bars only (transparent bg) — brand brown #4A3018
const LOGO_COLOR = '#4A3018';

// Splash logo target ~35% of width centered. Per-density px:
const SIZES = { mdpi: 160, hdpi: 240, xhdpi: 320, xxhdpi: 480, xxxhdpi: 640 };

// Logo bars bounding box in SVG 1000x600 viewBox
const BAR_CX = 524, BAR_CY = 265;
const BAR_W = 308, BAR_H = 130;

function toSvg(w) {
  const k = (w * 0.35) / BAR_W;
  const tx = w / 2 - BAR_CX * k;
  const ty = w / 2 - BAR_CY * k;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}">
  <g fill="${LOGO_COLOR}" transform="translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${k.toFixed(6)})">
    <rect x="370" y="200" width="24" height="130" rx="6" ry="6"/>
    <rect x="418" y="200" width="260" height="22" rx="6" ry="6"/>
    <rect x="418" y="254" width="195" height="22" rx="6" ry="6"/>
    <rect x="418" y="308" width="133" height="22" rx="6" ry="6"/>
  </g>
</svg>`;
}

async function verify(filePath, expectedSize) {
  const img = sharp(filePath);
  const { width, height, channels } = await img.metadata();
  const buf = await img.raw().toBuffer();
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = buf[i], g = buf[i+1], b = buf[i+2];
      const a = channels === 4 ? buf[i+3] : 255;
      if (a > 10 && (r !== 248 || g !== 247 || b !== 242)) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  return {
    cx: cx.toFixed(1), cy: cy.toFixed(1),
    offX: Math.abs(cx - expectedSize / 2).toFixed(1),
    offY: Math.abs(cy - expectedSize / 2).toFixed(1),
    w: maxX-minX+1, h: maxY-minY+1,
  };
}

async function generate() {
  console.log('Generating Reeda splash logos (centered)...\n');
  for (const [density, size] of Object.entries(SIZES)) {
    const dir = path.join(RES_DIR, `drawable-${density}`);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, 'splash_logo.png');
    await sharp(Buffer.from(toSvg(size))).png().toFile(file);
    const v = await verify(file, size);
    console.log(`  ${density} ${size}px: center=(${v.cx},${v.cy}) offset=(${v.offX},${v.offY}) bars=${v.w}x${v.h}`);
  }
  console.log('\nDone.');
}

generate().catch(e => { console.error(e); process.exit(1); });