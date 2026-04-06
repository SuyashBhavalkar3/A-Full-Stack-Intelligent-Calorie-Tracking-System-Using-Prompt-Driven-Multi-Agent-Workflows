import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Loader2, Check, Mail, Activity } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  age: z.coerce.number().min(13).max(120),
  gender: z.enum(["male", "female", "other"]),
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(30).max(300),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise" },
  { value: "light", label: "Light", description: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderate", description: "Moderate exercise 3-5 days/week" },
  { value: "active", label: "Active", description: "Hard exercise 6-7 days/week" },
  { value: "very_active", label: "Very Active", description: "Very hard exercise & physical job" },
];

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: 25,
      gender: "male",
      height: 170,
      weight: 70,
      activity_level: "moderate",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileApi.me();
        if (response.data) {
          form.reset({
            age: response.data.age ?? 25,
            gender: response.data.gender ?? "male",
            height: response.data.height_cm ?? response.data.height ?? 170,
            weight: response.data.weight_kg ?? response.data.weight ?? 70,
            activity_level: response.data.activity_level ?? "moderate",
          });
        }
      } catch (error) {
        // Use default values
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await profileApi.setup({
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        activity_level: data.activity_level,
      });
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {user?.email || "user@example.com"}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="font-semibold mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register("age")}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={form.watch("gender")}
                    onValueChange={(v) => form.setValue("gender", v as any)}
                    className="flex gap-2"
                  >
                    {["male", "female", "other"].map((g) => (
                      <Label
                        key={g}
                        className={cn(
                          "flex-1 flex items-center justify-center h-12 rounded-lg border-2 cursor-pointer transition-colors capitalize",
                          form.watch("gender") === g
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <RadioGroupItem value={g} className="sr-only" />
                        {g}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    {...form.register("height")}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Current Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    {...form.register("weight")}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Activity Level</h3>
              </div>
              
              <RadioGroup
                value={form.watch("activity_level")}
                onValueChange={(v) => form.setValue("activity_level", v as any)}
                className="space-y-2"
              >
                {ACTIVITY_LEVELS.map((level) => (
                  <Label
                    key={level.value}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                      form.watch("activity_level") === level.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={level.value} />
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-primary hover:opacity-90"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
