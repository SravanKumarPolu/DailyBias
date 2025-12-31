#!/usr/bin/env node

/**
 * Validation Script for Real-World Examples and Quick Tips
 *
 * This script validates:
 * 1. All biases have tips (either in data or hardcoded)
 * 2. Tips quality (4+ per bias, proper format)
 * 3. Example quality (when present)
 * 4. JSON structure integrity
 */

const fs = require('fs');
const path = require('path');

// Load biases data
const biasesPath = path.join(__dirname, '..', 'data', 'biases.json');
const biasesData = JSON.parse(fs.readFileSync(biasesPath, 'utf8'));

// Statistics
const stats = {
  totalBiases: biasesData.length,
  biasesWithTipsInData: 0,
  biasesWithExamples: 0,
  totalExamples: 0,
  examplesByCategory: {
    business: 0,
    politics: 0,
    personal: 0,
    historical: 0,
    news: 0
  },
  issues: []
};

console.log('🔍 Validating Real-World Examples & Quick Tips\n');
console.log('═'.repeat(60));

// Validate each bias
biasesData.forEach((bias, index) => {
  const biasNum = index + 1;

  // Check for tips in data
  if (bias.tips && Array.isArray(bias.tips)) {
    stats.biasesWithTipsInData++;

    // Validate tips quality
    if (bias.tips.length < 4) {
      stats.issues.push({
        bias: bias.title,
        type: 'TIPS_COUNT',
        message: `Has only ${bias.tips.length} tips (recommended: 4+)`
      });
    }

    // Check for empty tips
    bias.tips.forEach((tip, tipIndex) => {
      if (!tip || tip.trim().length === 0) {
        stats.issues.push({
          bias: bias.title,
          type: 'EMPTY_TIP',
          message: `Tip #${tipIndex + 1} is empty`
        });
      }
    });
  }

  // Check for examples
  if (bias.examples && Array.isArray(bias.examples)) {
    stats.biasesWithExamples++;
    stats.totalExamples += bias.examples.length;

    // Validate examples
    bias.examples.forEach((example, exIndex) => {
      // Count by category
      if (example.category) {
        stats.examplesByCategory[example.category] =
          (stats.examplesByCategory[example.category] || 0) + 1;
      }

      // Validate required fields
      if (!example.title || example.title.trim().length === 0) {
        stats.issues.push({
          bias: bias.title,
          type: 'MISSING_EXAMPLE_TITLE',
          message: `Example #${exIndex + 1} missing title`
        });
      }

      if (!example.description || example.description.trim().length === 0) {
        stats.issues.push({
          bias: bias.title,
          type: 'MISSING_EXAMPLE_DESC',
          message: `Example #${exIndex + 1} missing description`
        });
      }

      if (!example.category) {
        stats.issues.push({
          bias: bias.title,
          type: 'MISSING_CATEGORY',
          message: `Example #${exIndex + 1} missing category`
        });
      }

      // Check description length (should be substantial)
      if (example.description && example.description.length < 100) {
        stats.issues.push({
          bias: bias.title,
          type: 'SHORT_DESCRIPTION',
          message: `Example "${example.title}" description is too short (${example.description.length} chars, recommended: 150+)`
        });
      }
    });
  }
});

// Print statistics
console.log('\n📊 STATISTICS\n');
console.log(`Total Biases: ${stats.totalBiases}`);
console.log(`\n💡 Tips Coverage:`);
console.log(`  ├─ Biases with tips in data: ${stats.biasesWithTipsInData} (${((stats.biasesWithTipsInData / stats.totalBiases) * 100).toFixed(1)}%)`);
console.log(`  └─ Biases without tips in data: ${stats.totalBiases - stats.biasesWithTipsInData} (${(((stats.totalBiases - stats.biasesWithTipsInData) / stats.totalBiases) * 100).toFixed(1)}%)`);

console.log(`\n🌟 Examples Coverage:`);
console.log(`  ├─ Biases with examples: ${stats.biasesWithExamples} (${((stats.biasesWithExamples / stats.totalBiases) * 100).toFixed(1)}%)`);
console.log(`  ├─ Total examples: ${stats.totalExamples}`);
console.log(`  ├─ Average per bias: ${(stats.totalExamples / stats.biasesWithExamples).toFixed(1)}`);
console.log(`  └─ Biases without examples: ${stats.totalBiases - stats.biasesWithExamples} (${(((stats.totalBiases - stats.biasesWithExamples) / stats.totalBiases) * 100).toFixed(1)}%)`);

console.log(`\n📁 Examples by Category:`);
console.log(`  ├─ Business: ${stats.examplesByCategory.business}`);
console.log(`  ├─ Politics: ${stats.examplesByCategory.politics}`);
console.log(`  ├─ Personal: ${stats.examplesByCategory.personal}`);
console.log(`  ├─ Historical: ${stats.examplesByCategory.historical}`);
console.log(`  └─ News: ${stats.examplesByCategory.news}`);

// Print issues
if (stats.issues.length > 0) {
  console.log(`\n⚠️  ISSUES FOUND (${stats.issues.length})\n`);
  stats.issues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.bias}`);
    console.log(`   ${issue.message}\n`);
  });
} else {
  console.log(`\n✅ NO ISSUES FOUND - All validations passed!\n`);
}

// Print recommendations
console.log('═'.repeat(60));
console.log('\n💡 RECOMMENDATIONS\n');

if (stats.biasesWithTipsInData < stats.totalBiases) {
  console.log(`📝 Migrate remaining ${stats.totalBiases - stats.biasesWithTipsInData} biases' tips to data`);
}

if (stats.biasesWithExamples < stats.totalBiases) {
  const needed = stats.totalBiases - stats.biasesWithExamples;
  console.log(`🌟 Add structured examples to ${needed} more biases`);
  console.log(`   Priority: High-traffic biases without examples`);
}

if (stats.totalExamples > 0) {
  const avgPerBias = stats.totalExamples / stats.biasesWithExamples;
  if (avgPerBias < 2.5) {
    console.log(`📈 Consider adding more examples (current avg: ${avgPerBias.toFixed(1)}, target: 3)`);
  }
}

console.log('\n═'.repeat(60));

// Exit with appropriate code
if (stats.issues.some(i => i.type !== 'SHORT_DESCRIPTION' && i.type !== 'TIPS_COUNT')) {
  console.log('\n❌ Validation failed with critical issues\n');
  process.exit(1);
} else if (stats.issues.length > 0) {
  console.log('\n⚠️  Validation passed with warnings\n');
  process.exit(0);
} else {
  console.log('\n✅ Validation passed - excellent!\n');
  process.exit(0);
}

