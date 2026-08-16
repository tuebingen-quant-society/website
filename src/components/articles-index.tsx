/**
 * The /articles listing: ten pieces per page, newest first, with the older
 * pages hanging off /articles/2 and up.
 */
import { localePath, type Locale } from "@/i18n";
import { articlesContent, fill } from "@/i18n/articles-content";
import { articlesPath, type ArticlePage } from "@/lib/articles";
import { ArticleCard } from "./article-card";

export function ArticlesIndex({ locale, page }: { locale: Locale; page: ArticlePage }) {
  const copy = articlesContent[locale];
  const previous = page.page > 1 ? page.page - 1 : null;
  const next = page.page < page.pageCount ? page.page + 1 : null;

  return (
    <section className="section articles" aria-labelledby="articles-headline">
      <div className="section__inner">
        <header className="articles__head">
          <p className="articles__eyebrow">{copy.eyebrow}</p>
          <h1 className="section-headline" id="articles-headline">
            {copy.headline}
          </h1>
          <p className="lead articles__lead">{copy.lead}</p>
        </header>

        {page.items.length === 0 ? (
          <div className="articles__empty">
            <h2 className="articles__empty-title">{copy.empty.title}</h2>
            <p className="articles__empty-body">{copy.empty.body}</p>
          </div>
        ) : (
          <ul className="articles__grid" role="list">
            {page.items.map((article) => (
              <ArticleCard article={article} key={article.slug} locale={locale} />
            ))}
          </ul>
        )}

        {page.pageCount > 1 && (
          <nav className="articles__pagination" aria-label={copy.pagination.aria}>
            {previous ? (
              <a
                className="link link--arrow articles__page-link"
                href={localePath(locale, articlesPath(previous))}
                rel="prev"
              >
                <span className="arrow arrow--back" aria-hidden="true">
                  ←
                </span>
                <span className="link__label">{copy.pagination.previous}</span>
              </a>
            ) : (
              <span />
            )}

            <p className="articles__page-status tnum">
              {fill(copy.pagination.status, { page: page.page, total: page.pageCount })}
            </p>

            {next ? (
              <a
                className="link link--arrow articles__page-link"
                href={localePath(locale, articlesPath(next))}
                rel="next"
              >
                <span className="link__label">{copy.pagination.next}</span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </a>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </section>
  );
}
