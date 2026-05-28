import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content/blog');
const ogOutputDirectory = path.join(process.cwd(), 'public/og');
const manifestPath = path.join(ogOutputDirectory, '.manifest.json');

// Pin the installed Three.js version into the hash so a version bump invalidates cached images.
const THREE_VERSION = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'node_modules/three/package.json'), 'utf8')
).version;

// Hash the script itself + Three.js version so any change to rendering code or Three.js
// version invalidates all cached images.
const SCRIPT_HASH = hashString([
  fs.readFileSync(fileURLToPath(import.meta.url), 'utf8'),
  THREE_VERSION,
].join('|'));

if (!fs.existsSync(ogOutputDirectory)) {
  fs.mkdirSync(ogOutputDirectory, { recursive: true });
}

// ── Manifest ─────────────────────────────────────────────────────────────────

function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 16);
}

function loadManifest() {
  try { return JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
  catch { return {}; }
}

function saveManifest(manifest) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function getPostHash(post) {
  return hashString([
    SCRIPT_HASH,
    post.slug,
    post.ogTitle    || post.title       || '',
    post.ogSubtitle || post.description || '',
    post.category   || '',
  ].join('|'));
}

const PORTFOLIO_HASH = hashString(`portfolio|${SCRIPT_HASH}`);

function needsGeneration(key, hash, manifest) {
  if (manifest[key] !== hash) return true;
  return !fs.existsSync(path.join(ogOutputDirectory, `${key}.png`));
}

// ── Content ───────────────────────────────────────────────────────────────────

async function getAllPosts() {
  if (!fs.existsSync(contentDirectory)) return [];
  return fs.readdirSync(contentDirectory)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const { data } = matter(fs.readFileSync(path.join(contentDirectory, f), 'utf8'));
      return { slug, ...data };
    });
}

// ── HTML generation ───────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function buildPortfolioOverlay() {
  return `
    <div class="og-title" style="font-size:88px;letter-spacing:-1px">NOTVCTO</div>
    <div class="og-desc" style="font-size:20px;letter-spacing:2px;color:#555;text-transform:uppercase">Systems Architect &amp; Vulnerability Researcher</div>
    <div class="og-url">notvc.to</div>`;
}

function buildPostOverlay(post) {
  return `
    <div class="og-tag">${esc(post.category || 'Blog')}</div>
    <div class="og-title">${esc(post.ogTitle || post.title || '')}</div>
    <div class="og-desc">${esc(post.ogSubtitle || post.description || '')}</div>
    <div class="og-url">${esc(`notvc.to/blog/${post.slug}`)}</div>`;
}

