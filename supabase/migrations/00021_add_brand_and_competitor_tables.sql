
-- 1. Brand Kits Table
CREATE TABLE IF NOT EXISTS brand_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3b82f6',
    secondary_color TEXT DEFAULT '#1d4ed8',
    accent_color TEXT DEFAULT '#8b5cf6',
    fonts JSONB DEFAULT '["Inter", "Roboto"]',
    vibe TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for brand_kits
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own brand kits"
    ON brand_kits FOR ALL
    USING (auth.uid() = user_id);

-- 2. Competitor Analyses Table
CREATE TABLE IF NOT EXISTS competitor_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    competitor_url TEXT NOT NULL,
    competitor_name TEXT,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for competitor_analyses
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their competitor analyses"
    ON competitor_analyses FOR ALL
    USING (auth.uid() = user_id);

-- 3. Social Media Hook Lab Table (Optional, for saving hooks)
CREATE TABLE IF NOT EXISTS hook_lab (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    hooks JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for hook_lab
ALTER TABLE hook_lab ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their hook lab"
    ON hook_lab FOR ALL
    USING (auth.uid() = user_id);
