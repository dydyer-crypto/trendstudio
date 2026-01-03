-- Reply Assistant - AI-Powered Community Management
-- This feature helps creators manage social media comments with AI-generated responses

-- 1. Social Comments Table - Store comments from social media platforms
CREATE TABLE IF NOT EXISTS social_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'youtube', 'instagram', 'tiktok', 'twitter', 'facebook', 'linkedin'
    platform_post_id TEXT NOT NULL, -- ID of the post on the platform
    comment_id TEXT NOT NULL, -- Unique comment ID from platform
    author_username TEXT,
    author_profile_url TEXT,
    content TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'question', 'complaint', 'spam')),
    sentiment_score DECIMAL(3,2) DEFAULT 0, -- -1 to 1 scale
    sentiment_confidence DECIMAL(3,2) DEFAULT 0, -- 0 to 1 scale
    reply_suggested TEXT, -- AI-generated reply suggestion
    reply_sent BOOLEAN DEFAULT FALSE,
    reply_timestamp TIMESTAMPTZ,
    engagement_score INTEGER DEFAULT 0, -- Calculated engagement potential
    priority_score DECIMAL(3,2) DEFAULT 0, -- 0-1 for sorting
    tags TEXT[] DEFAULT '{}', -- User-defined tags
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Reply Templates Table - User-created response templates
CREATE TABLE IF NOT EXISTS reply_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN ('positive', 'question', 'complaint', 'spam', 'neutral', 'celebration', 'gratitude')),
    template_text TEXT NOT NULL,
    platform_specific BOOLEAN DEFAULT FALSE,
    target_platforms TEXT[] DEFAULT '{}', -- ['youtube', 'instagram', etc.]
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0, -- Percentage based on engagement
    avg_response_time INTEGER DEFAULT 0, -- Average time to respond in seconds
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Reply History Table - Track sent replies and their performance
CREATE TABLE IF NOT EXISTS reply_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    platform TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    response_time_seconds INTEGER, -- How long it took to respond
    engagement_metrics JSONB DEFAULT '{}', -- likes, replies, shares, etc.
    ai_generated BOOLEAN DEFAULT TRUE,
    template_used UUID REFERENCES reply_templates(id),
    performance_score DECIMAL(3,2) DEFAULT 0, -- 0-1 based on engagement
    user_feedback TEXT, -- 'good', 'bad', 'neutral'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_history ENABLE ROW LEVEL SECURITY;

-- Users can manage their own social comments
CREATE POLICY "Users can manage their own social comments"
    ON social_comments FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can manage their own reply templates
CREATE POLICY "Users can manage their own reply templates"
    ON reply_templates FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can manage their own reply history
CREATE POLICY "Users can manage their own reply history"
    ON reply_history FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_comments_user_platform ON social_comments(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_comments_sentiment ON social_comments(sentiment);
CREATE INDEX IF NOT EXISTS idx_social_comments_priority ON social_comments(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_social_comments_created ON social_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reply_templates_user_type ON reply_templates(user_id, template_type);
CREATE INDEX IF NOT EXISTS idx_reply_history_comment ON reply_history(comment_id);
CREATE INDEX IF NOT EXISTS idx_reply_history_performance ON reply_history(performance_score DESC);

-- Insert default reply templates for new users
INSERT INTO reply_templates (user_id, template_name, template_type, template_text, platform_specific, target_platforms) VALUES
-- Note: These will be inserted for each user when they first access the Reply Assistant
-- For now, we'll create them as examples that can be cloned

-- Function to update comment priority scores
CREATE OR REPLACE FUNCTION calculate_comment_priority()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate priority based on sentiment, engagement potential, and time
    NEW.priority_score := (
        CASE
            WHEN NEW.sentiment = 'complaint' THEN 0.9
            WHEN NEW.sentiment = 'question' THEN 0.8
            WHEN NEW.sentiment = 'negative' THEN 0.7
            WHEN NEW.sentiment = 'positive' THEN 0.4
            ELSE 0.5
        END
        -- Boost for recent comments (newer = higher priority)
        + GREATEST(0, (EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 86400.0) * -0.1)
        -- Boost for engagement potential
        + (NEW.engagement_score::decimal / 1000.0)
    );

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic priority calculation
CREATE TRIGGER trigger_calculate_comment_priority
    BEFORE INSERT OR UPDATE ON social_comments
    FOR EACH ROW
    EXECUTE FUNCTION calculate_comment_priority();

-- Function to update template success rates
CREATE OR REPLACE FUNCTION update_template_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    -- Update success rate based on reply history performance
    UPDATE reply_templates
    SET
        success_rate = (
            SELECT COALESCE(AVG(performance_score * 100), 0)
            FROM reply_history
            WHERE template_used = NEW.id
            AND created_at > NOW() - INTERVAL '30 days'
        ),
        usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for template success rate updates
CREATE TRIGGER trigger_update_template_success_rate
    AFTER INSERT ON reply_history
    FOR EACH ROW
    WHEN (NEW.template_used IS NOT NULL)
    EXECUTE FUNCTION update_template_success_rate();</content>
</xai:function_call">The comprehensive database schema for the Reply Assistant has been created, including tables for social comments, reply templates, and reply history with advanced features like priority scoring and performance tracking.