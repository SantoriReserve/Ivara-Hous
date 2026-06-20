import Image from "next/image";
import type { DashboardResource } from "@/lib/dashboard/resources";
import { getResourceImageUrl, getResourceObjectPosition } from "@/lib/dashboard/dashboard-images";

type ResourcesViewProps = {
  resources: DashboardResource[];
};

export function ResourcesView({ resources }: ResourcesViewProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {resources.map((resource) => (
        <article
          key={resource.id}
          className="group flex flex-col overflow-hidden border border-black/10 bg-white transition-all duration-luxury ease-luxury hover:border-black/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5">
            <Image
              src={getResourceImageUrl(resource.id)}
              alt=""
              fill
              className="object-cover transition-transform duration-luxury ease-luxury group-hover:scale-[1.03]"
              style={{ objectPosition: getResourceObjectPosition(resource.id) }}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <p className="luxury-label mb-2 text-gray-muted">{resource.category}</p>
            <h3 className="font-serif text-xl font-normal tracking-tight text-black sm:text-2xl">
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
          </div>
        </article>
      ))}
    </div>
  );
}
