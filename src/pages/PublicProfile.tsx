import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkillBadge } from "@/components/ui/skill-badge";
import { useProfileById } from "@/hooks/useProfile";
import { useProfile } from "@/hooks/useProfile";
import {
  useCheckExistingRequest,
  useSendRequest,
  useUpdateRequestStatus,
  useRequestsSentToday,
} from "@/hooks/useMatchRequests";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  MapPin,
  GraduationCap,
  Clock,
  Target,
  Users,
  Mail,
  MessageCircle,
  ArrowLeft,
  Send,
  Check,
  X,
  Inbox,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  AVAILABILITY_OPTIONS, 
  PROJECT_TYPE_OPTIONS, 
  LOOKING_FOR_OPTIONS,
  CONTACT_PREFERENCE_OPTIONS
} from "@/lib/constants";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useProfileById(id);
  const { data: myProfile } = useProfile();
  const { data: existingRequest } = useCheckExistingRequest(profile?.user_id);
  const { data: requestsSentToday } = useRequestsSentToday();
  const sendRequest = useSendRequest();
  const updateStatus = useUpdateRequestStatus();

  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [message, setMessage] = useState("");

  const isOwnProfile = user?.id === profile?.user_id;

  const isIncomingPending =
    existingRequest?.status === "pending" &&
    existingRequest.to_user_id === user?.id;
  const isOutgoingPending =
    existingRequest?.status === "pending" &&
    existingRequest.from_user_id === user?.id;
  const isMatched = existingRequest?.status === "accepted";

  const handleSendRequest = async () => {
    if (!profile) return;

    try {
      await sendRequest.mutateAsync({
        toUserId: profile.user_id,
        message: message.trim() || undefined,
        requestsSentToday: requestsSentToday ?? 0,
        existingRequest: existingRequest ?? null,
      });

      toast({
        title: "Request sent!",
        description: `Your match request has been sent to ${profile.display_name}.`,
      });
      setShowRequestDialog(false);
      setMessage("");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to send request";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async () => {
    if (!existingRequest?.id) return;
    try {
      await updateStatus.mutateAsync({
        requestId: existingRequest.id,
        status: "accepted",
      });
      toast({
        title: "Request accepted!",
        description: `You're now matched with ${profile?.display_name}.`,
      });
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to accept request";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const availabilityLabel = AVAILABILITY_OPTIONS.find(
    (o) => o.value === profile?.availability
  )?.label;
  
  const projectTypeLabel = PROJECT_TYPE_OPTIONS.find(
    (o) => o.value === profile?.preferred_project_type
  )?.label;
  
  const lookingForLabel = LOOKING_FOR_OPTIONS.find(
    (o) => o.value === profile?.looking_for
  )?.label;

  const contactLabel = CONTACT_PREFERENCE_OPTIONS.find(
    (o) => o.value === profile?.contact_preference
  )?.label;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">
            This profile doesn't exist or has been made private.
          </p>
          <Button onClick={() => navigate("/discover")}>
            Back to Discover
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Profile Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-2xl">
                  {profile.display_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                    {profile.level && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {profile.level}
                      </span>
                    )}
                    {profile.school && <span>{profile.school}</span>}
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <SkillBadge
                      key={skill}
                      skill={skill}
                      variant={myProfile?.skills?.includes(skill) ? "match" : "default"}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <SkillBadge key={interest} skill={interest} />
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Availability
                </div>
                <p className="font-medium">{availabilityLabel}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Project Type
                </div>
                <p className="font-medium">{projectTypeLabel}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Looking For
                </div>
                <p className="font-medium">{lookingForLabel}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {profile.contact_preference === "email" ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  Contact
                </div>
                <p className="font-medium">{contactLabel}</p>
              </div>
            </div>

            {/* Action buttons */}
            {!isOwnProfile && (
              <div className="pt-4 border-t space-y-2">
                {isMatched && (
                  <div className="flex items-center gap-2 text-success font-medium">
                    <Check className="h-4 w-4" />
                    You are matched
                  </div>
                )}
                {isOutgoingPending && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Request sent (pending)
                  </div>
                )}
                {isIncomingPending && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Inbox className="h-4 w-4" />
                      This person sent you a request.
                    </span>
                    <Button
                      onClick={handleAcceptRequest}
                      disabled={updateStatus.isPending}
                      className="gap-2 bg-success hover:bg-success/90 shrink-0"
                    >
                      <Check className="h-4 w-4" />
                      Accept request
                    </Button>
                  </div>
                )}
                {existingRequest?.status === "declined" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <X className="h-4 w-4 text-destructive" />
                    Request declined
                  </div>
                )}
                {!existingRequest && (
                  <Button
                    onClick={() => setShowRequestDialog(true)}
                    className="bg-gradient-primary hover:opacity-90 gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Match Request
                  </Button>
                )}
              </div>
            )}

            {isOwnProfile && (
              <div className="pt-4 border-t">
                <Button onClick={() => navigate("/profile")} variant="outline">
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Match Request</DialogTitle>
            <DialogDescription>
              Send a request to {profile.display_name}. You can include an optional message.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Hi! I'd love to work together on..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
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
