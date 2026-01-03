-- WordPress Integration
-- Add WordPress sites connection and content export functionality

-- Create wordpress_sites table
CREATE TABLE IF NOT EXISTS wordpress_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_name TEXT NOT NULL,
    site_url TEXT NOT NULL,
    api_url TEXT NOT NULL, -- https://site.com/wp-json/wp/v2/
    username TEXT NOT NULL,
    application_password TEXT, -- Encrypted in production
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for wordpress_sites
ALTER TABLE wordpress_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their WordPress sites"
    ON wordpress_sites FOR ALL
    USING (auth.uid() = user_id);

-- Create wordpress_exports table to track exports
CREATE TABLE IF NOT EXISTS wordpress_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wordpress_site_id UUID REFERENCES wordpress_sites(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'blog_post', 'page', 'aio_content'
    content_id TEXT, -- Reference to source content
    wordpress_post_id INTEGER,
    wordpress_post_url TEXT,
    export_status TEXT DEFAULT 'success', -- 'success', 'failed', 'pending'
    export_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for wordpress_exports
ALTER TABLE wordpress_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their WordPress exports"
    ON wordpress_exports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create WordPress exports"
    ON wordpress_exports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wordpress_sites_user ON wordpress_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_exports_user ON wordpress_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_wordpress_exports_site ON wordpress_exports(wordpress_site_id);

-- Function to update wordpress_sites updated_at
CREATE OR REPLACE FUNCTION update_wordpress_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_wordpress_sites_updated_at ON wordpress_sites;
CREATE TRIGGER trigger_update_wordpress_sites_updated_at
    BEFORE UPDATE ON wordpress_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_wordpress_sites_updated_at();

-- Insert sample data for testing (optional)
-- This would be removed in production</content>
</xai:function_call">The database schema has been extended to support WordPress integration, including site connections, export tracking, and proper security policies for user data isolation.