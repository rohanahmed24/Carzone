import http from 'node:http';
import path from 'node:path';
import {readFile,realpath} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
const beneath=(root,target)=>{const relative=path.relative(root,target);return relative!=='' && !relative.startsWith(`..${path.sep}`) && relative!=='..' && !path.isAbsolute(relative);};
export function createStaticServer(root) {
  if(typeof root!=='string'||!path.isAbsolute(root)||path.parse(root).root===path.resolve(root)) throw new Error('Server root must be an absolute non-root directory');
  root=path.resolve(root);
  return http.createServer(async(req,res)=>{
    const send=(status,body,type='text/plain; charset=utf-8',extra={})=>{const bytes=Buffer.isBuffer(body)?body:Buffer.from(body);res.writeHead(status,{'Content-Type':type,'Content-Length':bytes.length,'Cache-Control':'no-store',...extra});res.end(req.method==='HEAD'?undefined:bytes);};
    if(!['GET','HEAD'].includes(req.method)) return send(405,'Method not allowed',undefined,{'Allow':'GET, HEAD'});
    let decoded;
    try{decoded=decodeURIComponent((req.url||'/').split('?')[0]);}catch{return send(400,'Malformed URL');}
    if(!decoded.startsWith('/')||decoded.includes('\0')||decoded.includes('\\')||decoded.split('/').includes('..')) return send(403,'Forbidden');
    const filename=path.resolve(root,`.${decoded==='/'?'/index.html':decoded}`);
    if(!beneath(root,filename)) return send(403,'Forbidden');
    try {
      // Realpath containment also prevents a symlink inside the root exposing external files.
      const [actualRoot,actualFile]=await Promise.all([realpath(root),realpath(filename)]);
      if(!beneath(actualRoot,actualFile)) return send(403,'Forbidden');
      const body=await readFile(actualFile);
      send(200,body,types[path.extname(filename).toLowerCase()]||'application/octet-stream');
    }catch(error){send(['ENOENT','ENOTDIR','EISDIR','EACCES'].includes(error.code)?404:500,'Not found');}
  });
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  createStaticServer(path.resolve('dist')).listen(4176,'127.0.0.1',()=>console.log('Carzone preview: http://127.0.0.1:4176 (manual refresh)'));
}
