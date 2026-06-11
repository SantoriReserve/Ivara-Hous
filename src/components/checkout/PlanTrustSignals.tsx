const TRUST_SIGNALS = [
  "Built for emerging creators",
  "No previous partnerships required",
  "Self-paced",
  "Instant access",
  "Personalized based on assessment responses",
  "Designed for long-term creator growth",
] as const;

export function PlanTrustSignals() {
  return (
    <section className="border-t border-black/10 bg-gray-light py-section sm:py-section-md lg:py-section-xl">
      <div className="luxury-container max-w-3xl">
        <p className="luxury-label mb-5">Why Creators Trust This Plan</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
          Premium, Practical, And Built For You
        </h2>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {TRUST_SIGNALS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-4 border border-black/10 bg-white p-5 font-sans text-sm text-black"
            >
              <span className="mt-2 h-px w-5 shrink-0 bg-black" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
