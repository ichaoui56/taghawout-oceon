"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "../content";
import { useLocale } from "./LocaleProvider";
import Logo from "./Logo";

export default function Nav() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);
  const homeHref = (href: string) => href.startsWith("/") || pathname === "/" ? href : `/${href}`;

  const closeMenu = () => {
    setOpen(false);
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenuMounted(false), 380);
  };

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    setMenuMounted(true);
    window.requestAnimationFrame(() => setOpen(true));
  };

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const syncActiveLink = () => {
      const hash = window.location.hash;
      if (NAV_LINKS.some((link) => link.href === hash)) setActiveHref(hash);
      else if (pathname.startsWith("/activities")) setActiveHref("/activities");
      else if (pathname.startsWith("/blog") || pathname.startsWith("/blogs")) setActiveHref("#journal");
      else setActiveHref("");
    };
    syncActiveLink();
    window.addEventListener("hashchange", syncActiveLink);
    return () => window.removeEventListener("hashchange", syncActiveLink);
  }, [pathname]);

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = panel.current!;
    const items = () => Array.from(root.querySelectorAll<HTMLElement>("a[href], button"));
    document.body.style.overflow = "hidden";
    items()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeMenu(); return; }
      if (e.key !== "Tab") return;
      const list = items();
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      trigger.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header className={`site-nav fixed inset-x-0 top-0 z-[100] text-paper${scrolled ? " site-nav--scrolled" : pathname !== "/" ? " site-nav--interior" : ""}${open ? " site-nav--menu-open" : ""}`}>
        <div className="site-nav__inner flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Logo href={pathname === "/" ? "#top" : "/#top"} compact={scrolled} tone={scrolled || open ? "blue" : "white"} />
          </div>
          <nav aria-label={t("Primary navigation")} className="site-nav__actions">
            <ul className="site-nav__links">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={homeHref(l.href)}
                    onClick={() => setActiveHref(l.href)}
                    aria-current={activeHref === l.href ? (l.href.startsWith("#") ? "location" : "page") : undefined}
                  >
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={homeHref("#transfer")} className="site-nav__book hidden whitespace-nowrap bg-signal px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-paper transition hover:bg-paper hover:text-ink sm:inline-flex">
              {t("Book now")} <span className="ml-3" aria-hidden="true">↗</span>
            </Link>
            <div className={`site-language-switch${locale === "fr" ? " site-language-switch--fr" : ""}`} role="group" aria-label={t("Choose language")}>
              <span className="site-language-switch__indicator" aria-hidden="true" />
              {(["en", "fr"] as const).map((option) => (
                <button key={option} type="button" aria-label={option === "en" ? "English" : "Français"} aria-pressed={locale === option} onClick={() => setLocale(option)}>
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              ref={trigger}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={t(open ? "Close" : "Menu")}
              onClick={toggleMenu}
              className="site-nav__menu"
            >
              <span className="site-nav__burger" aria-hidden="true"><span /><span /></span>
            </button>
          </nav>
        </div>
      </header>

      {menuMounted && (
        <div
          ref={panel}
          id="site-menu"
          role="dialog"
          aria-modal={open ? "true" : undefined}
          aria-hidden={!open}
          aria-label={t("Site menu")}
          className={`site-menu-backdrop${open ? " site-menu-backdrop--open" : ""}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeMenu();
          }}
        >
          <aside className="site-menu-panel">
            <p className="site-menu__eyebrow">{t("Site menu")}</p>
            <nav aria-label={t("Primary navigation")}>
              <ul className="site-menu__links">
                {NAV_LINKS.map((l, index) => (
                  <li key={l.href}>
                    <Link
                      href={homeHref(l.href)}
                      onClick={() => { setActiveHref(l.href); closeMenu(); }}
                      aria-current={activeHref === l.href ? (l.href.startsWith("#") ? "location" : "page") : undefined}
                      className={`site-menu__link${activeHref === l.href ? " is-active" : ""}`}
                    >
                      <span>{t(l.label)}</span>
                      <span className="site-menu__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="site-menu__footer">{t("Every mile, considered.")}</p>
          </aside>
        </div>
      )}
    </>
  );
}
