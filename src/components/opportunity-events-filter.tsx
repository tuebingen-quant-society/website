"use client";

import { useState } from "react";
import type { Locale } from "@/i18n";
import type { EventListing, ProgramToWatch } from "@/lib/public-directory-types";

type OpportunityEventsFilterProps = {
  events: EventListing[];
  womenProgramsToWatch: ProgramToWatch[];
  locale: Locale;
};

export function OpportunityEventsFilter({ events, womenProgramsToWatch, locale }: OpportunityEventsFilterProps) {
  const [filter, setFilter] = useState<"all" | "women-focused">("all");
  const visibleEvents = filter === "all"
    ? events
    : events.filter((event) => event.focus === "women-focused");

  return (
    <>
      <div className="directory-filters" role="group" aria-label={locale === "de" ? "Events filtern" : "Filter events"}>
        <button
          type="button"
          className="directory-filter"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          {locale === "de" ? "Alle Events" : "All events"}
        </button>
        <button
          type="button"
          className="directory-filter"
          aria-pressed={filter === "women-focused"}
          onClick={() => setFilter("women-focused")}
        >
          {locale === "de" ? "Frauenfokussierte Events & Programme" : "Women-focused events & programmes"}
        </button>
      </div>
      <p className="directory-note">
        {locale === "de"
          ? "Die Teilnahmebedingungen unterscheiden sich je nach Veranstalter. Prüfe vor der Bewerbung, an wen sich das jeweilige Event richtet."
          : "Eligibility varies by organizer. Check who each event is for before applying."}
      </p>
      {visibleEvents.length ? (
        <ul className="directory-grid">
          {visibleEvents.map((event) => (
            <li className="directory-card card" key={event.name}>
              <p className="directory-card__meta">{event.kind[locale]} · {event.status === "open"
                ? (locale === "de" ? "Anmeldung offen" : "Registration open")
                : (locale === "de" ? "Demnächst" : "Upcoming")}</p>
              <a href={event.href} target="_blank" rel="noopener noreferrer" className="directory-card__title">{event.name}<span aria-hidden="true"> ↗</span></a>
              <p className="directory-card__date">{event.dateLabel[locale]}</p>
              <p className="directory-card__text">{event.audience[locale]}</p>
              <p className="directory-card__text">{event.details[locale]}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="directory-note">
          {locale === "de" ? "Aktuell sind keine passenden Events gelistet." : "No matching events are listed right now."}
        </p>
      )}
      {filter === "women-focused" && (
        <section className="directory-follow-up" aria-labelledby="women-programmes-title">
          <h3 id="women-programmes-title">{locale === "de" ? "Weitere Programme im Blick behalten" : "Other programmes to watch"}</h3>
          <p className="directory-note">
            {locale === "de"
              ? "Diese Firmen bieten wiederkehrende Programme an, haben aber noch keinen nächsten Termin veröffentlicht. Der Link führt zur offiziellen Programmseite."
              : "These firms run recurring programmes but have not posted their next dates. Links go to the official programme pages."}
          </p>
          <ul className="directory-grid">
            {womenProgramsToWatch.map((program) => (
              <li className="directory-card card" key={program.name}>
                <a href={program.href} target="_blank" rel="noopener noreferrer" className="directory-card__title">{program.name}<span aria-hidden="true"> ↗</span></a>
                <p className="directory-card__text">{program.audience[locale]}</p>
                <p className="directory-card__text">{program.details[locale]}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
