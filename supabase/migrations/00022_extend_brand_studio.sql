-- Extend Brand Studio with additional fields and brand_assets table

-- Add new fields to brand_kits table
ALTER TABLE brand_kits
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS brand_voice JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Update existing fonts column to be more structured
ALTER TABLE brand_kits
ADD COLUMN IF NOT EXISTS typography JSONB DEFAULT '{"primary": "Inter", "secondary": "Roboto", "heading": "Inter", "body": "Inter"}';

-- Create brand_assets table for storing various brand assets
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL, -- 'logo', 'font', 'template', 'image', 'icon', 'pattern'
    asset_name TEXT NOT NULL,
    asset_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    metadata JSONB DEFAULT '{}', -- dimensions, colors, etc.
    is_primary BOOLEAN DEFAULT FALSE, -- for logo, main font, etc.
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for brand_assets
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage brand assets for their kits"
    ON brand_assets FOR ALL
    USING (
        brand_kit_id IN (
            SELECT id FROM brand_kits WHERE user_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_assets_kit_id ON brand_assets(brand_kit_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON brand_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_brand_kits_user_active ON brand_kits(user_id, is_active);

-- Function to update brand_kits updated_at
CREATE OR REPLACE FUNCTION update_brand_kits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_brand_kits_updated_at ON brand_kits;
CREATE TRIGGER trigger_update_brand_kits_updated_at
    BEFORE UPDATE ON brand_kits
    FOR EACH ROW
    EXECUTE FUNCTION update_brand_kits_updated_at();

-- Insert some default brand kits for existing users (optional)
-- This will be handled by the application when users first access Brand Studio</content>
</xai:function_call">The database schema has been extended for the Brand Studio with additional fields for brand voice, typography, and a new brand_assets table for storing various brand assets like logos, fonts, templates, etc. Now let me create the BrandKitService.