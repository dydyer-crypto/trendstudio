-- Update the handle_new_user function to process referrals
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
user_count int;
referrer_profile_id uuid;
BEGIN
SELECT COUNT(*) INTO user_count FROM profiles;

-- Check if there's a referral code in user metadata
IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
  -- Find the referrer by referral code
  SELECT id INTO referrer_profile_id
  FROM profiles
  WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
END IF;

-- Insert a profile synced with fields collected at signup
INSERT INTO public.profiles (id, email, phone, role, referred_by)
VALUES (
  NEW.id,
  NEW.email,
  NEW.phone,
  CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END,
  referrer_profile_id
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