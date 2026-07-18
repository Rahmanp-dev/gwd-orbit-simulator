"use client";

import { useState, useEffect } from "react";
import { useEvent, useDeals, useTeams } from "@/hooks/useData";
import { formatINRCompact } from "@/lib/utils";
import { Flame, Trophy, DollarSign, Users, Clock, PauseCircle } from "lucide-react";

// Calculate a fake but consistent per-day deadline based on event start date
function getDayDeadlineTime(event?: { startDate?: string; currentDay?: number; totalDays?: number }): number {
  if (!event) return Date.now() + 8 * 3600000;
  const base = event.startDate ? new Date(event.startDate) : new Date();
  const dayIndex = (event.currentDay || 1) - 1;
  return base.getTime() + (dayIndex + 1) * 24 * 60 * 60 * 1000;
}

function useCountdown(targetTimeMs: number) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = targetTimeMs - Date.now();
      if (diff <= 0) {
        setTimeLeft((prev) => (prev?.h === 0 && prev?.m === 0 && prev?.s === 0 ? prev : { h: 0, m: 0, s: 0 }));
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft((prev) => (prev?.h === h && prev?.m === m && prev?.s === s ? prev : { h, m, s }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTimeMs]);

  return timeLeft;
}

export function EventTicker() {
  const { data: eventData } = useEvent();
  const { data: dealsData } = useDeals();
  const { data: teamsData } = useTeams();

  const event = eventData?.event;
  const deals = dealsData?.deals || [];
  const teams = (teamsData as any)?.teams || [];

  const deadlineMs = event ? getDayDeadlineTime(event) : 0;
  const timeLeft = useCountdown(deadlineMs);

  if (!event) return null;

  const isPaused = event.status === "paused";

  const closedDeals = deals.filter((d: any) =>
    ["gwd_closed_paid", "client_approved", "delivery_qa_pass"].includes(d.status)
  );

  const totalRevenue = closedDeals.reduce(
    (sum: number, d: any) => sum + (d.gwdFinalDealValue || d.dealValue || 0),
    0
  );

  const countdownStr = timeLeft
    ? `${String(timeLeft.h).padStart(2, "0")}:${String(timeLeft.m).padStart(2, "0")}:${String(timeLeft.s).padStart(2, "0")}`
    : "--:--:--";

  const isUrgent = timeLeft && timeLeft.h < 2;

  return (
    <div
      className={`text-white px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-mono flex items-center justify-between overflow-x-auto no-scrollbar border-b shadow-xs max-w-full ${
        isPaused
          ? "bg-amber-950 border-amber-700/50"
          : "bg-[var(--dark)] border-white/10"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 whitespace-nowrap min-w-0 flex-shrink-0">
        {isPaused ? (
          <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider animate-pulse">
            <PauseCircle className="w-3.5 h-3.5" />
            Event Paused
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[var(--crimson)] font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            Day {event.currentDay || 1} of {event.totalDays || 9}
          </span>
        )}
        <span className="text-white/30">•</span>
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <DollarSign className="w-3.5 h-3.5" />
          Revenue: {formatINRCompact(totalRevenue)}
        </span>
        <span className="text-white/30">•</span>
        <span className="flex items-center gap-1 text-amber-400 font-bold">
          <Trophy className="w-3.5 h-3.5" />
          Deals: {closedDeals.length}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-3 text-white/70 text-[11px] whitespace-nowrap">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 text-sky-400" />
          {teams.length} Teams
        </span>
        {!isPaused && (
          <span
            className={`flex items-center gap-1 font-bold ${
              isUrgent ? "text-rose-400 animate-pulse" : "text-white/70"
            }`}
          >
            <Clock className="w-3 h-3" />
            {countdownStr}
          </span>
        )}
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
            isPaused ? "bg-amber-700/50 text-amber-300" : "bg-white/10 text-white/70"
          }`}
        >
          {event.status}
        </span>
      </div>
    </div>
  );
}

export default EventTicker;
