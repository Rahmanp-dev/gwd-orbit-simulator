/**
 * dealUtils.ts — Shared Deal data helpers
 * Centralises data masking and deal status display logic.
 */

/**
 * Strip sensitive GWD-internal fields from a deal document
 * before returning it to a participant-role API caller.
 */
export function maskDealForParticipant(deal: Record<string, unknown>): Record<string, unknown> {
  return {
    ...deal,
    clientPhone: deal.clientPhone ? "••• hidden by GWD Sales •••" : undefined,
    clientEmail: deal.clientEmail ? "••• hidden by GWD Sales •••" : undefined,
    gwdInternalNotes: undefined,
    gwdPaymentTransactionId: undefined,
  };
}

/** Human-readable label + badge variant for every DealStatus value */
export const DEAL_STATUS_META: Record<
  string,
  { label: string; variant: "success" | "warning" | "default" | "danger" | "info" }
> = {
  submitted:               { label: "Submitted",            variant: "warning"  },
  admin_pending_contact:   { label: "Awaiting GWD Contact", variant: "warning"  },
  gwd_contacted:           { label: "GWD Contacted",        variant: "info"     },
  proposal_sent:           { label: "Proposal Sent",        variant: "info"     },
  negotiating:             { label: "Negotiating",          variant: "warning"  },
  gwd_closed_paid:         { label: "Closed & Paid ✓",      variant: "success"  },
  lead_cold:               { label: "Cold Lead",            variant: "default"  },
  revision_requested:      { label: "Revision Requested",   variant: "warning"  },
  delivery_assigned:       { label: "Delivery Assigned",    variant: "info"     },
  delivery_in_progress:    { label: "In Progress",          variant: "info"     },
  delivery_qa_pass:        { label: "QA Passed ✓",          variant: "success"  },
  client_delivered:        { label: "Client Delivered",     variant: "success"  },
  client_approved:         { label: "Client Approved ⭐",   variant: "success"  },
  under_review:            { label: "Under Review",         variant: "default"  },
  approved:                { label: "Approved",             variant: "success"  },
  rejected:                { label: "Rejected",             variant: "danger"   },
};
