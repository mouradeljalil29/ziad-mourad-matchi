import { useState, useMemo, useEffect } from "react";
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
import { SkillBadge } from "@/components/ui/skill-badge";
import { useProfiles, calculateMatchScore, DISCOVER_PAGE_SIZE } from "@/hooks/useProfiles";
import { useProfile } from "@/hooks/useProfile";
import {
  useSendRequest,
  useCheckExistingRequest,
  useRequestsSentToday,
} from "@/hooks/useMatchRequests";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Filter,
  Users,
  Send,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
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

const DISCOVER_FILTERS_KEY = "discover-filters";

function loadPersistedFilters() {
  try {
    const raw = sessionStorage.getItem(DISCOVER_FILTERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      search?: string;
      selectedSkills?: string[];
      availability?: string;
      projectType?: string;
      lookingFor?: string;
    };
    if (parsed && typeof parsed === "object") {
      return {
        search: typeof parsed.search === "string" ? parsed.search : "",
        selectedSkills: Array.isArray(parsed.selectedSkills)
          ? parsed.selectedSkills.filter((s) => typeof s === "string")
          : [],
        availability:
          typeof parsed.availability === "string" ? parsed.availability : "all",
        projectType:
          typeof parsed.projectType === "string" ? parsed.projectType : "all",
        lookingFor:
          typeof parsed.lookingFor === "string" ? parsed.lookingFor : "all",
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function savePersistedFilters(filters: {
  search: string;
  selectedSkills: string[];
  availability: string;
  projectType: string;
  lookingFor: string;
}) {
  try {
    sessionStorage.setItem(DISCOVER_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    /* ignore */
  }
}

export default function Discover() {
  const persisted = useMemo(loadPersistedFilters, []);

  const [search, setSearch] = useState(persisted?.search ?? "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    persisted?.selectedSkills ?? []
  );
  const [availability, setAvailability] = useState(
    persisted?.availability ?? "all"
  );
  const [projectType, setProjectType] = useState(
    persisted?.projectType ?? "all"
  );
  const [lookingFor, setLookingFor] = useState(persisted?.lookingFor ?? "all");
  const [sortBy, setSortBy] = useState<"match" | "recent" | "name">("match");
  const [page, setPage] = useState(1);

  const [requestTarget, setRequestTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [requestMessage, setRequestMessage] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: myProfile, isLoading: profileLoading } = useProfile();
  const { data: profilesResult, isLoading: profilesLoading } = useProfiles({
    search,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    availability: availability as "all",
    projectType: projectType as "all",
    lookingFor: lookingFor as "all",
    page,
    pageSize: DISCOVER_PAGE_SIZE,
  });
  const profiles = profilesResult?.data ?? [];
  const total = profilesResult?.total ?? 0;

  const sendRequest = useSendRequest();
  const { data: requestsSentToday } = useRequestsSentToday();
  const { data: existingRequestForTarget } = useCheckExistingRequest(
    requestTarget?.userId
  );

  useEffect(() => {
    savePersistedFilters({
      search,
      selectedSkills,
      availability,
      projectType,
      lookingFor,
    });
  }, [search, selectedSkills, availability, projectType, lookingFor]);

  const needsProfile = !profileLoading && !myProfile;

  const sortedProfiles = useMemo(() => {
    const withScores = profiles.map((p) => ({
      ...p,
      matchScore: calculateMatchScore(p, myProfile || null),
    }));

    if (sortBy === "match") {
      return withScores.sort((a, b) => b.matchScore - a.matchScore);
    }
    if (sortBy === "name") {
      return withScores.sort((a, b) =>
        (a.display_name ?? "").localeCompare(b.display_name ?? "")
      );
    }
    return withScores;
  }, [profiles, myProfile, sortBy]);

  const handleSendRequest = async () => {
    if (!requestTarget) return;

    try {
      await sendRequest.mutateAsync({
        toUserId: requestTarget.userId,
        message: requestMessage.trim() || undefined,
        requestsSentToday: requestsSentToday ?? 0,
        existingRequest: existingRequestForTarget ?? null,
      });

      toast({
        title: "Request sent!",
        description: `Your match request has been sent to ${requestTarget.name}.`,
      });
      setRequestTarget(null);
      setRequestMessage("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send request";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSkills([]);
    setAvailability("all");
    setProjectType("all");
    setLookingFor("all");
    setPage(1);
  };

  const hasFilters =
    search ||
    selectedSkills.length > 0 ||
    availability !== "all" ||
    projectType !== "all" ||
    lookingFor !== "all";

  const totalPages = Math.max(1, Math.ceil(total / DISCOVER_PAGE_SIZE));
  const canNext = page < totalPages;
  const canPrev = page > 1;

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
              Before you can discover other students, you need to create your
              profile.
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Discover</h1>
            <p className="text-muted-foreground">
              Find students with complementary skills
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as "match" | "recent" | "name")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best match</SelectItem>
                <SelectItem value="recent">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or school..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
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
                  <h4 className="font-medium">Filter by Skills (chips)</h4>
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                    {SKILLS_OPTIONS.map((skill) => (
                      <SkillBadge
                        key={skill}
                        skill={skill}
                        variant={
                          selectedSkills.includes(skill) ? "selected" : "default"
                        }
                        onClick={() => toggleSkill(skill)}
                      />
                    ))}
                  </div>
                  {selectedSkills.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSkills([]);
                        setPage(1);
                      }}
                      className="w-full"
                    >
                      Clear Skills
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

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
                    <Select
                      value={availability}
                      onValueChange={(v) => {
                        setAvailability(v);
                        setPage(1);
                      }}
                    >
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
                    <Select
                      value={projectType}
                      onValueChange={(v) => {
                        setProjectType(v);
                        setPage(1);
                      }}
                    >
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
                    <Select
                      value={lookingFor}
                      onValueChange={(v) => {
                        setLookingFor(v);
                        setPage(1);
                      }}
                    >
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
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset filters
              </Button>
            )}
          </div>
        </div>

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

        {profilesLoading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : sortedProfiles.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed bg-muted/30">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No profiles found</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              {hasFilters
                ? "Try adjusting your filters to see more results."
                : "Try adding skills to your profile so others can find you—or invite friends to join!"}
            </p>
            {hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Reset filters
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="gap-2"
              >
                Edit my profile
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchScore={Math.round(profile.matchScore ?? 0)}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!canPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!canNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!requestTarget} onOpenChange={() => setRequestTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Match Request</DialogTitle>
            <DialogDescription>
              Send a request to {requestTarget?.name}. You can include an
              optional message.
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
