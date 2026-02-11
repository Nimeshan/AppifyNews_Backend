# Article Generation Modes

This project supports two modes for generating articles:

## 1. OpenAI Mode (Default)

**Status**: ✅ Active by default  
**Requires**: `OPENAI_API_KEY` environment variable  
**Quality**: Higher quality, more creative content  
**Cost**: Uses OpenAI API (GPT-4o)  
**Speed**: Slower (API calls)

### How to Use:
- Leave `USE_CODE_GENERATION` unset or set to `false`
- Ensure `OPENAI_API_KEY` is set in Railway/environment
- Articles will be generated using OpenAI GPT-4o

### Services Used:
- `contentGenerator.ts` - OpenAI GPT-4o for blog content
- `seoOptimizer.ts` - OpenAI GPT-4o for SEO optimization
- `htmlConverter.ts` - OpenAI GPT-4o for HTML conversion
- `titleGenerator.ts` - OpenAI GPT-4o for title generation
- `metaDescriptionGenerator.ts` - OpenAI GPT-4o for meta descriptions

---

## 2. Code-Based Mode (Alternative)

**Status**: ✅ Available via flag  
**Requires**: No API keys needed  
**Quality**: Good quality, extracts from RSS/articles  
**Cost**: Free (no API calls)  
**Speed**: Faster (no API calls)

### How to Use:
- Set `USE_CODE_GENERATION=true` in Railway/environment
- No OpenAI API key needed
- Articles will be generated using code-based extraction

### Services Used:
- `contentGeneratorCode.ts` - Extracts content from RSS/articles
- `seoOptimizerCode.ts` - Code-based SEO with keyword extraction
- `htmlConverterCode.ts` - Markdown to HTML conversion
- `titleGeneratorCode.ts` - Title from RSS/headings
- `metaDescriptionGeneratorCode.ts` - Meta from content

---

## Switching Between Modes

### In Railway:
1. Go to your backend service → Variables
2. To use OpenAI: Remove or set `USE_CODE_GENERATION=false`
3. To use Code: Set `USE_CODE_GENERATION=true`
4. Redeploy the service

### Locally:
```bash
# Use OpenAI (default)
# Don't set USE_CODE_GENERATION or set it to false
export USE_CODE_GENERATION=false

# Use Code-based
export USE_CODE_GENERATION=true
```

---

## Comparison

| Feature | OpenAI Mode | Code Mode |
|---------|-------------|-----------|
| Content Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Creativity | High | Medium |
| API Costs | Yes | No |
| Speed | Slower | Faster |
| Dependencies | OpenAI API | None |
| Customization | Limited | Full control |

---

## Recommendation

- **Use OpenAI** for production when quality is critical
- **Use Code** for testing, development, or when API costs are a concern
- Both modes are fully functional and can be switched at any time
