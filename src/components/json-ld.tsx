/**
 * Inlines a schema.org graph. See src/lib/structured-data.ts for the nodes.
 */
import type { JsonLdNode } from "@/lib/structured-data";

export function JsonLd({ nodes }: { nodes: JsonLdNode[] }) {
  const graph = JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });

  return (
    <script
      type="application/ld+json"
      // Escaping "<" is what keeps a stray "</script>" inside a title or a
      // description from ending the block early.
      dangerouslySetInnerHTML={{ __html: graph.replace(/</g, "\\u003c") }}
    />
  );
}
