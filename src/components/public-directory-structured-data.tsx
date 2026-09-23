import { careerFields, employers } from "@/i18n/career-directory";
import { beginnerResources } from "@/i18n/opportunity-directory";
import { directoryCopy, type DirectoryKind } from "@/i18n/public-directory-copy";
import type { Locale } from "@/i18n";
import { site, wortmarke } from "@/config";
import { absoluteUrl, type JsonLdNode } from "@/lib/structured-data";
import { currentEvents } from "@/lib/opportunity-status";
import { JsonLd } from "./json-ld";

export function DirectoryStructuredData({
  locale,
  kind,
}: {
  locale: Locale;
  kind: DirectoryKind;
}) {
  const copy = directoryCopy[locale][kind];
  const path = kind;
  const names = kind === "quant-careers"
    ? employers.map((item) => item.name)
    : kind === "quant-fields"
      ? careerFields.map((item) => item.title[locale])
      : [
          ...currentEvents()
            .slice()
            .sort((left, right) => left.activeThrough.localeCompare(right.activeThrough))
            .map((item) => item.name),
          ...beginnerResources.map((item) => item.name),
        ];
  const url = absoluteUrl(locale, path);
  const nodes: JsonLdNode[] = [
    {
      "@type": "CollectionPage",
      "@id": `${url}#collection`,
      url,
      name: copy.title,
      description: copy.description,
      inLanguage: locale,
      isAccessibleForFree: true,
      isPartOf: { "@id": `${site}/#website` },
      publisher: { "@id": `${site}/#organisation` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: names.map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: wortmarke.lang, item: absoluteUrl(locale) },
        { "@type": "ListItem", position: 2, name: copy.title, item: url },
      ],
    },
  ];
  return <JsonLd nodes={nodes} />;
}
