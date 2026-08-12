#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'node_modules', 'react-native-video', 'package.json');
const targetPath = path.join(
  root,
  'node_modules',
  'react-native-video',
  'android',
  'src',
  'main',
  'java',
  'com',
  'brentvatne',
  'exoplayer',
  'ReactExoplayerView.java',
);

const buggy =
  'long reserveMemory = (long) minBufferMemoryReservePercent * runtime.maxMemory();';
const fixed =
  'long reserveMemory = (long) (minBufferMemoryReservePercent * runtime.maxMemory());';

function fail(message) {
  console.error(`[fix-rnv-buffer-memory] ERROR: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pkgPath)) {
  fail(`react-native-video package not found at ${pkgPath}`);
}

let version;
try {
  version = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
} catch (error) {
  fail(`unable to read react-native-video version: ${error.message}`);
}

if (version !== '6.19.2') {
  fail(`expected react-native-video 6.19.2, found ${version || 'unknown'}`);
}

if (!fs.existsSync(targetPath)) {
  fail(`target source not found at ${targetPath}`);
}

const source = fs.readFileSync(targetPath, 'utf8');
const buggyCount = source.split(buggy).length - 1;
const fixedCount = source.split(fixed).length - 1;

if (buggyCount === 0 && fixedCount === 1) {
  console.log('[fix-rnv-buffer-memory] already fixed');
  process.exit(0);
}

if (buggyCount !== 1 || fixedCount !== 0) {
  fail(
    `unexpected source state (buggy=${buggyCount}, fixed=${fixedCount}); refusing non-exact patch`,
  );
}

fs.writeFileSync(targetPath, source.replace(buggy, fixed), 'utf8');

const verified = fs.readFileSync(targetPath, 'utf8');
if (!verified.includes(fixed) || verified.includes(buggy)) {
  fail('post-write verification failed');
}

console.log('[fix-rnv-buffer-memory] applied upstream reserve-memory fix');
