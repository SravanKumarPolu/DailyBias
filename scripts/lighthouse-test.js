#!/usr/bin/env node

/**
 * Lighthouse CI script for performance, SEO, and accessibility testing
 * 
 * Usage:
 *   pnpm test:lighthouse
 *   pnpm test:lighthouse --url=http://localhost:3000
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_URL = process.env.URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'lighthouse-reports');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(OUTPUT_DIR, `lighthouse-${timestamp}.html`);
const jsonPath = path.join(OUTPUT_DIR, `lighthouse-${timestamp}.json`);

console.log(`\n🔍 Running Lighthouse on ${DEFAULT_URL}...\n`);

try {
  // Run Lighthouse
  const reportBasePath = reportPath.replace('.html', '');
  const command = `npx lighthouse "${DEFAULT_URL}" ` +
    `--output=html,json ` +
    `--output-path=${reportBasePath} ` +
    `--chrome-flags="--headless --no-sandbox" ` +
    `--only-categories=performance,accessibility,seo,best-practices ` +
    `--quiet`;

  execSync(command, { stdio: 'inherit' });

  // Read and parse JSON report
  const jsonReport = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const scores = {
    performance: Math.round(jsonReport.categories.performance.score * 100),
    accessibility: Math.round(jsonReport.categories.accessibility.score * 100),
    seo: Math.round(jsonReport.categories.seo.score * 100),
    'best-practices': Math.round(jsonReport.categories['best-practices'].score * 100),
  };

  console.log('\n📊 Lighthouse Scores:');
  console.log(`  Performance: ${scores.performance}/100`);
  console.log(`  Accessibility: ${scores.accessibility}/100`);
  console.log(`  SEO: ${scores.seo}/100`);
  console.log(`  Best Practices: ${scores['best-practices']}/100`);

  // Check if scores meet thresholds
  const thresholds = {
    performance: 80,
    accessibility: 90,
    seo: 90,
    'best-practices': 80,
  };

  let passed = true;
  for (const [category, threshold] of Object.entries(thresholds)) {
    if (scores[category] < threshold) {
      console.log(`  ⚠️  ${category} score (${scores[category]}) is below threshold (${threshold})`);
      passed = false;
    }
  }

  if (passed) {
    console.log('\n✅ All Lighthouse scores meet thresholds!\n');
  } else {
    console.log('\n⚠️  Some scores are below thresholds. See report for details.\n');
  }

  console.log(`📄 Full report: ${reportPath}`);
  console.log(`📄 JSON report: ${jsonPath}\n`);

  // In CI, exit with error if thresholds not met
  if (process.env.CI && !passed) {
    process.exit(1);
  }
} catch (error) {
  console.error('\n❌ Lighthouse test failed:', error.message);
  process.exit(1);
}

