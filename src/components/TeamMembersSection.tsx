"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Locale } from "../i18n";
import type { TeamSectionSettings } from "../homepage-sections";

export default function TeamMembersSection({ locale, settings }: { locale: Locale; settings: TeamSectionSettings }) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = section.current;
    if (!element) return;

    const media = gsap.matchMedia(element);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: (() => void)[] = [];

      element.querySelectorAll<HTMLElement>(".team-member").forEach((card) => {
        const profileCard = card.querySelector<HTMLElement>(".team-member__card");
        const image = card.querySelector<HTMLElement>(".team-member__image");
        const content = card.querySelector<HTMLElement>(".team-member__content");
        const marker = card.querySelector<HTMLElement>(".team-member__marker");
        if (!profileCard || !image || !content || !marker) return;

        const enter = () => {
          gsap.to(profileCard, { y: -8, boxShadow: "0 1.5rem 3rem rgb(16 42 54 / 20%)", borderColor: "rgb(0 124 163 / 55%)", duration: 0.35, ease: "power3.out", overwrite: "auto" });
          gsap.to(image, { scale: 1.07, duration: 0.65, ease: "power3.out", overwrite: "auto" });
          gsap.to(content, { y: -4, duration: 0.35, ease: "power3.out", overwrite: "auto" });
          gsap.to(marker, { rotate: 45, scale: 1.08, color: "#f5fafc", backgroundColor: "#007ca3", borderColor: "#007ca3", duration: 0.3, ease: "power2.out", overwrite: "auto" });
        };
        const leave = () => {
          gsap.to(profileCard, { y: 0, boxShadow: "0 0.8rem 2rem rgb(16 42 54 / 7%)", borderColor: "rgb(16 42 54 / 14%)", duration: 0.45, ease: "power3.out", overwrite: "auto" });
          gsap.to(image, { scale: 1, duration: 0.75, ease: "power3.out", overwrite: "auto" });
          gsap.to(content, { y: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
          gsap.to(marker, { rotate: 0, scale: 1, color: "#007ca3", backgroundColor: "transparent", borderColor: "rgb(16 42 54 / 27%)", duration: 0.35, ease: "power2.out", overwrite: "auto" });
        };

        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
        });
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    });

    return () => media.revert();
  }, []);

  return (
    <section ref={section} id="team" className="team-section px-5 py-16 md:px-[4vw] md:py-24">
      <div className="team-section__inner mx-auto max-w-[1500px]">
        <div className="team-section__kicker" data-reveal>
          <span>TAGHAZOUT · MOROCCO</span>
          <span><i aria-hidden="true" /> {settings.localCrew[locale]}</span>
        </div>
        <div className="team-section__intro" data-reveal>
          <div className="team-section__title-wrap">
            <p className="eyebrow">{settings.eyebrow[locale]}</p>
            <h2><span>{settings.titleLead[locale]}</span><span>{settings.titleAccent[locale]}</span></h2>
          </div>
          <p className="team-section__summary">
            {settings.summary[locale]}
          </p>
        </div>

        <ol className="team-section__grid" data-stagger>
          {settings.members.map((member, index) => (
            <li className="team-member" key={member.id} data-card>
              <article className="team-member__card">
                <div className="team-member__portrait">
                  <img src={member.image} alt={member.imageAlt[locale]} className="team-member__image" loading="lazy" />
                  <span className="team-member__shade" aria-hidden="true" />
                  <div className="team-member__portrait-meta">
                    <span className="team-member__number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="team-member__location">TAGHAZOUT</span>
                  </div>
                  <div className="team-member__content">
                    <p>{member.role[locale]}</p>
                    <h3>{member.name}</h3>
                  </div>
                </div>
              </article>
              <footer className="team-member__footer">
                <span>{member.detail[locale]}</span>
                <span className="team-member__marker" aria-hidden="true">↗</span>
              </footer>
            </li>
          ))}
        </ol>
        <div className="team-section__outro" data-reveal>
          <span>{settings.outroLabel[locale]}</span>
          <p>{settings.outro[locale]}</p>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
    </section>
  );
}