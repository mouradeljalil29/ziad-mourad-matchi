import { ReactNode, useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { useProfile } from "@/hooks/useProfile";
import { getProfileCompleteness } from "@/lib/profileCompleteness";
import {
  OnboardingModal,
  hasOnboardingBeenShown,
} from "@/components/onboarding/OnboardingModal";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (profileLoading || !profile) return;
    const completeness = getProfileCompleteness(profile);
    if (completeness < 100 && !hasOnboardingBeenShown()) {
      setOnboardingOpen(true);
    }
  }, [profile, profileLoading]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <OnboardingModal
        profile={profile}
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
      />
    </div>
  );
}
