-- Add platform-specific publishing fields to scheduled_posts table
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS platform_post_id TEXT,
ADD COLUMN IF NOT EXISTS platform_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS publishing_error TEXT,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform_post_id ON scheduled_posts(platform_post_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_retry_count ON scheduled_posts(retry_count);

COMMENT ON COLUMN scheduled_posts.platform_post_id IS 'ID of the post on the target platform after publishing';
COMMENT ON COLUMN scheduled_posts.platform_metadata IS 'JSON storage for platform-specific post metadata';
COMMENT ON COLUMN scheduled_posts.publishing_error IS 'Error message if publishing failed';
COMMENT ON COLUMN scheduled_posts.retry_count IS 'Number of publishing retry attempts';
COMMENT ON COLUMN scheduled_posts.max_retries IS 'Maximum number of retry attempts allowed';