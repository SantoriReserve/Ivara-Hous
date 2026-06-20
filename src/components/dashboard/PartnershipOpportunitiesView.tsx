import Link from "next/link";
import { FallbackImage } from "@/components/dashboard/FallbackImage";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";
import {
  getPartnershipObjectPosition,
} from "@/lib/dashboard/dashboard-images";
import { OPPORTUNITY_IMAGE_FALLBACK } from "@/lib/dashboard/opportunity-images";
import type { ContactConfidence } from "@/lib/dashboard/partnership-contact-types";
import { UNAVAILABLE_LABEL } from "@/lib/dashboard/partnership-contact-types";
import {
  formatInstagramDisplay,
  formatWebsiteDisplay,
} from "@/lib/dashboard/partnership-result-utils";
import { ROUTES } from "@/lib/constants";

function partnershipBusinessId(opp: PartnershipOpportunity): string {
  if (opp.id.startsWith("curated-")) return opp.id.slice("curated-".length);
  if (opp.id.startsWith("pipeline-")) return opp.id.slice("pipeline-".length);
  return opp.id;
}

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

function ConfidenceBadge({ confidence }: { confidence: ContactConfidence }) {
  if (confidence === "unavailable") {
    return (
      <span className="ml-2 inline-block border border-black/10 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-nav text-gray-muted">
        Unavailable
      </span>
    );
  }

  return (
    <span
      className={`ml-2 inline-block px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-nav ${
        confidence === "verified" ? "bg-black text-white" : "border border-black/20 text-black"
      }`}
    >
      {confidence === "verified" ? "Verified" : "Likely"}
    </span>
  );
}

function ContactIntelligenceSection({ opp }: { opp: PartnershipOpportunity }) {
  const intel = opp.contactIntel;
  const websiteDisplay = formatWebsiteDisplay(opp.website);
  const instagramDisplay = formatInstagramDisplay(opp.instagram);
  const hasWebsite = websiteDisplay !== UNAVAILABLE_LABEL;
  const hasInstagram = instagramDisplay !== UNAVAILABLE_LABEL;

  return (
    <div className="space-y-3">
      <div>
        <p className="luxury-label mb-1 text-gray-muted">Best outreach path</p>
        <p className="font-sans text-sm text-black">{opp.contactWhere}</p>
      </div>

      <div>
        <p className="luxury-label mb-1 text-gray-muted">Official website</p>
        {hasWebsite && intel?.website ? (
          <p className="font-sans text-sm text-black">
            <a
              href={intel.website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-60"
            >
              {websiteDisplay.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
            <ConfidenceBadge confidence={intel.website.confidence} />
          </p>
        ) : (
          <p className="font-sans text-sm text-gray-mid">
            {UNAVAILABLE_LABEL}
            <ConfidenceBadge confidence="unavailable" />
          </p>
        )}
      </div>

      <div>
        <p className="luxury-label mb-1 text-gray-muted">Instagram</p>
        {hasInstagram && intel?.instagram ? (
          <p className="font-sans text-sm text-black">
            {instagramDisplay}
            <ConfidenceBadge confidence={intel.instagram.confidence} />
          </p>
        ) : (
          <p className="font-sans text-sm text-gray-mid">
            {UNAVAILABLE_LABEL}
            <ConfidenceBadge confidence="unavailable" />
          </p>
        )}
      </div>

      {intel && intel.emails.length > 0 && (
        <div>
          <p className="luxury-label mb-1 text-gray-muted">Email contacts</p>
          <ul className="space-y-1">
            {intel.emails.map((entry) => (
              <li key={entry.email} className="font-sans text-sm text-black">
                <a href={`mailto:${entry.email}`} className="underline hover:opacity-60">
                  {entry.email}
                </a>
                <span className="text-gray-mid"> · {entry.department}</span>
                <ConfidenceBadge confidence={entry.confidence} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {intel?.contactPerson && (
        <div>
          <p className="luxury-label mb-1 text-gray-muted">Contact person</p>
          <p className="font-sans text-sm text-black">
            {intel.contactPerson.title
              ? `${intel.contactPerson.name} — ${intel.contactPerson.title}`
              : intel.contactPerson.name}
            <ConfidenceBadge confidence={intel.contactPerson.confidence} />
          </p>
        </div>
      )}

      {intel?.phone && (
        <div>
          <p className="luxury-label mb-1 text-gray-muted">Phone</p>
          <p className="font-sans text-sm text-black">
            {intel.phone.number}
            <ConfidenceBadge confidence={intel.phone.confidence} />
          </p>
        </div>
      )}
    </div>
  );
}

function OpportunityCard({
  opp,
  showScores,
}: {
  opp: PartnershipOpportunity;
  showScores: boolean;
}) {
  const locationLabel = opp.searchLocation ?? opp.address?.split(",").slice(-2).join(", ").trim();

  return (
    <article className="group flex flex-col overflow-hidden border border-black/10 bg-white transition-all duration-luxury ease-luxury hover:border-black/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <FallbackImage
        src={opp.imageUrl}
        fallbackSrc={OPPORTUNITY_IMAGE_FALLBACK}
        alt={`${opp.businessName} — ${opp.category}`}
        objectPosition={getPartnershipObjectPosition(opp.category, partnershipBusinessId(opp))}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
      />

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="luxury-label mb-1 text-gray-muted">{opp.category}</p>
            <h3 className="font-serif text-xl font-normal tracking-tight text-black sm:text-2xl">
              {opp.businessName}
            </h3>
            {opp.source === "discovered" && (
              <p className="mt-1 font-sans text-[10px] uppercase tracking-nav text-gray-muted">
                Live discovery · Geoapify verified
              </p>
            )}
            {locationLabel && (
              <p className="mt-1 font-sans text-xs text-gray-mid">{locationLabel}</p>
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
            <p className="luxury-label mb-2 text-gray-muted">Contact intelligence</p>
            <ContactIntelligenceSection opp={opp} />
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
      <div className="grid gap-8 md:grid-cols-2">
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
            <div className="grid gap-8 md:grid-cols-2">
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
