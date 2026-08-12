import { kontakt } from "@/config";
import { content, localePath, type Locale } from "@/i18n";
import { SignInGlyph } from "./sign-in-glyph";
import { MarketBackground } from "./market-background";
import { SignaturePlot } from "./signature-plot";
import { Ticker } from "./ticker";

export function HomePage({ locale }: { locale: Locale }) {
  const { hero, about, activities, open, join } = content[locale];
  /* The only login on the page: "Mitmachen" scrolls down to the section that
     explains what the account is for, and the button below it does the rest. */
  const membersHref = localePath(locale, "members");

  return (
    <>
      <section className="hero" id="top" aria-labelledby="hero-headline">
        <MarketBackground />
        <div className="hero__glow hero__glow--a" aria-hidden="true" />
        <div className="hero__glow hero__glow--b" aria-hidden="true" />
        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__inner">
          <div className="hero__text">
            <h1 className="hero-headline" id="hero-headline">
              {hero.headline} <span className="text-grad">{hero.headlineAccent}</span>
            </h1>
            <p className="hero__subline lead">{hero.subline}</p>
            <div className="hero__ctas">
              <a className="btn btn--primary" href={hero.ctaPrimaer.href}>
                {hero.ctaPrimaer.label}
              </a>
              <a className="btn btn--secondary" href={hero.ctaSekundaer.href}>
                {hero.ctaSekundaer.label}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="hero__plot">
            <SignaturePlot locale={locale} />
          </div>
        </div>
      </section>

      <Ticker locale={locale} />

      {/* Headline and prose sit side by side from 900px — the section's copy is
          two dense paragraphs, and a single column makes them read as a wall. */}
      <section className="section" id="about" aria-labelledby="about-headline">
        <div className="section__inner about reveal">
          <h2 className="section-headline about__head" id="about-headline">
            {about.headline}
          </h2>
          <div className="about__body prose">
            {about.absaetze.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>

      <section className="section" id="activities" aria-labelledby="activities-headline">
        <div className="section__inner">
          <h2 className="section-headline reveal" id="activities-headline">
            {activities.headline}
          </h2>
          <ul className="cards reveal" role="list">
            {activities.karten.map((card, index) => (
              <li
                className={`card cards__item${card.geplant ? " card--geplant" : ""}`}
                key={card.titel}
              >
                <span className="card__num tnum" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="card__titel">{card.titel}</h3>
                <p className="card__text">{card.beschreibung}</p>
                {card.geplant && <span className="badge">{activities.badge}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--surface" id="open" aria-labelledby="open-headline">
        <div className="section__inner">
          <div className="open__body reveal">
            <h2 className="section-headline" id="open-headline">{open.headline}</h2>
            <p className="open__absatz lead">{open.absatz}</p>
          </div>
        </div>
      </section>

      <section className="section" id="join" aria-labelledby="join-headline">
        <div className="section__inner">
          <div className="panel join-panel reveal">
            <div className="join__body">
              <h2 className="section-headline" id="join-headline">{join.headline}</h2>
              <p className="join__absatz lead">{join.absatz}</p>
              <p className="join__cta">
                <a className="btn btn--primary" href={membersHref}>
                  <SignInGlyph />
                  {join.cta}
                </a>
              </p>
              <p className="join__hinweis">{join.hinweis}</p>
              <p className="join__social">
                <a className="link link--arrow" href={kontakt.instagram} rel="me noopener">
                  <span className="link__label">{join.instagramLink}</span>
                  <span className="arrow" aria-hidden="true">→</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
