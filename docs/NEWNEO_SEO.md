# NEWNEO search indexing baseline

Updated 2026-09-16.

- Public marketing origin: https://www.newneo.ai. Apex permanently redirects to www.
- All 27 sitemap pages use self-referencing www canonicals with trailing slashes, matching static hosting. FinOps is included.
- Public robots.txt allows crawling and declares the www sitemap.
- Platform root metadata sets noindex/nofollow. Caddy adds X-Robots-Tag to all platform responses, including login and demo.
- www /demo and /demo/ redirects also receive noindex/nofollow and are excluded from sitemap/navigation.
- Do not disallow demo or app crawling in robots.txt: crawlers must be able to read noindex. Authentication remains the access-control boundary; noindex is not security.

## Multilingual site and blog

Current approved scope: English (United States) and Brazilian Portuguese only. Spanish, French and German are deferred; do not implement them in this phase.

| Language | URL prefix | HTML language / hreflang |
| --- | --- | --- |
| English (US) | / (retain current URLs) | en-US |
| Portuguese (Brazil) | /pt-br/ | pt-BR |

Current published public content remains English (HTML lang=en). These prefixes are planned, not published translations. When translations are published, add reciprocal hreflang only between existing equivalent pages, including English, and self-canonicals for each translation. Include published localized URLs in the sitemap. Do not announce unpublished translations in hreflang or sitemap. Provide an explicit language selector; no forced IP-based redirects. Apply the same language structure to the future blog; only link equivalent translated articles, not unrelated posts or language homepages.

## Next phase (not configured by this change)

- Verify a newneo.ai domain property in Google Search Console with the owner's Google account and submit https://www.newneo.ai/sitemap.xml.
- Publish reviewed Brazilian Portuguese translations and an English / Portuguese language selector.
- Build the bilingual blog in English and Brazilian Portuguese with article authors, dates, original evidence and accurate Article structured data.
- Review Search Console indexing and real performance metrics after crawling. Deployment does not guarantee indexing or immediate removal of previously indexed app URLs.

References:
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.google.com/search/docs/specialty/international/localized-versions
