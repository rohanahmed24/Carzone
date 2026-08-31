import path from 'node:path';
import {watch} from 'node:fs';
import {build} from './build.mjs';
import {createStaticServer} from './server.mjs';

await build();
createStaticServer(path.resolve('dist')).listen(4176,'127.0.0.1',()=>console.log('Carzone dev: http://127.0.0.1:4176 — refresh manually after rebuilds.'));
let timer;
let building=false;
let queued=false;
async function rebuild(){
  if(building){queued=true;return;}
  building=true;
  try{await build();console.log('Rebuilt. Refresh the browser.');}catch(error){console.error('Build failed:',error.message);}
  finally{building=false;if(queued){queued=false;void rebuild();}}
}
for(const directory of ['src','assets']) watch(directory,{recursive:true},()=>{clearTimeout(timer);timer=setTimeout(rebuild,150);});
