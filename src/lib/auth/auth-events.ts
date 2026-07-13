type AuthEventName =
  | "purchase.received"
  | "purchase.duplicate_ignored"
  | "user.provisioned"
  | "user.already_exists"
  | "purchase.linked"
  | "purchase.link_failed"
  | "password_setup.email_sent"
  | "password_setup.email_skipped"
  | "password_setup.email_failed"
  | "login.success"
  | "login.failure"
  | "password_reset.requested"
  | "password_reset.completed"
  | "password_reset.failed";

type AuthEventPayload = Record<string, string | number | boolean | null | undefined>;

/**
 * Structured production logs for auth/purchase debugging.
 * Grep Vercel logs by event name, e.g. `auth.event=login.failure`.
 */
export function logAuthEvent(event: AuthEventName, payload: AuthEventPayload = {}): void {
  const entry = {
    scope: "auth",
    event,
    ts: new Date().toISOString(),
    ...payload,
  };

  const line = `auth.event=${event} ${JSON.stringify(entry)}`;

  if (
    event.endsWith(".failed") ||
    event.endsWith(".failure") ||
    event === "purchase.link_failed" ||
    event === "password_setup.email_failed"
  ) {
    console.error(line);
    return;
  }

  console.log(line);
}
