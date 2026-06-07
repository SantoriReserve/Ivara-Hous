import Image from "next/image";
import Link from "next/link";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";
import { ROUTES } from "@/lib/constants";

type PartnershipOpportunitiesViewProps = {
  opportunities: PartnershipOpportunity[];
  showScores?: boolean;
};

const PRIORITY_STYLES = {
  high: "bg-black text-white",
  medium: "border border-black/20 text-black",
  explore: "border border-black/10 text-gray-mid",
} as const;

function ScoreStars({ score }: { score: number }) {
  return (
    <span className="font-sans text-sm text-black" aria-label={`${score} of 5 stars`}>
      {"★".repeat(score)}
      <span className="text-black/20">{"★".repeat(5 - score)}</span>
    </span>
  );
}

export function PartnershipOpportunitiesView({
  opportunities,
  showScores = false,
}: PartnershipOpportunitiesViewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {opportunities.map((opp) => (
        <article
          key={opp.id}
          className="flex flex-col overflow-hidden border border-black/10"
        >
          <div className="relative aspect-[16/10] w-full bg-black/5">
            <Image
              src={opp.imageUrl}
              alt={`${opp.businessName} — ${opp.category}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="luxury-label mb-1 text-gray-muted">{opp.category}</p>
                <h3 className="font-serif text-xl font-normal tracking-tight text-black">
                  {opp.businessName}
                </h3>
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

            <p className="mt-3 font-sans text-sm leading-relaxed text-gray-mid">
              {opp.description}
            </p>

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

              <div>
                <p className="luxury-label mb-1 text-gray-muted">Contact</p>
                <p className="font-sans text-sm font-medium text-black">{opp.contactWhere}</p>
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
      ))}
    </div>
  );
}
