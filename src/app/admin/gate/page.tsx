import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPinForm } from "@/components/admin/AdminPinForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin Access",
  robots: { index: false, follow: false },
};

export default function AdminGatePage() {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-white lg:min-h-[calc(100vh-6rem)]">
      <div className="luxury-container flex min-h-[inherit] items-center justify-center py-16">
        <div className="w-full max-w-md border border-black/10 p-8 sm:p-10">
          <p className="luxury-label mb-3 text-gray-muted">Private Business Access</p>
          <h1 className="font-serif text-3xl text-black">{SITE_NAME} Admin</h1>
          <p className="mt-3 font-sans text-sm text-gray-mid">
            Enter your owner access code to open the business command center. This page is not
            linked publicly.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="font-sans text-sm text-gray-mid">Loading…</div>}>
              <AdminPinForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
