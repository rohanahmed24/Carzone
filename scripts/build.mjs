import path from 'node:path';
import {mkdir,writeFile,cp} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {vehicles} from '../src/domain/catalogue.mjs';
import {validateCatalogue} from '../src/domain/schema.mjs';
import {prepareAssets} from './prepare-assets.mjs';
import {renderPages} from '../src/pages/registry.mjs';
import {renderShell} from '../src/ui/shell.mjs';

export async function build(outDir=path.resolve('dist')) {
  const errors=validateCatalogue(vehicles);
  if(errors.length) throw new Error(errors.join('\n'));
  await mkdir(outDir,{recursive:true});
  await prepareAssets(outDir);
  for(const [filename,page] of renderPages()) {
    if(!/^[a-z-]+\.html$/.test(filename)) throw new Error('Unsafe output filename');
    await writeFile(path.join(outDir,filename),renderShell(page),'utf8');
  }
  for(const dir of ['domain','ui','browser']) await cp(path.join('src',dir),path.join(outDir,'assets',dir),{recursive:true});
  await cp('src/styles',path.join(outDir,'assets','styles'),{recursive:true});
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  await build();
  console.log('Carzone built to dist.');
}
