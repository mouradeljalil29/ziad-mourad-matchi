import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/ui/skill-badge";
import { Profile } from "@/hooks/useProfile";
import { 
  MapPin, 
  GraduationCap, 
  Clock, 
  Target, 
  Users,
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  AVAILABILITY_OPTIONS, 
  PROJECT_TYPE_OPTIONS, 
  LOOKING_FOR_OPTIONS 
} from "@/lib/constants";

interface ProfileCardProps {
  profile: Profile;
  matchScore?: number;
  mySkills?: string[];
  action?: React.ReactNode;
  compact?: boolean;
}

export function ProfileCard({
  profile,
  matchScore,
  mySkills = [],
  action,
  compact = false,
}: ProfileCardProps) {
  const availabilityLabel = AVAILABILITY_OPTIONS.find(
    (o) => o.value === profile.availability
  )?.label;
  
  const projectTypeLabel = PROJECT_TYPE_OPTIONS.find(
    (o) => o.value === profile.preferred_project_type
  )?.label;
  
  const lookingForLabel = LOOKING_FOR_OPTIONS.find(
    (o) => o.value === profile.looking_for
  )?.label;

  const displayedSkills = compact ? profile.skills?.slice(0, 4) : profile.skills?.slice(0, 8);
  const remainingSkills = (profile.skills?.length || 0) - (displayedSkills?.length || 0);

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg">
              {profile.display_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <Link
                to={`/profile/${profile.id}`}
                className="font-semibold text-lg hover:text-primary transition-colors"
              >
                {profile.display_name}
              </Link>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {profile.level && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.level}
                  </span>
                )}
                {profile.school && (
                  <span className="truncate max-w-[150px]">{profile.school}</span>
                )}
              </div>
            </div>
          </div>

          {matchScore !== undefined && matchScore > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-sm font-medium text-success">
              <Sparkles className="h-3.5 w-3.5" />
              {matchScore}%
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        {profile.city && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {profile.city}
          </div>
        )}

        {/* Bio */}
        {profile.bio && !compact && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Skills */}
        {displayedSkills && displayedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayedSkills.map((skill) => (
              <SkillBadge
                key={skill}
                skill={skill}
                variant={mySkills.includes(skill) ? "match" : "default"}
              />
            ))}
            {remainingSkills > 0 && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                +{remainingSkills} more
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {availabilityLabel && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {availabilityLabel}
            </span>
          )}
          {projectTypeLabel && (
            <span className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              {projectTypeLabel}
            </span>
          )}
          {lookingForLabel && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {lookingForLabel}
            </span>
          )}
        </div>
      </CardContent>

      {action && (
        <CardFooter className="pt-0">
          {action}
        </CardFooter>
      )}
    </Card>
  );
}
