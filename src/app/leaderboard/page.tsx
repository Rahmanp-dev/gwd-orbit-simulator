"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Target,
  DollarSign,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLeaderboard, useEvent } from "@/hooks/useData";
import { formatINRCompact } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  deal_architect: "Deal Architect",
  project_manager: "Project Manager",
  developer: "Developer",
  designer: "Designer",
  wildcard: "Wildcard",
};

const D = { fontFamily: "'Space Grotesk', var(--font-display, sans-serif)" };
const M = { fontFamily: "'JetBrains Mono', var(--font-mono, monospace)" };

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"team" | "individual">("team");
  const { data: teamData, isLoading: teamLoading } = useLeaderboard("team");
  const { data: indivData, isLoading: indivLoading } = useLeaderboard("individual");
  const { data: eventData } = useEvent();

  const teams = teamData?.leaderboard || [];
  const individuals = indivData?.leaderboard || [];
  const event = eventData?.event;
  const currentDay = event?.currentDay ?? 4;
  const totalDays = event?.totalDays ?? 9;

  const isLoading = tab === "team" ? teamLoading : indivLoading;

  // Compute aggregate stats
  const totalTeams = teams.length;
  const totalDeals = teams.reduce((sum: number, t: any) => sum + (t.totalDeals || 0), 0);
  const totalRevenue = teams.reduce((sum: number, t: any) => sum + (t.totalRevenue || 0), 0);
  const daysRemaining = Math.max(0, totalDays - currentDay);

  // Top 3 for podium
  const top3 = teams.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-16 text-[#0F0F0F]">
      {/* ═══ HEADER ═══ */}
      <div className="bg-white border-b border-[#E4E4E7] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 min-h-[44px] text-[#71717A] hover:text-[#0F0F0F] transition-colors text-sm font-semibold active:scale-98"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2">
              <span className="pill pill-red" style={M}>
                <span className="live-ring" />
                Live · Day {currentDay} of {totalDays}
              </span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-[#0F0F0F]" style={D}>
              <span className="text-[#DC2626]" style={D}>BizSim</span> Leaderboard
            </h1>
            <p className="text-[#71717A] text-xs sm:text-sm font-medium" style={M}>Real-time rankings · Auto-refreshes every 15s</p>
          </div>

          {/* ═══ TOP 3 PODIUM (Light Theme) ═══ */}
          {!isLoading && teams.length >= 3 ? (
            <div className="flex items-end justify-center gap-3 sm:gap-6 mt-14 max-w-xl mx-auto">
              
              {/* 2nd Place */}
              <div className="flex-1 flex flex-col items-center transition-transform hover:-translate-y-1">
                <div className="text-2xl mb-1">🥈</div>
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-md ring-4 ring-[#E4E4E7] bg-white border border-[#D4D4D8]"
                >
                  {top3[1]?.emoji || "🏢"}
                </div>
                <div className="text-xs sm:text-sm font-bold mt-3 text-center line-clamp-1 w-full text-[#3F3F3F]" style={D}>
                  {top3[1]?.name}
                </div>
                <div className="text-[#DC2626] font-bold text-sm sm:text-base tracking-tight mt-0.5" style={M}>
                  {top3[1]?.totalScore} pts
                </div>
                <div className="w-full h-16 bg-gradient-to-t from-[#F4F4F5] to-transparent rounded-t-xl mt-3 border-t border-[#E4E4E7]" />
              </div>

              {/* 1st Place */}
              <div className="flex-1 flex flex-col items-center -mt-6 transition-transform hover:-translate-y-1">
                <div className="text-3xl mb-1">🥇</div>
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-lg ring-4 ring-[#FEF3C7] bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border border-[#F59E0B]"
                >
                  {top3[0]?.emoji || "🏢"}
                </div>
                <div className="text-sm sm:text-base font-bold mt-3 text-center line-clamp-1 w-full text-[#0F0F0F]" style={D}>
                  {top3[0]?.name}
                </div>
                <div className="text-[#DC2626] font-black text-base sm:text-lg tracking-tight mt-0.5" style={M}>
                  {top3[0]?.totalScore} pts
                </div>
                <div className="w-full h-24 bg-gradient-to-t from-[#FEF3C7]/40 to-transparent rounded-t-xl mt-3 border-t border-[#FEF3C7] shadow-sm" />
              </div>

              {/* 3rd Place */}
              <div className="flex-1 flex flex-col items-center transition-transform hover:-translate-y-1">
                <div className="text-2xl mb-1">🥉</div>
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-md ring-4 ring-[#FEE2E2] bg-white border border-[#FCA5A5]"
                >
                  {top3[2]?.emoji || "🏢"}
                </div>
                <div className="text-xs sm:text-sm font-bold mt-3 text-center line-clamp-1 w-full text-[#3F3F3F]" style={D}>
                  {top3[2]?.name}
                </div>
                <div className="text-[#DC2626] font-bold text-sm sm:text-base tracking-tight mt-0.5" style={M}>
                  {top3[2]?.totalScore} pts
                </div>
                <div className="w-full h-12 bg-gradient-to-t from-[#F4F4F5] to-transparent rounded-t-xl mt-3 border-t border-[#E4E4E7]" />
              </div>

            </div>
          ) : isLoading ? (
            <div className="flex justify-center mt-12 mb-8">
              <Loader2 className="w-8 h-8 text-[#DC2626] animate-spin" />
            </div>
          ) : null}
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 relative z-20">
        <div className="flex bg-white rounded-xl border border-[#E4E4E7] p-1 w-fit mx-auto shadow-sm">
          <button
            onClick={() => setTab("team")}
            className={`px-6 py-2 min-h-[38px] rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === "team" ? "bg-[#DC2626] text-white shadow-sm" : "text-[#71717A] hover:text-[#0F0F0F] active:scale-95"
            }`}
            style={D}
          >
            <Users className="w-4 h-4 inline" />
            Teams
          </button>
          <button
            onClick={() => setTab("individual")}
            className={`px-6 py-2 min-h-[38px] rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === "individual" ? "bg-[#DC2626] text-white shadow-sm" : "text-[#71717A] hover:text-[#0F0F0F] active:scale-95"
            }`}
            style={D}
          >
            <Trophy className="w-4 h-4 inline" />
            Individuals
          </button>
        </div>
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="max-w-6xl mx-auto px-6 py-8 animate-slide-up">
        {isLoading ? (
          <div className="card overflow-hidden border border-[#E4E4E7] shadow-sm p-6 space-y-3 bg-white">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : tab === "team" ? (
          <div className="card overflow-hidden border border-[#E4E4E7] shadow-sm bg-white p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-left text-xs font-bold text-[#71717A] uppercase tracking-wider font-mono">
                  <th className="p-4 w-16" style={M}>Rank</th>
                  <th className="p-4" style={D}>Team</th>
                  <th className="p-4 text-center hidden md:table-cell" style={D}>Niche</th>
                  <th className="p-4 text-right" style={D}>Score</th>
                  <th className="p-4 text-right hidden md:table-cell" style={D}>Deals</th>
                  <th className="p-4 text-right hidden lg:table-cell" style={D}>Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5]">
                {teams.map((team: any) => (
                  <tr key={team._id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="p-4">
                      <span 
                        className={`font-bold text-base sm:text-lg`} 
                        style={{ ...M, color: team.rank <= 3 ? "#DC2626" : "#A1A1AA" }}
                      >
                        {team.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{team.emoji}</span>
                        <span className="font-bold text-sm sm:text-base text-[#0F0F0F]" style={D}>{team.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center hidden md:table-cell">
                      <span 
                        className="text-xs font-semibold text-[#52525B] bg-[#FAFAFA] px-2.5 py-1 rounded-full border border-[#E4E4E7]"
                        style={M}
                      >
                        {team.nicheId?.icon || ""} {team.nicheId?.name || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-base sm:text-lg text-[#DC2626]" style={D}>{team.totalScore}</span>
                    </td>
                    <td className="p-4 text-right hidden md:table-cell font-mono text-sm text-[#52525B]" style={M}>
                      {team.totalDeals || 0}
                    </td>
                    <td className="p-4 text-right hidden lg:table-cell font-mono text-sm text-[#52525B]" style={M}>
                      {formatINRCompact(team.totalRevenue || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card overflow-hidden border border-[#E4E4E7] shadow-sm bg-white p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-left text-xs font-bold text-[#71717A] uppercase tracking-wider font-mono">
                  <th className="p-4 w-16" style={M}>Rank</th>
                  <th className="p-4" style={D}>Participant</th>
                  <th className="p-4 hidden md:table-cell" style={D}>Team</th>
                  <th className="p-4 hidden md:table-cell" style={D}>Role</th>
                  <th className="p-4 text-right" style={D}>Score</th>
                  <th className="p-4 text-right hidden md:table-cell" style={D}>Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5]">
                {individuals.map((person: any) => (
                  <tr key={person._id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="p-4">
                      <span 
                        className="font-bold text-base sm:text-lg" 
                        style={{ ...M, color: person.rank <= 3 ? "#DC2626" : "#A1A1AA" }}
                      >
                        {person.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#DC2626] bg-[#FFF5F5] border border-[#FCA5A5]"
                          style={M}
                        >
                          {person.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                        </div>
                        <span className="font-bold text-sm sm:text-base text-[#0F0F0F]" style={D}>{person.name}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm font-semibold text-[#52525B]" style={D}>
                      {person.teamId?.emoji} {person.teamId?.name || "—"}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <Badge variant="default" size="sm">
                        {ROLE_LABELS[person.participantRole] || person.participantRole}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-base sm:text-lg text-[#DC2626]" style={M}>
                      {person.orbitScore}
                    </td>
                    <td className="p-4 text-right hidden md:table-cell">
                      <Badge variant={person.tier === "partner" ? "success" : person.tier === "elite" ? "danger" : person.tier === "pro" ? "warning" : "default"} size="sm">
                        {person.tier}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Users, label: "Total Teams", value: totalTeams.toString() },
            { icon: Target, label: "Deals Closed", value: totalDeals.toString() },
            { icon: DollarSign, label: "Total Revenue", value: formatINRCompact(totalRevenue) },
            { icon: Trophy, label: "Days Remaining", value: daysRemaining.toString() },
          ].map((s) => (
            <div key={s.label} className="card p-5 flex items-center gap-3.5 hover:shadow-md transition-shadow bg-white">
              <div className="w-11 h-11 rounded-xl bg-[#FFF5F5] flex items-center justify-center border border-[#FFF5F5] shadow-2xs">
                <s.icon className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#0F0F0F]" style={D}>{s.value}</div>
                <div className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-wider" style={M}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
