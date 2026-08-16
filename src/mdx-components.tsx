import type { MDXComponents } from "mdx/types";

/**
 * Global MDX element mapping — required by @next/mdx in the App Router.
 *
 * Article bodies are plain Markdown, so the elements arrive as bare tags and
 * are styled by `.article__body` in src/styles/articles.css. The only tags
 * handled here are the ones that need markup a stylesheet cannot add:
 * external links get rel/target, images stay unblocked figures.
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
    ...components,
  };
}
