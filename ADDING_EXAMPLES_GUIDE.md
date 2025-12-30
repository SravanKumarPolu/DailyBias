# Guide: Adding Real-World Examples to Biases

This guide explains how to add real-world examples to cognitive biases in DebiasDaily.

---

## Quick Start

### 1. Find the bias in `data/biases.json`

```json
{
  "id": "your-bias-id",
  "title": "Your Bias Name",
  "category": "social",
  "summary": "...",
  "why": "...",
  "counter": "...",
  "source": "core"
}
```

### 2. Add the `examples` array

```json
{
  "id": "your-bias-id",
  "title": "Your Bias Name",
  "category": "social",
  "summary": "...",
  "why": "...",
  "counter": "...",
  "source": "core",
  "examples": [
    {
      "title": "Example Title",
      "description": "Detailed description of the real-world example...",
      "category": "business",
      "year": 2020,
      "source": "Source name (optional)"
    }
  ]
}
```

---

## Example Structure

### Required Fields

- **`title`** (string) - Brief, catchy title (3-8 words)
- **`description`** (string) - Detailed scenario (150-250 words)
- **`category`** (string) - One of: `"business"`, `"politics"`, `"personal"`, `"historical"`, `"news"`

### Optional Fields

- **`source`** (string) - Source attribution (e.g., "NASA investigation", "Stanford study")
- **`year`** (number) - Year of the event/study

---

## Categories Explained

### 🔵 Business
Corporate decisions, startup stories, investment cases, workplace scenarios

**Examples:**
- Enron scandal
- Theranos fraud
- Blockbuster vs. Netflix
- Startup funding decisions

### 🟣 Politics
Government decisions, policy failures, political campaigns, international relations

**Examples:**
- Bay of Pigs invasion
- Iraq WMD intelligence
- Brexit campaign
- Election predictions

### 🟢 Personal
Everyday life, relationships, personal finance, social situations

**Examples:**
- Restaurant choices
- Dating decisions
- Wedding planning
- Movie theater behavior

### 🟠 Historical
Major historical events, disasters, wars, significant societal changes

**Examples:**
- NASA Challenger disaster
- Tulip Mania (1637)
- World War decisions
- Economic bubbles

### 🔴 News
Current events, media coverage, recent trends, viral stories

**Examples:**
- COVID-19 responses
- Cryptocurrency boom (2021)
- Shark attack summer (2001)
- Social media trends

---

## Writing Great Examples

### ✅ DO

1. **Be Specific**
   - ❌ "A company made a bad decision"
   - ✅ "Blockbuster refused to buy Netflix for $50 million in 2000"

2. **Include Numbers & Details**
   - ❌ "The project went over budget"
   - ✅ "Sydney Opera House: projected $7M, actual $102M (1,357% over budget)"

3. **Show Consequences**
   - ❌ "People were overconfident"
   - ✅ "90% of startups fail, yet 80% of entrepreneurs believe they'll succeed"

4. **Mix Famous & Relatable**
   - Include both well-known cases (Enron, NASA) and everyday scenarios (restaurants, dating)

5. **Cite Sources When Possible**
   - "Stanford Gender Bias Research"
   - "NASA Challenger investigation"
   - "Senate Intelligence Committee Report"

### ❌ DON'T

1. **Don't Be Vague**
   - Avoid: "Studies show...", "Research indicates..."
   - Better: "A 2017 Stanford study found..."

2. **Don't Editorialize**
   - Avoid: "This terrible decision..."
   - Better: "This decision led to..."

3. **Don't Use Jargon**
   - Write for a general audience
   - Explain technical terms

4. **Don't Make It Too Long**
   - Keep descriptions to 150-250 words
   - One clear point per example

5. **Don't Duplicate**
   - Each example should show a different aspect of the bias
   - Vary the contexts (business, personal, historical)

---

## Example Template

```json
{
  "title": "[Catchy 3-8 word title]",
  "description": "[150-250 word description that includes: (1) What happened, (2) How the bias manifested, (3) What the consequences were. Use specific numbers, names, and dates. Make it concrete and memorable.]",
  "category": "[business|politics|personal|historical|news]",
  "year": 2020,
  "source": "[Optional: Name of study, report, or event]"
}
```

---

## Real Example Breakdown

Let's analyze a good example:

