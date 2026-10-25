"use client";

/**
 * The section list beside an article on wide screens. The links work without
 * JavaScript; the script only marks the section currently being read.
 */
import { useEffect, useState } from "react";
import type { ArticleHeading } from "@/lib/articles";

type ArticleOutlineProps = {
  outline: ArticleHeading[];
  label: string;
};

export function ArticleOutline({ outline, label }: ArticleOutlineProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = outline
      .map(({ id }) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => heading !== null);
    if (!headings.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // A section counts as current once its heading has passed the upper
      // third of the viewport, below the sticky header.
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > line) break;
        current = heading.id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [outline]);

  return (
    <nav className="article-outline" aria-labelledby="article-outline-title">
      <p className="article-outline__title" id="article-outline-title">
        {label}
      </p>
      <ol className="article-outline__list" role="list">
        {outline.map(({ id, text }) => (
          <li key={id}>
            <a
              className="article-outline__link"
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
