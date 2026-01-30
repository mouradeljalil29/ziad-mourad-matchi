import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getProfileCompleteness } from "@/lib/profileCompleteness";
import type { Profile } from "@/hooks/useProfile";

const ONBOARDING_SHOWN_KEY = "binomematch-onboarding-shown";

export function hasOnboardingBeenShown(): boolean {
  try {
    return sessionStorage.getItem(ONBOARDING_SHOWN_KEY) === "true";
  } catch {
    return false;
  }
}

export function setOnboardingShown(): void {
  try {
    sessionStorage.setItem(ONBOARDING_SHOWN_KEY, "true");
  } catch {
    /* ignore */
  }
}

interface OnboardingModalProps {
  profile: Profile | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({
  profile,
  open,
  onOpenChange,
}: OnboardingModalProps) {
  const navigate = useNavigate();
  const completeness = getProfileCompleteness(profile);

  const handleClose = () => {
    setOnboardingShown();
    onOpenChange(false);
  };

  const handleGoToProfile = () => {
    setOnboardingShown();
    onOpenChange(false);
    navigate("/profile");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={handleClose}>
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>
            Your profile is {completeness}% complete. Adding more details (skills,
            availability, bio, city) helps others find you and improves your match
            score.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums">{completeness}%</span>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="sm:mr-auto">
            Maybe later
          </Button>
          <Button onClick={handleGoToProfile} className="bg-gradient-primary hover:opacity-90">
            Complete profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
