# Full Pokédex execution checklist

This plan grows the existing static Ledger into an open-source reference site. Keep its matchup and team tools, but give Pokémon, forms, moves, abilities, and items first-class, linkable pages. “Complete” means complete for a **declared game/version and data snapshot**, not an unqualified claim that every mechanic applies in every game. Check each box in order; each phase has a release gate.

**Implementation note (2026-11-25):** `pokedex.html` now browses the existing 1,351 local Pokémon/form records with search, type filter, direct query links, and ability/move details. This is an initial browse slice. Versioned facts, source provenance, images, item pages, and the release gates below remain open.

**Continuation (2026-11-25):** `index.html` is now the Pokédex home. A pinned PokéAPI CSV import generates 1,025 species, 1,351 forms, 938 moves, 374 abilities, 2,223 items, evolution links, and 27 populated learnset version groups. `ledger.html` is now a dedicated six-slot team builder; the calculator and GO tools were intentionally retired from its UI. The game filter applies to learnsets and move learners only; other version-dependent facts and gimmick mechanics still need modeling. Do not mark the full release gates complete yet.

**Detail expansion (2026-11-25):** The home page is dark by default, with locally hosted Hubot Sans and Kalnia, a Kelvin-inspired thermal hero, and an animated modal detail bubble. The import now includes genus, gender ratio, egg groups, growth and hatch data, regional numbers, all recorded English Pokédex entries, encounter rows, game indices, move effects/flags, EV yield, and the current type chart. Game-specific availability remains a qualified evidence view, not a confirmed obtainable checklist.

## 0. Define the product and baseline

- [ ] Record the target games/version groups, languages (start with English), and an explicit data cutoff in `data/README.md`. Maintain a coverage matrix for species, forms, moves, abilities, items, learnsets, encounters, and mechanics by version.
- [ ] Capture the current behavior: search, dossier, type calculator, damage estimate, team builder, GO mode, presets, shared URLs, mobile, and print. Save a few browser screenshots and sample shared URLs as regression fixtures.
- [ ] Inventory `index.html` and the three generated JS files. Record counts and missing descriptions, IDs, forms, and links. Preserve the current site as a working baseline while refactoring.
- [ ] Define “better than Pokémon Database” as measurable goals: direct links to every record, version-specific facts, source/provenance on disputed facts, fast keyboard search, clear form comparisons, accessible mobile pages, and visible coverage/missing-data indicators.
- [ ] Decide the static output shape: generated JSON + prebuilt HTML pages/search index (recommended for SEO and deep links), with build-time scripts only and no required runtime API. Keep a simple static-host deployment.

**Gate:** baseline checklist and coverage matrix are committed; current app still works.

## Design direction: Kelvin reference

