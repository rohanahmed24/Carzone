import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {checkArtifact} from '../scripts/check-artifact.mjs';

const routes = [
  'index.html', 'latest-cars.html', 'popular-cars.html', 'upcoming-cars.html',
  'car-details.html', 'used-car-details.html', 'car-specification.html',
  'car-price.html', 'car-review.html', 'car-valuation.html', 'compare-car.html',
  'sell-your-car.html', 'write-review.html', 'style-guide.html'
];

const page = (name, extra = '') => `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="description" content="Description for ${name}"><meta http-equiv="Content-Security-Policy" content="default-src 'self'">
<title>Carzone ${name}</title><link rel="stylesheet" href="assets/styles/app.css"></head>
<body><main id="main"><h1>${name}</h1><p>This is useful generated Carzone demo content for testing.</p>${extra}</main><script type="module" src="assets/browser/app.mjs"></script></body></html>`;

async function fixture(t, mutate = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'carzone-artifact-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  for (const directory of ['styles','icons','browser','domain','media','brand','fonts']) await mkdir(path.join(root, 'assets', directory), {recursive: true});
  await writeFile(path.join(root, 'assets/styles/app.css'), '.hero{background:url("../icons/heart.svg")}');
  await writeFile(path.join(root, 'assets/icons/heart.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(path.join(root, 'assets/browser/app.mjs'), 'import "../domain/dependency.mjs";');
  await writeFile(path.join(root, 'assets/domain/dependency.mjs'), 'export {};');
  for (const route of routes) await writeFile(path.join(root, route), mutate[route] ?? page(route));
  return root;
}

test('controlled complete fixture is self-contained and preserves all fourteen routes', async t => {
  const root = await fixture(t);
  assert.deepEqual(await checkArtifact(root), []);
});

test('root-relative HTML, srcset, CSS and module URLs resolve inside the artifact', async t => {
  const absolutePage = page('index.html', '<img src="/assets/brand/carzone-logo.png" srcset="/assets/media/car-360.webp 360w, /assets/media/car-720.webp 720w"><a href="/car-details.html?car=city#main">Details</a>')
    .replace('href="assets/styles/app.css"','href="/assets/styles/app.css"')
    .replace('src="assets/browser/app.mjs"','src="/assets/browser/app.mjs"');
  const root = await fixture(t, {'index.html':absolutePage});
  await writeFile(path.join(root,'assets/brand/carzone-logo.png'),'fixture');
  await writeFile(path.join(root,'assets/media/car-360.webp'),'fixture');
  await writeFile(path.join(root,'assets/media/car-720.webp'),'fixture');
  await writeFile(path.join(root,'assets/styles/app.css'),'@import "/assets/styles/extra.css"; .hero{background:url(/assets/media/car-720.webp)}');
  await writeFile(path.join(root,'assets/styles/extra.css'),'.hero{color:black}');
  await writeFile(path.join(root,'assets/browser/app.mjs'),'import "/assets/domain/dependency.mjs";');
  assert.deepEqual(await checkArtifact(root),[]);
});

test('encoded traversal and encoded protocol-relative paths are rejected', async t => {
  const root = await fixture(t, {'index.html':page('index.html', '<img src="/%2e%2e/assets/icons/heart.svg"><img src="/%2foutside.example/x"><img src="assets/%2e%2e/%2e%2e/outside.webp">')});
  const issues = await checkArtifact(root);
  assert.equal(issues.filter(issue => /escapes artifact|not a local URL/.test(issue)).length,3);
});

const radioMarkup = '<div class="condition-control"><label><input type="radio" name="condition" value="new"><span>New</span></label></div>';
const radioCss = '.condition-control input{position:absolute;opacity:0}.condition-control span{display:flex;min-height:44px}.condition-control input:focus-visible+span{outline:3px solid blue}';

test('only labeled native condition radios with a visible focus proxy may be transparent', async t => {
  const root = await fixture(t, {'index.html':page('index.html',radioMarkup)});
  await writeFile(path.join(root,'assets/styles/app.css'),radioCss);
  assert.deepEqual(await checkArtifact(root),[]);
  await writeFile(path.join(root,'assets/styles/app.css'),`${radioCss}.hero{opacity:0}`);
  assert.match((await checkArtifact(root)).join('\n'),/zero-opacity/);
  await writeFile(path.join(root,'assets/styles/app.css'),radioCss.replace('.condition-control input{','.condition-control input, .hero{'));
  assert.match((await checkArtifact(root)).join('\n'),/zero-opacity/);
  await writeFile(path.join(root,'assets/styles/app.css'),radioCss.replace('outline:3px solid blue','color:blue'));
  assert.match((await checkArtifact(root)).join('\n'),/zero-opacity/);
  await writeFile(path.join(root,'assets/styles/app.css'),radioCss);
  await writeFile(path.join(root,'index.html'),page('index.html',radioMarkup.replace('<span>New</span>','')));
  assert.match((await checkArtifact(root)).join('\n'),/zero-opacity/);
});

test('artifact allowlist is directory-specific and rejects sources, docs and unexpected files', async t => {
  const root = await fixture(t);
  for (const name of ['assets/source/raw.png','assets/media/raw.png','assets/brand/extra.png','assets/icons/made-up.svg','assets/fonts/source.ttf','assets/styles/readme.txt','assets/browser/state.json','docs/LICENSE','assets/surprise.js']) {
    await mkdir(path.dirname(path.join(root,name)),{recursive:true});
    await writeFile(path.join(root,name),'unapproved fixture');
  }
  for (const name of ['assets/fonts/manrope-LICENSE','assets/icons/lucide-LICENSE','assets/fonts/manrope-latin-400-normal.woff2']) await writeFile(path.join(root,name),'approved fixture');
  const issues = await checkArtifact(root);
  for (const name of ['assets/source/raw.png','assets/media/raw.png','assets/brand/extra.png','assets/icons/made-up.svg','assets/fonts/source.ttf','assets/styles/readme.txt','assets/browser/state.json','docs/LICENSE','assets/surprise.js']) assert.ok(issues.some(issue => issue.startsWith(`${name}:`)),name);
  assert.ok(!issues.some(issue => /manrope-LICENSE|lucide-LICENSE|manrope-latin-400/.test(issue)));
});

test('reports missing route, unresolved asset, dangling fragment, and placeholder href', async t => {
  const root = await fixture(t, {
    'index.html': page('index.html', '<a href="missing.html">Missing</a><a href="car-details.html#not-here">Broken</a><a href="#not-here">Same page</a><a href="#">Placeholder</a>')
  });
  await rm(path.join(root, 'style-guide.html'));
  const issues = await checkArtifact(root);
  assert.match(issues.join('\n'), /missing expected route style-guide\.html/);
  assert.match(issues.join('\n'), /missing\.html/);
  assert.equal(issues.filter(issue => issue.includes('dangling fragment') && issue.includes('not-here')).length, 2);
  assert.match(issues.join('\n'), /href=\["'\]#\["'\]/);
});

test('reports route content that is too short to be meaningful', async t => {
  const root = await fixture(t, {
    'index.html': '<!doctype html><html lang="en"><head><meta name="description" content="Description for index"><meta http-equiv="Content-Security-Policy" content="default-src \'self\'"><title>Carzone index</title></head><body><h1>Home</h1>Hi</body></html>'
  });
  const issues = await checkArtifact(root);
  assert.match(issues.join('\n'), /index\.html: route content is not meaningful/);
});

test('reports remote form action, copied legacy runtime, and unexpected root HTML page', async t => {
  const root = await fixture(t, {
    'index.html': page('index.html', '<form action="https://receiver.example/submit"></form><script src="assets/webflow.js"></script>')
  });
  await writeFile(path.join(root, 'extra.html'), page('extra.html'));
  const issues = await checkArtifact(root);
  assert.match(issues.join('\n'), /remote form action/);
  assert.match(issues.join('\n'), /webflow\\\.js/i);
  assert.match(issues.join('\n'), /unexpected root HTML page extra\.html/);
});
