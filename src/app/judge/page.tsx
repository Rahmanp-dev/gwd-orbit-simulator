"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import {
  Trophy,
  Award,
  Star,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sliders,
  Send,
  Loader2,
  Flag,
  Lock,
  MessageSquare,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export default function JudgePanelPage() {
  const { role } = useUserRole();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [scores, setScores] = useState({
    design: 5,
    technical: 5,
    pitch: 5,
    innovation: 5,
    scalability: 5,
  });
  const [nomination, setNomination] = useState("None");
  const [submitting, setSubmitting] = useState(false);
  const [judgeNotes, setJudgeNotes] = useState<Record<string, string>>({});
  const [conflictTeams, setConflictTeams] = useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/judge/reviews");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        if (data.submissions?.length > 0 && !selectedSub) {
          selectSubmission(data.submissions[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch submissions", err);
    } finally {
      setLoading(false);
    }
  };

  const selectSubmission = (sub: any) => {
    setSelectedSub(sub);
    // Initialize judgeNotes state for this submission
    setJudgeNotes((prev) => ({ ...prev, [sub.id]: sub.existingNote || "" }));
    
    if (sub.existingScore) {
      setScores({
        design: sub.existingScore.design,
        technical: sub.existingScore.technical,
        pitch: sub.existingScore.pitch,
        innovation: sub.existingScore.innovation,
        scalability: sub.existingScore.scalability,
      });
      setNomination(sub.existingScore.nomination || "None");
    } else {
      setScores({
        design: 5,
        technical: 5,
        pitch: 5,
        innovation: 5,
        scalability: 5,
      });
      setNomination("None");
    }
  };

  const totalScore = scores.design + scores.technical + scores.pitch + scores.innovation + scores.scalability;

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (selectedSub.scored) return; // Already locked
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/judge/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: selectedSub.id,
          teamId: selectedSub.teamId,
          scores,
          nomination,
          judgeNote: judgeNotes[selectedSub.id] || "",
        }),
      });
      
      if (res.ok) {
        setSuccessMsg(`Score locked for ${selectedSub.team}! (${totalScore}/50 pts)`);
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchSubmissions();
      } else {
        setSuccessMsg("Failed to submit score — please try again.");
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Network error submitting score.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConflict = (subId: string, teamName: string) => {
    if (!confirm(`Flag conflict of interest for team "${teamName}"? This will skip them from your evaluation queue.`)) return;
    setConflictTeams(prev => new Set([...prev, subId]));
  };

  // If not staff, DashboardLayout will handle the block visually, 
  // but we can return null to avoid unnecessary renders
  if (role !== "judge" && role !== "organizer" && role !== "admin") {
    // Actually, DashboardLayout shows its own fallback.
    // Let it render.
  }

  return (
    <DashboardLayout title="Judge Evaluation Panel" breadcrumbs={["Home", "Judge Panel"]}>
      {/* Top Banner */}
      <div className="bg-[var(--dark)] text-white rounded-3xl p-8 mb-8 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[var(--crimson)]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[var(--crimson)] rounded-full text-xs font-bold uppercase tracking-wider">
                Evaluation Committee Portal
              </span>
              <Badge variant="warning" size="sm">Dr. Suman & Vivek R. Access</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Deliverable Quality Scoring Board
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mt-2 leading-relaxed">
              Evaluate verified client deliverables on design rigor, technical Lighthouse performance, commercial scalability, and value proposition. Your scores determine the special ₹1,20,000 cash award winners.
            </p>
          </div>

          <Link
            href="/finale"
            className="px-5 py-3 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" /> Go to Grand Finale Podiums →
          </Link>
        </div>
      </div>

      {/* Progress header */}
      {submissions.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-white border border-[var(--border)] flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {submissions.filter(s => s.scored).length} of {submissions.length} teams scored
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--surface-alt)] overflow-hidden">
              <div
                className="h-2 rounded-full bg-[var(--success)] transition-all"
                style={{ width: `${Math.round((submissions.filter(s => s.scored).length / submissions.length) * 100)}%` }}
              />
            </div>
          </div>
          {successMsg && (
            <span className="text-xs font-bold text-[var(--success)] bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
              ✓ {successMsg}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Submissions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">
              Deliverables for Review ({submissions.filter(s => !conflictTeams.has(s.id)).length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-2xl border flex flex-col items-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Loading deliverables...</p>
            </div>
          ) : submissions.length === 0 ? (
             <div className="p-8 text-center bg-white rounded-2xl border">
             <p className="text-sm text-gray-500">No deliverables submitted yet.</p>
           </div>
          ) : (
            submissions
              .filter(sub => !conflictTeams.has(sub.id))
              .map((sub) => (
              <div
                key={sub.id}
                onClick={() => selectSubmission(sub)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                  selectedSub?.id === sub.id
                    ? "border-[var(--crimson)] bg-white shadow-md ring-2 ring-[var(--crimson)]/10"
                    : "border-[var(--border)] bg-[var(--surface-alt)] hover:bg-white"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-[var(--crimson)]">{sub.team}</span>
                    {sub.scored && <Badge variant="success" size="sm">Scored ✓</Badge>}
                  </div>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{sub.client}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{sub.service}</p>
                  <div className="text-[11px] text-[var(--text-muted)] font-medium mt-2">
                    Closed Value: <strong className="text-[var(--text-primary)]">₹{(sub.revenue / 1000).toFixed(0)}K</strong>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConflict(sub.id, sub.team); }}
                    title="Flag conflict of interest"
                    className="text-[10px] text-[var(--text-muted)] hover:text-red-500 flex items-center gap-0.5 transition-colors"
                  >
                    <Flag className="w-3 h-3" /> COI
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 2 Cols: Evaluation Sheet & Sliders */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSub ? (
            <div className="card p-6 border border-[var(--border)] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
                <div>
                  <span className="text-xs font-bold text-[var(--crimson)] uppercase tracking-wider">Evaluation Sheet</span>
                  <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
                    {selectedSub.team} — {selectedSub.client}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    DA: <strong>{selectedSub.daOwner}</strong> &nbsp;•&nbsp; Lead Dev: <strong>{selectedSub.devOwner}</strong>
                  </p>
                </div>

                {selectedSub.previewUrl !== "#" && (
                  <a
                    href={selectedSub.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-[var(--dark)] text-white hover:bg-black rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs self-start sm:self-center"
                  >
                    <span>Preview Live Deliverable</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Locked overlay for already-scored submissions */}
              {selectedSub.scored && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-green-800">This submission is already scored and locked. Scores cannot be changed after submission.</span>
                </div>
              )}

              {/* Notes box */}
              <div className="my-6 p-4 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs">
                <strong className="text-[var(--text-primary)]">Deliverable Highlights:</strong>
                <p className="text-[var(--text-secondary)] mt-1 leading-relaxed">{selectedSub.notes}</p>
              </div>

              {/* Judge private notes */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  Your Private Notes (not shared with participants)
                </label>
                <textarea
                  rows={2}
                  value={judgeNotes[selectedSub.id] || ""}
                  onChange={(e) => setJudgeNotes(prev => ({ ...prev, [selectedSub.id]: e.target.value }))}
                  placeholder="Add internal notes for this submission..."
                  disabled={selectedSub.scored}
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Scoring Sliders Form */}
              <form onSubmit={handleScoreSubmit} className="space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[var(--crimson)]" /> Quality Dimension Scoring (1 - 10)
                  </h3>
                  <span className="text-lg font-black text-[var(--crimson)] bg-[var(--crimson-pale)] px-3 py-1 rounded-xl">
                    {totalScore} / 50 Total Points
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { key: "design", label: "Design & UI/UX Aesthetic (Modern, clean, rich layout)", value: scores.design },
                    { key: "technical", label: "Technical Speed & Responsiveness (Next.js & Lighthouse audit)", value: scores.technical },
                    { key: "pitch", label: "Value Proposition & Client Fit (Solves digital gap)", value: scores.pitch },
                    { key: "innovation", label: "Innovation & Micro-Interactions (Dynamic animations & CRM hooks)", value: scores.innovation },
                    { key: "scalability", label: "Commercial Scalability (Can be replicated across niche)", value: scores.scalability },
                  ].map((item) => (
                    <div key={item.key}>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-[var(--text-primary)]">{item.label}</span>
                        <span className="text-[var(--crimson)] text-sm font-black">{item.value} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={item.value}
                        disabled={selectedSub.scored}
                        onChange={(e) =>
                          setScores((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                        }
                        className="w-full accent-[var(--crimson)] cursor-pointer h-2 bg-[var(--surface-alt)] rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>

                {/* Special Award Nomination */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
                    Nominate for Special Award / Recognition
                  </label>
                  <select
                    value={nomination}
                    disabled={selectedSub.scored}
                    onChange={(e) => setNomination(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--crimson)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="None">No special nomination</option>
                    <option value="Best Deal Architect Award">🏆 Best Deal Architect Award (High conversion pitch)</option>
                    <option value="Fastest Execution Sprint">⚡ Fastest Execution Sprint (Delivered in under 12 hrs)</option>
                    <option value="Top Commercial Scalability">🌟 Top Commercial Scalability (Best micro-agency template)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-3">
                  {selectedSub.scored ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-5 py-3 rounded-xl">
                      <Lock className="w-4 h-4" /> Score Locked ✓
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-[var(--crimson)] hover:bg-[var(--crimson-dark)] disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-md"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Lock & Submit Score Sheet</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="card p-12 border border-[var(--border)] flex flex-col items-center justify-center text-center">
              <Award className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-500">Select a deliverable to review</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
