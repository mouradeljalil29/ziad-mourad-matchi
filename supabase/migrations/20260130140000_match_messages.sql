-- Messages between matched users (conversation per match)
CREATE TABLE IF NOT EXISTS public.match_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;

-- Only participants of the match can read messages (match must be accepted)
CREATE POLICY "Match participants can read messages"
ON public.match_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.match_requests mr
    WHERE mr.id = match_messages.match_id
      AND mr.status = 'accepted'
      AND (mr.from_user_id = auth.uid() OR mr.to_user_id = auth.uid())
  )
);

-- Only participants can send messages
CREATE POLICY "Match participants can send messages"
ON public.match_messages FOR INSERT
TO authenticated
WITH CHECK (
  from_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.match_requests mr
    WHERE mr.id = match_messages.match_id
      AND mr.status = 'accepted'
      AND (mr.from_user_id = auth.uid() OR mr.to_user_id = auth.uid())
  )
);

CREATE INDEX idx_match_messages_match_id ON public.match_messages(match_id);
CREATE INDEX idx_match_messages_created_at ON public.match_messages(created_at);
