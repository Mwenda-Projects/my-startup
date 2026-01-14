-- Enable realtime for conversations table (for last_message_at updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;