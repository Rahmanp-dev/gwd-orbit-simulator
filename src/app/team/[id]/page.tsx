"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Trophy,
  Users,
  Briefcase,
  DollarSign,
  Star,
  ExternalLink,
  CheckCircle2,
  Share2,
  Sparkles,
  ArrowLeft,
  Flame,
  Loader2,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export default function TeamDetailPage() {
  const params = useParams();
  const id = (Array.isArray(params?.id) ? params.id[0] : params?.id) || "";
  const { role: userRole } = useUserRole();

  const [team, setTeam] = useState<any>(null);
  const [verifiedDeals, setVerifiedDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchTeamData();
    }
  }, [id]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/team/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        setVerifiedDeals(data.verifiedDeals || []);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to load team");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Team Profile" breadcrumbs={["Home", "Teams"]}>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">Loading team profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !team) {
    return (
      <DashboardLayout title="Team Profile" breadcrumbs={["Home", "Teams"]}>
        <div className="p-12 text-center text-red-500 font-bold bg-white rounded-xl shadow-sm border border-red-200">
          {error || "Team not found."}
        </div>
      </DashboardLayout>
    );
  }

  const sortedMembers = [...(team.memberIds || [])].sort((a, b) => (b.orbitScore || 0) - (a.orbitScore || 0));
  const isDemoTeam = team.name === "Team Phoenix" || team.name === "Team Titan";

  return (
    <DashboardLayout title={`${team.name} Profile`} breadcrumbs={["Home", "Teams", team.name]}>
      {/* Back button + Share */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={userRole === "admin" || userRole === "organizer" ? "/leaderboard" : "/dashboard"}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-gray-50 transition-colors shadow-2xs">
          <Share2 className="w-3.5 h-3.5" /> Share Profile
        </button>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-10 mb-8 border border-[var(--border)] shadow-md relative overflow-hidden">
        {/* Background decorative patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--crimson)]/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between">
          {/* Left: Identity */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-[var(--surface-alt)] to-gray-200 border-4 border-white shadow-xl flex items-center justify-center text-4xl md:text-5xl flex-shrink-0">
              {team.emoji || "🏢"}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="warning" size="md">Rank #{team.rank || "-"}</Badge>
                {isDemoTeam && (
                  <span className="flex items-center gap-1 text-xs font-bold text-[var(--crimson)] bg-[var(--crimson-pale)] px-2.5 py-1 rounded-full">
                    <Flame className="w-3.5 h-3.5" /> Hot Streak
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
                {team.name}
              </h1>
              <p className="text-sm font-bold text-[var(--crimson)] uppercase tracking-wider mb-3">
                {team.nicheId?.name || "General Business"}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                {team.nicheId?.description || "A dedicated micro-agency participating in the GWD Orbit Simulator."}
              </p>
            </div>
          </div>

          {/* Right: Key Stats */}
          <div className="flex items-center gap-4 bg-[var(--surface-alt)] p-4 rounded-2xl border border-[var(--border)] min-w-[280px]">
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5" /> Total Points
              </div>
              <div className="text-2xl font-black text-[var(--text-primary)]">
                {team.totalScore || 0}
              </div>
            </div>
            <div className="w-px h-12 bg-[var(--border)]"></div>
            <div className="flex-1 pl-4">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5" /> Revenue
              </div>
              <div className="text-2xl font-black text-green-600">
                ₹{((team.totalRevenue || 0) / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Col (2 span): Squad Roster */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--crimson)]" /> Squad Roster
            </h2>
            <Badge variant="default" size="sm">{sortedMembers.length} Members</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedMembers.map((member: any) => {
              const isCaptain = team.captainId?._id === member._id;

              return (
                <div key={member._id} className="card p-5 border border-[var(--border)] hover:border-[var(--crimson)] transition-colors group relative overflow-hidden">
                  {isCaptain && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/20 rounded-bl-full flex items-start justify-end p-2 pointer-events-none">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--dark)] to-gray-600 text-white font-bold flex items-center justify-center text-sm shadow-md flex-shrink-0">
                      {member.avatar || member.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--crimson)] transition-colors">
                        {member.name}
                      </h3>
                      <div className="text-xs text-[var(--text-muted)] font-medium mb-3">
                        {isCaptain ? "Deal Architect (Captain)" : member.participantRole || "Participant"}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] font-bold bg-[var(--surface-alt)] px-2 py-1 rounded-md text-[var(--text-secondary)] border border-[var(--border)]">
                          <Trophy className="w-3 h-3 text-[var(--crimson)]" /> {member.orbitScore || 0} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (1 span): Verified Pipeline */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-[var(--crimson)]" /> Verified Delivery Pipeline
          </h2>

          <div className="card p-0 border border-[var(--border)] overflow-hidden bg-white">
            <div className="p-4 bg-[var(--surface-alt)] border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Closed Deals</span>
              <span className="w-6 h-6 rounded-full bg-[var(--crimson)] text-white text-xs font-bold flex items-center justify-center">
                {verifiedDeals.length}
              </span>
            </div>
            
            <div className="divide-y divide-[var(--border)]">
              {verifiedDeals.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No verified deals yet.
                </div>
              ) : (
                verifiedDeals.map((deal: any, i: number) => (
                  <div key={deal._id || i} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 
                        {deal.status === 'client_approved' || deal.status === 'client_delivered' ? 'Delivered' : 'Paid'}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-[var(--text-primary)] text-sm mb-0.5">
                      {deal.clientName}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">{deal.serviceType}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[var(--crimson)]">
                        ₹{((deal.gwdFinalDealValue || deal.dealValue || 0) / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
