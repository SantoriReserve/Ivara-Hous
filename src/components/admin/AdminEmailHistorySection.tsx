import { formatDateTime } from "@/lib/admin/admin-format";
import { labelEmailType } from "@/lib/admin/customer-insights";
import type { EmailDeliveryRecord } from "@/lib/email/email-delivery-repository";

export function AdminEmailHistorySection({ emails }: { emails: EmailDeliveryRecord[] }) {
  return (
    <section className="space-y-4 border border-black/10 p-6">
      <div>
        <h3 className="font-serif text-2xl text-black">Email History</h3>
        <p className="mt-2 font-sans text-sm text-gray-mid">
          Structured for future open/click tracking. Status reflects send delivery today.
        </p>
      </div>
      {emails.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10">
            <thead>
              <tr className="text-left font-sans text-xs uppercase tracking-nav text-gray-muted">
                <th className="px-3 py-2">Email Type</th>
                <th className="px-3 py-2">Date Sent</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Delivery</th>
                <th className="px-3 py-2">Opens</th>
                <th className="px-3 py-2">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {emails.map((email) => (
                <tr key={email.id}>
                  <td className="px-3 py-2 font-sans text-sm">{labelEmailType(email.emailType)}</td>
                  <td className="px-3 py-2 font-sans text-sm">{formatDateTime(email.createdAt)}</td>
                  <td className="px-3 py-2 font-sans text-sm capitalize">{email.status}</td>
                  <td className="px-3 py-2 font-sans text-sm">
                    {email.status === "sent" ? "Delivered to provider" : "Failed"}
                  </td>
                  <td className="px-3 py-2 font-sans text-sm text-gray-muted">—</td>
                  <td className="px-3 py-2 font-sans text-sm text-gray-muted">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-sans text-sm text-gray-mid">No emails recorded yet.</p>
      )}
    </section>
  );
}
