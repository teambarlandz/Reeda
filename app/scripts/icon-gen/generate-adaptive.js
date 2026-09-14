const fs = require('fs');
const path = require('path');

const RES = path.resolve(__dirname, '../../android/app/src/main/res');

// Logo geometry from assets/logo.svg (1000x600 viewBox)
const bars = [
  [370, 200, 24, 130, 6],
  [418, 200, 260, 22, 6],
  [418, 254, 195, 22, 6],
  [418, 308, 133, 22, 6],
];

// Fit into 108x108 adaptive icon viewport, centered, safe-zone aware (inner ~66)
const scale = 0.195;
const cx = 524; // logo center x
const cy = 265; // logo center y
const tx = 54 - cx * scale;
const ty = 54 - cy * scale;

function roundRectPath(x, y, w, h, r) {
  const X = x => (x * scale + tx).toFixed(2);
  const Y = y => (y * scale + ty).toFixed(2);
  const R = r * scale;
  const x0 = x;
  const y0 = y;
  const x1 = x + w;
  const y1 = y + h;
  return [
    `M${X(x0 + R)},${Y(y0)}`,
    `H${X(x1 - R)}`,
    `Q${X(x1)},${Y(y0)} ${X(x1)},${Y(y0 + R)}`,
    `V${Y(y1 - R)}`,
    `Q${X(x1)},${Y(y1)} ${X(x1 - R)},${Y(y1)}`,
    `H${X(x0 + R)}`,
    `Q${X(x0)},${Y(y1)} ${X(x0)},${Y(y1 - R)}`,
    `V${Y(y0 + R)}`,
    `Q${X(x0)},${Y(y0)} ${X(x0 + R)},${Y(y0)}`,
    'Z',
  ].join('');
}

const fgPath = bars.map(b => roundRectPath(...b)).join(' ');

const COLOR = '#4A3018';

const vectorFg = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <path
      android:fillColor="${COLOR}"
      android:pathData="${fgPath}"/>
</vector>
`;

const adaptive = (name) => `<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
    ${name === 'ic_launcher_round' ? '' : '<monochrome android:drawable="@drawable/ic_launcher_monochrome"/>'}
</adaptive-icon>
`;

const anydpi = path.join(RES, 'mipmap-anydpi-v26');
fs.mkdirSync(anydpi, { recursive: true });
fs.writeFileSync(path.join(RES, 'drawable', 'ic_launcher_foreground.xml'), vectorFg);
fs.writeFileSync(path.join(RES, 'drawable', 'ic_launcher_monochrome.xml'), vectorFg);
fs.writeFileSync(path.join(anydpi, 'ic_launcher.xml'), adaptive('ic_launcher'));
fs.writeFileSync(path.join(anydpi, 'ic_launcher_round.xml'), adaptive('ic_launcher_round'));
console.log('Wrote adaptive icon resources:');
console.log('  drawable/ic_launcher_foreground.xml');
console.log('  drawable/ic_launcher_monochrome.xml');
console.log('  mipmap-anydpi-v26/ic_launcher.xml');
console.log('  mipmap-anydpi-v26/ic_launcher_round.xml');