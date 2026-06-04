import { useState, useEffect } from "react";
import { loadRetreatInquiries, type RetreatInquiry } from "@/utils/contentStore";

export function InquiriesTab() {
  const [inquiries, setInquiries] = useState<RetreatInquiry[]>([]);

  useEffect(() => { setInquiries(loadRetreatInquiries()); }, []);

  return (
    <article className="sia-card space-y-5">
      <h2 className="sia-h3">Retreat Form Inquiries</h2>
      {inquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No retreat inquiries submitted yet.</p>
      ) : (
        <div className="grid gap-3">
          {inquiries.slice().reverse().map((lead) => (
            <div key={lead.id} className="rounded-xl border border-border p-4 text-sm">
              <p className="font-semibold text-primary">{lead.fullName}</p>
              <p className="text-muted-foreground">{lead.email} · {lead.phone}</p>
              <p className="mt-1 text-muted-foreground">
                Retreat: {lead.preferredRetreat} · Participants: {lead.participants}
              </p>
              <p className="mt-2 text-foreground/90">{lead.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Submitted: {new Date(lead.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}