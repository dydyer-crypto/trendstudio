-- Create enum for post status
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'cancelled');

-- Create enum for social media platforms
CREATE TYPE social_platform AS ENUM ('youtube', 'instagram', 'tiktok', 'facebook', 'twitter', 'linkedin', 'other');

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT, -- 'video', 'image', 'text'
  platform social_platform NOT NULL,
  status post_status NOT NULL DEFAULT 'draft',
  scheduled_date TIMESTAMPTZ NOT NULL,
  published_date TIMESTAMPTZ,
  content_url TEXT, -- URL to the generated content
  thumbnail_url TEXT,
  tags TEXT[], -- Array of tags
  notes TEXT, -- Internal notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_date ON scheduled_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform ON scheduled_posts(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_date ON scheduled_posts(user_id, scheduled_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scheduled_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_scheduled_posts_updated_at ON scheduled_posts;
CREATE TRIGGER trigger_update_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_posts_updated_at();

-- RLS Policies
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Users can view their own posts
CREATE POLICY "Users can view their own scheduled posts"
  ON scheduled_posts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own posts
CREATE POLICY "Users can create their own scheduled posts"
  ON scheduled_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own posts
CREATE POLICY "Users can update their own scheduled posts"
  ON scheduled_posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete their own scheduled posts"
  ON scheduled_posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all posts
CREATE POLICY "Admins can view all scheduled posts"
  ON scheduled_posts FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can manage all posts
CREATE POLICY "Admins can manage all scheduled posts"
  ON scheduled_posts FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

COMMENT ON TABLE scheduled_posts IS 'Stores scheduled content posts for publication calendar';
COMMENT ON COLUMN scheduled_posts.content_type IS 'Type of content: video, image, or text';
COMMENT ON COLUMN scheduled_posts.platform IS 'Target social media platform';
COMMENT ON COLUMN scheduled_posts.status IS 'Current status of the post';
COMMENT ON COLUMN scheduled_posts.scheduled_date IS 'When the post is scheduled to be published';
COMMENT ON COLUMN scheduled_posts.published_date IS 'Actual publication date (if published)';