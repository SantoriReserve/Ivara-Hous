import Link from "next/link";
import { FallbackImage } from "@/components/dashboard/FallbackImage";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";
import { OPPORTUNITY_IMAGE_FALLBACK } from "@/lib/dashboard/opportunity-images";
import { ROUTES } from "@/lib/constants";

type PartnershipOpportunitiesViewProps = {
  opportunities: PartnershipOpportunity[];
  showScores?: boolean;
  groupByTier?: boolean;
};

const PRIORITY_STYLES = {
  high: "bg-black text-white",
  medium: "border border-black/20 text-black",
  explore: "border border-black/10 text-gray-mid",
} as const;

const TIER_SECTIONS: Array<{ tier: 1 | 2 | 3; title: string; description: string }> = [
  {
    tier: 1,
    title: "Tier 1 — Easy Wins",
    description: "Local boutiques, independents, and small hospitality brands — best first outreach.",
  },
  {
    tier: 2,
    title: "Tier 2 — Established Partners",
    description: "Established hotels, restaurants, villas, and experience operators.",
  },
  {
    tier: 3,
    title: "Tier 3 — Luxury & Stretch",
    description: "Luxury brands, high-end resorts, and premium hospitality groups.",
  },
];

function ScoreStars({ score }: { score: number }) {
  return (
    <span className="font-sans text-sm text-black" aria-label={`${score} of 5 stars`}>
      {"★".repeat(score)}
      <span className="text-black/20">{"★".repeat(5 - score)}</span>
    </span>
  );
}

function OpportunityCard({
  opp,
  showScores,
}: {
  opp: PartnershipOpportunity;
  showScores: boolean;
}) {
  return (
    <article className="flex flex-col overflow-hidden border border-black/10">
      <FallbackImage
        src={opp.imageUrl}
        fallbackSrc={OPPORTUNITY_IMAGE_FALLBACK}
        alt={`${opp.businessName} — ${opp.category}`}
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="luxury-label mb-1 text-gray-muted">{opp.category}</p>
            <h3 className="font-serif text-xl font-normal tracking-tight text-black">
              {opp.businessName}
            </h3>
            {opp.source === "discovered" && (
              <p className="mt-1 font-sans text-[10px] uppercase tracking-nav text-gray-muted">
                Live discovery · verify Instagram before outreach
              </p>
            )}
          </div>
          <span
            className={`shrink-0 px-2 py-0.5 font-sans text-[10px] uppercase tracking-nav ${PRIORITY_STYLES[opp.priority]}`}
          >
            {opp.priority}
          </span>
        </div>

        {showScores && (
          <p className="mt-3 font-sans text-xs font-medium text-black">{opp.tierLabel}</p>
        )}

        <p className="mt-3 font-sans text-sm leading-relaxed text-gray-mid">{opp.description}</p>

        <div className="mt-4 space-y-3">
          <div>
            <p className="luxury-label mb-1 text-gray-muted">Why this matches you</p>
            <p className="font-sans text-sm text-black">{opp.whyYou}</p>
            <p className="mt-1 font-sans text-sm text-gray-mid">{opp.matchReason}</p>
          </div>

          {showScores && (
            <div className="grid grid-cols-3 gap-3 border border-black/10 p-4">
              <div>
                <p className="luxury-label mb-1 text-[10px] text-gray-muted">Opportunity</p>
                <ScoreStars score={opp.opportunityScore} />
              </div>
              <div>
                <p className="luxury-label mb-1 text-[10px] text-gray-muted">Difficulty</p>
                <ScoreStars score={opp.difficultyScore} />
              </div>
              <div>
                <p className="luxury-label mb-1 text-[10px] text-gray-muted">Value</p>
                <ScoreStars score={opp.valueScore} />
              </div>
            </div>
          )}

          <div className="border border-black/10 bg-black/5 p-4">
            <p className="luxury-label mb-2 text-gray-muted">Do today</p>
            <p className="font-sans text-sm leading-relaxed text-black">{opp.doToday}</p>
          </div>

          {opp.address && (
            <div>
              <p className="luxury-label mb-1 text-gray-muted">Address</p>
              <p className="font-sans text-sm text-black">{opp.address}</p>
            </div>
          )}

          <div>
            <p className="luxury-label mb-1 text-gray-muted">Contact</p>
            {opp.contactPerson && (
              <p className="font-sans text-sm text-black">{opp.contactPerson}</p>
            )}
            {opp.contactEmail && (
              <p className="font-sans text-sm font-medium text-black">
                <a href={`mailto:${opp.contactEmail}`} className="underline hover:opacity-60">
                  {opp.contactEmail}
                </a>
              </p>
            )}
            <p className="font-sans text-sm text-black">{opp.contactWhere}</p>
            <p className="mt-1 font-sans text-xs text-gray-mid">
              {opp.instagram}
              {opp.website.startsWith("http") ? (
                <>
                  {" · "}
                  <a
                    href={opp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-60"
                  >
                    {opp.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </>
              ) : (
                <> · {opp.website}</>
              )}
            </p>
          </div>

          <div>
            <p className="luxury-label mb-1 text-gray-muted">Recommended pitch</p>
            <p className="font-sans text-sm text-gray-mid">{opp.recommendedPitch}</p>
            <Link
              href={`${ROUTES.dashboardPitchTemplates}#${opp.pitchTemplateId}`}
              className="mt-2 inline-block font-sans text-sm font-medium text-black underline hover:opacity-60"
            >
              {opp.pitchTemplateTitle} →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PartnershipOpportunitiesView({
  opportunities,
  showScores = false,
  groupByTier = false,
}: PartnershipOpportunitiesViewProps) {
  if (!groupByTier) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} opp={opp} showScores={showScores} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {TIER_SECTIONS.map((section) => {
        const tierOpps = opportunities.filter((o) => o.partnershipTier === section.tier);
        if (tierOpps.length === 0) return null;
        return (
          <div key={section.tier} className="space-y-4">
            <div>
              <h4 className="font-serif text-xl text-black">{section.title}</h4>
              <p className="mt-1 font-sans text-sm text-gray-mid">{section.description}</p>
              <p className="mt-1 font-sans text-xs uppercase tracking-nav text-gray-muted">
                {tierOpps.length} opportunities
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {tierOpps.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} showScores={showScores} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
