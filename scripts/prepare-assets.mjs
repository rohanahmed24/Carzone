import sharp from 'sharp';
import {copyFile, mkdir, readFile} from 'node:fs/promises';
import path from 'node:path';

const fontFiles = [
  ['@fontsource/manrope/files/manrope-latin-400-normal.woff2', 'manrope-latin-400-normal.woff2'],
  ['@fontsource/manrope/files/manrope-latin-500-normal.woff2', 'manrope-latin-500-normal.woff2'],
  ['@fontsource/manrope/files/manrope-latin-600-normal.woff2', 'manrope-latin-600-normal.woff2'],
  ['@fontsource/manrope/files/manrope-latin-700-normal.woff2', 'manrope-latin-700-normal.woff2'],
  ['@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2', 'barlow-condensed-latin-600-normal.woff2'],
  ['@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2', 'barlow-condensed-latin-700-normal.woff2']
];

const iconNames = ['heart', 'plus', 'minus', 'x', 'menu', 'arrow-right', 'arrow-left', 'sliders-horizontal', 'check', 'chevron-down'];

async function copyLocalAssets(outDir, brandSource) {
  const fonts = path.join(outDir, 'assets', 'fonts');
  const icons = path.join(outDir, 'assets', 'icons');
  const brand = path.join(outDir, 'assets', 'brand');
  await Promise.all([mkdir(fonts, {recursive: true}), mkdir(icons, {recursive: true}), mkdir(brand, {recursive: true})]);
  await Promise.all(fontFiles.map(([source, destination]) => copyFile(path.join('node_modules', source), path.join(fonts, destination))));
  await Promise.all(iconNames.map(name => copyFile(path.join('node_modules', 'lucide-static', 'icons', `${name}.svg`), path.join(icons, `${name}.svg`))));
  await Promise.all([
    copyFile(path.join('node_modules', '@fontsource', 'manrope', 'LICENSE'), path.join(fonts, 'manrope-LICENSE')),
    copyFile(path.join('node_modules', '@fontsource', 'barlow-condensed', 'LICENSE'), path.join(fonts, 'barlow-condensed-LICENSE')),
    copyFile(path.join('node_modules', 'lucide-static', 'LICENSE'), path.join(icons, 'lucide-LICENSE')),
    copyFile(brandSource, path.join(brand, 'carzone-logo.png'))
  ]);
}

/** Encode only the manifest-selected sources and copy the local browser assets. */
export async function prepareAssets(outDir) {
  const m = JSON.parse(await readFile('assets/manifest.json', 'utf8'));
  const media = path.join(outDir, 'assets', 'media');
  await mkdir(media, {recursive: true});
  for (const item of m.images.filter(x => x.role !== 'brand')) {
    for (const width of item.widths) {
      await sharp(item.source).resize({width, withoutEnlargement: true})
        .webp({quality: 82}).toFile(path.join(media, `${item.id}-${width}.webp`));
    }
  }
  const brand = m.images.find(item => item.role === 'brand');
  if (!brand) throw new Error('Asset manifest must declare a brand source');
  await copyLocalAssets(outDir, brand.source);
}
