import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables } from "@/integrations/supabase/types";

export type MatchMessage = Tables<"match_messages">;

export function useMatchMessages(matchId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match_messages", matchId],
    queryFn: async () => {
      if (!user || !matchId) return [];

      const { data, error } = await supabase
        .from("match_messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) {
        // Table may not exist yet – return empty rather than crashing
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          return [];
        }
        throw error;
      }
      return (data ?? []) as MatchMessage[];
    },
    enabled: !!user && !!matchId,
    refetchInterval: 4000,
    retry: 1,
  });
}

export function useSendMatchMessage(matchId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!user || !matchId) throw new Error("Not authenticated");

      const sanitized = text.trim().slice(0, 2000);
      if (!sanitized) throw new Error("Le message ne peut pas être vide");

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
    onMutate: async (text) => {
      // Optimistic update: show message instantly
      if (!user || !matchId) return;
      await queryClient.cancelQueries({ queryKey: ["match_messages", matchId] });
      const previous = queryClient.getQueryData<MatchMessage[]>(["match_messages", matchId]);

      const optimistic: MatchMessage = {
        id: `temp-${Date.now()}`,
        match_id: matchId,
        from_user_id: user.id,
        text: text.trim().slice(0, 2000),
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<MatchMessage[]>(
        ["match_messages", matchId],
        (old) => [...(old ?? []), optimistic]
      );

      return { previous };
    },
    onError: (_err, _text, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["match_messages", matchId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["match_messages", matchId] });
    },
  });
}
