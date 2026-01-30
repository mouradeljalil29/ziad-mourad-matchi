import type { Profile } from "@/hooks/useProfile";

const FIELDS: (keyof Profile)[] = [
  "display_name",
  "level",
  "skills",
  "availability",
  "preferred_project_type",
  "bio",
  "city",
];

export function getProfileCompleteness(profile: Profile | null | undefined): number {
  if (!profile) return 0;

  let filled = 0;
  for (const field of FIELDS) {
    const value = profile[field];
    if (field === "skills") {
      if (Array.isArray(value) && value.length > 0) filled++;
    } else if (value != null && String(value).trim() !== "") {
      filled++;
    }
  }
  return Math.round((filled / FIELDS.length) * 100);
}

export const PROFILE_COMPLETENESS_FIELDS = FIELDS;
