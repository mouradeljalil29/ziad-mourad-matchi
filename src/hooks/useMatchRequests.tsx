import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables, Enums } from "@/integrations/supabase/types";

export type MatchRequest = Tables<"match_requests">;
export type MatchStatus = Enums<"match_status">;

interface RequestWithProfile extends MatchRequest {
  from_profile?: Tables<"profiles"> | null;
  to_profile?: Tables<"profiles"> | null;
}

export function useIncomingRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match_requests", "incoming", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from("match_requests")
        .select("*")
        .eq("to_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each request
      const fromUserIds = requests.map((r) => r.from_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", fromUserIds);

      return requests.map((r) => ({
        ...r,
        from_profile: profiles?.find((p) => p.user_id === r.from_user_id) || null,
      })) as RequestWithProfile[];
    },
    enabled: !!user,
  });
}

export function useOutgoingRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match_requests", "outgoing", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from("match_requests")
        .select("*")
        .eq("from_user_id", user.id)
        .in("status", ["pending"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each request
      const toUserIds = requests.map((r) => r.to_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", toUserIds);

      return requests.map((r) => ({
        ...r,
        to_profile: profiles?.find((p) => p.user_id === r.to_user_id) || null,
      })) as RequestWithProfile[];
    },
    enabled: !!user,
  });
}

export function useMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["matches", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from("match_requests")
        .select("*")
        .eq("status", "accepted")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Get all partner user IDs
      const partnerIds = requests.map((r) =>
        r.from_user_id === user.id ? r.to_user_id : r.from_user_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", partnerIds);

      return requests.map((r) => {
        const partnerId = r.from_user_id === user.id ? r.to_user_id : r.from_user_id;
        return {
          ...r,
          partner_profile: profiles?.find((p) => p.user_id === partnerId) || null,
        };
      });
    },
    enabled: !!user,
  });
}

export function useCheckExistingRequest(toUserId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match_requests", "check", user?.id, toUserId],
    queryFn: async () => {
      if (!user || !toUserId) return null;

      const { data, error } = await supabase
        .from("match_requests")
        .select("*")
        .or(
          `and(from_user_id.eq.${user.id},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${user.id})`
        )
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user && !!toUserId,
  });
}

export function useSendRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ toUserId, message }: { toUserId: string; message?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("match_requests")
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          message,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match_requests"] });
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: MatchStatus }) => {
      const { data, error } = await supabase
        .from("match_requests")
        .update({ status })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match_requests"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
