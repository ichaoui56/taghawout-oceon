"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Activity } from "../activities";
import type { Locale } from "../i18n";


gsap.registerPlugin(ScrollTrigger);

const fallbackImages = [
  ["https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1000&q=86", "Surfing in the Atlantic"],
  ["https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1000&q=86", "Surf session"],
  ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=86", "Ocean lifestyle"],
  ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=86", "Surf and yoga"],
  ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=86", "Moroccan coastline"],
  ["https://images.unsplash.com/photo-1539650116455-8b5d8a0d57a9?auto=format&fit=crop&w=1000&q=86", "Camel riding"],
  ["https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1000&q=86", "Paradise Valley"],
  ["https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=86", "Outdoor adventure"],
  ["https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1000&q=86", "Horse riding"],
  ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=86", "Atlantic landscape"],
] as const;

export default function ExperienceGallery({ activities, locale }: { activities: Activity[]; locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const managed: { src: string; alt: string }[] = [];
  for (const activity of activities) {
    for (const image of activity.gallery?.length ? activity.gallery : [{ src: activity.image, alt: activity.imageAlt }]) {
      if (image.src && !managed.some((item) => item.src === image.src)) managed.push(image);
      if (managed.length >= 10) break;
    }
    if (managed.length >= 10) break;
  }
  const images = managed.length ? managed : fallbackImages.map(([src, alt]) => ({ src, alt }));

  useEffect(() => {
    const section = root.current;
    const trackElement = track.current;
    if (!section || !trackElement) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const context = gsap.context(() => {
      const calculateDistance = () => Math.max(0, trackElement.scrollWidth - window.innerWidth);
      gsap.set(trackElement, { x: 0 });
      gsap.to(trackElement, {
        x: () => -calculateDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 40px",
          end: () => `+=${calculateDistance() + window.innerHeight * 0.65}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, section);

    return () => context.revert();
  }, [activities]);

  const heading = locale === "fr" ? "NOTRE MONDE. NOS EXPÉRIENCES." : "OUR WORLD. OUR EXPERIENCES.";
  const subtitle = locale === "fr"
    ? "Un aperçu des moments, aventures et expériences océaniques qui rendent Taghazout Ocean unique."
    : "A glimpse into the moments, adventures, and ocean experiences that make Taghazout Ocean special.";

  return (
    <section id="world" ref={root} className="experience-gallery">
      <div className="experience-gallery__heading" data-reveal>
        <p>TAGHAZOUT OCEAN · 30°43′ N</p>
        <h2>{heading}</h2>
        <span>{subtitle}</span>
      </div>
      <div className="experience-gallery__viewport">
        <div ref={track} className="experience-gallery__track">
          {images.map((image, index) => (
            <figure className={`experience-gallery__image experience-gallery__image--${(index % 4) + 1}`} key={`${image.src}-${index}`}>
              <img src={image.src} alt={image.alt} loading={index < 3 ? "eager" : "lazy"} />
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{image.alt}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
