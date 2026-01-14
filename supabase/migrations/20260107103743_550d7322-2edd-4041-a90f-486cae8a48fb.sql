-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 100,
  tickets_sold INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event RSVPs/tickets table
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ticket_count INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Active events are viewable by everyone" 
ON public.events FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can view own events" 
ON public.events FOR SELECT 
USING (auth.uid() = organizer_id);

CREATE POLICY "Users can create own events" 
ON public.events FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own events" 
ON public.events FOR UPDATE 
USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete own events" 
ON public.events FOR DELETE 
USING (auth.uid() = organizer_id);

-- RSVPs policies
CREATE POLICY "Users can view own RSVPs" 
ON public.event_rsvps FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view RSVPs" 
ON public.event_rsvps FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.events 
  WHERE events.id = event_rsvps.event_id 
  AND events.organizer_id = auth.uid()
));

CREATE POLICY "Users can create RSVPs" 
ON public.event_rsvps FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own RSVPs" 
ON public.event_rsvps FOR UPDATE 
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();