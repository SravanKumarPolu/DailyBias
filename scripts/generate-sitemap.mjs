import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://debiasdaily.com';
const CHANGE_FREQUENCY = 'weekly';
const PRIORITY = '0.8';

// Static pages for sitemap
const staticPages = [
  '',
  '/today',
  '/welcome',
  '/saved',
  '/biases',
  '/quiz',
  '/weekly-review',
  '/settings',
  '/about',
];

// Common bias IDs based on the biases data structure
const commonBiasIds = [
  'confirmation-bias',
  'anchoring-bias',
  'availability-heuristic',
  'dunning-kruger-effect',
  'sunk-cost-fallacy',
  'halo-effect',
  'fundamental-attribution-error',
  'self-serving-bias',
  'outcome-bias',
  'optimism-bias',
  'loss-aversion',
  'framing-effect',
  'bandwagon-effect',
  'false-consensus-effect',
  'authority-bias',
];

function generateSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
  staticPages.forEach((path) => {
    sitemap += `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${CHANGE_FREQUENCY}</changefreq>
    <priority>${PRIORITY}</priority>
  </url>
`;
  });

  // Add bias detail pages
  commonBiasIds.forEach((biasId) => {
    sitemap += `  <url>
    <loc>${SITE_URL}/bias/${biasId}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });

  sitemap += '</urlset>';

  const outputPath = join(__dirname, '../dist/sitemap.xml');
  writeFileSync(outputPath, sitemap, 'utf-8');
  console.log('Sitemap generated at:', outputPath);
}

generateSitemap();