import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatPercent } from "@/lib/admin/admin-format";
import { getAdminConversionMetrics } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import { ROUTES } from "@/lib/constants";

type ConversionPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminConversionPage({ searchParams }: ConversionPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const metrics = await getAdminConversionMetrics({ includeTestData });

  const funnel = [
    {
      label: "Visitors",
      value: metrics.visitorsLabel,
      detail: "Connect analytics when ready",
    },
    {
      label: "Free Assessments Started",
      value: String(metrics.assessmentsStarted),
    },
    {
      label: "Free Assessments Completed",
      value: String(metrics.assessmentsCompleted),
    },
    {
      label: "Purchased Creator Development Plan",
      value: String(metrics.purchased),
      href: `${ROUTES.adminCustomers}${includeTestData ? "?includeTestData=true" : ""}`,
    },
    {
      label: "Currently Active",
      value: String(metrics.currentlyActive),
      href: `${ROUTES.adminCustomers}?filter=active${includeTestData ? "&includeTestData=true" : ""}`,
    },
    {
      label: "Completed Program",
      value: String(metrics.completedProgram),
      href: `${ROUTES.adminCustomers}?filter=completed${includeTestData ? "&includeTestData=true" : ""}`,
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Conversion"
        title="Funnel Intelligence"
        description="Follow the path from free assessment to purchased plan to program completion."
      />

      <AdminMetricGrid
        metrics={[
          {
            label: "Assessment → Purchase",
            value: formatPercent(metrics.assessmentToPurchaseRate, 1),
          },
          {
            label: "Purchase → Active",
            value: formatPercent(metrics.purchaseToActiveRate, 1),
          },
          {
            label: "Active → Completed",
            value: formatPercent(metrics.activeToCompletedRate, 1),
          },
          {
            label: "Overall Funnel",
            value: formatPercent(metrics.overallFunnelRate, 1),
            detail: "Completed program ÷ assessments started",
          },
        ]}
      />

      <div className="space-y-3">
        {funnel.map((step, index) => {
          const card = (
            <div className="border border-black/10 p-6 transition-colors hover:border-black">
              <p className="luxury-label mb-2 text-gray-muted">
                Step {index + 1}
              </p>
              <p className="font-serif text-2xl text-black">{step.label}</p>
              <p className="mt-3 font-sans text-sm text-gray-mid">{step.value}</p>
              {step.detail ? (
                <p className="mt-2 font-sans text-xs text-gray-muted">{step.detail}</p>
              ) : null}
            </div>
          );

          return (
            <div key={step.label}>
              {step.href ? <a href={step.href}>{card}</a> : card}
              {index < funnel.length - 1 ? (
                <div className="flex justify-center py-2">
                  <span className="font-sans text-xs uppercase tracking-nav text-gray-muted">
                    ↓
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
