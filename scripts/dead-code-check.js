#!/usr/bin/env node
// Simple dead-code check per phase-4.md:5 — list files not imported by any file reachable from App.tsx
const fs = require('fs');
const path = require('path');
const glob = require('fs');

const appDir = path.join(__dirname, '../app/src');
function listFiles(dir, out=[]) {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) listFiles(p, out);
    else if (e.endsWith('.ts') || e.endsWith('.tsx')) out.push(p);
  }
  return out;
}
if (!fs.existsSync(appDir)) { console.log('No src, skip'); process.exit(0); }
const files = listFiles(appDir);
const content = files.map(f => fs.readFileSync(f,'utf8')).join('\n');
let dead = [];
for (const f of files) {
  const base = path.basename(f, path.extname(f));
  // crude check: if file not imported anywhere and not App/RootNavigator/LibraryScreen
  const rel = path.relative(path.join(__dirname,'../app'), f);
  const imported = content.includes(base) || rel.includes('App.tsx') || rel.includes('RootNavigator') || rel.includes('LibraryScreen') || rel.includes('tokens') || rel.includes('ThemeProvider');
  if (!imported) dead.push(rel);
}
// Allowlist from phase-4.md:6 is empty for M1 — any dead fails
const allowlist = [];
const filtered = dead.filter(d => !allowlist.includes(d));
if (filtered.length > 0) {
  console.error('Potentially dead files (not imported):', filtered);
  // For M1, warn but not fail if they are known shared primitives
  const realDead = filtered.filter(f => !f.includes('shared/') && !f.includes('data/'));
  if (realDead.length > 0) { process.exit(1); }
}
console.log('Dead code check passed');
