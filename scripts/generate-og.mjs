import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content/blog');
const ogOutputDirectory = path.join(process.cwd(), 'public/og');
const manifestPath = path.join(ogOutputDirectory, '.manifest.json');
const templatePath = path.join(process.cwd(), 'og-template.html');

if (!fs.existsSync(ogOutputDirectory)) {
  fs.mkdirSync(ogOutputDirectory, { recursive: true });
}

function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 16);
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveManifest(manifest) {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function getTemplateHash() {
  return hashString(fs.readFileSync(templatePath, 'utf8'));
}

function getPostHash(post, templateHash) {
  return hashString([
    templateHash,
    post.slug,
    post.ogTitle || post.title || '',
    post.ogSubtitle || post.description || '',
    post.category || '',
  ].join('|'));
}

function needsGeneration(key, hash, manifest) {
  if (manifest[key] !== hash) return true;
  return !fs.existsSync(path.join(ogOutputDirectory, `${key}.png`));
}

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

async function generateImages() {
  const manifest = loadManifest();
  const templateHash = getTemplateHash();
  const templateFileUrl = `file://${templatePath}`;

  const posts = await getAllPosts();

  const portfolioHash = hashString(`portfolio|${templateHash}`);
  const needsPortfolio = needsGeneration('portfolio', portfolioHash, manifest);
  const postsToGenerate = posts.filter((post) =>
    needsGeneration(post.slug, getPostHash(post, templateHash), manifest)
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
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  if (needsPortfolio) {
    console.log('  portfolio.png');
    await page.goto(`${templateFileUrl}?screenshot=1&type=portfolio`);
    await page.waitForSelector('body.ready');
    const stage = await page.$('#stage');
    await stage.screenshot({ path: path.join(ogOutputDirectory, 'portfolio.png') });
    manifest['portfolio'] = portfolioHash;
  }

  for (const post of postsToGenerate) {
    console.log(`  ${post.slug}.png`);
    const title    = encodeURIComponent(post.ogTitle    || post.title           || '');
    const desc     = encodeURIComponent(post.ogSubtitle || post.description     || '');
    const category = encodeURIComponent(post.category   || 'Blog');
    const url      = encodeURIComponent(`notvc.to/blog/${post.slug}`);

    await page.goto(`${templateFileUrl}?screenshot=1&type=post&category=${category}&title=${title}&desc=${desc}&url=${url}`);
    await page.waitForSelector('body.ready');
    const stage = await page.$('#stage');
    await stage.screenshot({ path: path.join(ogOutputDirectory, `${post.slug}.png`) });
    manifest[post.slug] = getPostHash(post, templateHash);
  }

  await browser.close();
  saveManifest(manifest);
  console.log('Done.');
}

generateImages().catch((err) => {
  console.error(err);
  process.exit(1);
});
