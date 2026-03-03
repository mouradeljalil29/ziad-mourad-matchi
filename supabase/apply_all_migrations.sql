-- ============================================================
-- SCRIPT COMPLET - Copiez TOUT dans Supabase > SQL Editor > Run
-- ============================================================

-- ==================== ENUMS ====================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availability_type') THEN
    CREATE TYPE public.availability_type AS ENUM ('weekdays', 'weekends', 'evenings', 'flexible');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_type') THEN
    CREATE TYPE public.project_type AS ENUM ('web', 'mobile', 'data', 'devops', 'any');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'looking_for_type') THEN
    CREATE TYPE public.looking_for_type AS ENUM ('binome', 'team', 'any');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_preference_type') THEN
    CREATE TYPE public.contact_preference_type AS ENUM ('in-app', 'email');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
    CREATE TYPE public.match_status AS ENUM ('pending', 'accepted', 'declined', 'canceled');
  END IF;
END $$;

-- ==================== PROFILES ====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  school TEXT,
  level TEXT,
  city TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  availability availability_type DEFAULT 'flexible',
  preferred_project_type project_type DEFAULT 'any',
  looking_for looking_for_type DEFAULT 'binome',
  contact_preference contact_preference_type DEFAULT 'in-app',
  contact_email TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view visible profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can view visible profiles" ON public.profiles FOR SELECT TO authenticated USING (is_visible = true OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_visible ON public.profiles(is_visible);

-- ==================== MATCH REQUESTS ====================
CREATE TABLE IF NOT EXISTS public.match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status match_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT no_self_request CHECK (from_user_id != to_user_id),
  CONSTRAINT unique_pending_request UNIQUE (from_user_id, to_user_id)
);

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own requests' AND tablename = 'match_requests') THEN
    CREATE POLICY "Users can view their own requests" ON public.match_requests FOR SELECT TO authenticated USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create requests' AND tablename = 'match_requests') THEN
    CREATE POLICY "Users can create requests" ON public.match_requests FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Request participants can update' AND tablename = 'match_requests') THEN
    CREATE POLICY "Request participants can update" ON public.match_requests FOR UPDATE TO authenticated USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_match_requests_from_user ON public.match_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_to_user ON public.match_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON public.match_requests(status);

-- ==================== TRIGGERS ====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_match_requests_updated_at') THEN
    CREATE TRIGGER update_match_requests_updated_at BEFORE UPDATE ON public.match_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ==================== MATCH NOTES ====================
CREATE TABLE IF NOT EXISTS public.match_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, owner_user_id)
);

ALTER TABLE public.match_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own notes' AND tablename = 'match_notes') THEN
    CREATE POLICY "Users can view own notes" ON public.match_notes FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own notes' AND tablename = 'match_notes') THEN
    CREATE POLICY "Users can insert own notes" ON public.match_notes FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own notes' AND tablename = 'match_notes') THEN
    CREATE POLICY "Users can update own notes" ON public.match_notes FOR UPDATE TO authenticated USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own notes' AND tablename = 'match_notes') THEN
    CREATE POLICY "Users can delete own notes" ON public.match_notes FOR DELETE TO authenticated USING (owner_user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_match_notes_match_id ON public.match_notes(match_id);
CREATE INDEX IF NOT EXISTS idx_match_notes_owner ON public.match_notes(owner_user_id);

-- ==================== MATCH MESSAGES ====================
CREATE TABLE IF NOT EXISTS public.match_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Match participants can read messages' AND tablename = 'match_messages') THEN
    CREATE POLICY "Match participants can read messages" ON public.match_messages FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.match_requests mr
      WHERE mr.id = match_id AND mr.status = 'accepted'
        AND (mr.from_user_id = auth.uid() OR mr.to_user_id = auth.uid())
    ));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Match participants can send messages' AND tablename = 'match_messages') THEN
    CREATE POLICY "Match participants can send messages" ON public.match_messages FOR INSERT TO authenticated
    WITH CHECK (
      from_user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.match_requests mr
        WHERE mr.id = match_id AND mr.status = 'accepted'
          AND (mr.from_user_id = auth.uid() OR mr.to_user_id = auth.uid())
      )
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_match_messages_match_id ON public.match_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_match_messages_created_at ON public.match_messages(match_id, created_at);
