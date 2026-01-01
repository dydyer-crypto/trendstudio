-- Create platform_credentials table for storing OAuth tokens and social media account connections
CREATE TABLE IF NOT EXISTS platform_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  account_name TEXT NOT NULL, -- Display name or handle
  account_id TEXT NOT NULL, -- Platform-specific account ID
  access_token TEXT, -- OAuth access token (encrypted in production)
  refresh_token TEXT, -- OAuth refresh token (encrypted in production)
  token_expires_at TIMESTAMPTZ, -- When access token expires
  scopes TEXT[], -- Array of granted permissions
  metadata JSONB DEFAULT '{}', -- Additional platform-specific data
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, account_id) -- One connection per platform account per user
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_credentials_user_id ON platform_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_credentials_platform ON platform_credentials(platform);
CREATE INDEX IF NOT EXISTS idx_platform_credentials_active ON platform_credentials(is_active);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_platform_credentials_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_platform_credentials_updated_at ON platform_credentials;
CREATE TRIGGER trigger_update_platform_credentials_updated_at
  BEFORE UPDATE ON platform_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_credentials_updated_at();

-- Enable RLS
ALTER TABLE platform_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own platform credentials"
  ON platform_credentials FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own platform credentials"
  ON platform_credentials FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own platform credentials"
  ON platform_credentials FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own platform credentials"
  ON platform_credentials FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all credentials
CREATE POLICY "Admins can view all platform credentials"
  ON platform_credentials FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

COMMENT ON TABLE platform_credentials IS 'Stores OAuth credentials and account connections for social media platforms';
COMMENT ON COLUMN platform_credentials.account_name IS 'Display name or username for the connected account';
COMMENT ON COLUMN platform_credentials.account_id IS 'Platform-specific unique account identifier';
COMMENT ON COLUMN platform_credentials.scopes IS 'Array of OAuth scopes granted by the user';
COMMENT ON COLUMN platform_credentials.metadata IS 'JSON storage for platform-specific connection data';