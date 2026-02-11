-- Add content JSON column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS content JSONB;

-- Migrate existing content blocks to JSON
UPDATE articles a
SET content = (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'type', acb.type::text,
        'text', acb.text,
        'src', acb.src,
        'alt', acb.alt
      ) ORDER BY acb.sort_order
    ) FILTER (WHERE acb.id IS NOT NULL),
    '[]'::json
  )
  FROM article_content_blocks acb
  WHERE acb.article_id = a.id
)
WHERE EXISTS (
  SELECT 1 FROM article_content_blocks acb WHERE acb.article_id = a.id
);

-- Set empty array for articles with no content blocks
UPDATE articles
SET content = '[]'::jsonb
WHERE content IS NULL;
