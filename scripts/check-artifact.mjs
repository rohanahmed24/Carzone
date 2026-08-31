import {lstat, readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const expectedRoutes = [
  'index.html', 'latest-cars.html', 'popular-cars.html', 'upcoming-cars.html',
  'car-details.html', 'used-car-details.html', 'car-specification.html',
  'car-price.html', 'car-review.html', 'car-valuation.html', 'compare-car.html',
  'sell-your-car.html', 'write-review.html', 'style-guide.html'
];

const blockedDirectories = new Set(['.git', 'docs', 'node_modules', 'src', 'source']);
const iconNames = new Set(['heart','plus','minus','x','menu','arrow-right','arrow-left','sliders-horizontal','check','chevron-down']);
const licensePaths = new Set(['assets/fonts/manrope-LICENSE','assets/fonts/barlow-condensed-LICENSE','assets/icons/lucide-LICENSE']);
function approvedArtifactPath(relative) {
  return expectedRoutes.includes(relative) ||
    relative === 'assets/brand/carzone-logo.png' || licensePaths.has(relative) ||
    /^assets\/media\/[a-z0-9-]+\.webp$/.test(relative) ||
    /^assets\/fonts\/(?:manrope-latin-(?:400|500|600|700)|barlow-condensed-latin-(?:600|700))-normal\.woff2$/.test(relative) ||
    (/^assets\/icons\/[^/]+\.svg$/.test(relative) && iconNames.has(path.basename(relative,'.svg'))) ||
    /^assets\/(?:browser|domain|ui)\/[a-z0-9-]+\.mjs$/.test(relative) ||
    /^assets\/styles\/[a-z0-9-]+\.css$/.test(relative);
}
const forbidden = [/webflow\.js/i, /jquery/i, /WebFont\.load/, /formdata\.webflow/i, /href=["']#["']/i, /style=["'][^"']*opacity:\s*0/i];
const externalLinkAllowlist = new Set();

const exists = async filename => {
  try { await lstat(filename); return true; } catch { return false; }
};
const stripQueryAndHash = value => value.replace(/[?#].*$/, '');
const meaningfulText = html => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:nbsp|amp|quot|#39);/gi, ' ')
  .replace(/\s+/g, ' ').trim();

function attributes(html) {
  const values = [];
  const pattern = /\b(src|href|srcset|action)\s*=\s*(["'])([\s\S]*?)\2/gi;
  for (let match; (match = pattern.exec(html));) values.push({name: match[1].toLowerCase(), value: match[3]});
  return values;
}

function isExternal(value) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value);
}

function resolveLocal(root, fromFile, value) {
  const bare = stripQueryAndHash(value);
  if (!bare) return {filename: fromFile};
  let decoded;
  try { decoded = decodeURIComponent(bare); } catch { return {error: 'invalid URL encoding'}; }
  // URL root means artifact root, never the host drive root. Check traversal
  // before URL normalization removes dot segments (including encoded dots).
  if (/[\\:%?#\0]/.test(decoded)) return {error: 'invalid local URL encoding'};
  if (decoded.startsWith('//')) return {error: 'not a local URL'};
  const fromRelative = path.relative(root,fromFile).replaceAll('\\','/');
  const segments = decoded.startsWith('/') ? [] : fromRelative.split('/').slice(0,-1);
  for (const segment of decoded.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (!segments.length) return {error: 'escapes artifact'};
      segments.pop();
    } else segments.push(segment);
  }
  const origin = 'https://carzone-artifact.invalid';
  let url;
  try { url = new URL(decoded, `${origin}/${fromRelative}`); } catch { return {error: 'invalid local URL'}; }
  if (url.origin !== origin) return {error: 'not a local URL'};
  const filename = path.resolve(root,...decodeURIComponent(url.pathname).split('/').filter(Boolean));
  const relative = path.relative(root, filename);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return {error: 'escapes artifact'};
  return {filename};
}

async function collectFiles(root, directory = root, files = []) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const filename = path.join(directory, entry.name);
    const relative = path.relative(root, filename).replaceAll('\\', '/');
    if (entry.isSymbolicLink()) { files.push({relative, filename, symlink: true}); continue; }
    if (entry.isDirectory()) await collectFiles(root, filename, files);
    else files.push({relative, filename, directory: path.dirname(relative)});
  }
  return files;
}

function externalIssue(source, value, type) {
  if (type === 'action') return `${source}: remote form action ${value}`;
  return `${source}: unapproved external ${type} ${value}`;
}

async function checkReference({root, fromFile, source, value, type, issues, cssFiles, moduleFiles}) {
  if (!value) return;
  if (isExternal(value)) {
    if (type === 'href' && externalLinkAllowlist.has(value)) return;
    issues.push(externalIssue(source, value, type));
    return;
  }
  if (/^(?:data:|javascript:|mailto:|tel:)/i.test(value)) {
    issues.push(`${source}: unsupported ${type} URL ${value}`);
    return;
  }
  const resolved = resolveLocal(root, fromFile, value);
  if (resolved.error) { issues.push(`${source}: ${type} ${value} ${resolved.error}`); return; }
  if (!await exists(resolved.filename)) { issues.push(`${source}: unresolved ${type} ${value}`); return; }
  const extension = path.extname(resolved.filename).toLowerCase();
  if (extension === '.css') cssFiles.add(resolved.filename);
  if (extension === '.mjs' || extension === '.js') moduleFiles.add(resolved.filename);
  const fragment = value.includes('#') ? value.slice(value.indexOf('#') + 1) : '';
  if (fragment) {
    let id;
    try { id = decodeURIComponent(fragment); } catch { issues.push(`${source}: invalid fragment ${fragment}`); return; }
    if (extension === '.html' || !extension) {
      const target = await readFile(resolved.filename, 'utf8');
      const idPattern = new RegExp(`\\b(?:id|name)\\s*=\\s*(["'])${id.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\1`, 'i');
      if (!idPattern.test(target)) issues.push(`${source}: dangling fragment ${value}`);
    } else issues.push(`${source}: fragment target is not HTML ${value}`);
  }
}

function hasAccessibleConditionRadios(htmlPages, css) {
  const groups = htmlPages.flatMap(html => [...html.matchAll(/<div\b[^>]*class=["']condition-control["'][^>]*>([\s\S]*?)<\/div>/gi)].map(match => match[1]));
  if (!groups.length) return false;
  for (const group of groups) {
    const inputs = [...group.matchAll(/<input\b[^>]*>/gi)];
    const labels = [...group.matchAll(/<label\b[^>]*>\s*<input\b(?=[^>]*\btype=["']radio["'])[^>]*>\s*<span>\s*[^<\s][^<]*<\/span>\s*<\/label>/gi)];
    if (!inputs.length || inputs.length !== labels.length) return false;
  }
  const proxy = css.match(/\.condition-control\s+span\s*\{([^}]+)\}/)?.[1] ?? '';
  const focus = css.match(/\.condition-control\s+input:focus-visible\s*\+\s*span\s*\{([^}]+)\}/)?.[1] ?? '';
  return /display\s*:\s*(?:flex|inline-flex|block)\b/.test(proxy) &&
    /outline\s*:\s*[1-9][\d.]*px\s+solid\s+/.test(focus) &&
    !/(?:visibility\s*:\s*hidden|display\s*:\s*none|opacity\s*:\s*0\b)/.test(proxy + focus);
}

async function inspectCss(root, filename, issues, cssFiles, moduleFiles, htmlPages) {
  const css = await readFile(filename, 'utf8');
  const source = path.relative(root, filename).replaceAll('\\', '/');
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g,'');
  for (const rule of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/(?:^|;)\s*opacity\s*:\s*(?:0(?:\.0*)?|\.0+)(?:\s*!important)?\s*(?:;|$)/i.test(rule[2])) continue;
    const isNativeRadioProxy = rule[1].trim() === '.condition-control input' && hasAccessibleConditionRadios(htmlPages,withoutComments);
    if (!isNativeRadioProxy) issues.push(`${source}: initial zero-opacity style is not allowed (${rule[1].trim()})`);
  }
  const urls = [];
  for (const match of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) urls.push(match[2]);
  for (const match of css.matchAll(/@import\s+(?:url\(\s*)?(["'])(.*?)\1/gi)) urls.push(match[2]);
  for (const value of urls) await checkReference({root, fromFile: filename, source, value, type: 'CSS url', issues, cssFiles, moduleFiles});
}

async function inspectModule(root, filename, issues, cssFiles, moduleFiles) {
  const sourceText = await readFile(filename, 'utf8');
  const source = path.relative(root, filename).replaceAll('\\', '/');
  const values = [];
  for (const match of sourceText.matchAll(/\b(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?(["'])(.*?)\1/g)) values.push(match[2]);
  for (const match of sourceText.matchAll(/\bimport\s*\(\s*(["'])(.*?)\1\s*\)/g)) values.push(match[2]);
  for (const value of values) await checkReference({root, fromFile: filename, source, value, type: 'module import', issues, cssFiles, moduleFiles});
}

export async function checkArtifact(root) {
  const absoluteRoot = path.resolve(root);
  const issues = [];
  if (!await exists(absoluteRoot)) return [`artifact root does not exist: ${absoluteRoot}`];
  const files = await collectFiles(absoluteRoot);
  for (const file of files) {
    const parts = file.relative.split('/');
    if (file.symlink) issues.push(`${file.relative}: symbolic links are not allowed`);
    if (parts.some(part => blockedDirectories.has(part))) issues.push(`${file.relative}: forbidden source directory`);
    if (!file.symlink && !approvedArtifactPath(file.relative)) issues.push(`${file.relative}: unapproved artifact path or file type`);
  }
  const rootHtml = files.filter(file => !file.symlink && path.dirname(file.relative) === '.' && file.relative.endsWith('.html')).map(file => file.relative);
  for (const route of expectedRoutes) if (!rootHtml.includes(route)) issues.push(`missing expected route ${route}`);
  for (const filename of rootHtml) if (!expectedRoutes.includes(filename)) issues.push(`unexpected root HTML page ${filename}`);

  const titles = new Map(), descriptions = new Map();
  const cssFiles = new Set(), moduleFiles = new Set();
  const htmlPages = [];
  for (const route of expectedRoutes) {
    const filename = path.join(absoluteRoot, route);
    if (!await exists(filename)) continue;
    const html = await readFile(filename, 'utf8');
    htmlPages.push(html);
    for (const pattern of forbidden) if (pattern.test(html)) issues.push(`${route}: forbidden legacy/placeholder pattern ${pattern}`);
    if (!/^\s*<!doctype\s+html>/i.test(html)) issues.push(`${route}: missing HTML doctype`);
    if (!/<html\b[^>]*\blang\s*=\s*["']en(?:-[^"']+)?["']/i.test(html)) issues.push(`${route}: expected lang=en`);
    const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim();
    const description = html.match(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*\bcontent\s*=\s*["']([^"']+)["'][^>]*>/i)?.[1].trim();
    if (!title) issues.push(`${route}: missing title`); else if (titles.has(title)) issues.push(`${route}: duplicate title also used by ${titles.get(title)}`); else titles.set(title, route);
    if (!description) issues.push(`${route}: missing description`); else if (descriptions.has(description)) issues.push(`${route}: duplicate description also used by ${descriptions.get(description)}`); else descriptions.set(description, route);
    if ((html.match(/<h1(?:\s|>)/gi) ?? []).length !== 1) issues.push(`${route}: expected one h1`);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
    const routeContent = main.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi,'');
    if (meaningfulText(routeContent).length < 30) issues.push(`${route}: route content is not meaningful`);
    if (!/<meta\b(?=[^>]*\bhttp-equiv\s*=\s*["']content-security-policy["'])[^>]*\bcontent\s*=/i.test(html)) issues.push(`${route}: missing CSP meta policy`);
    for (const attribute of attributes(html)) {
      const values = attribute.name === 'srcset' ? attribute.value.split(',').map(item => item.trim().split(/\s+/)[0]) : [attribute.value];
      for (const value of values) await checkReference({root: absoluteRoot, fromFile: filename, source: route, value, type: attribute.name, issues, cssFiles, moduleFiles});
    }
  }
  for (const filename of cssFiles) await inspectCss(absoluteRoot, filename, issues, cssFiles, moduleFiles, htmlPages);
  for (const filename of moduleFiles) await inspectModule(absoluteRoot, filename, issues, cssFiles, moduleFiles);
  return issues;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const issues = await checkArtifact(path.resolve(process.argv[2] ?? 'dist'));
  if (issues.length) {
    console.error(`Artifact verification failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else console.log('Artifact verification passed.');
}
