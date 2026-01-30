-- Create custom types for enums
CREATE TYPE public.availability_type AS ENUM ('weekdays', 'weekends', 'evenings', 'flexible');
CREATE TYPE public.project_type AS ENUM ('web', 'mobile', 'data', 'devops', 'any');
CREATE TYPE public.looking_for_type AS ENUM ('binome', 'team', 'any');
CREATE TYPE public.contact_preference_type AS ENUM ('in-app', 'email');
CREATE TYPE public.match_status AS ENUM ('pending', 'accepted', 'declined', 'canceled');

-- Create profiles table
CREATE TABLE public.profiles (
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
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create match_requests table
CREATE TABLE public.match_requests (
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view visible profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_visible = true OR user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Match requests policies
CREATE POLICY "Users can view their own requests"
ON public.match_requests FOR SELECT
TO authenticated
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create requests"
ON public.match_requests FOR INSERT
TO authenticated
WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Request participants can update"
ON public.match_requests FOR UPDATE
TO authenticated
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_requests_updated_at
BEFORE UPDATE ON public.match_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_is_visible ON public.profiles(is_visible);
CREATE INDEX idx_match_requests_from_user ON public.match_requests(from_user_id);
CREATE INDEX idx_match_requests_to_user ON public.match_requests(to_user_id);
CREATE INDEX idx_match_requests_status ON public.match_requests(status);