/**
 * k6 load test script for DebiasDaily
 * 
 * Install k6: https://k6.io/docs/getting-started/installation/
 * 
 * Usage:
 *   k6 run tests/load/load-test.js
 *   k6 run --vus 50 --duration 30s tests/load/load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Load Daily page
  const dailyResponse = http.get(`${BASE_URL}/`, {
    tags: { name: 'Daily Page' },
  });
  
  const dailyCheck = check(dailyResponse, {
    'daily page status is 200': (r) => r.status === 200,
    'daily page has content': (r) => r.body.length > 1000,
    'daily page loads quickly': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(!dailyCheck);
  sleep(1);

  // Test 2: Load All page
  const allResponse = http.get(`${BASE_URL}/all`, {
    tags: { name: 'All Page' },
  });
  
  const allCheck = check(allResponse, {
    'all page status is 200': (r) => r.status === 200,
    'all page has content': (r) => r.body.length > 1000,
  });
  
  errorRate.add(!allCheck);
  sleep(1);

  // Test 3: Load Analytics page
  const analyticsResponse = http.get(`${BASE_URL}/analytics`, {
    tags: { name: 'Analytics Page' },
  });
  
  const analyticsCheck = check(analyticsResponse, {
    'analytics page status is 200': (r) => r.status === 200,
    'analytics page has content': (r) => r.body.length > 500,
  });
  
  errorRate.add(!analyticsCheck);
  sleep(1);

  // Test 4: Load Settings page
  const settingsResponse = http.get(`${BASE_URL}/settings`, {
    tags: { name: 'Settings Page' },
  });
  
  const settingsCheck = check(settingsResponse, {
    'settings page status is 200': (r) => r.status === 200,
    'settings page has content': (r) => r.body.length > 500,
  });
  
  errorRate.add(!settingsCheck);
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'tests/load/load-test-results.json': JSON.stringify(data),
  };
}

// Simple text summary formatter
function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}Load Test Summary\n`;
  summary += `${indent}==================\n\n`;
  
  // HTTP metrics
  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration;
    summary += `${indent}HTTP Request Duration:\n`;
    summary += `${indent}  avg: ${duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  p95: ${duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}  p99: ${duration.values['p(99)'].toFixed(2)}ms\n\n`;
  }
  
  if (data.metrics.http_req_failed) {
    const failed = data.metrics.http_req_failed;
    summary += `${indent}HTTP Request Failed: ${(failed.values.rate * 100).toFixed(2)}%\n\n`;
  }
  
  // Checks
  if (data.root_group && data.root_group.checks) {
    summary += `${indent}Checks:\n`;
    for (const check of data.root_group.checks) {
      const passRate = (check.passes / (check.passes + check.fails)) * 100;
      summary += `${indent}  ${check.name}: ${passRate.toFixed(2)}% pass rate\n`;
    }
  }
  
  return summary;
}

