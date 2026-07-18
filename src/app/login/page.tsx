"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rocket, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-alt)] flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-[var(--crimson)] flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Orbit Simulator</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">
            Welcome back
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Sign in to your BizSim dashboard
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── One-Click Demo Credentials Card ────────────────────── */}
          <div className="mb-6 p-3.5 bg-white border border-[var(--border)] rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--crimson)]">
                ⚡ One-Click Demo Accounts
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Password: <code className="bg-[var(--surface-alt)] px-1 py-0.5 rounded font-mono font-bold text-[var(--text-primary)]">BizSim2026</code>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setEmail("organizer@gwd.global"); setPassword("BizSim2026"); }}
                className="flex flex-col items-start p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--crimson)] hover:bg-[var(--crimson-pale)] transition-all text-left"
              >
                <span className="text-xs font-bold text-[var(--text-primary)]">👑 CEO Pasha</span>
                <span className="text-[10px] text-[var(--text-muted)]">Organizer War Room</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("arjun@gwd.global"); setPassword("BizSim2026"); }}
                className="flex flex-col items-start p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--crimson)] hover:bg-[var(--crimson-pale)] transition-all text-left"
              >
                <span className="text-xs font-bold text-[var(--text-primary)]">🚀 Arjun Reddy</span>
                <span className="text-[10px] text-[var(--text-muted)]">Participant (DA Captain)</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("admin@gwd.global"); setPassword("BizSim2026"); }}
                className="flex flex-col items-start p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--crimson)] hover:bg-[var(--crimson-pale)] transition-all text-left"
              >
                <span className="text-xs font-bold text-[var(--text-primary)]">🛡️ Admin Officer</span>
                <span className="text-[10px] text-[var(--text-muted)]">Verification Queue</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("judge@gwd.global"); setPassword("BizSim2026"); }}
                className="flex flex-col items-start p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--crimson)] hover:bg-[var(--crimson-pale)] transition-all text-left"
              >
                <span className="text-xs font-bold text-[var(--text-primary)]">⚖️ CII CIES Chair</span>
                <span className="text-[10px] text-[var(--text-muted)]">Judge Rubric Panel</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--crimson)] text-white font-semibold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-[var(--text-secondary)] mt-6 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[var(--crimson)] font-semibold hover:underline">
              Register for BizSim
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-1 bg-[var(--dark)] items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold mb-4">
            Close Deals.
            <br />
            <span className="text-[var(--crimson)]">Win Prizes.</span>
            <br />
            Build Careers.
          </h2>
          <p className="text-gray-400">
            India&apos;s first live business simulation hackathon. 9 days of real sales,
            real revenue, and real opportunity.
          </p>
        </div>
      </div>
    </div>
  );
}
