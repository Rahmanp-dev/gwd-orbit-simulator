/**
 * Application constants for the Orbit Simulator
 */

export const NICHES = [
  { slug: "healthcare", name: "Healthcare", icon: "🏥", color: "#10B981", description: "Dental, Clinics, Dermatology, Pharmacy" },
  { slug: "fashion", name: "Fashion & Retail", icon: "👗", color: "#8B5CF6", description: "Boutiques, Jewellery, Apparel" },
  { slug: "realestate", name: "Real Estate & Interiors", icon: "🏠", color: "#F59E0B", description: "Interior Designers, Architects, Property" },
  { slug: "fnb", name: "F&B & Services", icon: "🍽️", color: "#EF4444", description: "Restaurants, Cafes, Salons, Fitness" },
] as const;

export const PARTICIPANT_ROLES = [
  { value: "deal_architect", label: "Deal Architect", description: "Find and close clients", icon: "Handshake" },
  { value: "project_manager", label: "Project Manager", description: "Scope, staff, and deliver projects", icon: "ClipboardList" },
  { value: "developer", label: "Developer", description: "Build websites, apps, systems", icon: "Code2" },
  { value: "designer", label: "Designer", description: "UI/UX, branding, social media", icon: "Palette" },
  { value: "wildcard", label: "Wildcard", description: "Research, content, fill gaps", icon: "Sparkles" },
] as const;

export const DEAL_STATUSES = {
  submitted: { label: "Submitted", color: "#F4A01C", bg: "#FFFBF0" },
  under_review: { label: "Under Review", color: "#3B82F6", bg: "#EFF6FF" },
  approved: { label: "Approved", color: "#2E7D32", bg: "#E8F5E9" },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEF2F2" },
  revision_requested: { label: "Revision Requested", color: "#9333EA", bg: "#F5F3FF" },
} as const;

export const LEAD_STATUSES = {
  available: { label: "Available", color: "#6C757D" },
  claimed: { label: "Claimed", color: "#3B82F6" },
  contacted: { label: "Contacted", color: "#F4A01C" },
  meeting_set: { label: "Meeting Set", color: "#8B5CF6" },
  proposal_sent: { label: "Proposal Sent", color: "#EC4899" },
  closed: { label: "Closed", color: "#2E7D32" },
  lost: { label: "Lost", color: "#DC2626" },
} as const;

export const DELIVERY_STATUSES = {
  not_started: { label: "Not Started", color: "#6C757D" },
  in_progress: { label: "In Progress", color: "#3B82F6" },
  delivered: { label: "Delivered", color: "#F4A01C" },
  client_approved: { label: "Client Approved", color: "#2E7D32" },
} as const;

export const EVENT_STATUSES = {
  draft: { label: "Draft", color: "#6C757D" },
  registration: { label: "Registration Open", color: "#3B82F6" },
  active: { label: "Live", color: "#2E7D32" },
  paused: { label: "Paused", color: "#F4A01C" },
  completed: { label: "Completed", color: "#111111" },
} as const;

export const AWARDS = [
  { name: "Grand Champion", emoji: "🥇", category: "team" as const, prize: "₹50,000 + Founding DA Position" },
  { name: "Runner-Up", emoji: "🥈", category: "team" as const, prize: "₹25,000 + Pro 1 Year" },
  { name: "Third Place", emoji: "🥉", category: "team" as const, prize: "₹15,000 + Pro 6 Months" },
  { name: "Best Individual Closer", emoji: "🏆", category: "individual" as const, prize: "₹15,000 + Orbit Elite" },
  { name: "Best Pitch", emoji: "🎯", category: "individual" as const, prize: "₹5,000" },
  { name: "Best Content Creator", emoji: "📹", category: "individual" as const, prize: "₹5,000" },
  { name: "People's Choice", emoji: "🌟", category: "individual" as const, prize: "₹5,000" },
] as const;

export const SIMULATION_DAYS = [
  { day: 1, name: "Launch", tagline: "Niche reveal. Lead list. Playbook. Teams form.", highlight: true },
  { day: 2, name: "First Contact", tagline: "Cold calls begin. Log every lead in CRM." },
  { day: 3, name: "Pitch Day", tagline: "Meetings. Proposals. Convert interest." },
  { day: 4, name: "Close or Lose", tagline: "First deals must be closed. Score updates live.", highlight: true },
  { day: 5, name: "Build", tagline: "Deliver projects while pitching new clients." },
  { day: 6, name: "Double Down", tagline: "Parallel: close more, deliver more." },
  { day: 7, name: "Wild Card", tagline: "Surprise challenge drops at 9am. 200 pts.", highlight: true },
  { day: 8, name: "Final Push", tagline: "Last deals. All projects delivered. Score locked." },
  { day: 9, name: "Grand Finale", tagline: "Winners. Prizes. Orbit offers to top 20.", finale: true },
] as const;
