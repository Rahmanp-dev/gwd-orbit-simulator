"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, TrendingUp, Users, Zap, ArrowRight } from "lucide-react";
import { formatINRCompact } from "@/lib/utils";

/* Mono numerals (stats + scores) — Geist Mono via the --mono token */
const MN = { fontFamily: "var(--mono, 'Geist Mono', monospace)" } as const;
const M = { fontFamily: "var(--mono, 'Geist Mono', monospace)" };

interface TeamRow {
  _id: string; name: string; emoji: string;
  totalScore: number; totalRevenue: number; totalDeals: number;
  nicheId?: { name: string; icon: string };
}
interface EventState { currentDay: number; totalDays: number; }

export default function LiveEventStats() {
  const [teams, setTeams] = useState<TeamRow[] | null>(null);
  const [event, setEvent] = useState<EventState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const [lb, ev] = await Promise.all([
          fetch("/api/leaderboard?type=team").then(r => r.json()),
          fetch("/api/admin/event").then(r => r.json()).catch(() => null),
        ]);
        if (dead) return;
        if (lb?.leaderboard) setTeams(lb.leaderboard.slice(0, 3));
        if (ev?.event) setEvent({ currentDay: ev.event.currentDay ?? 4, totalDays: ev.event.totalDays ?? 9 });
      } catch { if (!dead) setFailed(true); }
    })();
    return () => { dead = true; };
  }, []);

  const top3 = teams?.slice(0, 3) ?? [];
  const totalRevenue = teams?.reduce((s, t) => s + (t.totalRevenue || 0), 0) ?? 0;
  const totalDeals   = teams?.reduce((s, t) => s + (t.totalDeals || 0), 0) ?? 0;

  if (!teams && !failed) return (
    <div className="space-y-3">
      {[72, 56, 48].map(h => (
        <div key={h} className="skel" style={{ height: h }} />
      ))}
    </div>
  );
  if (failed) return null;

  const day = event?.currentDay ?? 4;
  const total = event?.totalDays ?? 9;
  const pct = Math.round((day / total) * 100);

  return (
    <div>
      {/* Day progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-[#DC2626]">
          <span className="live-ring" style={{ transform: "scale(0.8)" }} />
          Day {day} of {total}
        </span>
        <span className="text-[11px] text-[#A1A1AA]" style={M}>{pct}% complete</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#F4F4F5] mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width:`${pct}%`, background:"linear-gradient(90deg,#DC2626,#EF4444)" }}
        />
      </div>

      {/* 4 stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {[
          { icon:Users,      val: teams ? `${teams.length}` : "—",               label:"Teams",   c:"#2563EB", bg:"#EFF6FF" },
          { icon:Zap,        val: totalDeals ? `${totalDeals}` : "—",            label:"Deals",   c:"#D97706", bg:"#FFFBEB" },
          { icon:TrendingUp, val: totalRevenue ? formatINRCompact(totalRevenue) : "—", label:"Revenue", c:"#059669", bg:"#ECFDF5" },
          { icon:Trophy,     val: top3[0]?.name.split(" ")[0] ?? "—",            label:"Leader",  c:"#DC2626", bg:"#FFF5F5" },
        ].map(({ icon:Ic, val, label, c, bg }) => (
          <div key={label} className="rounded-xl p-3.5 border" style={{ background:bg, borderColor:`${c}18` }}>
            <Ic className="w-3.5 h-3.5 mb-2" style={{ color:c }} strokeWidth={2} />
            <div className="text-[18px] font-bold text-[#0F0F0F] tracking-tight tnum" style={MN}>{val}</div>
            <div className="text-[10px] text-[#A1A1AA] uppercase tracking-[0.1em] mt-0.5" style={M}>{label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      {top3.length >= 2 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor:"#E4E4E7" }}>
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background:"#FAFAFA", borderBottom:"1px solid #F4F4F5" }}
          >
            <span className="text-[12px] font-semibold text-[#3F3F3F] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
              Top Teams
            </span>
            <Link href="/leaderboard" className="text-[11px] text-[#DC2626] hover:underline flex items-center gap-0.5" style={M}>
              Full rankings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#F4F4F5] bg-white">
            {top3.map((t, i) => (
              <div key={t._id} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    ...M,
                    background: i === 0 ? "#FEE2E2" : "#F4F4F5",
                    color: i === 0 ? "#DC2626" : "#A1A1AA",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-base flex-shrink-0">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#0F0F0F] truncate">{t.name}</div>
                  {t.nicheId && (
                    <div className="text-[10px] text-[#A1A1AA]" style={M}>{t.nicheId.icon} {t.nicheId.name}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#DC2626] tnum" style={MN}>{t.totalScore}</div>
                  <div className="text-[10px] text-[#A1A1AA]" style={M}>{formatINRCompact(t.totalRevenue||0)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