function buildOGPage(overlayHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0d0d0d; display: flex; align-items: flex-start; }
    #stage {
      position: relative; width: 1200px; height: 630px;
      background: #0d0d0d; overflow: hidden; flex-shrink: 0;
    }
    #gl { position: absolute; inset: 0; width: 100%; height: 100%; }
    #overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to right, rgba(13,13,13,0.93) 0%, rgba(13,13,13,0.75) 50%, transparent 75%);
      display: flex; flex-direction: column; justify-content: center;
      padding: 0 88px; gap: 20px;
    }
    .og-tag   { font-family: 'Geist Mono', monospace; font-size: 18px; color: #555; letter-spacing: 4px; text-transform: uppercase; }
    .og-title { font-family: 'Playfair Display', Georgia, serif; font-size: 64px; font-weight: 700; font-style: italic; color: #fefefe; line-height: 1.12; max-width: 620px; }
    .og-desc  { font-family: 'Geist Mono', monospace; font-size: 22px; color: #666; max-width: 580px; }
    .og-url   { font-family: 'Geist Mono', monospace; font-size: 16px; color: #333; position: absolute; bottom: 48px; left: 88px; }
  </style>
</head>
<body>
<div id="stage">
  <canvas id="gl"></canvas>
  <div id="overlay">${overlayHtml}
  </div>
</div>
<script type="module">
import { WebGLRenderer, Scene, PerspectiveCamera, IcosahedronGeometry, ShaderMaterial, Mesh } from '../../node_modules/three/build/three.module.min.js';
const W = 1200, H = 630;
const renderer = new WebGLRenderer({
  canvas: document.getElementById('gl'),
  antialias: true, alpha: true, preserveDrawingBuffer: true,
});
renderer.setSize(W, H);
renderer.setPixelRatio(1);

const scene  = new Scene();
const camera = new PerspectiveCamera(45, W / H, 0.1, 100);
camera.position.set(0, 0, 5);

const uniforms = { uTime: { value: 0 } };

const vertexShader = \`
  uniform float uTime;
  varying vec2 vUv;
  varying float vDisplacement;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4  j  = p - 49.0 * floor(p * ns.z * ns.z);
    vec4  x_ = floor(j * ns.z);
    vec4  y_ = floor(j - 7.0 * x_);
    vec4  x  = x_ * ns.x + ns.yyyy;
    vec4  y  = y_ * ns.x + ns.yyyy;
    vec4  h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    float noise = snoise(position * 1.5 + uTime * 0.15);
    float displacement = noise * 0.15;
    vDisplacement = displacement;
    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
\`;

const fragmentShader = \`
  varying vec2 vUv;
  varying float vDisplacement;
  void main() {
    float intensity = 0.3 + vDisplacement * 2.0;
    vec3 color = vec3(intensity);
    float line = smoothstep(0.0, 0.02, abs(fract(vUv.x * 20.0) - 0.5));
    line *= smoothstep(0.0, 0.02, abs(fract(vUv.y * 20.0) - 0.5));
    gl_FragColor = vec4(color * (1.0 - line * 0.5), 0.6);
  }
\`;

const geo  = new IcosahedronGeometry(1.8, 20);
const mat  = new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, wireframe: true });
const mesh = new Mesh(geo, mat);
mesh.position.x = 0.6;
scene.add(mesh);

let prev = 0;
function animate(t) {
  requestAnimationFrame(animate);
  const dt = (t - prev) / 1000;
  prev = t;
  uniforms.uTime.value += dt;
  mesh.rotation.y += dt * 0.05;
  renderer.render(scene, camera);
}

async function init() {
  try {
    const pf = new FontFace(
      'Playfair Display',
      'url(https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.1.1/files/playfair-display-latin-400-normal.woff2)',
      { weight: '400', style: 'normal' }
    );
    const gm = new FontFace(
      'Geist Mono',
      'url(https://cdn.jsdelivr.net/npm/@fontsource/geist-mono@5.1.1/files/geist-mono-latin-500-normal.woff2)',
      { weight: '500' }
    );
    await Promise.all([pf.load(), gm.load()]);
    document.fonts.add(pf);
    document.fonts.add(gm);
  } catch(e) {}
  animate(0);
  setTimeout(() => document.body.classList.add('ready'), 100);
}

init();
</script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function generateImages() {
  const manifest = loadManifest();
  const posts = await getAllPosts();

  const needsPortfolio = needsGeneration('portfolio', PORTFOLIO_HASH, manifest);
  const postsToGenerate = posts.filter((post) =>
    needsGeneration(post.slug, getPostHash(post), manifest)
  );

  const totalNeeded = (needsPortfolio ? 1 : 0) + postsToGenerate.length;

  if (totalNeeded === 0) {
    console.log(`OG images up to date (${posts.length} post(s) cached), skipping.`);
    return;
  }

  const cached = posts.length - postsToGenerate.length;
  console.log(`Generating ${totalNeeded} OG image(s)${cached > 0 ? ` (${cached} cached)` : ''}...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  const tempHtmlPath = path.join(ogOutputDirectory, '.temp-og.html');

  async function renderOG(overlayHtml, outputPath) {
    fs.writeFileSync(tempHtmlPath, buildOGPage(overlayHtml));
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body.ready');
    const stage = await page.$('#stage');
    await stage.screenshot({ path: outputPath });
  }

  try {
    if (needsPortfolio) {
      console.log('  portfolio.png');
      await renderOG(buildPortfolioOverlay(), path.join(ogOutputDirectory, 'portfolio.png'));
      manifest['portfolio'] = PORTFOLIO_HASH;
    }

    for (const post of postsToGenerate) {
      console.log(`  ${post.slug}.png`);
      await renderOG(buildPostOverlay(post), path.join(ogOutputDirectory, `${post.slug}.png`));
      manifest[post.slug] = getPostHash(post);
    }
  } finally {
    if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    await browser.close();
  }

  saveManifest(manifest);
  console.log('Done.');
}

generateImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
