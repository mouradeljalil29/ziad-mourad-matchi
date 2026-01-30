import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SkillBadge } from "@/components/ui/skill-badge";
import { useProfiles, calculateMatchScore } from "@/hooks/useProfiles";
import { useProfile } from "@/hooks/useProfile";
import { useSendRequest } from "@/hooks/useMatchRequests";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  Users, 
  Send,
  SlidersHorizontal,
  X
} from "lucide-react";
import {
  SKILLS_OPTIONS,
  AVAILABILITY_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  LOOKING_FOR_OPTIONS,
} from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function Discover() {
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState("all");
  const [projectType, setProjectType] = useState("all");
  const [lookingFor, setLookingFor] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "match">("match");
  
  const [requestTarget, setRequestTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [requestMessage, setRequestMessage] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: myProfile, isLoading: profileLoading } = useProfile();
  const { data: profiles, isLoading: profilesLoading } = useProfiles({
    search,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    availability: availability as any,
    projectType: projectType as any,
    lookingFor: lookingFor as any,
  });
  const sendRequest = useSendRequest();

  // Check if user has a profile
  const needsProfile = !profileLoading && !myProfile;

  // Calculate match scores and sort
  const sortedProfiles = useMemo(() => {
    if (!profiles) return [];
    
    const withScores = profiles.map((p) => ({
      ...p,
      matchScore: calculateMatchScore(p, myProfile || null),
    }));

    if (sortBy === "match") {
      return withScores.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    return withScores;
  }, [profiles, myProfile, sortBy]);

  const handleSendRequest = async () => {
    if (!requestTarget) return;
    
    try {
      await sendRequest.mutateAsync({
        toUserId: requestTarget.userId,
        message: requestMessage.trim() || undefined,
      });
      
      toast({
        title: "Request sent!",
        description: `Your match request has been sent to ${requestTarget.name}.`,
      });
      setRequestTarget(null);
      setRequestMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive",
      });
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSkills([]);
    setAvailability("all");
    setProjectType("all");
    setLookingFor("all");
  };

  const hasFilters =
    search ||
    selectedSkills.length > 0 ||
    availability !== "all" ||
    projectType !== "all" ||
    lookingFor !== "all";

  if (needsProfile) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground">
              Before you can discover other students, you need to create your profile.
            </p>
          </div>
          <Button
            onClick={() => navigate("/profile")}
            className="bg-gradient-primary hover:opacity-90"
          >
            Create Profile
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Discover</h1>
            <p className="text-muted-foreground">
              Find students with complementary skills
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best Match</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or school..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Skills Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Skills
                  {selectedSkills.length > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {selectedSkills.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h4 className="font-medium">Filter by Skills</h4>
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                    {SKILLS_OPTIONS.map((skill) => (
                      <SkillBadge
                        key={skill}
                        skill={skill}
                        variant={selectedSkills.includes(skill) ? "selected" : "default"}
                        onClick={() => toggleSkill(skill)}
                      />
                    ))}
                  </div>
                  {selectedSkills.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSkills([])}
                      className="w-full"
                    >
                      Clear Skills
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* More Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Availability</label>
                    <Select value={availability} onValueChange={setAvailability}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        {AVAILABILITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Type</label>
                    <Select value={projectType} onValueChange={setProjectType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        {PROJECT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Looking For</label>
                    <Select value={lookingFor} onValueChange={setLookingFor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        {LOOKING_FOR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <SkillBadge
                key={skill}
                skill={skill}
                variant="selected"
                onRemove={() => toggleSkill(skill)}
              />
            ))}
          </div>
        )}

        {/* Results */}
        {profilesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : sortedProfiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No profiles found</h3>
            <p className="text-muted-foreground mb-4">
              {hasFilters
                ? "Try adjusting your filters to see more results."
                : "Be the first to invite your friends!"}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                matchScore={Math.min(Math.round((profile.matchScore / 100) * 100), 100)}
                mySkills={myProfile?.skills || []}
                action={
                  <Button
                    onClick={() =>
                      setRequestTarget({
                        userId: profile.user_id,
                        name: profile.display_name,
                      })
                    }
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Request
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={!!requestTarget} onOpenChange={() => setRequestTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Match Request</DialogTitle>
            <DialogDescription>
              Send a request to {requestTarget?.name}. You can include an optional message.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Hi! I'd love to work together on..."
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={sendRequest.isPending}
              className="bg-gradient-primary hover:opacity-90"
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
