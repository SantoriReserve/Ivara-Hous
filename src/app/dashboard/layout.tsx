import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getProfileByUserId } from "@/lib/auth/profile-repository";
import { userHasPaidDashboardAccess } from "@/lib/auth/require-paid-access";
import { getCurrentUser } from "@/lib/auth/require-user";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`${ROUTES.login}?next=${ROUTES.dashboard}`);
  }

  const hasAccess = await userHasPaidDashboardAccess(user.id);

  if (!hasAccess) {
    redirect(ROUTES.accessDenied);
  }

  const profile = await getProfileByUserId(user.id);

  return (
    <DashboardShell userEmail={user.email} userName={profile?.fullName}>
      {children}
    </DashboardShell>
  );
}
