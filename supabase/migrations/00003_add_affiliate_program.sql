-- Add referral_code to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_earnings INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Create referrals table to track referral history
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'credited')),
  reward_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referred_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Update existing users to have referral codes
UPDATE profiles 
SET referral_code = generate_referral_code() 
WHERE referral_code IS NULL;

-- Trigger to generate referral code for new users
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_referral_code ON profiles;
CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Function to process referral rewards
CREATE OR REPLACE FUNCTION process_referral_reward(referred_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_user_id UUID;
  reward_credits INTEGER := 50; -- Reward amount for successful referral
BEGIN
  -- Get the referrer
  SELECT referred_by INTO referrer_user_id
  FROM profiles
  WHERE id = referred_user_id;
  
  -- If user was referred by someone
  IF referrer_user_id IS NOT NULL THEN
    -- Update referral status to completed
    UPDATE referrals
    SET status = 'completed',
        completed_at = NOW()
    WHERE referrer_id = referrer_user_id 
      AND referred_id = referred_user_id
      AND status = 'pending';
    
    -- Credit the referrer
    UPDATE profiles
    SET credits = credits + reward_credits,
        referral_earnings = referral_earnings + reward_credits
    WHERE id = referrer_user_id;
    
    -- Update referral record with reward amount
    UPDATE referrals
    SET status = 'credited',
        reward_amount = reward_credits
    WHERE referrer_id = referrer_user_id 
      AND referred_id = referred_user_id
      AND status = 'completed';
  END IF;
END;
$$;

-- RLS Policies for referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON referrals FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

COMMENT ON TABLE referrals IS 'Tracks referral relationships and rewards';
COMMENT ON COLUMN profiles.referral_code IS 'Unique referral code for sharing';
COMMENT ON COLUMN profiles.referred_by IS 'User who referred this user';
COMMENT ON COLUMN profiles.referral_earnings IS 'Total credits earned from referrals';