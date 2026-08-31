import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {createStaticServer} from '../scripts/server.mjs';
test('static server handles exact files, methods, lengths, and unsafe paths',async t=>{
  const root=await mkdtemp(path.join(tmpdir(),'carzone-server-'));
  const server=createStaticServer(root);
  const emitted=[];
  server.on('request',(request,response)=>response.on('finish',()=>emitted.push({method:request.method,header:response._header})));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(root,{recursive:true,force:true});});
  await writeFile(path.join(root,'index.html'),'<h1>Hello</h1>');
  await writeFile(path.join(root,'base.css'),'body{}');
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://localhost:${server.address().port}`;
  const home=await fetch(base); assert.equal(home.status,200); assert.match(home.headers.get('content-type'),/text\/html/);assert.equal(await home.text(),'<h1>Hello</h1>');
  // The host intermediary strips HTML lengths, so check the native emitted header
  // for HTML and also assert an unmodified CSS length over actual HTTP transport.
  assert.match(emitted.find(entry=>entry.method==='GET').header,/Content-Length: 14\r\n/i);
  const css=await fetch(`${base}/base.css`);assert.match(css.headers.get('content-type'),/text\/css/);assert.equal(css.headers.get('content-length'),'6');
  const head=await fetch(base,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.match(emitted.find(entry=>entry.method==='HEAD').header,/Content-Length: 14\r\n/i);
  assert.equal((await fetch(`${base}/missing.html`)).status,404);
  assert.equal((await fetch(base,{method:'POST'})).status,405);
  for(const unsafe of ['/%2e%2e%2fsecret','/%00','/%ZZ','/..%5csecret']){
    const status=await new Promise((resolve,reject)=>{http.get(`${base}${unsafe}`,response=>{response.resume();resolve(response.statusCode)}).on('error',reject)});
    assert.ok([400,403,404].includes(status),`${unsafe}: ${status}`);
  }
});
