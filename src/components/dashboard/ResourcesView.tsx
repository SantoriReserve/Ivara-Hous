import type { DashboardResource } from "@/lib/dashboard/resources";

type ResourcesViewProps = {
  resources: DashboardResource[];
};

export function ResourcesView({ resources }: ResourcesViewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {resources.map((resource) => (
        <article key={resource.id} className="flex flex-col border border-black/10 p-6">
          <p className="luxury-label mb-2 text-gray-muted">{resource.category}</p>
          <h3 className="font-serif text-xl font-normal tracking-tight text-black">
            {resource.title}
          </h3>
          <p className="mt-3 font-sans text-sm leading-relaxed text-gray-mid">
            {resource.description}
          </p>
          <ul className="mt-5 flex-1 space-y-2">
            {resource.items.map((item) => (
              <li key={item} className="flex gap-2 font-sans text-sm text-gray-mid">
                <span className="text-black">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-black/10 pt-4">
            <p className="luxury-label mb-1 text-gray-muted">Do today</p>
            <p className="font-sans text-sm text-black">{resource.doToday}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
