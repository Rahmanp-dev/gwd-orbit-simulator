"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Rocket, Mail, Lock, User, Phone, GraduationCap, Link2, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { PARTICIPANT_ROLES } from "@/utils/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    linkedin: "",
    preferredRole: "deal_architect",
    skills: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);

  const update = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--surface-alt)] flex items-center justify-center px-6">
        <div className="card p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[var(--success-pale)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            You&apos;re In! 🎉
          </h2>
          <p className="text-[var(--text-secondary)]">
            Account created. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface-alt)] flex">
      {/* Left: Visual */}
      <div className="hidden lg:flex flex-1 bg-[var(--dark)] items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="text-6xl mb-6">⚡</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Join India&apos;s First
            <br />
            <span className="text-[var(--crimson)]">Live Business Simulation</span>
          </h2>
          <div className="space-y-3 mt-8">
            {["9 days of real business warfare", "50+ verified SMB leads per team", "₹1.2 Lakh prize pool", "Founding position in GWD Orbit"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[var(--crimson)] flex-shrink-0" />
                <span className="text-sm font-medium" style={{ color: '#D4D4D8' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <img src="/logo-red.png" alt="GWD Logo" className="h-10 w-auto object-contain" />
            <span className="font-bold text-xl tracking-tight">Orbit Simulator</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= s
                      ? "bg-[var(--crimson)] text-white"
                      : "bg-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-0.5 ${step >= 2 ? "bg-[var(--crimson)]" : "bg-[var(--border)]"}`} />
                )}
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-bold mb-2">
            {step === 1 ? "Create your account" : "Choose your role"}
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            {step === 1 ? "Step 1: Basic information" : "Step 2: Your BizSim role"}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Mohd Abdul Rahman"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full pl-10 pr-10 py-2.5 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 98765..."
                      className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">College</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={form.college}
                      onChange={(e) => update("college", e.target.value)}
                      placeholder="MJCET"
                      className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!form.name || !form.email || !form.password) {
                    setError("Please fill in all required fields");
                    return;
                  }
                  if (form.password.length < 8) {
                    setError("Password must be at least 8 characters");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--crimson)] text-white font-semibold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Preferred Role *</label>
                <div className="grid grid-cols-1 gap-2">
                  {PARTICIPANT_ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => update("preferredRole", role.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        form.preferredRole === role.value
                          ? "border-[var(--crimson)] bg-[var(--crimson-pale)]"
                          : "border-[var(--border)] hover:border-[var(--crimson)] bg-white"
                      }`}
                    >
                      <div className="font-semibold text-sm">{role.label}</div>
                      <div className="text-xs text-[var(--text-muted)]">{role.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">LinkedIn Profile</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="url"
                    value={form.linkedin}
                    onChange={(e) => update("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/yourname"
                    className="w-full pl-10 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-[var(--border)] text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--surface-alt)] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--crimson)] text-white font-semibold rounded-lg hover:bg-[var(--crimson-dark)] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="text-sm text-[var(--text-secondary)] mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--crimson)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
