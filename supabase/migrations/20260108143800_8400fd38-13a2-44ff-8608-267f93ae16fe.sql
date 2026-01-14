-- Add phone verification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- Create phone verification codes table
CREATE TABLE public.phone_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on phone_verification_codes
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification codes
CREATE POLICY "Users can view own verification codes"
ON public.phone_verification_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create verification codes for themselves
CREATE POLICY "Users can create verification codes"
ON public.phone_verification_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification codes
CREATE POLICY "Users can update own verification codes"
ON public.phone_verification_codes
FOR UPDATE
USING (auth.uid() = user_id);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  credit_amount NUMERIC DEFAULT 50,
  credited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals they made
CREATE POLICY "Users can view own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.referral_code := new_code;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code for new users
CREATE TRIGGER generate_referral_code_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.referral_code IS NULL)
EXECUTE FUNCTION public.generate_referral_code();

-- Generate referral codes for existing users
UPDATE public.profiles 
SET referral_code = upper(substring(md5(random()::text || id::text) from 1 for 8))
WHERE referral_code IS NULL;

-- Function to credit referrer when referred user completes first transaction
CREATE OR REPLACE FUNCTION public.credit_referrer_on_first_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_record RECORD;
  referral_record RECORD;
BEGIN
  -- Only process when transaction becomes completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Check if buyer was referred and referral not yet credited
    SELECT r.* INTO referral_record
    FROM public.referrals r
    WHERE r.referred_id = NEW.buyer_id
      AND r.status = 'pending';
    
    IF referral_record IS NOT NULL THEN
      -- Credit the referrer
      UPDATE public.wallets
      SET available_balance = available_balance + referral_record.credit_amount,
          updated_at = now()
      WHERE user_id = referral_record.referrer_id;
      
      -- Mark referral as credited
      UPDATE public.referrals
      SET status = 'credited',
          credited_at = now()
      WHERE id = referral_record.id;
      
      -- Create notification for referrer
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (
        referral_record.referrer_id,
        'referral_credit',
        'Referral Bonus!',
        'You earned KSH ' || referral_record.credit_amount || ' because someone you referred completed their first purchase!',
        '/wallet'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for crediting referrer
CREATE TRIGGER credit_referrer_trigger
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.credit_referrer_on_first_transaction();