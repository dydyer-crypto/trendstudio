-- Table for storing aggregated social media account statistics (snapshots)
CREATE TABLE IF NOT EXISTS social_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  credential_id UUID NOT NULL REFERENCES platform_credentials(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  
  -- Account level metrics
  follower_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC(10,4) DEFAULT 0,
  total_views_30d INTEGER DEFAULT 0,
  total_likes_30d INTEGER DEFAULT 0,
  
  -- Time tracking
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(credential_id, snapshot_date)
);

-- Table for storing specific post performance data
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  platform_post_id TEXT NOT NULL,
  
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_analytics_user ON social_analytics_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_platform ON social_analytics_snapshots(platform);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post ON post_analytics(post_id);

-- RLS
ALTER TABLE social_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics snapshots"
  ON social_analytics_snapshots FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own post analytics"
  ON post_analytics FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM scheduled_posts 
    WHERE scheduled_posts.id = post_analytics.post_id 
    AND scheduled_posts.user_id = auth.uid()
  ));

COMMENT ON TABLE social_analytics_snapshots IS 'Daily snapshots of account-level performance metrics per platform';
COMMENT ON TABLE post_analytics IS 'Detailed performance metrics for individual published posts';
