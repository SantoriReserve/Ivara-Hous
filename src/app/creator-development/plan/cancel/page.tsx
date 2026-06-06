import { Suspense } from "react";
import { CreatorDevelopmentPlanCancelContent } from "@/components/checkout/CreatorDevelopmentPlanCancelContent";

export default function CreatorDevelopmentPlanCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="luxury-container py-section text-center font-sans text-sm text-gray-mid">
          Loading…
        </div>
      }
    >
      <CreatorDevelopmentPlanCancelContent />
    </Suspense>
  );
}
