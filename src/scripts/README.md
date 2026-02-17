# Article Validation and Auto-Fix Scripts

This directory contains scripts to validate and automatically fix articles according to Appify's SEO-first content guidelines.

## Scripts

### `validateArticles.ts`

Validates all published articles against the content guidelines and reports issues.

**Usage:**
```bash
npm run validate-articles
```

**What it checks:**
- ✅ Required sections (Definition, How It Works, Trade-offs, Decision Framework, Implementation, Conclusion)
- ✅ Section word counts (150-250 words minimum)
- ✅ Trade-off paragraphs (120+ words each)
- ✅ Single-sentence bullet points (flags if < 50 words)
- ✅ Multiple CTAs (flags if > 1)
- ✅ Banned phrases
- ✅ FAQ sections (banned)
- ✅ SEO requirements (primary keyword in H1, first paragraph, H2, conclusion)

**Output:**
- Detailed report for each article
- Validation score (0-100)
- List of issues with suggestions
- Summary statistics

### `fixArticles.ts`

Automatically fixes common issues in articles:
- Expands single-sentence bullet points into paragraphs (using AI if available)
- Removes extra CTAs (keeps only one in conclusion)

**Usage:**

Dry run (preview changes without applying):
```bash
npm run fix-articles
```

Apply fixes (actually save changes):
```bash
npm run fix-articles:apply
```

**Note:** The fix script uses OpenAI GPT-4o-mini to expand bullet points when available. If OpenAI API key is not set, it uses simple text expansion.

## Integration

The auto-fix script is automatically integrated into the article generation pipeline (`generateArticles.ts`). Articles are automatically fixed before being saved to the database.

## Guidelines Reference

Articles must follow these rules:

1. **H1 Title**: Must contain primary keyword naturally, no hype
2. **Definition Section**: Precise explanation, no fluff
3. **How It Works**: Implementation-focused mechanics
4. **Trade-Offs and Risks**: Each trade-off must be 120+ words
5. **Decision Framework**: Criteria for when to build vs buy, etc.
6. **Implementation Steps**: Realistic, mentions governance, monitoring, costs
7. **Conclusion**: Short, no motivational language, max 1 CTA

**Banned Phrases:**
- "In today's..."
- "rapidly evolving landscape"
- "competitive advantage"
- "This article explores..."
- "recently announced"
- FAQ sections

**Depth Requirements:**
- Major sections: 150-250 words minimum
- Trade-off paragraphs: 120+ words each
- Bullet points: Must be expanded into paragraphs (50+ words)

## Example Output

### Validation
```
📄 Article: How to Build AI Agents
   Slug: how-to-build-ai-agents
   Score: 75/100
   Issues: 3 (1 errors, 2 warnings)
   
   Issues:
   1. ❌ [Conclusion] Found 3 CTAs (maximum allowed: 1)
      💡 Suggestion: Remove extra CTAs, keep only one optional CTA in conclusion
   2. ⚠️ [Trade-offs] Section too short: 120 words (minimum: 150)
      💡 Suggestion: Expand section with more detail and depth
   3. ❌ [Content Block 5] Single-sentence bullet point found: "Use RAG for context..." (12 words)
      💡 Suggestion: Expand bullet point into a full paragraph (minimum 50 words)
```

### Fix
```
📄 Article 1: How to Build AI Agents
   Slug: how-to-build-ai-agents
   Score before: 75/100
   ✅ Fixed 2 issue(s):
      - Expanded single-sentence bullet points into paragraphs
      - Removed 2 extra CTA(s), kept only one in conclusion
   Score after: 90/100
   📈 Improvement: +15 points
```
