/**
 * useEventDay — fetches the current simulation day and event status from the API.
 * Used by Briefing, Timeline, Finale, and other day-aware pages.
 */
"use client";

import { useState, useEffect, useCallback } from "react";

interface EventDayState {
  currentDay: number;
  totalDays: number;
  status: string;
  demoMode: boolean;
  loading: boolean;
  error: string;
  refresh: () => void;
}

const DAY_LABELS: Record<number, string> = {
  1: "Orientation & Niche Reveal",
  2: "Lead Research & First Pitches",
  3: "Discovery Calls & Wireframes",
  4: "Close or Lose (Deadline Day)",
  5: "Delivery Sprint Begins",
  6: "QA & Client Review",
  7: "Presentation Prep",
  8: "Sponsor Showcase",
  9: "Grand Finale & Awards",
};

export function useEventDay(): EventDayState {
  const [currentDay, setCurrentDay] = useState(4); // Sensible fallback
  const [totalDays, setTotalDays] = useState(9);
  const [status, setStatus] = useState("active");
  const [demoMode, setDemoMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEventDay = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/event", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.event) {
          setCurrentDay(data.event.currentDay ?? 4);
          setTotalDays(data.event.totalDays ?? 9);
          setStatus(data.event.status ?? "active");
          setDemoMode(data.event.demoMode ?? true);
        }
      } else {
        setError("Could not load event status");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventDay();
  }, [fetchEventDay]);

  return {
    currentDay,
    totalDays,
    status,
    demoMode,
    loading,
    error,
    refresh: fetchEventDay,
  };
}

export { DAY_LABELS };
export default useEventDay;
