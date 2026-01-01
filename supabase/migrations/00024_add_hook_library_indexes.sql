-- Add indexes to hook_library table for improved search performance

-- Index for performance score queries
CREATE INDEX IF NOT EXISTS idx_hook_library_performance_score ON hook_library(performance_score DESC);

-- Index for usage count queries
CREATE INDEX IF NOT EXISTS idx_hook_library_usage_count ON hook_library(usage_count DESC);

-- Index for last used queries
CREATE INDEX IF NOT EXISTS idx_hook_library_last_used ON hook_library(last_used_at DESC);

-- Index for topic searches
CREATE INDEX IF NOT EXISTS idx_hook_library_topic ON hook_library USING gin(to_tsvector('english', topic));

-- Index for platform filtering
CREATE INDEX IF NOT EXISTS idx_hook_library_platform ON hook_library(platform);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_hook_library_category ON hook_library(category_id);

-- Composite index for user + performance score queries
CREATE INDEX IF NOT EXISTS idx_hook_library_user_performance ON hook_library(user_id, performance_score DESC);

-- Composite index for user + usage count queries
CREATE INDEX IF NOT EXISTS idx_hook_library_user_usage ON hook_library(user_id, usage_count DESC);

-- Composite index for user + last used queries
CREATE INDEX IF NOT EXISTS idx_hook_library_user_last_used ON hook_library(user_id, last_used_at DESC);

-- Composite index for user + platform + favorite queries
CREATE INDEX IF NOT EXISTS idx_hook_library_user_platform_fav ON hook_library(user_id, platform, is_favorite);

-- Index for created_at for time-based filtering
CREATE INDEX IF NOT EXISTS idx_hook_library_created_at ON hook_library(created_at DESC);