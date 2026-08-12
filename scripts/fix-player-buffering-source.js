#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const targetPath = path.join(root, 'src', 'screens', 'home', 'Player.tsx');

function fail(message) {
  console.error(`[fix-player-buffering-source] ERROR: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  fail(`Player source not found at ${targetPath}`);
}

let source = fs.readFileSync(targetPath, 'utf8');

const importOld = `  SelectedTrackType,\n} from 'react-native-video';`;
const importNew = `  SelectedTrackType,\n  BufferingStrategyType,\n} from 'react-native-video';`;

const bufferOld = `        bufferConfig: {backBufferDurationMs: 30000},`;
const bufferNew = `        bufferConfig: {\n          // Keep high-bitrate streams from consuming the complete Android heap.\n          minBufferMs: 8000,\n          maxBufferMs: 20000,\n          bufferForPlaybackMs: 1500,\n          bufferForPlaybackAfterRebufferMs: 3000,\n          backBufferDurationMs: 0,\n          maxHeapAllocationPercent: 0.18,\n          minBufferMemoryReservePercent: 0.2,\n          minBackBufferMemoryReservePercent: 0.25,\n          cacheSizeMB: 0,\n        },`;

const strategyOld = `      progressUpdateInterval: 1000,\n      showNotificationControls: showMediaControls,`;
const strategyNew = `      progressUpdateInterval: 1000,\n      bufferingStrategy: BufferingStrategyType.DEPENDING_ON_MEMORY,\n      showNotificationControls: showMediaControls,`;

function count(text, needle) {
  return text.split(needle).length - 1;
}

function applyExact(label, oldText, newText) {
  const oldCount = count(source, oldText);
  const newCount = count(source, newText);

  if (oldCount === 0 && newCount === 1) {
    console.log(`[fix-player-buffering-source] ${label}: already fixed`);
    return;
  }

  if (oldCount !== 1 || newCount !== 0) {
    fail(`${label}: unexpected source state (old=${oldCount}, new=${newCount})`);
  }

  source = source.replace(oldText, newText);
  console.log(`[fix-player-buffering-source] ${label}: applied`);
}

applyExact('BufferingStrategyType import', importOld, importNew);
applyExact('memory-aware bufferConfig', bufferOld, bufferNew);
applyExact('memory-dependent buffering strategy', strategyOld, strategyNew);

fs.writeFileSync(targetPath, source, 'utf8');

const verified = fs.readFileSync(targetPath, 'utf8');
for (const [label, expected] of [
  ['BufferingStrategyType import', importNew],
  ['memory-aware bufferConfig', bufferNew],
  ['memory-dependent buffering strategy', strategyNew],
]) {
  if (count(verified, expected) !== 1) {
    fail(`${label}: post-write verification failed`);
  }
}

if (
  verified.includes(bufferOld) ||
  verified.includes(strategyOld) ||
  verified.includes(importOld)
) {
  fail('legacy buffering configuration remains after patch');
}

console.log('[fix-player-buffering-source] upstream buffering adaptation verified');
