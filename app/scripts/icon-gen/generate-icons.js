/* eslint-env node */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const RES_DIR = path.resolve(__dirname, '../../android/app/src/main/res');
const LOGO_COLOR = '#4A3018';
const BG_COLOR = '#F8F7F2';

// Logo bars bounding box in SVG 1000x600 viewBox
const BAR_CX = 524, BAR_CY = 265; // center
const BAR_W = 308, BAR_H = 130;   // dimensions

const DENSITIES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

function makeIconSvg(size) {
  // Bars occupy ~55% of width
  const k = (size * 0.55) / BAR_W;
  const tx = size / 2 - BAR_CX * k;
  const ty = size / 2 - BAR_CY * k;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG_COLOR}"/>
  <g fill="${LOGO_COLOR}" transform="translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${k.toFixed(6)})">
    <rect x="370" y="200" width="24" height="130" rx="6" ry="6"/>
    <rect x="418" y="200" width="260" height="22" rx="6" ry="6"/>
    <rect x="418" y="254" width="195" height="22" rx="6" ry="6"/>
    <rect x="418" y="308" width="133" height="22" rx="6" ry="6"/>
  </g>
</svg>`;
}

function makeRoundIconSvg(size) {
  const k = (size * 0.55) / BAR_W;
  const tx = size / 2 - BAR_CX * k;
  const ty = size / 2 - BAR_CY * k;
  const r = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><clipPath id="c"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="${size}" height="${size}" fill="${BG_COLOR}"/>
    <g fill="${LOGO_COLOR}" transform="translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${k.toFixed(6)})">
      <rect x="370" y="200" width="24" height="130" rx="6" ry="6"/>
      <rect x="418" y="200" width="260" height="22" rx="6" ry="6"/>
      <rect x="418" y="254" width="195" height="22" rx="6" ry="6"/>
      <rect x="418" y="308" width="133" height="22" rx="6" ry="6"/>
    </g>
  </g>
</svg>`;
}

async function verify(filePath, expectedSize) {
  const img = sharp(filePath);
  const { width, height, channels } = await img.metadata();
  if (width !== expectedSize || height !== expectedSize) throw new Error(`${filePath}: expected ${expectedSize}x${expectedSize}, got ${width}x${height}`);
  const buf = await img.raw().toBuffer();
  // Find bounding box of non-background pixels
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = buf[i], g = buf[i+1], b = buf[i+2];
      // Not background (#F8F7F2 = 248,247,242) and not circle-transparent (alpha check)
      if (channels === 4) {
        const a = buf[i+3];
        if (a > 10 && (r !== 248 || g !== 247 || b !== 242)) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      } else {
        if (r !== 248 || g !== 247 || b !== 242) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const offX = Math.abs(cx - expectedSize / 2).toFixed(1);
  const offY = Math.abs(cy - expectedSize / 2).toFixed(1);
  return { cx: cx.toFixed(1), cy: cy.toFixed(1), offX, offY, w: maxX-minX+1, h: maxY-minY+1 };
}

async function generate() {
  console.log('Generating Reeda mipmap icons (centered)...\n');

  for (const [density, size] of Object.entries(DENSITIES)) {
    const dir = path.join(RES_DIR, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });

    const icPath = path.join(dir, 'ic_launcher.png');
    await sharp(Buffer.from(makeIconSvg(size))).resize(size, size).png().toFile(icPath);
    const v = await verify(icPath, size);
    console.log(`  ${density} ${size}px: icon center=(${v.cx},${v.cy}) offset=(${v.offX},${v.offY}) bars=${v.w}x${v.h}`);

    const rPath = path.join(dir, 'ic_launcher_round.png');
    await sharp(Buffer.from(makeRoundIconSvg(size))).resize(size, size).png().toFile(rPath);
    const vr = await verify(rPath, size);
    console.log(`  ${density} ${size}px: round center=(${vr.cx},${vr.cy}) offset=(${vr.offX},${vr.offY}) bars=${vr.w}x${vr.h}`);
  }

  console.log('\nDone.');
}

generate().catch(err => { console.error(err); process.exit(1); });
