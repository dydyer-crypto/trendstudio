-- Drop and recreate the handle_new_user function with correct fields
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count int;
  referrer_profile_id uuid;
  extracted_username text;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (format: username@miaoda.com)
  extracted_username := split_part(NEW.email, '@', 1);
  
  -- Check if there's a referral code in user metadata
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    -- Find the referrer by referral code
    SELECT id INTO referrer_profile_id
    FROM profiles
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
  END IF;
  
  -- Insert a profile with all required fields
  INSERT INTO public.profiles (id, username, email, role, referred_by, credits)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END,
    referrer_profile_id,
    CASE WHEN referrer_profile_id IS NOT NULL THEN 100 ELSE 50 END -- Bonus credits for referrals
  );
  
  -- If user was referred, create a referral record
  IF referrer_profile_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, status)
    VALUES (referrer_profile_id, NEW.id, 'pending');
    
    -- Process the referral reward immediately
    PERFORM process_referral_reward(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Creates a profile for new users with username extracted from email';