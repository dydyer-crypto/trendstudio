-- Create tutorial_progress table to track user tutorial completion
CREATE TABLE IF NOT EXISTS tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutorial_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  current_step INTEGER DEFAULT 0,
  completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tutorial_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user_id ON tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_tutorial_id ON tutorial_progress(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_status ON tutorial_progress(status);

-- Create tutorial_badges table for achievements
CREATE TABLE IF NOT EXISTS tutorial_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create index for badges
CREATE INDEX IF NOT EXISTS idx_tutorial_badges_user_id ON tutorial_badges(user_id);

-- Function to update tutorial progress
CREATE OR REPLACE FUNCTION update_tutorial_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_interaction_at = NOW();
  
  -- Set started_at if status changes from not_started
  IF OLD.status = 'not_started' AND NEW.status != 'not_started' AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;
  
  -- Set completed_at if status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for tutorial progress updates
DROP TRIGGER IF EXISTS trigger_update_tutorial_progress ON tutorial_progress;
CREATE TRIGGER trigger_update_tutorial_progress
  BEFORE UPDATE ON tutorial_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_tutorial_progress();

-- RLS Policies for tutorial_progress
ALTER TABLE tutorial_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own tutorial progress"
  ON tutorial_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own progress
CREATE POLICY "Users can create their own tutorial progress"
  ON tutorial_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "Users can update their own tutorial progress"
  ON tutorial_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all progress
CREATE POLICY "Admins can view all tutorial progress"
  ON tutorial_progress FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for tutorial_badges
ALTER TABLE tutorial_badges ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view their own badges"
  ON tutorial_badges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own badges
CREATE POLICY "Users can earn badges"
  ON tutorial_badges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all badges
CREATE POLICY "Admins can view all badges"
  ON tutorial_badges FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

COMMENT ON TABLE tutorial_progress IS 'Tracks user progress through interactive tutorials';
COMMENT ON TABLE tutorial_badges IS 'Stores earned tutorial achievement badges';
COMMENT ON COLUMN tutorial_progress.tutorial_id IS 'Unique identifier for the tutorial';
COMMENT ON COLUMN tutorial_progress.current_step IS 'Current step number in the tutorial';
COMMENT ON COLUMN tutorial_progress.completed_steps IS 'Array of completed step numbers';