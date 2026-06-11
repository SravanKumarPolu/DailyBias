import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://debiasdaily.com';

// Static pages for sitemap with priorities
const staticPages = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/today', priority: '0.9', changefreq: 'daily' },
  { path: '/welcome', priority: '0.5', changefreq: 'monthly' },
  { path: '/saved', priority: '0.8', changefreq: 'weekly' },
  { path: '/biases', priority: '0.9', changefreq: 'weekly' },
  { path: '/quiz', priority: '0.7', changefreq: 'weekly' },
  { path: '/weekly-review', priority: '0.6', changefreq: 'weekly' },
  { path: '/settings', priority: '0.3', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
];

// Read biases data file to extract all bias IDs
function getAllBiasIds() {
  try {
    const biasesPath = join(__dirname, '../src/data/biases.ts');
    const biasesContent = readFileSync(biasesPath, 'utf-8');
    
    // Extract bias IDs using regex pattern
    const idPattern = /id:\s*"([^"]+)"/g;
    const ids = [];
    let match;
    
    while ((match = idPattern.exec(biasesContent)) !== null) {
      ids.push(match[1]);
    }
    
    return ids;
  } catch (error) {
    console.error('Error reading biases data:', error);
    return [];
  }
}

function generateSitemap() {
  const biasIds = getAllBiasIds();
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
  staticPages.forEach((page) => {
    sitemap += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Add all bias detail pages
  biasIds.forEach((biasId) => {
    sitemap += `  <url>
    <loc>${SITE_URL}/bias/${biasId}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  });

  sitemap += '</urlset>';

  const outputPath = join(__dirname, '../dist/sitemap.xml');
  writeFileSync(outputPath, sitemap, 'utf-8');
  console.log(`Sitemap generated at: ${outputPath}`);
  console.log(`Total URLs: ${staticPages.length + biasIds.length}`);
  console.log(`Bias pages: ${biasIds.length}`);
}

generateSitemap();