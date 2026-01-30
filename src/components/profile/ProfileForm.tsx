import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillBadge } from "@/components/ui/skill-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Profile, ProfileInsert, ProfileUpdate } from "@/hooks/useProfile";
import {
  SKILLS_OPTIONS,
  INTERESTS_OPTIONS,
  AVAILABILITY_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  LOOKING_FOR_OPTIONS,
  CONTACT_PREFERENCE_OPTIONS,
  LEVEL_OPTIONS,
} from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  profile?: Profile | null;
  onSubmit: (data: Omit<ProfileInsert, "user_id"> | ProfileUpdate) => Promise<void>;
  isLoading: boolean;
}

export function ProfileForm({ profile, onSubmit, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    school: profile?.school || "",
    level: profile?.level || "",
    city: profile?.city || "",
    bio: profile?.bio || "",
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    availability: profile?.availability || "flexible",
    preferred_project_type: profile?.preferred_project_type || "any",
    looking_for: profile?.looking_for || "binome",
    contact_preference: profile?.contact_preference || "in-app",
    contact_email: profile?.contact_email || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.display_name.trim()) {
      newErrors.display_name = "Display name is required";
    } else if (formData.display_name.length > 100) {
      newErrors.display_name = "Display name must be less than 100 characters";
    }
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }
    
    if (formData.skills.length === 0) {
      newErrors.skills = "Select at least one skill";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData as unknown as ProfileInsert);
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg">Basic Information</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="John Doe"
                maxLength={100}
              />
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">School / University</Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                placeholder="MIT, Stanford, etc."
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Paris, New York, etc."
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others about yourself, your goals, and what kind of projects you're interested in..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Skills *</h3>
            <p className="text-sm text-muted-foreground">
              Select the technologies and skills you're proficient in
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {SKILLS_OPTIONS.map((skill) => (
              <SkillBadge
                key={skill}
                skill={skill}
                variant={formData.skills.includes(skill) ? "selected" : "default"}
                onClick={() => toggleSkill(skill)}
              />
            ))}
          </div>
          {errors.skills && (
            <p className="text-sm text-destructive">{errors.skills}</p>
          )}
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Interests</h3>
            <p className="text-sm text-muted-foreground">
              What areas are you interested in exploring?
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {INTERESTS_OPTIONS.map((interest) => (
              <SkillBadge
                key={interest}
                skill={interest}
                variant={formData.interests.includes(interest) ? "selected" : "default"}
                onClick={() => toggleInterest(interest)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg">Preferences</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) =>
                  setFormData({ ...formData, availability: value as typeof formData.availability })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Project Type</Label>
              <Select
                value={formData.preferred_project_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, preferred_project_type: value as typeof formData.preferred_project_type })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Looking For</Label>
              <Select
                value={formData.looking_for}
                onValueChange={(value) =>
                  setFormData({ ...formData, looking_for: value as typeof formData.looking_for })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOOKING_FOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contact Preference</Label>
              <Select
                value={formData.contact_preference}
                onValueChange={(value) =>
                  setFormData({ ...formData, contact_preference: value as typeof formData.contact_preference })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_PREFERENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.contact_preference === "email" && (
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  placeholder="you@example.com"
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground">
                  Shown to your matches so they can reach you
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {profile ? "Save Changes" : "Create Profile"}
      </Button>
    </form>
  );
}
