-- Add RLS policy to allow public read access to profiles for marketplace functionality
-- This allows buyers to see seller information on listings
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);