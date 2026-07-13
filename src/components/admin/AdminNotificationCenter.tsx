import { formatDateTime } from "@/lib/admin/admin-format";
import type { AdminNotificationItem } from "@/lib/admin/admin-types";

export function AdminNotificationCenter({
  notifications,
}: {
  notifications: AdminNotificationItem[];
}) {
  return (
    <section className="border border-black/10 p-6">
      <p className="luxury-label mb-2 text-gray-muted">Notification Center</p>
      <h3 className="font-serif text-2xl text-black">Today&apos;s Command Signals</h3>
      {notifications.length ? (
        <ul className="mt-6 divide-y divide-black/10">
          {notifications.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-sans text-xs uppercase tracking-nav text-gray-muted">
                    {item.severity}
                  </p>
                  <p className="mt-1 font-sans text-sm text-black">{item.title}</p>
                  <p className="mt-1 font-sans text-sm text-gray-mid">{item.detail}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-xs text-gray-muted">
                    {formatDateTime(item.occurredAt)}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-2 inline-block font-sans text-xs uppercase tracking-nav text-gray-mid hover:text-black"
                    >
                      Open →
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 font-sans text-sm text-gray-mid">No urgent signals right now.</p>
      )}
    </section>
  );
}
