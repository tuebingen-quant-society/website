/**
 * One entry in the article listing — also used for the home-page teaser.
 *
 * The whole card is the link, so the target is as large as the card is; the
 * shared `.card` treatment (hover keyline, coral wash) comes from global.css.
 */
import { localePath, type Locale } from "@/i18n";
import { articlesContent, fill, formatArticleDate } from "@/i18n/articles-content";
import { articlePath, type Article } from "@/lib/articles";
import { ArticlePreview } from "./article-preview";

export function ArticleCard({ article, locale }: { article: Article; locale: Locale }) {
  const copy = articlesContent[locale];
  const foreign = article.lang !== locale;

  return (
    <li className="article-card">
      <a className="card article-card__link" href={localePath(locale, articlePath(article.slug))}>
        <span className="article-card__figure">
          <ArticlePreview slug={article.slug} kind={article.kind} />
          {/* Only flagged when it differs from the page — no badge on the
              articles that are already in the reader's language. Sits on the
              figure so the kicker below stays a single line on every card. */}
          {foreign && (
            <span className="article-card__lang">{copy.languages[article.lang]}</span>
          )}
        </span>

        <span className="article-card__body">
          <span className="article-card__kicker">
            <span className="article-card__kind">{copy.kinds[article.kind]}</span>
            <span className="article-card__sep" aria-hidden="true">
              ·
            </span>
            <span>{fill(copy.readingTime, { n: article.readingMinutes })}</span>
          </span>

          <span className="article-card__title" lang={foreign ? article.lang : undefined}>
            {article.title}
          </span>
          <span className="article-card__text" lang={foreign ? article.lang : undefined}>
            {article.description}
          </span>

          <span className="article-card__foot">
            <time className="tnum" dateTime={article.date}>
              {formatArticleDate(article.date, locale)}
            </time>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </span>
        </span>
      </a>
    </li>
  );
}
