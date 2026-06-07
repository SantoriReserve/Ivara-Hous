import { CopyButton } from "@/components/dashboard/CopyButton";
import type { PitchTemplate } from "@/lib/dashboard/pitch-templates";

type PitchTemplatesViewProps = {
  templates: PitchTemplate[];
};

export function PitchTemplatesView({ templates }: PitchTemplatesViewProps) {
  return (
    <div className="space-y-8">
      {templates.map((template) => (
        <article key={template.id} id={template.id} className="scroll-mt-8 border border-black/10 bg-white">
          <div className="border-b border-black/10 p-6">
            <p className="luxury-label mb-2 text-gray-muted">Pitch Template</p>
            <h3 className="font-serif text-2xl font-normal tracking-tight text-black">
              {template.title}
            </h3>
            <p className="mt-2 font-sans text-sm text-gray-mid">{template.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-black/10 px-2 py-0.5 font-sans text-[10px] uppercase tracking-nav text-gray-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div className="border border-black bg-black p-4 text-white">
              <p className="luxury-label mb-2 text-white/60">Send today</p>
              <p className="font-sans text-sm">{template.sendToday}</p>
            </div>
            <div className="border border-black/10 bg-black/5 p-4">
              <p className="luxury-label mb-2 text-gray-muted">Personalize before sending</p>
              <p className="font-sans text-sm text-black">{template.personalizeBeforeSending}</p>
            </div>
            {template.subject && (
              <div>
                <p className="luxury-label mb-2 text-gray-muted">Subject line</p>
                <p className="font-sans text-sm text-black">{template.subject}</p>
              </div>
            )}
            <div>
              <p className="luxury-label mb-2 text-gray-muted">Copy and paste</p>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-mid">
                {template.body}
              </pre>
            </div>
            <CopyButton text={template.subject ? `Subject: ${template.subject}\n\n${template.body}` : template.body} />
          </div>
        </article>
      ))}
    </div>
  );
}
