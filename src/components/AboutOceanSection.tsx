import Link from "next/link";
import type { Locale } from "../i18n";
import type { AboutOceanSettings } from "../homepage-sections";

type AboutIconName = "wave" | "board" | "coach" | "compass" | "mountain" | "pin" | "star";

function AboutIcon({ name }: { name: AboutIconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {name === "wave" && <path d="M3 16c2.4 0 2.4-3 4.8-3s2.4 3 4.8 3 2.4-3 4.8-3 2.4 3 4.8 3M3 20c2.4 0 2.4-2 4.8-2s2.4 2 4.8 2 2.4-2 4.8-2 2.4 2 4.8 2M4 10c1.4-3.5 4-5.5 7.5-5.5 2.4 0 4.4 1 5.8 2.9" />}
      {name === "board" && <><path d="M12 3c2.2 2.7 4 6.7 4 10.2a4 4 0 1 1-8 0C8 9.7 9.8 5.7 12 3Z" /><path d="M10.4 13.5h3.2M12 14v4" /></>}
      {name === "coach" && <><path d="M4 19V9m5 10V5m6 14v-7m5 7V8" /><path d="m3 6 6-3 6 4 6-3" /></>}
      {name === "compass" && <><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4 5.4-2.2Z" /></>}
      {name === "mountain" && <><path d="m3 19 6.5-11 3.2 5.2 2.2-3.4L21 19H3Z" /><path d="m8 11 1.5 1.4L11 11m3.7 1.1 1.1 1.2 1.2-1.2" /></>}
      {name === "pin" && <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>}
      {name === "star" && <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />}
    </svg>
  );
}

export default function AboutOceanSection({ locale, settings }: { locale: Locale; settings: AboutOceanSettings }) {
  const hero = settings.hero;
  const impact = settings.impact;

  return (
    <div id="about-ocean" className="about-ocean">
      <section id="about" className="about-ocean__hero" aria-labelledby="about-ocean-title">
        <div className="about-ocean__hero-inner">
          <div className="about-ocean__intro" data-reveal>
            <p className="about-ocean__eyebrow"><span>{hero.eyebrow[locale]}</span><i aria-hidden="true" /></p>
            <h2 id="about-ocean-title">{hero.titleLead[locale]} <em>{hero.titleAccent[locale]}</em></h2>
            <p className="about-ocean__lead">{hero.introduction[locale]}</p>
            <Link href="#our-story" className="about-ocean__button">
              {hero.discoverStory[locale]}<span aria-hidden="true">→</span>
            </Link>
            <p className="about-ocean__signature">{hero.signature[locale]}</p>
          </div>

          <div className="about-ocean__visual" data-reveal>
            <figure className="about-ocean__surfer">
              <img src={hero.images[0].image} alt={hero.images[0].alt[locale]} loading="lazy" />
            </figure>
            <figure className="about-ocean__postcard about-ocean__postcard--coast">
              <img src={hero.images[1].image} alt={hero.images[1].alt[locale]} loading="lazy" />
            </figure>
            <figure className="about-ocean__postcard about-ocean__postcard--crew">
              <img src={hero.images[2].image} alt={hero.images[2].alt[locale]} loading="lazy" />
            </figure>
            <span className="about-ocean__visual-note" aria-hidden="true"><AboutIcon name="wave" /></span>
          </div>
        </div>
        
      </section>

      <section id="ocean-impact" className="about-ocean__impact" aria-labelledby="about-ocean-impact-title">
        
        <img
          className="about-ocean__impact-image"
          src={impact.image}
          alt=""
          loading="lazy"
        />
        <div className="about-ocean__impact-inner">
          <div className="about-ocean__impact-copy" data-reveal>
            <p className="about-ocean__eyebrow"><span>{impact.eyebrow[locale]}</span><i aria-hidden="true" /></p>
            <h2 id="about-ocean-impact-title">{impact.title.map((line) => <span key={line[locale]}>{line[locale]}</span>)}</h2>
            <p>{impact.description[locale]}</p>
            <Link href="/activities" className="about-ocean__button about-ocean__button--light">
              {impact.cta[locale]}<span aria-hidden="true">→</span>
            </Link>
          </div>

          <ul className="about-ocean__highlights" data-stagger>
            {impact.highlights.map((highlight, index) => {
              const icons: AboutIconName[] = ["pin", "wave", "star"];
              return (
                <li key={highlight.title[locale]} data-card>
                  <span className="about-ocean__highlight-icon"><AboutIcon name={icons[index]} /></span>
                  <strong>{highlight.title[locale]}</strong>
                  <small>{highlight.detail[locale]}</small>
                </li>
              );
            })}
          </ul>

        </div>
        <svg className="about-ocean__impact-wave about-ocean__impact-wave--bottom" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 44c166 46 281-14 451 2 203 20 263 64 468 29 194-33 316-15 521 10v35H0Z" fill="#08b5de" />
          <path d="M0 71c176 39 265-19 446 0 210 22 302 48 488 17 194-32 303-6 506 8v24H0Z" fill="#F5FAFC" />
        </svg>
      </section>
    </div>
  );
}