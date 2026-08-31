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
<title>Carzone ${name}</title><link rel="stylesheet" href="assets/app.css"></head>
<body><main id="main"><h1>${name}</h1><p>This is useful generated Carzone demo content for testing.</p>${extra}</main><script type="module" src="assets/app.mjs"></script></body></html>`;

async function fixture(t, mutate = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'carzone-artifact-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  await mkdir(path.join(root, 'assets'), {recursive: true});
  await writeFile(path.join(root, 'assets', 'app.css'), '.hero{background:url("logo.svg")}');
  await writeFile(path.join(root, 'assets', 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await writeFile(path.join(root, 'assets', 'app.mjs'), 'import "./dependency.mjs";');
  await writeFile(path.join(root, 'assets', 'dependency.mjs'), 'export {};');
  for (const route of routes) await writeFile(path.join(root, route), mutate[route] ?? page(route));
  return root;
}

test('controlled complete fixture is self-contained and preserves all fourteen routes', async t => {
  const root = await fixture(t);
  assert.deepEqual(await checkArtifact(root), []);
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