Use [Kelvin on One Page Love](https://onepagelove.com/kelvin) as the visual guide: warm beige canvas, expressive thermal gradients, large editorial typography, overlapping information panels, and magazine-like composition. Translate its festival presentation into a searchable reference product; keep dense tables and facts easy to scan.

- [ ] Make a small design board before implementation: desktop/mobile captures of Kelvin, color samples, type scale, spacing, panel treatments, and motion examples. Record which patterns belong on the home/feature pages and which are suitable for dense reference pages.
- [ ] Define design tokens for warm paper/ink neutrals, restrained thermal accent gradients, type colors, spacing, borders, shadows, and light/dark modes. Verify text and control contrast on every gradient and surface.
- [ ] Use a display serif for prominent Pokémon names and editorial headings, paired with a clear sans face for search, statistics, tables, and navigation. Check font licensing and provide local/system fallbacks.
- [ ] Prototype three page types at desktop and mobile widths: immersive Pokédex landing/search, Pokémon detail with large art and overlapping fact panels, and a compact move/item/ability detail page. Make the data legible before adding motion.
- [ ] Apply the thermal palette as a brand layer; keep Pokémon type colors recognizable and provide text labels so color is never the sole cue. Let artwork carry the hero visual while facts stay on stable, readable panels.
- [ ] Use scroll reveals and panel transitions sparingly; honor reduced motion, avoid layout shifts, and keep search/filter response immediate. Test keyboard focus and touch targets in the prototype.
- [ ] Compare the finished pages side by side with the design board and verify a consistent visual language without copying Kelvin's branding, copy, images, or exact layout.

**Gate:** desktop/mobile prototypes establish reusable tokens and components and pass accessibility review before the full page rollout.

## 1. Source, rights, and reproducible data

- [ ] Add `docs/SOURCES.md`: source URL, upstream revision/date, fields imported, refresh method, license/terms, and attribution for each dataset and image collection. Distinguish the site's MIT code license from Pokémon IP and third-party data/assets.
- [ ] Use PokéAPI's versioned CSV/API data as the main structured source: species, Pokémon/form records, stats, types, evolution, learnsets, moves, abilities, items, game versions, flavor text, and localization. Pin a source revision; do not depend on live page-load requests.
- [ ] Evaluate Pokémon Showdown's structured data/text for gaps and game mechanics. Document source priority **per field** and overrides with a reason and source. Do not scrape Pokémon Database text or copy its page design.
- [ ] Add a repeatable importer under `scripts/` with pinned source revisions, cache, normalization, generated outputs, and a `data:check` mode that reports changes without writing. Never hand-edit generated files.
- [ ] Create stable IDs for species, battle forms, cosmetic forms, moves, abilities, items, versions, and asset variants. Store display names and aliases separately; use IDs in joins and URLs.
- [ ] Model validity by version: introduced/removed, availability, stats/types/abilities, learn method and level/TM, item effect and acquisition where sourced. Show “unknown” rather than inventing missing facts.
- [ ] Add schema validation and referential checks: unique IDs/slugs, valid links, no orphan records, nonempty required descriptions, and explicit exceptions for legitimate gaps. Emit a machine-readable coverage report.

**Gate:** one command regenerates deterministic data; the report explains every gap and provenance is visible.

## 2. Images and 3D-style presentation

- [ ] Audit PokéAPI sprites (`home` renders, official artwork, Showdown animation), plus any candidate 3D model source, for actual coverage **and rights to redistribute**. Publicly viewable or downloadable does not mean openly licensed. Do not represent 2D HOME renders as interactive 3D models.
- [ ] Choose a tiered asset policy: licensed 3D model/viewer only where permission is clear; otherwise HOME-style 3D renders; otherwise official art or animated sprite; finally a labeled silhouette. Keep source/author/license and missing-asset reason in an asset manifest.
- [ ] Build a mapping from stable form ID + gender + shiny + view to an asset. Include Mega, Primal, regional, Gigantamax, and cosmetic variants where assets exist. Audit mismatches manually on a representative set.
- [ ] Generate optimized sizes/formats and dimensions; lazy-load offscreen images, reserve layout space, and provide alt text. Make animation optional under reduced-motion preference.
- [ ] Add a visible asset attribution/rights page and per-asset provenance links. Keep the code repository's license claim limited to code and original content.

**Gate:** every displayed form has a correct image or labeled fallback; no unreviewed asset is shipped as “open source.”

## 3. Pokédex pages and navigation

- [ ] Split `index.html` into reusable UI, data loading, search, and calculator modules without changing existing behavior. Add a build/dev command and document static deployment output.
- [ ] Build Pokédex index: number/name/type/generation/region/form filters, sorting, instant keyboard search, URL state, and empty states. Link directly to each species and form.
- [ ] Build Pokémon page: artwork/variants, national and regional numbers, genus/flavor text by game, types, six stats and total, abilities/hidden ability, height/weight, gender/egg groups, growth, evolution conditions, forms, locations when sourced, and game availability.
- [ ] Build learnset table by selected game/version: method, level/TM/tutor/egg/event, move metadata, and links. Clearly distinguish unavailable from missing data.
- [ ] Add form comparison with stat/type/ability/appearance differences and transformation prerequisites. Cosmetic forms should not imply mechanical differences.
- [ ] Preserve calculator/team links from each Pokémon and move page; provide breadcrumbs, canonical URLs, keyboard navigation, semantic headings, and mobile layouts.

**Gate:** a user can find a Pokémon, switch versions/forms, inspect a legal learnset, and share the exact page.

## 4. Moves, abilities, items, and cross-links

- [ ] Build searchable move index and move pages: type, category, power/accuracy/PP, priority/target/contact and effects where sourced, generation/version differences, acquisition, and learners by version. Handle variable-power and “never misses” as rules, not misleading zeros.
- [ ] Build searchable ability index and ability pages: short and detailed effects, generation/version changes, Pokémon with normal/hidden access, and relevant interactions where supported.
- [ ] Import all in-scope items and build searchable item index/detail pages: category, pocket, price where applicable, usable/held effect, version-specific descriptions, acquisition where sourced, and Pokémon/form/evolution/move links. Cover balls, berries, TMs, evolutionary items, held items, plates, drives, Mega Stones, Z-Crystals, and Tera-related items where the chosen games include them.
- [ ] Generate reciprocal links and validate them (Pokémon ↔ move/ability/item; item ↔ evolution/form). Add type, nature, location, and generation reference pages if the dataset supports them.
- [ ] Show source/version on descriptions and label any editorial explanation written by this project. Avoid copying large blocks of third-party prose.

**Gate:** all in-scope moves, abilities, and items have reachable pages and a coverage report; links and filters agree with the selected version.

## 5. Every gimmick, with version rules

- [ ] Add a typed transformation model (`kind`, eligibility, trigger, required item/move/ability, resulting form/stats/types, version availability, duration/limits) rather than treating each gimmick as a species name suffix.
- [ ] Cover Mega Evolution and Primal Reversion, including stones/orbs, restrictions, changed abilities/stats/types, and game availability.
- [ ] Cover Dynamax and Gigantamax, including eligibility, G-Max forms/moves, Max Move conversion, HP scaling, turn limit, and restrictions. Do not imply all forms can Gigantamax.
- [ ] Cover Z-Moves and Ultra Burst: item, type/signature requirements, eligible base moves and effects, and versions.
- [ ] Cover Terastallization: Tera type, Stellar where applicable, STAB/type rules and exceptional forms/moves; separate an individual Pokémon's chosen Tera type from species data.
- [ ] Cover other form mechanics where in scope: regional forms, battle-only changes, weather/stance/ability/item-triggered forms, fusion, and cosmetic forms. Add a “not in this game” state.
- [ ] Keep the existing calculator labeled as an estimate until its assumptions and version-specific rules are implemented. If exact damage is a goal, specify a separate engine and compare against trusted battle examples rather than incrementally claiming full accuracy.

**Gate:** each mechanic has eligibility, trigger, result, item/move links, version labels, and representative verified examples.

## 6. Quality, release, and maintenance

- [ ] Add focused automated tests for importer joins, version filtering, evolution/form relationships, search, page links, and representative gimmick rules. Test ambiguous cases (same name/form, gender/shiny, unavailable move, unknown source).
- [ ] Run accessibility checks (keyboard, contrast, screen reader labels, reduced motion), mobile viewport checks, broken-link checks, and page-size/performance checks. Set and measure a page-load budget on a midrange phone.
- [ ] Add a generated sitemap, robots policy, page titles/descriptions, structured data only where accurate, and graceful 404 pages. Verify deep links on the chosen static host.
- [ ] Add CI for data checks, tests, build, link/asset validation, and a deploy preview. Publish only after source/rights review and manual spot checks across generations and gimmicks.
- [ ] Document contribution rules for corrections and new versions: evidence required, field-level source, regeneration command, tests, and how to flag disputed facts. Keep a visible data cutoff and changelog.

**Final acceptance:** every record in the declared scope is searchable and linkable; every page says which game/version its facts describe; missing data and art are explicit; current Ledger tools still work; assets are properly attributed and rights reviewed; the site builds and deploys reproducibly.

## Reference starting points

- PokéAPI documentation and fair use: https://pokeapi.co/docs/v2
- PokéAPI source CSV: https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv
- PokéAPI sprite categories: https://github.com/PokeAPI/sprites
- Pokémon Showdown data and mechanics: https://github.com/smogon/pokemon-showdown
- Smogon sprite licensing note: https://github.com/smogon/sprites#license
