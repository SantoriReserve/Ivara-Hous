const FAQ_ITEMS = [
  {
    question: "Who is this for?",
    answer:
      "Emerging and aspiring travel, lifestyle, hospitality, and luxury creators who want a structured system to build positioning, portfolio strength, and partnership readiness.",
  },
  {
    question: "Do I need previous experience?",
    answer:
      "No. The plan is personalized to your current stage based on your assessment responses — whether you are just starting or already publishing consistently.",
  },
  {
    question: "Do I need a portfolio?",
    answer:
      "Not yet. The plan includes portfolio development guidance and daily actions to help you build one as you progress.",
  },
  {
    question: "Can beginners use this?",
    answer:
      "Yes. Beginners receive foundational positioning, content, and outreach steps designed for long-term creator growth.",
  },
  {
    question: "How long does it take?",
    answer:
      "The system is structured across 40 days of guided action, but you work at your own pace with no deadlines.",
  },
  {
    question: "Can I complete it at my own pace?",
    answer:
      "Absolutely. There are no expiration dates or pressure timelines — move through your plan when it fits your schedule.",
  },
  {
    question: "When do I receive dashboard access?",
    answer:
      "Immediately after purchase. Create your account, and your personalized dashboard is available right away.",
  },
] as const;

export function PlanFaq() {
  return (
    <section className="border-t border-black/10 py-section sm:py-section-md lg:py-section-xl">
      <div className="luxury-container max-w-3xl">
        <p className="luxury-label mb-5">FAQ</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
          Common Questions
        </h2>
        <dl className="mt-12 space-y-8">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="border-b border-black/10 pb-8 last:border-0">
              <dt className="font-sans text-sm font-medium text-black">{item.question}</dt>
              <dd className="mt-3 font-sans text-sm leading-relaxed text-gray-mid">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
