import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfile, useCreateProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      if (profile) {
        await updateProfile.mutateAsync(data);
        toast({
          title: "Profile updated",
          description: "Your changes have been saved.",
        });
      } else {
        await createProfile.mutateAsync(data);
        toast({
          title: "Profile created",
          description: "Welcome to BinomeMatch! Start discovering partners.",
        });
        navigate("/discover");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {profile ? "Edit Profile" : "Create Your Profile"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile
              ? "Update your information to help others find you"
              : "Tell us about yourself so we can help you find the perfect partner"}
          </p>
        </div>

        <ProfileForm
          profile={profile}
          onSubmit={handleSubmit}
          isLoading={createProfile.isPending || updateProfile.isPending}
        />
      </div>
    </AppLayout>
  );
}
