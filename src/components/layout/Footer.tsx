import Link from "next/link";
import { FOOTER_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-black text-white">
      <div className="luxury-container py-20 sm:py-24">
        <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <p className="font-serif text-2xl tracking-tight">{SITE_NAME}</p>
            <p className="mt-6 font-sans text-sm leading-[1.8] text-white/60">
              A luxury travel agency connecting creators, properties, and
              creative partners through curated partnerships worldwide.
            </p>
          </div>

          <div>
            <p className="luxury-label mb-8 text-white/40">Explore</p>
            <ul className="space-y-4">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/70 transition-colors duration-luxury ease-luxury hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="luxury-label mb-8 text-white/40">Creators</p>
            <ul className="space-y-4">
              {FOOTER_LINKS.creators.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/70 transition-colors duration-luxury ease-luxury hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="luxury-label mb-8 text-white/40">Partners</p>
            <ul className="space-y-4">
              {FOOTER_LINKS.partners.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-white/70 transition-colors duration-luxury ease-luxury hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-10 sm:flex-row">
          <p className="font-sans text-[11px] tracking-wide text-white/50">
            © 2026 {SITE_NAME}. All Rights Reserved.
          </p>
          <p className="luxury-label text-white/35">{SITE_TAGLINE}</p>
        </div>
      </div>
    </footer>
  );
}
