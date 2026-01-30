-- Match messages: in-app messaging between accepted matches
CREATE TABLE IF NOT EXISTS public.match_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;

-- Only participants of an accepted match can read messages
CREATE POLICY "Match participants can read messages"
ON public.match_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.match_requests mr
    WHERE mr.id = match_id
      AND mr.status = 'accepted'
      AND (mr.from_user_id = auth.uid() OR mr.to_user_id = auth.uid())
  )
);

-- Only participants of an accepted match can send messages
CREATE POLICY "Match participants can send messages"
ON public.match_messages FOR INSERT
TO authenticated
WITH CHECK (
  from_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.match_requests mr
    WHERE mr.id = match_id
      AND mr.status = 'accepted'
      AND (mr.from_user_id = auth.uid() OR mr.to_user_id = auth.uid())
  )
);

-- Indexes for performance
CREATE INDEX idx_match_messages_match_id ON public.match_messages(match_id);
CREATE INDEX idx_match_messages_created_at ON public.match_messages(match_id, created_at);
