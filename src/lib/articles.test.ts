import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleCard } from "../components/article-card";
import { ArticlesIndex } from "../components/articles-index";
import { articlePath, articlesPath, type Article } from "./articles";

const note: Article = {
  slug: "vol-weekend",
  title: "Was die implizite Volatilität verrät",
  description: "Terminstruktur der impliziten Vola rund um Wochenenden.",
  date: "2026-08-12",
  lang: "de",
  kind: "research-note",
  readingMinutes: 6,
};

const englishNote: Article = { ...note, slug: "order-books", lang: "en" };

test("the archive keeps page one at /articles and numbers the rest", () => {
  assert.equal(articlesPath(), "articles");
  assert.equal(articlesPath(1), "articles");
  assert.equal(articlesPath(3), "articles/3");
  assert.equal(articlePath("vol-weekend"), "article/vol-weekend");
});

test("cards link into the locale the reader is already in", () => {
  const german = renderToStaticMarkup(
    createElement(ArticleCard, { article: note, locale: "de" }),
  );
  const english = renderToStaticMarkup(
    createElement(ArticleCard, { article: note, locale: "en" }),
  );

  assert.match(german, /href="\/article\/vol-weekend"/);
  assert.match(english, /href="\/en\/article\/vol-weekend"/);
});

test("only articles in the other language carry a language badge", () => {
  const matching = renderToStaticMarkup(
    createElement(ArticleCard, { article: note, locale: "de" }),
  );
  const foreign = renderToStaticMarkup(
    createElement(ArticleCard, { article: englishNote, locale: "de" }),
  );

  assert.doesNotMatch(matching, /article-card__lang/);
  assert.match(foreign, /article-card__lang/);
  assert.match(foreign, /Englisch/);
});

test("the listing paginates forwards only while there are older pages", () => {
  const first = renderToStaticMarkup(
    createElement(ArticlesIndex, {
      locale: "de",
      page: { items: [note], page: 1, pageCount: 2 },
    }),
  );
  const last = renderToStaticMarkup(
    createElement(ArticlesIndex, {
      locale: "de",
      page: { items: [englishNote], page: 2, pageCount: 2 },
    }),
  );

  assert.match(first, /href="\/articles\/2"/);
  assert.doesNotMatch(first, /rel="prev"/);
  assert.match(last, /href="\/articles"/);
  assert.doesNotMatch(last, /rel="next"/);
});

test("an empty archive explains itself instead of showing a blank grid", () => {
  const html = renderToStaticMarkup(
    createElement(ArticlesIndex, {
      locale: "de",
      page: { items: [], page: 1, pageCount: 1 },
    }),
  );

  assert.match(html, /Hier ist noch nichts/);
  assert.doesNotMatch(html, /articles__pagination/);
});
