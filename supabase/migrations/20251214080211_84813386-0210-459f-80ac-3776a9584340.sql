-- Create enum types for the payment system
CREATE TYPE public.transaction_status AS ENUM (
  'pending_payment',
  'paid_escrow',
  'delivered',
  'completed',
  'disputed',
  'refunded',
  'cancelled'
);

CREATE TYPE public.payment_method AS ENUM ('mpesa', 'card');

CREATE TYPE public.seller_tier AS ENUM ('free', 'premium', 'trusted');

CREATE TYPE public.listing_type AS ENUM ('item', 'service');

-- Create wallets table for storing user balances
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  escrow_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_fees_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seller_profiles table for seller-specific data
CREATE TABLE public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier seller_tier NOT NULL DEFAULT 'free',
  tier_expires_at TIMESTAMP WITH TIME ZONE,
  completed_orders INTEGER NOT NULL DEFAULT 0,
  in_app_completion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  total_ratings INTEGER NOT NULL DEFAULT 0,
  disputes_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  search_boost_score INTEGER NOT NULL DEFAULT 0,
  active_listings_count INTEGER NOT NULL DEFAULT 0,
  max_active_listings INTEGER NOT NULL DEFAULT 5,
  commission_rate NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for all payment transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  listing_id UUID NOT NULL,
  listing_type listing_type NOT NULL,
  listing_title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  seller_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status transaction_status NOT NULL DEFAULT 'pending_payment',
  payment_method payment_method,
  mpesa_checkout_request_id TEXT,
  mpesa_receipt_number TEXT,
  card_transaction_id TEXT,
  escrow_released_at TIMESTAMP WITH TIME ZONE,
  auto_release_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  disputed_at TIMESTAMP WITH TIME ZONE,
  dispute_reason TEXT,
  dispute_resolution TEXT,
  buyer_confirmed BOOLEAN NOT NULL DEFAULT false,
  seller_confirmed_delivery BOOLEAN NOT NULL DEFAULT false,
  is_rated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mpesa_callbacks table for storing M-Pesa callback data
CREATE TABLE public.mpesa_callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_request_id TEXT NOT NULL,
  merchant_request_id TEXT,
  result_code INTEGER,
  result_desc TEXT,
  mpesa_receipt_number TEXT,
  transaction_date TEXT,
  phone_number TEXT,
  amount NUMERIC(12, 2),
  raw_callback JSONB,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create premium_subscriptions table
CREATE TABLE public.premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier seller_tier NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'purchase',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Wallets policies
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Seller profiles policies
CREATE POLICY "Anyone can view seller profiles"
  ON public.seller_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own seller profile"
  ON public.seller_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions as buyer or seller"
  ON public.transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Buyers can create reviews for their transactions"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- M-Pesa callbacks - service role only (handled by edge functions)
CREATE POLICY "No direct access to mpesa callbacks"
  ON public.mpesa_callbacks FOR SELECT
  USING (false);

-- Premium subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON public.premium_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to initialize wallet and seller profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.seller_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user wallet/profile initialization
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_wallet();

-- Create function to update seller stats after transaction completion
CREATE OR REPLACE FUNCTION public.update_seller_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_in_app INTEGER;
  total_completed INTEGER;
  avg_rating NUMERIC;
  rating_count INTEGER;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update wallet balances
    UPDATE public.wallets
    SET 
      available_balance = available_balance + NEW.seller_amount,
      escrow_balance = escrow_balance - NEW.amount,
      total_earned = total_earned + NEW.seller_amount,
      total_fees_paid = total_fees_paid + NEW.platform_fee,
      updated_at = now()
    WHERE user_id = NEW.seller_id;
    
    -- Update seller profile stats
    SELECT COUNT(*) INTO total_completed
    FROM public.transactions
    WHERE seller_id = NEW.seller_id AND status = 'completed';
    
    SELECT AVG(rating), COUNT(*) INTO avg_rating, rating_count
    FROM public.reviews
    WHERE seller_id = NEW.seller_id;
    
    UPDATE public.seller_profiles
    SET 
      completed_orders = total_completed,
      average_rating = COALESCE(avg_rating, 0),
      total_ratings = rating_count,
      in_app_completion_rate = CASE 
        WHEN total_completed > 0 THEN 100
        ELSE 0
      END,
      updated_at = now()
    WHERE user_id = NEW.seller_id;
    
    -- Check and upgrade to Trusted Seller if eligible
    PERFORM public.check_trusted_seller_eligibility(NEW.seller_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for seller stats update
CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE OF status ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seller_stats();

-- Create function to check Trusted Seller eligibility
CREATE OR REPLACE FUNCTION public.check_trusted_seller_eligibility(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seller_record RECORD;
BEGIN
  SELECT * INTO seller_record
  FROM public.seller_profiles
  WHERE user_id = _user_id;
  
  -- Check eligibility: 80%+ in-app completion, 4.5+ rating, 10+ orders, <2 disputes
  IF seller_record.in_app_completion_rate >= 80 
     AND seller_record.average_rating >= 4.5 
     AND seller_record.completed_orders >= 10
     AND seller_record.disputes_count < 2
     AND seller_record.tier != 'trusted' THEN
    
    -- Upgrade to Trusted Seller with 6 months free Premium
    UPDATE public.seller_profiles
    SET 
      tier = 'trusted',
      tier_expires_at = now() + INTERVAL '6 months',
      commission_rate = 4.00,
      max_active_listings = 999,
      search_boost_score = 100,
      updated_at = now()
    WHERE user_id = _user_id;
    
    -- Create premium subscription record
    INSERT INTO public.premium_subscriptions (user_id, tier, expires_at, source)
    VALUES (_user_id, 'trusted', now() + INTERVAL '6 months', 'earned');
  END IF;
END;
$$;

-- Create function to add funds to escrow when payment is received
CREATE OR REPLACE FUNCTION public.add_to_escrow(_transaction_id UUID, _checkout_request_id TEXT, _receipt_number TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  txn RECORD;
BEGIN
  SELECT * INTO txn FROM public.transactions WHERE id = _transaction_id;
  
  IF txn IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Update transaction status
  UPDATE public.transactions
  SET 
    status = 'paid_escrow',
    mpesa_checkout_request_id = _checkout_request_id,
    mpesa_receipt_number = _receipt_number,
    auto_release_at = now() + INTERVAL '7 days',
    updated_at = now()
  WHERE id = _transaction_id;
  
  -- Add to seller's escrow balance
  UPDATE public.wallets
  SET 
    escrow_balance = escrow_balance + txn.amount,
    updated_at = now()
  WHERE user_id = txn.seller_id;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_transactions_buyer ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON public.transactions(seller_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created ON public.transactions(created_at DESC);
CREATE INDEX idx_reviews_seller ON public.reviews(seller_id);
CREATE INDEX idx_seller_profiles_tier ON public.seller_profiles(tier);
CREATE INDEX idx_seller_profiles_rating ON public.seller_profiles(average_rating DESC);
CREATE INDEX idx_mpesa_callbacks_checkout ON public.mpesa_callbacks(checkout_request_id);

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;