import { localePath, type Locale } from "@/i18n";
import { alumniCopy, alumniProfiles } from "@/i18n/alumni-content";
import { articlePath } from "@/lib/articles";

export function AlumniSection({ locale }: { locale: Locale }) {
  const copy = alumniCopy[locale];

  return (
    <section className="section" id="alumni" aria-labelledby="alumni-headline">
      <div className="section__inner reveal">
        <h2 className="section-headline" id="alumni-headline">{copy.title}</h2>
        <p className="directory-note">{copy.intro}</p>
        <ul className="directory-grid directory-grid--fields" role="list">
          {alumniProfiles.map((profile) => (
            <li className="directory-card card" key={profile.name}>
              <h3 className="directory-card__title">{profile.name}</h3>
              <p className="directory-card__meta">{profile.role[locale]}</p>
              <p className="directory-card__text">{profile.background[locale]}</p>
              <ul className="alumni-sources" role="list">
                {profile.sources.map(({ label, href }) => (
                  <li key={href}>
                    <a className="link" href={href} aria-label={`${profile.name} · ${typeof label === "string" ? label : label[locale]}`}>
                      {typeof label === "string" ? label : label[locale]}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="directory-bottom">
          <a className="link link--arrow" href={localePath(locale, articlePath(copy.articleSlug))}>
            <span className="link__label">{copy.article}</span>
            <span className="arrow" aria-hidden="true">→</span>
          </a>
        </p>
      </div>
    </section>
  );
}
