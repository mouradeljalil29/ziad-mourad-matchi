import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkillBadge } from "@/components/ui/skill-badge";
import { useProfileById } from "@/hooks/useProfile";
import { useProfile } from "@/hooks/useProfile";
import { useCheckExistingRequest, useSendRequest } from "@/hooks/useMatchRequests";
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
  X
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
  const sendRequest = useSendRequest();
  
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [message, setMessage] = useState("");

  const isOwnProfile = user?.id === profile?.user_id;
  
  const handleSendRequest = async () => {
    if (!profile) return;
    
    try {
      await sendRequest.mutateAsync({
        toUserId: profile.user_id,
        message: message.trim() || undefined,
      });
      
      toast({
        title: "Request sent!",
        description: `Your match request has been sent to ${profile.display_name}.`,
      });
      setShowRequestDialog(false);
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
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
              <div className="pt-4 border-t">
                {existingRequest ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {existingRequest.status === "pending" && (
                      <>
                        <Clock className="h-4 w-4" />
                        Request pending
                      </>
                    )}
                    {existingRequest.status === "accepted" && (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        You're matched!
                      </>
                    )}
                    {existingRequest.status === "declined" && (
                      <>
                        <X className="h-4 w-4 text-destructive" />
                        Request declined
                      </>
                    )}
                  </div>
                ) : (
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
