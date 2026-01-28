import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, User, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { MetaTags } from "@/components/MetaTags";

export function Settings() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch profile
  const { data: profile, isLoading: profileLoading, refetch } = trpc.aiCoach.getProfile.useQuery(undefined, {
    enabled: !!user,
  });

  // Form state
  const [preferredName, setPreferredName] = useState("");
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"first_time" | "mid_level" | "senior" | "executive">("executive");
  const [preferredCoachGender, setPreferredCoachGender] = useState<"female" | "male" | "nonbinary" | "no_preference">("no_preference");
  const [communicationStyle, setCommunicationStyle] = useState<"direct" | "supportive" | "balanced">("balanced");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reminderPreference, setReminderPreference] = useState<"1_day" | "3_days" | "7_days" | "none">("3_days");

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setPreferredName(profile.preferredName || "");
      setRole(profile.role || "");
      setExperienceLevel(profile.experienceLevel || "executive");
      setProfilePictureUrl(profile.profilePictureUrl || "");
      
      // Parse coaching preferences
      if (profile.coachingPreferences) {
        try {
          const prefs = typeof profile.coachingPreferences === 'string' 
            ? JSON.parse(profile.coachingPreferences) 
            : profile.coachingPreferences;
          setPreferredCoachGender(prefs.preferredCoachGender || "no_preference");
          setCommunicationStyle(prefs.communicationStyle || "balanced");
          setReminderPreference(prefs.reminderPreference || "3_days");
        } catch (e) {
        }
      }
    }
  }, [profile]);

  const utils = trpc.useUtils();
  
  // Upload profile picture mutation
  const uploadProfilePictureMutation = trpc.aiCoach.uploadProfilePicture.useMutation({
    onSuccess: (data) => {
      setProfilePictureUrl(data.url);
      setUploadingImage(false);
      toast.success("Profile picture uploaded successfully");
    },
    onError: (error) => {
      setUploadingImage(false);
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });
  
  // Update mutation
  const updateMutation = trpc.aiCoach.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      // Invalidate all coaching profile queries to force refresh
      utils.aiCoach.getProfile.invalidate();
      refetch();
      // Redirect to dashboard after successful save
      setTimeout(() => {
        navigate("/ai-coach/dashboard");
      }, 1000); // 1 second delay to show toast
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    
    setUploadingImage(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadProfilePictureMutation.mutate({
        imageData: base64,
        fileName: file.name,
      });
    };
    reader.onerror = () => {
      setUploadingImage(false);
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate({
      preferredName,
      role,
      experienceLevel,
      profilePictureUrl,
      coachingPreferences: {
        preferredCoachGender,
        communicationStyle,
        reminderPreference,
      },
    });
  };

  // Auth check
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/");
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              You need to complete onboarding first to access settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/ai-coach/onboarding")}>
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Settings | The Deep Brief"
        description="Manage your coaching profile and preferences"
      />

      <div className="container py-8 max-w-3xl">
        {/* Back Navigation */}
        <Link href="/ai-coach/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your coaching profile and preferences
          </p>
        </div>

        {/* Continue Onboarding Card */}
        {profile && !profile.hasCompletedOnboarding && (
          <Card className="border-[#4A6741] bg-[#4A6741]/5">
            <CardHeader>
              <CardTitle>Complete Your Onboarding</CardTitle>
              <CardDescription>
                Finish setting up your coaching profile to get the most out of AI Coach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/ai-coach/dashboard")} 
                className="bg-[#4A6741] hover:bg-[#3a5331] text-white"
              >
                Continue Onboarding
              </Button>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your profile details and coaching preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {uploadingImage ? "Uploading..." : "Upload a profile picture (max 5MB)"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred Name</Label>
                <Input
                  id="preferredName"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="How should your coach address you?"
                />
                <p className="text-sm text-muted-foreground">
                  This is how your AI coach will address you in conversations
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Current Role</Label>
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., CEO, VP of Engineering, Founder"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={(value: any) => setExperienceLevel(value)}>
                  <SelectTrigger id="experienceLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive (C-Suite, VP+)</SelectItem>
                    <SelectItem value="senior">Senior (Director, Senior Manager)</SelectItem>
                    <SelectItem value="mid_level">Mid-Level (Manager, Team Lead)</SelectItem>
                    <SelectItem value="first_time">First-Time Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Coaching Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Coaching Preferences</CardTitle>
              <CardDescription>
                Customize your coaching experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredCoachGender">Preferred Coach Gender</Label>
                <Select value={preferredCoachGender} onValueChange={(value: any) => setPreferredCoachGender(value)}>
                  <SelectTrigger id="preferredCoachGender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_preference">No Preference</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="nonbinary">Non-Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="communicationStyle">Communication Style</Label>
                <Select value={communicationStyle} onValueChange={(value: any) => setCommunicationStyle(value)}>
                  <SelectTrigger id="communicationStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct (Straight to the point)</SelectItem>
                    <SelectItem value="supportive">Supportive (Empathetic and encouraging)</SelectItem>
                    <SelectItem value="balanced">Balanced (Mix of both)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How would you like your coach to communicate with you?
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details (managed by Manus authentication)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Email</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Name</span>
                <span className="text-sm text-muted-foreground">{user.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                To update your email or name, please contact support
              </p>
            </CardContent>
          </Card>

          {/* Commitment Reminders */}
          <Card>
            <CardHeader>
              <CardTitle>Commitment Reminders</CardTitle>
              <CardDescription>
                Choose when you want to receive email reminders for upcoming commitments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-preference">Send reminders</Label>
                <Select value={reminderPreference} onValueChange={(value: any) => setReminderPreference(value)}>
                  <SelectTrigger id="reminder-preference">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_day">1 day before due date</SelectItem>
                    <SelectItem value="3_days">3 days before due date</SelectItem>
                    <SelectItem value="7_days">7 days before due date</SelectItem>
                    <SelectItem value="none">No reminders</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Reminders help you stay on track without being intrusive
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/ai-coach/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
