#!/usr/bin/env node
/**
 * Syncs version from package.json into android/app/build.gradle
 * (versionName + versionCode derived from semver).
 *
 * Usage: node scripts/sync-version.js
 */
const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
const pkgPath = path.join(appDir, 'package.json');
const gradlePath = path.join(appDir, 'android', 'app', 'build.gradle');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version; // e.g. "0.1.0"
const [major, minor, patch] = version.split('.').map(Number);

// versionCode: major*10000 + minor*100 + patch (max 2^31 - 1)
const versionCode = major * 10000 + minor * 100 + (patch || 0);

let gradle = fs.readFileSync(gradlePath, 'utf8');

// Replace versionName
gradle = gradle.replace(
  /versionName\s+"[^"]*"/,
  `versionName "${version}"`
);

// Replace versionCode
gradle = gradle.replace(
  /versionCode\s+\d+/,
  `versionCode ${versionCode}`
);

fs.writeFileSync(gradlePath, gradle, 'utf8');
console.log(`Synced version: ${version} (versionCode ${versionCode})`);
