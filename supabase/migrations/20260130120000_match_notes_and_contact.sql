-- Optional contact email when user prefers email contact
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Match notes: one note per match per user (owner)
CREATE TABLE IF NOT EXISTS public.match_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, owner_user_id)
);

-- Enable RLS
ALTER TABLE public.match_notes ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own notes
CREATE POLICY "Users can view own notes"
ON public.match_notes FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());

CREATE POLICY "Users can insert own notes"
ON public.match_notes FOR INSERT
TO authenticated
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can update own notes"
ON public.match_notes FOR UPDATE
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can delete own notes"
ON public.match_notes FOR DELETE
TO authenticated
USING (owner_user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_match_notes_updated_at
BEFORE UPDATE ON public.match_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_match_notes_match_id ON public.match_notes(match_id);
CREATE INDEX idx_match_notes_owner ON public.match_notes(owner_user_id);
