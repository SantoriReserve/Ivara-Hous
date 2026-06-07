import Link from "next/link";
import { LearningInsightForm } from "@/components/dashboard/LearningInsightForm";
import type { DayFocus } from "@/lib/dashboard/day-focus";

type TodayFocusViewProps = {
  focus: DayFocus;
  dayNumber: number;
  savedLearningResponse?: string | null;
};

export function TodayFocusView({
  focus,
  dayNumber,
  savedLearningResponse,
}: TodayFocusViewProps) {
  return (
    <div className="space-y-6">
      <section className="border border-black bg-black p-6 text-white md:p-8">
        <p className="font-sans text-[10px] uppercase tracking-nav text-white/60">
          Today&apos;s Focus
        </p>
        <h3 className="mt-2 font-serif text-2xl md:text-3xl">{focus.mainObjective}</h3>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <FocusCard
          label="Content"
          title={focus.contentAssignment.title}
          description={focus.contentAssignment.description}
          href={focus.contentAssignment.href}
        />
        <FocusCard
          label="Outreach"
          title={focus.outreachAssignment.title}
          description={focus.outreachAssignment.description}
          href={focus.outreachAssignment.href}
        />
        <FocusCard
          label="Learn"
          title={focus.learningAssignment.title}
          description={focus.learningAssignment.description}
          href="#learning-insight"
          variant="muted"
        />
        <div className="border border-black/10 p-5">
          <p className="luxury-label mb-2 text-gray-muted">Reflect</p>
          <p className="font-sans text-sm leading-relaxed text-black">{focus.reflectPrompt}</p>
        </div>
      </div>

      <section id="learning-insight" className="border border-black/10 p-6">
        <p className="luxury-label mb-2 text-gray-muted">Industry Insight</p>
        <h3 className="font-serif text-xl text-black">{focus.learningAssignment.title}</h3>
        <p className="mt-2 font-sans text-sm text-gray-mid">
          {focus.learningAssignment.description}
        </p>
        <LearningInsightForm
          insightId={focus.learningAssignment.insightId}
          dayNumber={dayNumber}
          prompt={focus.learningAssignment.prompt}
          initialResponse={savedLearningResponse ?? ""}
        />
      </section>

      <section>
        <p className="luxury-label mb-4 text-gray-muted">Resources</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {focus.resources.map((resource) => (
            <Link
              key={resource.href}
              href={resource.href}
              className="group border border-black/10 p-4 transition-colors hover:border-black/30"
            >
              <p className="font-sans text-sm font-medium text-black group-hover:underline">
                {resource.label} →
              </p>
              <p className="mt-1 font-sans text-xs text-gray-mid">{resource.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function FocusCard({
  label,
  title,
  description,
  href,
  variant = "default",
}: {
  label: string;
  title: string;
  description: string;
  href: string;
  variant?: "default" | "muted";
}) {
  const isAnchor = href.startsWith("#");

  const content = (
    <>
      <p className="luxury-label mb-2 text-gray-muted">{label}</p>
      <p className="font-serif text-lg text-black">{title}</p>
      <p className="mt-2 font-sans text-sm text-gray-mid">{description}</p>
      {!isAnchor && (
        <span className="mt-3 inline-block font-sans text-xs uppercase tracking-nav text-black underline">
          Open →
        </span>
      )}
    </>
  );

  if (isAnchor) {
    return (
      <div
        className={`border p-5 ${variant === "muted" ? "border-black/10 bg-black/[0.02]" : "border-black/10"}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`block border p-5 transition-colors hover:border-black/30 ${variant === "muted" ? "border-black/10 bg-black/[0.02]" : "border-black/10"}`}
    >
      {content}
    </Link>
  );
}
