"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const media = gsap.matchMedia(element);
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = element.querySelectorAll<HTMLElement>("section[id]:not(.hero-presentation):not(.experience-gallery):not(.service-section)");
      sections.forEach((section) => {
        section.classList.add("scroll-frame-section");
        gsap.fromTo(
          section,
          {
            y: 64,
            scale: 0.95,
            clipPath: "inset(2% 1.5% round 1.25rem)",
            "--scroll-frame-inset": "1.25rem",
            "--scroll-frame-opacity": 0.9,
          },
          {
            y: 0,
            scale: 1,
            clipPath: "inset(0% 0% round 0px)",
            "--scroll-frame-inset": "0px",
            "--scroll-frame-opacity": 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 96%",
              end: "top 18%",
              scrub: 1.2,
            },
          },
        );
      });

      const hero = element.querySelector<HTMLElement>(".hero-presentation");
      if (hero) {
        const heroContent = hero.querySelector<HTMLElement>(".hero-presentation__content");
        if (heroContent) {
          gsap.to(heroContent, {
            yPercent: 14,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 1.1,
            },
          });
        }
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-frame]").forEach((frame) => {
        const image = frame.querySelector<HTMLElement>("[data-frame-image]");
        gsap.fromTo(
          frame,
          { clipPath: "inset(10% 7% 10% 7%)", y: 26 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 1.05,
            ease: "power3.out",
            scrollTrigger: { trigger: frame, start: "top 88%", once: true },
          },
        );
        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.1 },
            {
              scale: 1,
              duration: 1.35,
              ease: "power2.out",
              scrollTrigger: { trigger: frame, start: "top 88%", once: true },
            },
          );
        }
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const cards = group.querySelectorAll<HTMLElement>("[data-card]");
        const isServiceGroup = group.closest(".service-section") !== null;
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: isServiceGroup ? 40 : 32, scale: isServiceGroup ? 0.97 : 1 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: isServiceGroup ? 0.82 : 0.7,
            stagger: isServiceGroup ? 0.14 : 0.11,
            ease: "power3.out",
            scrollTrigger: { trigger: group, start: "top 82%", once: true },
          },
        );
      });
    });

    return () => {
      media.revert();
      element.querySelectorAll(".scroll-frame-section").forEach((section) => {
        section.classList.remove("scroll-frame-section");
      });
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
