import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables } from "@/integrations/supabase/types";

export type MatchMessage = Tables<"match_messages">;

export function useMatchMessages(matchId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match_messages", matchId, user?.id],
    queryFn: async () => {
      if (!user || !matchId) return [];

      const { data, error } = await supabase
        .from("match_messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as MatchMessage[];
    },
    enabled: !!user && !!matchId,
  });
}

export function useSendMatchMessage(matchId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!user || !matchId) throw new Error("Not authenticated");

      const sanitized =
        typeof text === "string" ? text.trim().slice(0, 2000) : "";
      if (!sanitized) throw new Error("Message cannot be empty");

      const { data, error } = await supabase
        .from("match_messages")
        .insert({
          match_id: matchId,
          from_user_id: user.id,
          text: sanitized,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match_messages", matchId] });
    },
  });
}
