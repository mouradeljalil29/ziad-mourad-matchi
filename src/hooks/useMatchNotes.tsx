import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables } from "@/integrations/supabase/types";

export type MatchNote = Tables<"match_notes">;

export function useMatchNote(matchId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match_notes", matchId, user?.id],
    queryFn: async () => {
      if (!user || !matchId) return null;

      const { data, error } = await supabase
        .from("match_notes")
        .select("*")
        .eq("match_id", matchId)
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!matchId,
  });
}

export function useUpsertMatchNote(matchId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (noteText: string) => {
      if (!user || !matchId) throw new Error("Not authenticated");

      const sanitized =
        typeof noteText === "string" ? noteText.trim().slice(0, 2000) : "";

      const { data, error } = await supabase
        .from("match_notes")
        .upsert(
          {
            match_id: matchId,
            owner_user_id: user.id,
            note_text: sanitized || null,
          },
          { onConflict: "match_id,owner_user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match_notes", matchId] });
    },
  });
}
