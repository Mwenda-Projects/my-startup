-- Add latitude/longitude columns to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add latitude/longitude columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add latitude/longitude columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create index for faster geolocation queries
CREATE INDEX IF NOT EXISTS idx_items_location ON public.items(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_services_location ON public.services(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(latitude, longitude);