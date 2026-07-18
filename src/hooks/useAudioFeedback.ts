"use client";

import { useCallback } from "react";

/**
 * Web Audio API Sound Feedback Hook
 * Synthesizes lightweight, pleasant UI sound effects without external audio files.
 */
export function useAudioFeedback() {
  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, gainVal: number = 0.05) => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio context autoplay restrictions
    }
  }, []);

  const playSuccess = useCallback(() => {
    playTone(587.33, "sine", 0.15, 0.04); // D5
    setTimeout(() => playTone(880, "sine", 0.25, 0.05), 100); // A5
  }, [playTone]);

  const playMessage = useCallback(() => {
    playTone(783.99, "sine", 0.1, 0.03); // G5
  }, [playTone]);

  const playNotification = useCallback(() => {
    playTone(523.25, "triangle", 0.12, 0.04); // C5
    setTimeout(() => playTone(659.25, "triangle", 0.18, 0.04), 80); // E5
  }, [playTone]);

  return { playSuccess, playMessage, playNotification };
}
