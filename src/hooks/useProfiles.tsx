import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables, Enums } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type AvailabilityType = Enums<"availability_type">;
export type ProjectType = Enums<"project_type">;
export type LookingForType = Enums<"looking_for_type">;

const DISCOVER_PAGE_SIZE = 12;

interface ProfileFilters {
  search?: string;
  skills?: string[];
  availability?: AvailabilityType | "all";
  projectType?: ProjectType | "all";
  lookingFor?: LookingForType | "all";
  page?: number;
  pageSize?: number;
}

export function useProfiles(filters: ProfileFilters = {}) {
  const { user } = useAuth();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DISCOVER_PAGE_SIZE;

  return useQuery({
    queryKey: ["profiles", filters],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("is_visible", true);

      if (user) {
        query = query.neq("user_id", user.id);
      }

      if (filters.availability && filters.availability !== "all") {
        query = query.eq("availability", filters.availability as AvailabilityType);
      }

      if (filters.projectType && filters.projectType !== "all") {
        query = query.eq("preferred_project_type", filters.projectType as ProjectType);
      }

      if (filters.lookingFor && filters.lookingFor !== "all") {
        query = query.eq("looking_for", filters.lookingFor as LookingForType);
      }

      const { data, error } = await query.order("updated_at", { ascending: false });

      if (error) throw error;

      let results = (data ?? []) as Profile[];

      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.trim().toLowerCase();
        results = results.filter(
          (p) =>
            p.display_name?.toLowerCase().includes(searchLower) ||
            p.city?.toLowerCase().includes(searchLower) ||
            p.school?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.skills && filters.skills.length > 0) {
        results = results.filter((p) =>
          filters.skills!.some((skill) => p.skills?.includes(skill))
        );
      }

      const total = results.length;
      const start = (page - 1) * pageSize;
      const paginated = results.slice(start, start + pageSize);

      return { data: paginated, total };
    },
    enabled: !!user,
  });
}

export { DISCOVER_PAGE_SIZE };

/** Match score 0–100: project_type +30, shared skills +10 each (cap 40), availability +15, looking_for +15 */
export function calculateMatchScore(profile: Profile, myProfile: Profile | null): number {
  if (!myProfile) return 0;

  let score = 0;

  // +30 if preferred_project_type matches or either is "any"
  const myType = myProfile.preferred_project_type;
  const theirType = profile.preferred_project_type;
  if (myType === "any" || theirType === "any" || myType === theirType) {
    score += 30;
  }

  // +10 per shared skill, cap at +40
  const sharedSkills = profile.skills?.filter((s) => myProfile.skills?.includes(s)) || [];
  score += Math.min(sharedSkills.length * 10, 40);

  // +15 if availability matches or either is "flexible"
  const myAvail = myProfile.availability;
  const theirAvail = profile.availability;
  if (myAvail === "flexible" || theirAvail === "flexible" || myAvail === theirAvail) {
    score += 15;
  }

  // +15 if looking_for matches or either is "any"
  const myLooking = myProfile.looking_for;
  const theirLooking = profile.looking_for;
  if (myLooking === "any" || theirLooking === "any" || myLooking === theirLooking) {
    score += 15;
  }

  return Math.min(score, 100);
}
