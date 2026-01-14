-- Fix the security definer view issue by setting SECURITY INVOKER
ALTER VIEW public.public_profiles SET (security_invoker = on);