```json
{
  "title": "NASA Challenger Disaster",
  "description": "In 1986, NASA launched the Challenger despite engineers warning that O-rings would fail in cold weather. The night before launch, engineers presented data showing risk, but managers dismissed concerns to maintain the launch schedule. No one wanted to be 'the person who delayed the shuttle.' Seven astronauts died when the O-rings failed exactly as predicted.",
  "source": "NASA Challenger investigation",
  "year": 1986,
  "category": "historical"
}
```

**Why this works:**

✅ **Specific** - Names the event, date, and technical detail (O-rings)  
✅ **Shows the bias** - Groupthink: "No one wanted to be 'the person who delayed'"  
✅ **Consequences** - Seven astronauts died  
✅ **Well-sourced** - NASA investigation  
✅ **Memorable** - Famous case that demonstrates the bias clearly  
✅ **Right length** - ~80 words, concise but complete

---

## Validation Checklist

Before committing examples, verify:

- [ ] Title is 3-8 words
- [ ] Description is 150-250 words
- [ ] Category is one of the 5 valid options
- [ ] Example clearly demonstrates the specific bias
- [ ] Includes specific details (names, numbers, dates)
- [ ] Shows consequences of the bias
- [ ] Is factually accurate
- [ ] Source is cited (if applicable)
- [ ] JSON is valid (no syntax errors)
- [ ] No duplicate examples across biases

---

## Testing Your Examples

After adding examples, test them:

```bash
# 1. Validate JSON syntax
cd /Users/sravanpolu/Projects/DailyBias
node -e "JSON.parse(require('fs').readFileSync('./data/biases.json', 'utf8'))"

# 2. Build the project
npm run build

# 3. Check for TypeScript errors
npm run type-check

# 4. Start dev server and visually inspect
npm run dev
# Then navigate to the bias detail page
```

---

## Example Ideas by Bias Type

### Social Biases
- Workplace discrimination cases
- Jury decision studies
- Social media behavior
- Group decision failures

### Decision Biases
- Investment mistakes
- Business strategy failures
- Personal finance errors
- Policy decisions

### Memory Biases
- Eyewitness testimony errors
- False memory studies
- Historical revisionism
- Personal recollections

### Perception Biases
- Optical illusions in design
- Product perception studies
- Risk assessment errors
- Beauty premium research

---

## Resources for Finding Examples

### Academic Sources
- Google Scholar
- PubMed (for psychology studies)
- JSTOR
- University research databases

### Business Cases
- Harvard Business Review
- Case studies from business schools
- Company post-mortems
- SEC filings and investigations

### Historical Events
- Wikipedia (verify with primary sources)
- Historical archives
- Government investigations
- Documentaries and books

### News & Current Events
- Major news outlets
- Fact-checking sites
- Academic analyses of current events
- Social science research on trends

---

## Common Mistakes to Avoid

### 1. Too Abstract
❌ "People often make this mistake in business"  
✅ "In 2019, WeWork's board maintained a $47B valuation despite clear evidence of unsustainable losses"

### 2. Too Long
❌ 500-word essay with multiple tangents  
✅ 150-250 words focused on one clear point

### 3. Wrong Category
❌ Putting "Restaurant menu pricing" in "historical"  
✅ "Restaurant menu pricing" belongs in "personal"

### 4. No Consequences
❌ "The company made a biased decision"  
✅ "The company made a biased decision, leading to bankruptcy and 10,000 job losses"

### 5. Unsourced Claims
❌ "Studies show 80% of people..."  
✅ "A 2017 Stanford study found that 80% of people..."

---

## Priority Biases for Examples

### High Priority (Most Popular)
- Confirmation Bias ✅
- Anchoring ✅
- Sunk Cost Fallacy ✅
- Availability Heuristic ✅
- Dunning-Kruger Effect ✅

### Medium Priority
- Hindsight Bias
- Recency Bias
- Planning Fallacy
- Negativity Bias
- Loss Aversion

### Lower Priority
- Less common biases
- Highly technical biases
- Niche academic biases

---

## Questions?

If you're unsure about an example:

1. **Is it specific enough?** Add more details
2. **Is it too long?** Cut to the essential story
3. **Does it clearly show the bias?** Make the connection explicit
4. **Is it accurate?** Verify facts and sources
5. **Is it appropriate?** Avoid controversial or sensitive topics unless essential

---

**Last Updated:** December 31, 2025  
**Current Status:** 12 biases with examples, 38 remaining

