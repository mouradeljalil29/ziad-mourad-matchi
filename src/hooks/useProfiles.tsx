import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Tables, Enums } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type AvailabilityType = Enums<"availability_type">;
export type ProjectType = Enums<"project_type">;
export type LookingForType = Enums<"looking_for_type">;

interface ProfileFilters {
  search?: string;
  skills?: string[];
  availability?: AvailabilityType | "all";
  projectType?: ProjectType | "all";
  lookingFor?: LookingForType | "all";
}

export function useProfiles(filters: ProfileFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profiles", filters],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("is_visible", true);

      // Exclude current user
      if (user) {
        query = query.neq("user_id", user.id);
      }

      // Apply filters
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

      let results = data as Profile[];

      // Client-side filtering for search and skills
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
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

      return results;
    },
    enabled: !!user,
  });
}

export function calculateMatchScore(profile: Profile, myProfile: Profile | null): number {
  if (!myProfile) return 0;
  
  let score = 0;

  // Shared skills (most important)
  const sharedSkills = profile.skills?.filter((s) => myProfile.skills?.includes(s)) || [];
  score += sharedSkills.length * 10;

  // Same project type
  if (profile.preferred_project_type === myProfile.preferred_project_type) {
    score += 20;
  }

  // Same availability
  if (profile.availability === myProfile.availability) {
    score += 15;
  }

  // Same looking_for
  if (profile.looking_for === myProfile.looking_for) {
    score += 10;
  }

  // Same level
  if (profile.level === myProfile.level) {
    score += 5;
  }

  return score;
}
