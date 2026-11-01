import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

/**
 * Global MDX element mapping — required by @next/mdx in the App Router.
 *
 * Article bodies are plain Markdown, so the elements arrive as bare tags and
 * are styled by `.article__body` in src/styles/articles.css. The only tags
 * handled here are the ones that need markup a stylesheet cannot add:
 * external links get rel/target, images stay unblocked figures, and
 * <Formula> boxes a formula with its legend.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", children, ...props }) => {
      const external = /^https?:\/\//.test(href);
      return (
        <a
          className="link"
          href={href}
          {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
          {...props}
        >
          {children}
        </a>
      );
    },
    img: ({ src, alt, ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element -- article images are
      // author-supplied files in /public, sized by CSS, not by the layout.
      <img alt={alt ?? ""} className="article__image" src={src as string} {...props} />
    ),
    /* A display formula with its symbol legend, in one box. The math and the
       legend are ordinary Markdown children, so `$$…$$` works inside. */
    Formula: ({ children }: { children?: ReactNode }) => (
      <figure className="formula">{children}</figure>
    ),
    /* Background that most readers can skip: closed until asked for. */
    Details: ({ summary, children }: { summary: string; children?: ReactNode }) => (
      <details className="more">
        <summary className="more__summary">
          {summary}
          <span className="more__icon" aria-hidden="true" />
        </summary>
        <div className="more__body">{children}</div>
      </details>
    ),
    /* The two or three things to keep from a section. */
    Takeaways: ({ title, children }: { title: string; children?: ReactNode }) => (
      <aside className="takeaways">
        <p className="takeaways__title">{title}</p>
        {children}
      </aside>
    ),
    /* A Markdown list of "**Term**: definition" lines, set as a glossary grid. */
    Terms: ({ children }: { children?: ReactNode }) => <div className="terms">{children}</div>,
    ...components,
  };
}
