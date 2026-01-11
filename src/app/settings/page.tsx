"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Profile = {
  id: number;
  email: string;
  username: string;
  role?: string | null;
  full_name?: string | null;
  profile_picture?: string | null;
  is_verified?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
};

export default function SettingsPage() {
  const { loading: authLoading, isAuthenticated, refreshAuth } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (authLoading) return;
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const resp = await fetch("/api/user/profile");
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || "Failed to load profile");
        setProfile(data);
        setFullName(data?.full_name || "");
        setProfilePicture(data?.profile_picture || "");
      } catch (e) {
        toast.error((e as Error).message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, isAuthenticated]);

  const saveProfile = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          profile_picture: profilePicture,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed to update profile");
      setProfile(data);
      toast.success("Profile updated");
      await refreshAuth();
    } catch (e) {
      toast.error((e as Error).message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please fill current and new password");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const resp = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed to change password");
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e) {
      toast.error((e as Error).message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
          <p className="text-slate-400">Manage your account details and security.</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-100">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input value={profile?.email || ""} readOnly className="bg-slate-900/50 border-slate-700 text-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Username</Label>
                <Input value={profile?.username || ""} readOnly className="bg-slate-900/50 border-slate-700 text-slate-200" />
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {profile?.role ? `Role: ${String(profile.role).toUpperCase()}` : null}
              {profile?.is_verified !== undefined ? ` • Email verified: ${profile.is_verified ? "Yes" : "No"}` : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-100">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Full name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200"
                placeholder="Your name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Profile picture URL</Label>
              <Input
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200"
                placeholder="https://…"
                disabled={loading}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={saveProfile} disabled={loading}>
                {loading ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-slate-100">Change password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Current password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Confirm new password</Label>
                <Input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={changePassword} disabled={savingPassword}>
                {savingPassword ? "Updating..." : "Update password"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-red-400">Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="text-slate-400 text-sm">
              Account deletion isn’t enabled yet.
            </div>
            <Button variant="destructive" disabled>
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 