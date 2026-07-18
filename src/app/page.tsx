"use client";

import Link from "next/link";
import {
  Rocket, Trophy, Target, Zap, ArrowRight, ChevronDown,
  ShieldCheck, Clock, Handshake, Code2, Palette, TrendingUp,
  BadgeCheck, Users, Flame, Star, Check, MapPin, ChevronRight,
} from "lucide-react";
import LiveEventStats from "@/components/landing/LiveEventStats";
import Reveal from "@/components/landing/Reveal";
import { useSession } from "next-auth/react";

/* ═══════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════ */
function Nav() {
  const { data: session } = useSession();
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-white/85 backdrop-blur-xl border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-[var(--shadow-red)]" style={{ background: "var(--crimson)" }}>
            <Rocket className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold text-[var(--ink)] tracking-tight">
            GWD <span className="text-[var(--crimson)]">Orbit</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {[["#how","How it works"],["#prizes","Prizes"],["#roles","Roles"],["#faq","FAQ"]].map(([h,l])=>(
            <a key={h} href={h} className="text-[13px] text-[var(--text-muted)] hover:text-[var(--ink)] transition-colors font-medium">
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <Link href={(session.user as any)?.role === 'admin' ? '/admin/health' : '/dashboard'} className="btn-red text-[13px] !py-2 !px-4">
              Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--ink)] transition-colors px-3 py-2">
                Log in
              </Link>
              <Link href="/register" className="btn-red text-[13px] !py-2 !px-4">
                Register
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO — editorial split layout
═══════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="hero-mesh pt-14 min-h-screen flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 grid lg:grid-cols-[1fr_420px] gap-12 xl:gap-20 items-center py-20">

        {/* ── Left column — editorial headline ── */}
        <div>
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 mb-7">
            <span className="pill pill-red">
              <span className="live-ring" />
              Live Simulation
            </span>
            <span className="text-[12px] text-[var(--ink-4)] font-medium font-mono">BizSim 2026</span>
          </div>

          {/* Headline — Instrument Serif, editorial gravitas */}
          <h1 className="text-[clamp(2.8rem,6vw,4.8rem)] font-display text-[var(--ink)] mb-6" style={{ lineHeight: "1.02" }}>
            Close real deals.
            <br />
            <em className="not-italic text-shimmer">Win real money.</em>
          </h1>

          {/* Sub */}
          <p className="text-[17px] text-[var(--text-secondary)] mb-9 max-w-[480px] leading-[1.7]">
            9 days. 150+ participants. Real SMB leads, real proposals, real payments.
            The winning team takes home{" "}
            <span className="font-semibold text-[var(--ink)]">₹1.2 Lakh</span>{" "}
            and a founding position in GWD Orbit.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-10">
            <Link href="/register" className="btn-red">
              Register for ₹799
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/leaderboard" className="btn-border">
              <Trophy className="w-4 h-4" />
              Live Leaderboard
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-x-6 gap-y-2.5">
            {[
              { icon: ShieldCheck, text: "Razorpay payments",   c:"var(--success)" },
              { icon: BadgeCheck,  text: "GWD verified leads",  c:"var(--success)" },
              { icon: MapPin,      text: "Hyderabad",           c:"var(--text-muted)" },
              { icon: Clock,       text: "9-day live event",    c:"#2563EB" },
            ].map(({ icon:Ic, text, c }) => (
              <span key={text} className="flex items-center gap-1.5 text-[12px] text-[var(--ink-4)] font-medium">
                <Ic className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c }} strokeWidth={2} />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right column — Live Dashboard card ── */}
        <div id="live" className="w-full">
          <div className="w-full rounded-2xl overflow-hidden border border-[var(--line)] shadow-[var(--shadow-lg)]">
            {/* Panel header — faux browser chrome */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--line)] bg-[var(--surface-alt)]">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <span className="text-[12px] font-medium text-[var(--ink-4)] ml-1 font-mono">
                  orbit-dashboard.live
                </span>
              </div>
              <span className="pill pill-red !py-0.5 !px-2 !text-[10px]">
                <span className="live-ring" style={{ transform: "scale(0.8)" }} />
                LIVE
              </span>
            </div>

            {/* Panel body */}
            <div className="p-5 bg-white">
              <LiveEventStats />
            </div>
          </div>

          {/* Scroll hint */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-[11px] text-[var(--ink-4)] font-mono">
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            scroll to explore
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MARQUEE
═══════════════════════════════════════════════════════ */
function Ticker() {
  const items = [
    "₹1,20,000 in prizes","4 business niches","150+ participants",
    "Real Hyderabad SMBs","GWD verified leads","Founding Orbit positions",
    "9 live business days","CII · CIES judging",
  ];
  return (
    <div className="py-3.5 overflow-hidden bg-[var(--dark)] border-y border-white/5">
      <div className="marquee-track">
        {[0,1].map(dup => (
          <div key={dup} className="flex items-center">
            {items.map(t => (
              <span key={t+dup} className="flex items-center">
                <span className="text-[12px] font-medium text-white/55 px-7 whitespace-nowrap tracking-wide">
                  {t}
                </span>
                <span className="text-[var(--crimson)] text-[10px]">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WHAT IS BIZSIM
═══════════════════════════════════════════════════════ */
function WhatIs() {
  const cards = [
    {
      icon: Target, title: "Real Leads", sub: "Verified pipeline",
      body: "Each team gets 50+ verified local business leads — dental clinics, boutiques, restaurants — that genuinely need digital services.",
      color: "var(--crimson)", bg: "var(--crimson-bg)",
    },
    {
      icon: TrendingUp, title: "Real Revenue", sub: "₹10K–₹50K per deal",
      body: "Close deals worth ₹10K–₹50K each. Your team earns real money. BizSim tracks every conversation, proposal, and payment in real time.",
      color: "#2563EB", bg: "#EFF6FF",
    },
    {
      icon: Rocket, title: "Real Career", sub: "Founding Orbit offer",
      body: "Top 20 performers get Founding Operator positions in GWD Orbit — an AI-powered freelance ecosystem with transparent revenue splits.",
      color: "var(--success)", bg: "var(--success-pale)",
    },
  ];

  return (
    <section className="py-28 bg-[var(--surface-alt)]" id="what">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <span className="section-tag">About</span>
          <h2 className="text-[clamp(1.9rem,3.5vw,3rem)] mb-4 max-w-xl">
            Not a hackathon. <em className="not-italic text-[var(--crimson)]">Not a workshop.</em>
          </h2>
          <p className="text-[16px] text-[var(--text-secondary)] max-w-lg mb-14 leading-relaxed">
            BizSim gives you real leads, real tools, and 9 days to prove you can sell, build, and deliver.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <Reveal key={c.title} className={`delay-${(i+1)*100}`}>
              <div className="card group cursor-default h-full">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform"
                  style={{ background: c.bg }}
                >
                  <c.icon className="w-5 h-5" style={{ color: c.color }} strokeWidth={1.75} />
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-2 font-mono" style={{ color: c.color }}>
                  {c.sub}
                </div>
                <h3 className="text-[18px] font-bold font-sans mb-3 text-[var(--ink)] tracking-tight">{c.title}</h3>
                <p className="text-[14px] text-[var(--text-muted)] leading-[1.65]">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      n: "01", day: "Day 1", title: "Launch",
      color: "var(--crimson)",
      items: ["Opening ceremony & niche reveal","Lead packets distributed","Teams locked in","Clock starts"],
    },
    {
      n: "02", day: "Days 2–8", title: "The Grind",
      color: "#2563EB",
      items: ["Daily 9 AM briefing","Cold calling & pitching","Deals submitted & verified","Live leaderboard moves"],
    },
    {
      n: "03", day: "Day 9", title: "Grand Finale",
      color: "#B45309",
      items: ["Clock stops at noon","Top 3 present to judges","Awards ceremony","Prizes & Orbit offers"],
    },
  ];

  return (
    <section className="py-28 bg-white" id="how">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <span className="section-tag">Timeline</span>
          <h2 className="text-[clamp(1.9rem,3.5vw,3rem)] mb-14">
            The 9-day <em className="not-italic text-[var(--crimson)]">simulation</em>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.n} className={`delay-${(i+1)*100}`}>
              <div className="rounded-2xl p-8 h-full border border-[var(--line)] bg-white shadow-[var(--shadow-xs)]">
                {/* Step number */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span
                    className="text-[44px] font-bold font-display leading-none"
                    style={{ color: `${s.color}1A` }}
                  >
                    {s.n}
                  </span>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] font-mono" style={{ color: s.color }}>
                      {s.day}
                    </div>
                    <div className="text-[20px] font-bold font-sans text-[var(--ink)] leading-tight tracking-tight">
                      {s.title}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[var(--line)] mb-5" />

                <ul className="space-y-3">
                  {s.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-[var(--text-secondary)]">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: s.color }} strokeWidth={2.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SCORING
═══════════════════════════════════════════════════════ */
function Scoring() {
  const rows = [
    { action:"Lead Contacted",       pts:"+1",   pts_n:1   },
    { action:"Discovery Call",       pts:"+8",   pts_n:8   },
    { action:"Live Demo Sent",       pts:"+10",  pts_n:10  },
    { action:"Proposal Sent",        pts:"+15",  pts_n:15  },
    { action:"Meeting Booked",       pts:"+20",  pts_n:20  },
    { action:"Deal Closed (verbal)", pts:"+30",  pts_n:30  },
    { action:"Deal Closed (₹)",      pts:"+50",  pts_n:50  },
    { action:"Wild Card — Day 7",    pts:"+200", pts_n:200 },
  ];

  return (
    <section className="py-28 bg-[var(--surface-alt)]">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <span className="section-tag">Score System</span>
          <h2 className="text-[clamp(1.9rem,3.5vw,3rem)] mb-4">
            Every action <em className="not-italic text-[var(--crimson)]">earns points</em>
          </h2>
          <p className="text-[16px] text-[var(--text-secondary)] max-w-md mb-12 leading-relaxed">
            The Orbit scoring engine tracks every step of the deal lifecycle in real time.
          </p>
        </Reveal>

        {/* Score table */}
        <Reveal className="rounded-2xl overflow-hidden border border-[var(--line)] shadow-[var(--shadow-sm)] bg-white">
          {rows.map((r, i) => {
            const pct = Math.round((r.pts_n / 200) * 100);
            const isWild = r.pts_n === 200;
            return (
              <div
                key={r.action}
                className="grid grid-cols-[1fr_90px_1fr] items-center gap-4 px-6 py-4"
                style={{
                  background: isWild ? "var(--crimson-bg)" : i % 2 === 0 ? "#fff" : "var(--surface-alt)",
                  borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none",
                }}
              >
                <span className="text-[13px] font-medium text-[var(--text-secondary)]">{r.action}</span>
                <span
                  className="text-[22px] font-bold text-center font-mono tnum"
                  style={{ color: isWild ? "var(--crimson)" : "var(--ink)" }}
                >
                  {r.pts}
                </span>
                <div className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: isWild
                        ? "linear-gradient(90deg, var(--crimson), #EF4444)"
                        : "linear-gradient(90deg, var(--line-d), var(--text-muted))",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRIZES
═══════════════════════════════════════════════════════ */
function Prizes() {
  const main = [
    {
      rank:"#1", title:"Grand Champion", prize:"₹50,000",
      perks:["Founding DA Position","Orbit Elite membership","1:1 with GWD CEO"],
      hero: true,
    },
    {
      rank:"#2", title:"Runner-Up", prize:"₹25,000",
      perks:["Pro Membership · 1 Year","Orbit Fast-track"],
      hero: false,
    },
    {
      rank:"#3", title:"Third Place", prize:"₹15,000",
      perks:["Pro Membership · 6 Months"],
      hero: false,
    },
  ];

  const specials = [
    { icon:Trophy,  title:"Best Closer",      prize:"₹15,000", c:"#B45309", bg:"var(--warning-pale)" },
    { icon:Flame,   title:"Best Pitch",       prize:"₹5,000",  c:"var(--crimson)", bg:"var(--crimson-bg)" },
    { icon:Star,    title:"Best Content",     prize:"₹5,000",  c:"#2563EB", bg:"#EFF6FF" },
    { icon:Users,   title:"People's Choice",  prize:"₹5,000",  c:"var(--success)", bg:"var(--success-pale)" },
  ];

  return (
    <section className="py-28 bg-white" id="prizes">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <span className="section-tag">Prizes</span>
          <h2 className="text-[clamp(1.9rem,3.5vw,3rem)] mb-4">
            ₹1,20,000 <em className="not-italic text-[var(--crimson)]">prize pool</em>
          </h2>
          <p className="text-[16px] text-[var(--text-secondary)] mb-14 max-w-sm leading-relaxed">
            India&apos;s largest prize pool for a student business competition.
          </p>
        </Reveal>

        {/* Main prizes */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {main.map((p, i) => (
            <Reveal key={p.rank} className={`delay-${(i+1)*100}`}>
              {p.hero ? (
                <div
                  className="rounded-2xl p-9 text-center h-full relative overflow-hidden bg-[var(--dark)]"
                  style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(200,16,46,0.15)" }}
                >
                  <div
                    className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle,rgba(200,16,46,0.40) 0%,transparent 70%)" }}
                  />
                  <div className="text-[10px] font-semibold tracking-[0.2em] mb-3 relative font-mono text-white/30">
                    RANK {p.rank}
                  </div>
                  <div className="text-[15px] font-bold text-white/75 mb-4 tracking-tight">{p.title}</div>
                  <div className="text-[clamp(2.8rem,5vw,4rem)] font-display text-white leading-none mb-6 relative">
                    {p.prize}
                  </div>
                  <ul className="space-y-2.5 relative">
                    {p.perks.map(pk => (
                      <li key={pk} className="flex items-center gap-2 justify-center text-[13px] text-white/55">
                        <Check className="w-3 h-3 text-white/30" strokeWidth={2.5} />
                        {pk}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-2xl p-9 text-center h-full border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
                  <div className="text-[10px] font-semibold tracking-[0.2em] mb-3 font-mono text-[var(--ink-4)]">
                    RANK {p.rank}
                  </div>
                  <div className="text-[15px] font-bold text-[var(--text-secondary)] mb-4 tracking-tight">{p.title}</div>
                  <div className="text-[clamp(2.8rem,5vw,4rem)] font-display leading-none mb-6 text-[var(--ink)]">
                    {p.prize}
                  </div>
                  <ul className="space-y-2.5">
                    {p.perks.map(pk => (
                      <li key={pk} className="flex items-center gap-2 justify-center text-[13px] text-[var(--text-muted)]">
                        <Check className="w-3 h-3 text-[var(--line-d)]" strokeWidth={2.5} />
                        {pk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Reveal>
          ))}
        </div>

        {/* Special awards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {specials.map((a, i) => (
            <Reveal key={a.title} className={`delay-${(i+1)*100}`}>
              <div
                className="rounded-xl p-6 text-center border transition-all hover:-translate-y-1 duration-200 h-full"
                style={{ background: a.bg, borderColor:`${a.c}1A` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background:`${a.c}15` }}>
                  <a.icon className="w-4.5 h-4.5" style={{ color: a.c }} strokeWidth={2} />
                </div>
                <div className="text-[12px] font-semibold text-[var(--text-secondary)] mb-1 tracking-tight">{a.title}</div>
                <div className="text-[16px] font-bold font-mono tnum" style={{ color: a.c }}>{a.prize}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ROLES
═══════════════════════════════════════════════════════ */
function Roles() {
  const roles = [
    { icon:Handshake, name:"Deal Architect",  desc:"Find leads, pitch, close deals",            c:"var(--crimson)", bg:"var(--crimson-bg)" },
    { icon:Target,    name:"Project Manager", desc:"Scope work, proposals, manage delivery",    c:"#B45309", bg:"var(--warning-pale)" },
    { icon:Code2,     name:"Developer",       desc:"Build websites, apps, preview pages",       c:"#2563EB", bg:"#EFF6FF" },
    { icon:Palette,   name:"Designer",        desc:"UI/UX, branding, social creatives",         c:"#7C3AED", bg:"#F5F3FF" },
    { icon:Zap,       name:"Wildcard",        desc:"Research, content, fills any gap",          c:"var(--success)", bg:"var(--success-pale)" },
  ];

  return (
    <section className="py-28 bg-[var(--surface-alt)]" id="roles">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <span className="section-tag">Team Roles</span>
          <h2 className="text-[clamp(1.9rem,3.5vw,3rem)] mb-4">
            5 roles. <em className="not-italic text-[var(--crimson)]">One team.</em>
          </h2>
          <p className="text-[16px] text-[var(--text-secondary)] mb-14">Teams of 5, balanced by role preference.</p>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-4">
          {roles.map((r, i) => (
            <Reveal key={r.name} className={`delay-${(i+1)*100}`}>
              <div className="group rounded-2xl p-7 text-center border border-[var(--line)] bg-white shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] h-full">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform" style={{ background: r.bg }}>
                  <r.icon className="w-5 h-5" style={{ color: r.c }} strokeWidth={1.75} />
                </div>
                <h3 className="text-[13px] font-bold mb-1.5 font-sans text-[var(--ink)] tracking-tight">{r.name}</h3>
                <p className="text-[11px] text-[var(--ink-4)] leading-relaxed">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════════ */
function FAQ() {
  const items = [
    { q:"Do I need sales experience?", a:"No. BizSim is designed for beginners. We provide AI tools, pitch templates, and mentor support. Most participants have zero prior sales experience." },
    { q:"Is the ₹799 registration fee refundable?", a:"No, but it covers your entire 9-day access — AI tools, lead packets, mentoring sessions, and the closing ceremony." },
    { q:"Can I participate remotely?", a:"Days 2–8 are fully online/hybrid. Day 1 (Opening) and Day 9 (Grand Finale) are in-person at the venue in Hyderabad." },
    { q:"What if my team doesn't close any deals?", a:"That's fine — you still earn points for conversations, meetings, and proposals. The skills you build are directly applicable to any career." },
    { q:"What is GWD Orbit?", a:"Orbit is GWD Global's AI-powered freelance ecosystem. Top BizSim performers get founding positions — earn through real project delivery with AI-generated leads." },
    { q:"How are teams formed?", a:"Teams of 5 are balanced by role: 1 DA, 1 PM, 1 Dev, 1 Designer, 1 Wildcard. You can also register as a pre-formed team." },
  ];

  return (
    <section className="py-28 bg-white" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <span className="section-tag">FAQ</span>
          <h2 className="text-[clamp(1.9rem,3.5vw,3rem)] mb-12">
            Common <em className="not-italic text-[var(--crimson)]">questions</em>
          </h2>
        </Reveal>

        <div className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
          {items.map((f, i) => (
            <Reveal key={f.q} className={i > 0 ? "delay-100" : ""}>
              <details className="group bg-white">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer select-none list-none">
                  <span className="text-[15px] font-semibold text-[var(--ink)] group-open:text-[var(--crimson)] transition-colors pr-4 tracking-tight">
                    {f.q}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[var(--ink-4)] flex-shrink-0 group-open:rotate-180 transition-transform" strokeWidth={2} />
                </summary>
                <div className="px-6 pb-5 text-[14px] text-[var(--text-muted)] leading-[1.7] border-t border-[var(--line)]">
                  {f.a}
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CTA BANNER
═══════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section className="py-28 bg-[var(--dark)] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background:"radial-gradient(ellipse 60% 70% at 50% 100%,rgba(200,16,46,0.22) 0%,transparent 65%)" }}
      />
      <div className="max-w-2xl mx-auto px-6 text-center relative">
        <Reveal>
          <div className="text-[12px] font-medium text-white/35 mb-6 font-mono">bizsim-2026.gwdorbit.com</div>
          <h2 className="text-[clamp(2.2rem,5.5vw,3.8rem)] font-display text-white mb-6" style={{ lineHeight: "1.05" }}>
            Ready to prove
            <br />
            <em className="not-italic text-[var(--crimson)]">you can sell?</em>
          </h2>
          <p className="text-[17px] text-white/45 mb-9 leading-[1.65]">
            150 seats. 9 days. One shot to launch your career in business.
          </p>
          <Link href="/register" className="btn-red !text-[15px] !py-3.5 !px-8">
            Register Now — ₹799
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="mt-6 text-[11px] text-white/25 font-mono">
            Secure payment via Razorpay · Limited to 150 participants
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-[var(--dark)] py-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--crimson)" }}>
            <Rocket className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-bold text-white/80 tracking-tight">BizSim by GWD Global</span>
        </div>
        <div className="text-[11px] text-white/25 font-mono">© 2026 GWD Global Pvt Ltd. All rights reserved.</div>
        <div className="flex gap-5 text-[12px] text-white/35">
          {["Terms","Privacy","Contact"].map(l=>(
            <a key={l} href="#" className="hover:text-white/70 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <Ticker />
      <WhatIs />
      <HowItWorks />
      <Scoring />
      <Prizes />
      <Roles />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
