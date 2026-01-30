import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useProfileById(profileId: string | undefined) {
  return useQuery({
    queryKey: ["profile", "public", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
}

/** Strip fields that may not yet exist in DB to avoid schema-cache errors. */
function sanitizeProfileData<T extends Record<string, unknown>>(raw: T): T {
  const copy = { ...raw };
  // contact_email requires a migration; remove if empty so inserts don't break
  if (!copy.contact_email) {
    delete copy.contact_email;
  }
  return copy;
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profile: Omit<ProfileInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");

      const clean = sanitizeProfileData({ ...profile, user_id: user.id });

      const { data, error } = await supabase
        .from("profiles")
        .insert(clean)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profile: ProfileUpdate) => {
      if (!user) throw new Error("Not authenticated");

      const clean = sanitizeProfileData(profile);

      const { data, error } = await supabase
        .from("profiles")
        .update(clean)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
