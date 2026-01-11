"use client";

import { Shield, CheckCircle, Link2, Mail, FileText, ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Extended User interface with optional properties
interface ExtendedUser {
  id: string | number;
  email: string;
  username: string;
  role?: string;
  profile_picture?: string;
  full_name?: string;
  is_verified?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const profileId = typeof params.id === 'string' ? params.id : params.id?.[0];
  
  // Check if this is the current user's profile
  const isOwnProfile = user?.id.toString() === profileId;

  const [recentScans, setRecentScans] = useState<Array<{
    id: number;
    type: string;
    input: string;
    score: number;
    createdAt: string;
    result: string;
  }>>([]);
  const [scansLoading, setScansLoading] = useState(false);

  // Cast user to ExtendedUser for optional properties
  const extendedUser = user as ExtendedUser;

  useEffect(() => {
    if (!user || !profileId) return;
    if (!isOwnProfile) {
      router.replace(`/profile/${encodeURIComponent(String(user.id))}`);
    }
  }, [isOwnProfile, profileId, router, user]);

  useEffect(() => {
    const load = async () => {
      if (!user || !isOwnProfile) return;
      setScansLoading(true);
      try {
        const resp = await fetch("/api/scans?limit=8");
        const data = await resp.json();
        if (resp.ok) {
          setRecentScans(data?.scans ?? []);
        }
      } finally {
        setScansLoading(false);
      }
    };
    load();
  }, [isOwnProfile, user]);

  const scanRows = useMemo(() => {
    const iconFor = (t: string) => {
      const tt = (t || "").toLowerCase();
      if (tt.includes("url")) return Link2;
      if (tt.includes("email")) return Mail;
      if (tt.includes("file")) return FileText;
      return Shield;
    };
    const labelFor = (t: string) => (t ? t.toUpperCase() : "SCAN");
    return recentScans.map(s => ({
      ...s,
      Icon: iconFor(s.type),
      label: labelFor(s.type),
      riskPct: Math.round((s.score ?? 0) * 100),
      when: new Date(s.createdAt).toLocaleString(),
    }));
  }, [recentScans]);

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold text-white">Loading profile...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackgroundGradient className="rounded-[22px] p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center">
              {extendedUser.profile_picture ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src={extendedUser.profile_picture}
                      alt={extendedUser.full_name || extendedUser.email}
                      fill
                      className="object-cover"
                    />
                </div>
              ) : (
                <Shield className="w-12 h-12 text-white" />
              )}
            </div>
            {isOwnProfile && (
              <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-black flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{extendedUser.full_name || 'User Profile'}</h1>
            <p className="text-zinc-400 text-sm">{extendedUser.email}</p>
            {extendedUser.role && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                {extendedUser.role.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </BackgroundGradient>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2">Email</h3>
          <p className="text-xl text-primary">{extendedUser.email}</p>
        </Card>
        <Card className="bg-zinc-900/50 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2">Account ID</h3>
          <p className="text-xl text-primary">{extendedUser.id}</p>
        </Card>
        <Card className="bg-zinc-900/50 rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-2">Role</h3>
          <p className="text-xl text-primary">{extendedUser.role || 'User'}</p>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        <Card className="bg-zinc-900/50 rounded-lg p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Full Name</h3>
              <p className="text-lg text-zinc-400">{extendedUser.full_name || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Email Verified</h3>
              <p className={`text-lg ${extendedUser.is_verified ? "text-green-500" : "text-yellow-400"}`}>
                {extendedUser.is_verified ? "Verified" : "Not verified"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Created At</h3>
              <p className="text-lg text-zinc-400">
                {extendedUser.createdAt ? new Date(extendedUser.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Last Login</h3>
              <p className="text-lg text-zinc-400">
                {extendedUser.lastLogin ? new Date(extendedUser.lastLogin).toLocaleString() : "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent scans</h2>
          <Link href="/scans" className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Card className="bg-zinc-900/50 rounded-lg p-6 border border-white/10">
          {scansLoading ? (
            <div className="text-zinc-400">Loading scan history…</div>
          ) : scanRows.length === 0 ? (
            <div className="text-zinc-400">No scans yet. Try URL Scanner / Email Analyzer / File Scanner.</div>
          ) : (
            <div className="space-y-3">
              {scanRows.map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 rounded-md bg-blue-500/10 p-2">
                      <s.Icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium">{s.label}</div>
                      <div className="text-xs text-zinc-400 break-all overflow-hidden">
                        {s.input.length > 120 ? `${s.input.slice(0, 120)}…` : s.input}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{s.when}</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-300 sm:whitespace-nowrap self-end sm:self-auto">
                    Risk: <span className="text-white">{s.riskPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 