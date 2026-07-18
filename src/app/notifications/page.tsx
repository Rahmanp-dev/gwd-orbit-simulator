"use client";

import { useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Badge from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useNotifications } from "@/hooks/useData";
import { apiMutate } from "@/lib/api-client";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Trophy,
  Briefcase,
  Sparkles,
  CheckCheck,
  Inbox,
  ExternalLink,
  AlertCircle,
  Info,
} from "lucide-react";

const TYPE_META: Record<string, { icon: typeof Bell; color: string }> = {
  deal_approved: { icon: CheckCircle2, color: "text-emerald-500" },
  deal_rejected: { icon: AlertCircle, color: "text-red-500" },
  deal_submitted: { icon: Briefcase, color: "text-blue-500" },
  score: { icon: Trophy, color: "text-yellow-500" },
  system: { icon: Info, color: "text-[var(--text-muted)]" },
  broadcast: { icon: Sparkles, color: "text-purple-500" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { data, isLoading, mutate } = useNotifications();
  const { toast } = useToast();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markRead = useCallback(async (notificationId: string) => {
    await apiMutate("/api/notifications", { method: "PATCH", body: { action: "mark_read", notificationId } });
    mutate();
  }, [mutate]);

  const markAllRead = useCallback(async () => {
    const { error } = await apiMutate("/api/notifications", { method: "PATCH", body: { action: "mark_all_read" } });
    if (error) { toast.error(error); return; }
    toast.success("All notifications marked as read");
    mutate();
  }, [toast, mutate]);

  return (
    <DashboardLayout title="Notifications" breadcrumbs={["Home", "Notifications"]}>
      <div className="animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2.5 py-0.5 bg-[var(--crimson)] text-white text-xs font-mono font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Deals, scoring updates, and system alerts</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 min-h-[44px] text-xs font-bold text-[var(--crimson)] border border-[var(--crimson)]/20 rounded-xl hover:bg-[var(--crimson-pale)] transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>

        {/* Notification list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <Inbox className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <h3 className="font-bold text-lg text-[var(--text-primary)] font-display">No notifications yet</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Notifications will appear here when deals are updated or points are awarded.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: any) => {
              const meta = TYPE_META[notif.type] || TYPE_META.system;
              const Icon = meta.icon;
              return (
                <div
                  key={notif._id}
                  onClick={() => !notif.read && markRead(notif._id)}
                  className={`card p-4 flex items-start gap-4 transition-all cursor-pointer hover:bg-[var(--surface-alt)] ${
                    !notif.read ? "border-l-4 border-l-[var(--crimson)] bg-[var(--crimson-pale)]/30" : "opacity-80"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !notif.read ? "bg-[var(--crimson-pale)]" : "bg-[var(--surface-alt)]"
                  }`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-bold text-sm text-[var(--text-primary)]">{notif.title}</span>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-[var(--crimson)] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{timeAgo(notif.createdAt)}</span>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-[var(--crimson)] font-bold hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
