import test from 'node:test';
import assert from 'node:assert/strict';
import {access, mkdtemp, readFile, readdir} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {prepareAssets} from '../scripts/prepare-assets.mjs';

test('production manifest identifies every subject and its provenance', async () => {
  const m = JSON.parse(await readFile('assets/manifest.json', 'utf8'));
  assert.equal(new Set(m.images.map(x => x.id)).size, m.images.length);
  assert.equal(m.images.filter(x => x.role === 'vehicle').length, 12);
  assert.equal(m.images.filter(x => x.role === 'hero').length, 1);
  for (const x of m.images) {
    assert.ok(x.alt.length > 12 && x.provenance.length > 10);
    assert.ok(x.widths.every(w => Number.isInteger(w) && w > 0));
    await access(x.source);
  }
});

test('prepareAssets creates only declared, non-upscaled responsive media and local UI assets', async () => {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'carzone-assets-'));
  await prepareAssets(outDir);
  const manifest = JSON.parse(await readFile('assets/manifest.json', 'utf8'));
  const media = path.join(outDir, 'assets', 'media');
  for (const image of manifest.images.filter(item => item.role !== 'brand')) {
    for (const width of image.widths) await access(path.join(media, `${image.id}-${width}.webp`));
    const source = await sharp(image.source).metadata();
    const derivative = await sharp(path.join(media, `${image.id}-${image.widths.at(-1)}.webp`)).metadata();
    assert.ok(derivative.width <= source.width);
    assert.ok(derivative.height <= source.height);
  }
  await access(path.join(outDir, 'assets', 'brand', 'carzone-logo.png'));
  await access(path.join(outDir, 'assets', 'fonts', 'manrope-latin-400-normal.woff2'));
  await access(path.join(outDir, 'assets', 'icons', 'heart.svg'));
  assert.deepEqual((await readdir(path.join(outDir, 'assets', 'icons'))).filter(file => file.endsWith('.svg')).sort(), [
    'arrow-left.svg', 'arrow-right.svg', 'check.svg', 'chevron-down.svg', 'heart.svg',
    'menu.svg', 'minus.svg', 'plus.svg', 'sliders-horizontal.svg', 'x.svg'
  ]);
});
