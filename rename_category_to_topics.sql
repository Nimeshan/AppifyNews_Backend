-- Rename category column to topics
ALTER TABLE articles RENAME COLUMN category TO topics;

-- Drop old index and create new one
DROP INDEX IF EXISTS idx_articles_category;
CREATE INDEX IF NOT EXISTS idx_articles_topics ON articles(topics);
