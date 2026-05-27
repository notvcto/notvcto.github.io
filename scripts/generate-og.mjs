import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content/blog');
const ogOutputDirectory = path.join(process.cwd(), 'public/og');

if (!fs.existsSync(ogOutputDirectory)) {
  fs.mkdirSync(ogOutputDirectory, { recursive: true });
}

async function getAllPosts() {
  if (!fs.existsSync(contentDirectory)) return [];
  const fileNames = fs.readdirSync(contentDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return { slug, ...data };
    });
}

async function generateImages() {
  console.log('Generating OG images...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  const templatePath = `file://${path.join(process.cwd(), 'og-template.html')}`;

  // Generate Portfolio (Landing) Image
  console.log('Generating portfolio.png');
  const portfolioUrl = `${templatePath}?screenshot=1&type=portfolio`;
  await page.goto(portfolioUrl, { waitUntil: 'networkidle0' });
  await page.waitForSelector('body.ready');
  const stagePortfolio = await page.$('#stage');
  await stagePortfolio.screenshot({ path: path.join(ogOutputDirectory, 'portfolio.png') });

  // Generate Blog Posts Images
  const posts = await getAllPosts();
  for (const post of posts) {
    console.log(`Generating ${post.slug}.png`);
    const title = encodeURIComponent(post.ogTitle || post.title);
    const desc = encodeURIComponent(post.ogSubtitle || post.description || '');
    const category = encodeURIComponent(post.category || 'Blog');
    const url = encodeURIComponent(`notvc.to/blog/${post.slug}`);
    
    const postUrl = `${templatePath}?screenshot=1&type=post&category=${category}&title=${title}&desc=${desc}&url=${url}`;
    await page.goto(postUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('body.ready');
    const stagePost = await page.$('#stage');
    await stagePost.screenshot({ path: path.join(ogOutputDirectory, `${post.slug}.png`) });
  }

  await browser.close();
  console.log('Finished generating OG images.');
}

generateImages().catch(console.error);
