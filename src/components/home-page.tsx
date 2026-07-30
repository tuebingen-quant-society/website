import { kontakt } from "@/config";
import { content, type Locale } from "@/i18n";
import { JoinForm } from "./join-form";
import { MarketBackground } from "./market-background";
import { SignaturePlot } from "./signature-plot";
import { Ticker } from "./ticker";

export function HomePage({ locale }: { locale: Locale }) {
  const { hero, about, activities, open, join } = content[locale];

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
            <p className="hero__subline">{hero.subline}</p>
            <div className="hero__ctas">
              <a className="btn btn--primary" href={hero.ctaPrimaer.href}>
                {hero.ctaPrimaer.label}
              </a>
              <a className="link link--arrow" href={hero.ctaSekundaer.href}>
                {hero.ctaSekundaer.label}
                <span className="arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="hero__plot">
            <SignaturePlot locale={locale} />
          </div>
        </div>
      </section>

      <Ticker locale={locale} />

      <section className="section" id="about" aria-labelledby="about-headline">
        <div className="section__inner">
          <div className="prose">
            <h2 className="section-headline" id="about-headline">{about.headline}</h2>
            <div className="about__body">
              {about.absaetze.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="activities" aria-labelledby="activities-headline">
        <div className="section__inner">
          <h2 className="section-headline" id="activities-headline">
            {activities.headline}
          </h2>
          <ul className="cards" role="list">
            {activities.karten.map((card, index) => (
              <li
                className={`card cards__item${card.geplant ? " card--geplant" : ""}`}
                key={card.titel}
              >
                <span className="card__num" aria-hidden="true">
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
          <div className="open__body prose">
            <h2 className="section-headline" id="open-headline">{open.headline}</h2>
            <p className="open__absatz">{open.absatz}</p>
          </div>
        </div>
      </section>

      <section className="section" id="join" aria-labelledby="join-headline">
        <div className="section__inner">
          <div className="join-panel">
            <div className="join__body prose">
              <h2 className="section-headline" id="join-headline">{join.headline}</h2>
              <p className="join__absatz">{join.absatz}</p>
              <JoinForm locale={locale} />
              <p className="join__social">
                <a className="link link--arrow" href={kontakt.instagram} rel="me noopener">
                  {join.instagramLink}
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
