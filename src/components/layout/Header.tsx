"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS, ROUTES, SITE_NAME } from "@/lib/constants";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-sm">
      {/* Desktop — three-column grid prevents nav/actions overlap */}
      <div className="luxury-container hidden h-24 items-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-x-4 xl:gap-x-8 2xl:gap-x-10">
        <Link
          href={ROUTES.home}
          className="shrink-0 justify-self-start font-serif text-xl tracking-tight text-black transition-opacity duration-luxury hover:opacity-60 sm:text-2xl"
        >
          {SITE_NAME}
        </Link>

        <nav
          className="flex min-w-0 items-center justify-center justify-self-center gap-5 xl:gap-8"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link shrink-0 whitespace-nowrap"
              data-active={pathname === link.href ? "true" : "false"}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-[1] flex shrink-0 items-center justify-end justify-self-end gap-3 pl-5 xl:gap-4 xl:pl-6">
          <div className="flex items-center gap-4 border-r border-black/10 pr-4 xl:gap-5 xl:pr-5">
            <Link
              href={ROUTES.login}
              className="nav-link whitespace-nowrap"
              data-active={pathname === ROUTES.login ? "true" : "false"}
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.dashboard}
              className="nav-link whitespace-nowrap"
              data-active={pathname.startsWith("/dashboard") ? "true" : "false"}
            >
              Dashboard
            </Link>
          </div>
          <Button href={ROUTES.creatorApplication} variant="ghost" size="sm" className="shrink-0">
            Creator Application
          </Button>
          <Button href={ROUTES.partnerWithUs} variant="primary" size="sm" className="shrink-0">
            Partner With Us
          </Button>
        </div>
      </div>

      {/* Mobile / tablet below lg */}
      <div className="luxury-container flex h-[4.5rem] items-center justify-between lg:hidden">
        <Link
          href={ROUTES.home}
          className="shrink-0 font-serif text-xl tracking-tight text-black transition-opacity duration-luxury hover:opacity-60 sm:text-2xl"
          onClick={closeMenu}
        >
          {SITE_NAME}
        </Link>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="relative block h-3 w-6">
            <span
              className={`absolute left-0 top-0 block h-px w-6 bg-black transition-all duration-luxury ease-luxury ${menuOpen ? "top-[5px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-[5px] block h-px w-6 bg-black transition-all duration-luxury ease-luxury ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute left-0 top-[10px] block h-px w-6 bg-black transition-all duration-luxury ease-luxury ${menuOpen ? "top-[5px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-black/10 bg-white transition-all duration-luxury ease-luxury lg:hidden ${
          menuOpen ? "max-h-[36rem] opacity-100" : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <nav className="luxury-container py-8" aria-label="Mobile navigation">
          <ul className="space-y-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block font-sans text-sm uppercase tracking-nav transition-colors duration-luxury ${
                    pathname === link.href
                      ? "text-black"
                      : "text-gray-mid hover:text-black"
                  }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-black/10 pt-6">
              <Link
                href={ROUTES.dashboard}
                className="block font-sans text-sm uppercase tracking-nav text-gray-mid hover:text-black"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.login}
                className="block font-sans text-sm uppercase tracking-nav text-gray-mid hover:text-black"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            </li>
            <li className="flex flex-col gap-3 border-t border-black/10 pt-6">
              <Button
                href={ROUTES.creatorApplication}
                variant="outline"
                size="md"
                className="w-full"
              >
                Creator Application
              </Button>
              <Button
                href={ROUTES.partnerWithUs}
                variant="primary"
                size="md"
                className="w-full"
              >
                Partner With Us
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
