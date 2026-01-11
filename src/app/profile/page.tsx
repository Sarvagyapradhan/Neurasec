"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/login?returnUrl=${encodeURIComponent("/profile")}`);
      return;
    }

    router.replace(`/profile/${encodeURIComponent(String(user.id))}`);
  }, [loading, router, user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-6">
      <div className="text-slate-300">Loading profile…</div>
    </div>
  );
}