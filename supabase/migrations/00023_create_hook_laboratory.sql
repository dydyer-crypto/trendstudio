-- Hook Laboratory - Advanced A/B Testing for Content Hooks
-- This feature allows creators to generate and test multiple hook variations

-- 1. Hook Categories Table - Predefined psychological categories
CREATE TABLE IF NOT EXISTS hook_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., "Curiosité", "Peur", "Gain"
    display_name TEXT NOT NULL, -- Human readable name
    description TEXT,
    psychological_principle TEXT, -- The psychological principle behind the hook
    color TEXT NOT NULL, -- UI color for the category
    icon TEXT NOT NULL, -- Icon identifier
    success_rate DECIMAL(5,2) DEFAULT 0, -- Average success rate across all users
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    examples JSONB DEFAULT '[]', -- Array of example hooks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Content Hooks Table - Generated hooks for specific topics
CREATE TABLE IF NOT EXISTS content_hooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    target_audience TEXT,
    platform TEXT DEFAULT 'youtube', -- youtube, tiktok, instagram, linkedin
    category_id UUID REFERENCES hook_categories(id),
    generated_hooks JSONB NOT NULL DEFAULT '[]', -- Array of generated hooks with metadata
    best_performing_hook TEXT,
    performance_data JSONB DEFAULT '{}', -- Analytics data
    prompt_used TEXT, -- The AI prompt that generated these hooks
    ai_model TEXT DEFAULT 'gemini-pro',
    is_saved BOOLEAN DEFAULT FALSE, -- If user saved this generation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Hook Testing Table - A/B testing results
CREATE TABLE IF NOT EXISTS hook_testing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hook_id UUID REFERENCES content_hooks(id) ON DELETE CASCADE,
    hook_text TEXT NOT NULL,
    platform TEXT NOT NULL,
    post_url TEXT, -- URL of the published post/content
    impressions INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
    ctr DECIMAL(5,2) DEFAULT 0, -- Click-through rate
    watch_time INTEGER DEFAULT 0, -- For videos, in seconds
    completion_rate DECIMAL(5,2) DEFAULT 0, -- For videos
    test_duration_days INTEGER DEFAULT 7,
    is_control BOOLEAN DEFAULT FALSE, -- If this was the control version
    is_winner BOOLEAN DEFAULT FALSE, -- Algorithm determined winner
    confidence_score DECIMAL(5,2) DEFAULT 0, -- Statistical confidence
    notes TEXT, -- User notes about performance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Hook Library Table - User's saved hooks
CREATE TABLE IF NOT EXISTS hook_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hook_text TEXT NOT NULL,
    category_id UUID REFERENCES hook_categories(id),
    topic TEXT,
    platform TEXT,
    performance_score DECIMAL(5,2) DEFAULT 0, -- 0-100 based on historical performance
    tags TEXT[] DEFAULT '{}', -- User-defined tags
    is_favorite BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE hook_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hook_testing ENABLE ROW LEVEL SECURITY;
ALTER TABLE hook_library ENABLE ROW LEVEL SECURITY;

-- Allow read access to hook categories for all authenticated users
CREATE POLICY "Hook categories are readable by all users"
    ON hook_categories FOR SELECT
    TO authenticated
    USING (true);

-- Content hooks - users can only manage their own
CREATE POLICY "Users can manage their own content hooks"
    ON content_hooks FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Hook testing - users can only manage their own
CREATE POLICY "Users can manage their own hook testing"
    ON hook_testing FOR ALL
    TO authenticated
    USING (
        hook_id IN (
            SELECT id FROM content_hooks WHERE user_id = auth.uid()
        )
    );

-- Hook library - users can only manage their own
CREATE POLICY "Users can manage their own hook library"
    ON hook_library FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hook_categories_active ON hook_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_content_hooks_user_topic ON content_hooks(user_id, topic);
