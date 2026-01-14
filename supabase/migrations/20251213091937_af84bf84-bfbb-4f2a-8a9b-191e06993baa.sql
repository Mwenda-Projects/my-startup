-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a policy that only allows users to see their own full profile (including email)
CREATE POLICY "Users can view own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create a secure view that exposes only non-sensitive profile fields for public access
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio,
  university,
  major,
  graduation_year,
  created_at
FROM public.profiles;

-- Grant access to the view for authenticated and anonymous users
GRANT SELECT ON public.public_profiles TO anon, authenticated;