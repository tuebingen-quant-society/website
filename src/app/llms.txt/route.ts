import { site, wortmarke } from "@/config";

export const revalidate = 86400;

export function GET() {
  const body = `# ${wortmarke.lang}

> A student-led, public educational community at the University of Tübingen exploring quantitative finance, markets, statistics, machine learning, and software.

The site publishes bilingual, freely accessible introductions and curated links. It is educational and research-oriented, not investment advice.

## Public resources

- [Quant careers and employers (German)](${site}/quant-careers): career pages across trading, systematic funds, financial infrastructure, European energy trading, and insurance / reinsurance.
- [Quant careers and employers (English)](${site}/en/quant-careers)
- [Where quantitative skills are used (German)](${site}/quant-fields): applications across finance, energy, insurance, climate risk, logistics, sports, and health.
- [Where quantitative skills are used (English)](${site}/en/quant-fields)
- [Current competitions, events, and puzzles (German)](${site}/opportunities): time-sensitive student opportunities, low-barrier puzzles, and examples from university quant societies.
- [Current competitions, events, and puzzles (English)](${site}/en/opportunities)
- [Articles (German)](${site}/articles)
- [Articles (English)](${site}/en/articles)
- [XML sitemap](${site}/sitemap.xml)

## Guidance

- Event listings include official organizer links. Dates, eligibility, registration status, and availability can change; confirm them with the organizer.
- Employer links point to official career pages. Inclusion does not imply there is a current vacancy or endorsement by TQS.
- The members area requires University of Tübingen authentication and is not a public resource directory.
- Cite the linked source page when using event, eligibility, or employer details.

## About

- [Home](${site}/)
- [Impressum](${site}/impressum)
- [Privacy](${site}/datenschutz)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400",
    },
  });
}