CREATE INDEX IF NOT EXISTS idx_content_hooks_platform ON content_hooks(platform);
CREATE INDEX IF NOT EXISTS idx_hook_testing_hook_id ON hook_testing(hook_id);
CREATE INDEX IF NOT EXISTS idx_hook_library_user_favorite ON hook_library(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_hook_library_tags ON hook_library USING gin(tags);

-- Insert default hook categories
INSERT INTO hook_categories (name, display_name, description, psychological_principle, color, icon, examples) VALUES
('curiosity', 'Curiosité', 'Éveille la curiosité naturelle de l''audience', 'Principe de curiosité informationnelle', '#8B5CF6', 'Eye', '["Ce secret va changer votre façon de créer", "Vous ne croirez jamais ce qui s''est passé", "La découverte qui a bouleversé ma carrière"]'),
('fear', 'Peur', 'Utilise la peur de manquer quelque chose', 'Principe de peur de manquer (FOMO)', '#EF4444', 'AlertTriangle', '["Si vous ne changez pas maintenant, il sera trop tard", "Le risque que vous prenez sans le savoir", "L''erreur qui coûte cher à éviter"]'),
('gain', 'Gain', 'Promet un bénéfice concret et rapide', 'Principe de récompense anticipée', '#10B981', 'TrendingUp', '["Gagnez 10x plus de vues en 30 jours", "Le secret pour doubler vos revenus", "Comment atteindre 100k abonnés rapidement"]'),
('authority', 'Autorité', 'Établit la crédibilité et l''expertise', 'Principe d''autorité', '#3B82F6', 'Award', '["En tant qu''expert avec 500k abonnés", "Après 10 ans dans l''industrie", "Ce que personne d''autre ne vous dit"]'),
('social_proof', 'Preuve Sociale', 'Montre que d''autres réussissent', 'Principe de conformité sociale', '#F59E0B', 'Users', '["Comment j''ai aidé 10k créateurs à réussir", "Ce que font tous les top créateurs", "La stratégie utilisée par les influenceurs"]'),
('contrast', 'Contraste', 'Compare avant/après ou différent/même', 'Principe de contraste cognitif', '#EC4899', 'BarChart3', '["Avant: 100 vues. Après: 10k vues", "La différence entre amateur et pro", "Pourquoi 99% échouent et comment réussir"]'),
('question', 'Question', 'Pose une question engageante', 'Principe de réciprocité cognitive', '#06B6D4', 'HelpCircle', '["Êtes-vous satisfait de vos performances?", "Pourquoi vos vidéos ne décollent pas?", "Savez-vous vraiment comment monétiser?"]'),
('storytelling', 'Storytelling', 'Raconte une histoire captivante', 'Principe narratif humain', '#84CC16', 'BookOpen', '["Il était une fois un créateur comme vous...", "L''histoire vraie qui a changé ma vie", "Le parcours qui m''a mené au succès"]')
ON CONFLICT (name) DO NOTHING;

-- Function to update hook categories stats
CREATE OR REPLACE FUNCTION update_hook_category_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count and success rate for the category
    UPDATE hook_categories
    SET
        usage_count = (
            SELECT COUNT(*)
            FROM content_hooks
            WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
        ),
        success_rate = (
            SELECT COALESCE(AVG(
                CASE
                    WHEN ht.engagement_rate > 5 THEN 100 -- High engagement = success
                    WHEN ht.engagement_rate > 2 THEN 75
                    WHEN ht.engagement_rate > 1 THEN 50
                    ELSE 25
                END
            ), 0)
            FROM hook_testing ht
            JOIN content_hooks ch ON ht.hook_id = ch.id
            WHERE ch.category_id = COALESCE(NEW.category_id, OLD.category_id)
            AND ht.created_at > NOW() - INTERVAL '30 days'
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.category_id, OLD.category_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update category stats when hooks are created/tested
CREATE TRIGGER update_hook_category_stats_trigger
    AFTER INSERT OR UPDATE ON content_hooks
    FOR EACH ROW
    EXECUTE FUNCTION update_hook_category_stats();</content>
</xai:function_call">The comprehensive database schema for the Hook Laboratory has been created, including tables for hook categories, content hooks, testing results, and user libraries. This provides a solid foundation for A/B testing and performance tracking of content hooks across different platforms.