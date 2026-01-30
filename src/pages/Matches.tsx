import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/ui/skill-badge";
import { useMatches } from "@/hooks/useMatchRequests";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  Mail, 
  MessageCircle,
  MapPin,
  GraduationCap,
  ArrowRight
} from "lucide-react";
import { CONTACT_PREFERENCE_OPTIONS } from "@/lib/constants";

export default function Matches() {
  const { data: matches, isLoading } = useMatches();

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Matches</h1>
          <p className="text-muted-foreground">
            Students you've connected with for projects
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => {
              const profile = match.partner_profile;
              const contactLabel = CONTACT_PREFERENCE_OPTIONS.find(
                (o) => o.value === profile?.contact_preference
              )?.label;

              return (
                <Card key={match.id} className="animate-fade-in overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-xl shrink-0">
                          {profile?.display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Link
                              to={`/profile/${profile?.id}`}
                              className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                              {profile?.display_name || "Unknown"}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                              {profile?.level && (
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="h-3.5 w-3.5" />
                                  {profile.level}
                                </span>
                              )}
                              {profile?.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {profile.city}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {profile?.skills?.slice(0, 5).map((skill) => (
                              <SkillBadge key={skill} skill={skill} />
                            ))}
                            {(profile?.skills?.length || 0) > 5 && (
                              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                +{(profile?.skills?.length || 0) - 5} more
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {profile?.contact_preference === "email" ? (
                              <Mail className="h-4 w-4" />
                            ) : (
                              <MessageCircle className="h-4 w-4" />
                            )}
                            Prefers: {contactLabel}
                          </div>
                        </div>
                      </div>
                      <Link to={`/profile/${profile?.id}`}>
                        <Button variant="outline" className="gap-2 shrink-0">
                          View Profile
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-4">
              When you and another student both accept each other's requests, you'll be matched!
            </p>
            <Link to="/discover">
              <Button className="bg-gradient-primary hover:opacity-90">
                Discover Students
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
