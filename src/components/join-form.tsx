import { content, localePath, type Locale } from "@/i18n";

export function JoinForm({ locale }: { locale: Locale }) {
  const join = content[locale].join;

  return (
    <div className="join">
      <form className="join__form">
        <div className="join__row">
          <div className="join__field">
            <label className="visually-hidden" htmlFor={`join-email-${locale}`}>
              {join.label}
            </label>
            <input
              className="join__input"
              id={`join-email-${locale}`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={join.placeholder}
              disabled
            />
          </div>
          <button className="btn btn--primary join__submit" type="submit" disabled>
            {join.buttonIdle}
          </button>
        </div>
        <p className="join__hinweis">
          {join.datenschutzHinweis}{" "}
          <a className="link" href={localePath(locale, "datenschutz")}>
            {join.datenschutzLinkText}
          </a>
          .
        </p>
      </form>
    </div>
  );
}
