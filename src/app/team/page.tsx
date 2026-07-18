"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function TeamRedirectPage() {
  const { teamId, isLoading, isStaff } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (teamId) {
        router.replace(`/team/${teamId}`);
      } else if (isStaff) {
         // Staff don't have teams, redirect to leaderboard where they can pick a team
        router.replace("/leaderboard");
      }
    }
  }, [teamId, isLoading, isStaff, router]);

  return (
    <DashboardLayout title="Team Profile" breadcrumbs={["Home", "Team"]}>
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
        <p className="text-[var(--text-secondary)] font-medium">Locating team profile...</p>
      </div>
    </DashboardLayout>
  );
}
