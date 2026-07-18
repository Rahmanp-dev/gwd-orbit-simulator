"use client";

import { signOut } from "next-auth/react";
import { ShieldAlert, LogOut } from "lucide-react";

export default function SuspendedPage() {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-[var(--surface-alt)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white border border-[var(--border)] rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          Account Suspended
        </h1>
        
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
          Your account has been suspended by the event administration. If you believe this is a mistake, or to request reinstatement, please contact the GWD Organizer team.
        </p>

        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white font-semibold transition-all duration-200 text-sm shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}
