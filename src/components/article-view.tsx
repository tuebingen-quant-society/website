/**
 * A single article at /article/<slug>.
 *
 * The body is the compiled MDX component; everything around it (kicker, title,
 * byline, downloads) is built from the file's `meta` export.
 */
import type { ComponentType } from "react";
import { localePath, type Locale } from "@/i18n";
import { articlesContent, fill, formatArticleDate } from "@/i18n/articles-content";
import { articlesPath, type Article } from "@/lib/articles";
import { ArticlePreview } from "./article-preview";

type ArticleViewProps = {
  article: Article;
  locale: Locale;
  Body: ComponentType;
};

export function ArticleView({ article, locale, Body }: ArticleViewProps) {
  const copy = articlesContent[locale];
  const indexHref = localePath(locale, articlesPath());
  const foreign = article.lang !== locale;

  return (
    <article className="article">
      <div className="article__inner">
        {/* The header hides its nav below 768px, so the way back to the
            archive has to be on the page itself — at both ends of it. */}
        <p className="article__back">
          <a className="link link--arrow" href={indexHref}>
            <span className="arrow arrow--back" aria-hidden="true">
              ←
            </span>
            <span className="link__label">{copy.backToIndex}</span>
          </a>
        </p>

        <header className="article__head">
          <p className="article__kicker">
            <span className="article__kind">{copy.kinds[article.kind]}</span>
            <span className="article__sep" aria-hidden="true">
              ·
            </span>
            <time className="tnum" dateTime={article.date}>
              {formatArticleDate(article.date, locale)}
            </time>
            <span className="article__sep" aria-hidden="true">
              ·
            </span>
            <span>{fill(copy.readingTime, { n: article.readingMinutes })}</span>
          </p>

          <h1 className="article__title" lang={foreign ? article.lang : undefined}>
            {article.title}
          </h1>
          <p className="article__lead lead" lang={foreign ? article.lang : undefined}>
            {article.description}
          </p>

          {(article.authors?.length || article.updated) && (
            <p className="article__byline">
              {article.authors?.length
                ? `${copy.authorsPrefix} ${article.authors.join(", ")}`
                : null}
              {article.authors?.length && article.updated ? (
                <span className="article__sep" aria-hidden="true">
                  ·
                </span>
              ) : null}
              {article.updated
                ? fill(copy.updated, { date: formatArticleDate(article.updated, locale) })
                : null}
            </p>
          )}

          {article.topics?.length ? (
            <ul className="article__topics" role="list">
              {article.topics.map((topic) => (
                <li className="article__topic" key={topic}>
                  {topic}
                </li>
              ))}
            </ul>
          ) : null}

          {/* Set in the reader's language, about the article's — this is the
              one line that has to make sense before the prose switches over. */}
          {foreign && (
            <p className="article__lang-note">
              {fill(copy.languageNote, { language: copy.languages[article.lang] })}
            </p>
          )}
        </header>

        {article.preview !== false && (
          <figure className="article__figure">
            <ArticlePreview slug={article.slug} kind={article.kind} />
          </figure>
        )}

        <div className="article__body" lang={foreign ? article.lang : undefined}>
          <Body />
        </div>

        {article.resources?.length ? (
          <aside className="article__resources" aria-labelledby="article-resources">
            <h2 className="article__resources-title" id="article-resources">
              {copy.resources}
            </h2>
            <ul className="article__resource-list" role="list">
              {article.resources.map((resource) => (
                <li key={resource.href}>
                  <a className="link link--arrow" href={resource.href}>
                    <span className="link__label">{resource.label}</span>
                    <span className="arrow" aria-hidden="true">
                      ↓
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <footer className="article__foot">
          <a className="link link--arrow" href={indexHref}>
            <span className="arrow arrow--back" aria-hidden="true">
              ←
            </span>
            <span className="link__label">{copy.backToIndex}</span>
          </a>
        </footer>
      </div>
    </article>
  );
}
