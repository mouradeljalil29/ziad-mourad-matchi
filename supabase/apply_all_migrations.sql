-- ============================================================
-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE SQL EDITOR
-- This applies all pending migrations to fix errors
-- ============================================================

-- 1. Add contact_email column to profiles (fixes the schema cache error)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- 2. Create match_notes table
CREATE TABLE IF NOT EXISTS public.match_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, owner_user_id)
);

ALTER TABLE public.match_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own notes"
ON public.match_notes FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert own notes"
ON public.match_notes FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update own notes"
ON public.match_notes FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete own notes"
ON public.match_notes FOR DELETE
TO authenticated
USING (owner_user_id = auth.uid());

-- Trigger (ignore error if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_match_notes_updated_at'
  ) THEN
    CREATE TRIGGER update_match_notes_updated_at
    BEFORE UPDATE ON public.match_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_match_notes_match_id ON public.match_notes(match_id);
CREATE INDEX IF NOT EXISTS idx_match_notes_owner ON public.match_notes(owner_user_id);

-- 3. Create match_messages table (in-app messaging)
CREATE TABLE IF NOT EXISTS public.match_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Match participants can read messages"
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

CREATE POLICY IF NOT EXISTS "Match participants can send messages"
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

CREATE INDEX IF NOT EXISTS idx_match_messages_match_id ON public.match_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_match_messages_created_at ON public.match_messages(match_id, created_at);
