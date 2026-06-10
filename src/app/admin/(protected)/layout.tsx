import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminUser } from "@/lib/admin/admin-auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminUser();
  return (
    <AdminShell userEmail={session.email} accessMode={session.mode}>
      {children}
    </AdminShell>
  );
}
