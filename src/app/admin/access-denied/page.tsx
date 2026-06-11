import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import {
  getAdminAllowlist,
  getAdminAllowlistNormalized,
  getAdminAuthDiagnostics,
} from "@/lib/admin/admin-auth";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin Access Denied",
  robots: { index: false, follow: false },
};

export default async function AdminAccessDeniedPage() {
  const diagnostics = await getAdminAuthDiagnostics();
  const allowlist = getAdminAllowlist();
  const allowlistNormalized = getAdminAllowlistNormalized();

  return (
    <>
      <PageHero
        label="Admin"
        title="Access Denied"
        description={
          diagnostics
            ? "Your account is signed in, but it is not authorized for the Ivara Hous business command center."
            : "Enter the owner access code at /admin/gate, or sign in with an authorized business email."
        }
      />
      <section className="py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container mx-auto max-w-2xl space-y-6">
          {diagnostics ? (
            <div className="border border-black/10 p-6 font-sans text-sm text-gray-mid">
              <p className="luxury-label mb-4 text-gray-muted">Session Diagnostics</p>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs uppercase tracking-nav text-gray-muted">Signed-in email (auth.users)</dt>
                  <dd className="mt-1 text-black">{diagnostics.authUsersEmail}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-nav text-gray-muted">Normalized for comparison</dt>
                  <dd className="mt-1 text-black">{diagnostics.authUsersNormalized}</dd>
                </div>
                {diagnostics.profilesEmail ? (
                  <div>
                    <dt className="text-xs uppercase tracking-nav text-gray-muted">Profile email (profiles)</dt>
                    <dd className="mt-1 text-black">
                      {diagnostics.profilesEmail}
                      {diagnostics.profilesNormalized ? (
                        <span className="block text-gray-mid">
                          Normalized: {diagnostics.profilesNormalized}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-nav text-gray-muted">Authorized allowlist</dt>
                  <dd className="mt-1 text-black">{allowlist.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-nav text-gray-muted">Allowlist (normalized)</dt>
                  <dd className="mt-1 text-black">{allowlistNormalized.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-nav text-gray-muted">Comparison rules</dt>
                  <dd className="mt-1">
                    Case-insensitive · whitespace trimmed · Gmail dots/plus-tags normalized · checks
                    auth.users.email and profiles.email
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {!diagnostics ? (
              <Button href={`${ROUTES.adminGate}?next=${ROUTES.admin}`} variant="primary" size="lg">
                Enter Access Code
              </Button>
            ) : (
              <Link
                href={ROUTES.dashboard}
                className="inline-flex items-center border border-black bg-black px-6 py-3 font-sans text-xs uppercase tracking-nav text-white"
              >
                Go to Creator Dashboard
              </Link>
            )}
            <Button href={ROUTES.home} variant="secondary" size="lg">
              Return Home
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
