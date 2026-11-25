# Agent instructions: build the full Pokédex

The user's objective is to turn this repository into a comprehensive, open-source Pokémon reference and planning site. Use `POKEDEX_ROADMAP.md` as the task checklist. The user chose [Kelvin](https://onepagelove.com/kelvin) as the design guide. Work through the roadmap autonomously, phase by phase; do not treat this file as a request to complete the entire roadmap in a single turn when the user asks only for planning or a narrower change.

## Product contract

- `index.html` is the Pokédex home page. `ledger.html` is now a six-slot team builder using `data/dex.js` and `data/mega.js`. The earlier type calculator, damage estimate, GO mode, and calculator presets were intentionally retired from its UI at the user's request.
- A “full Pokédex” means Pokémon and forms, moves, abilities, items, evolutions, learnsets, game availability, and major battle gimmicks, with each fact tied to a selected game/version or clearly labeled as general/unknown.
- Every entity must be searchable, directly linkable, cross-linked, usable on mobile, keyboard accessible, and understandable when data or art is missing.
- Keep static hosting possible. Build-time tooling is acceptable; a runtime backend, account system, or live third-party API is unnecessary unless a concrete requirement cannot be met statically.
- Make the code and original project content open source, with clear boundaries around third-party data, trademarks, and imagery. Do not describe Pokémon sprites or 3D renders as open source merely because they are publicly hosted.

## Defaults to use without asking

- Start with English and the games/version groups supported by the pinned source data. State the exact data snapshot and coverage; expand scope as sources allow. Do not silently imply complete coverage of newer or future releases.
- Use PokéAPI's structured data as the primary import source and consider Pokémon Showdown for documented gaps, version rules, and mechanics. Pin source revisions and record field-level provenance in `docs/SOURCES.md`.
- Generate local data and static pages at build time. Use stable source IDs and explicit form IDs internally; names are display text and aliases, not join keys.
- Use HOME-style renders as the *preferred visual look* where rights review permits use; they are rendered images, not interactive 3D models. An actual 3D viewer requires a separately documented, usable model license. Use an attributed, labeled fallback when an asset is unavailable or cannot be shipped.
- Use Kelvin's warm paper background, thermal color accents, large editorial headings, and layered panels. Make search, tables, and long descriptions plain and legible. Do not reuse Kelvin's images, words, branding, or exact composition.
- If damage or GO tools return later, keep estimates labeled and treat GO as a separate ruleset and dataset.

## Execution loop

1. Read `README.md`, `data/README.md`, `DEPLOYMENT.md`, and `POKEDEX_ROADMAP.md`; inspect the current code and `git status` before editing. Preserve user changes.
2. Pick the earliest unchecked phase whose prerequisites are satisfied. Turn its bullets into small, reviewable implementation slices. Make the next slice functional end to end, including data, UI, links, and validation.
3. Before importing or shipping third-party material, record its source, revision, usage terms, attribution, and field/asset coverage. Do not scrape Pokémon Database copy or use unreviewed images to fill gaps.
4. Implement with deterministic scripts and generated outputs. Avoid hand-editing generated data. Document regeneration and update procedures.
5. Test the changed behavior and existing critical flows. Run data/schema/link checks, relevant automated tests, and a local browser check at desktop and mobile widths. Verify keyboard behavior, reduced motion, and readable contrast when touching UI.
6. Update the roadmap checkbox only when its acceptance criterion is met. Record evidence or a short note beside partial work; keep unmet items unchecked. Update README/deployment docs when commands or architecture change.
7. Summarize the outcome, tests, data/rights limitations, and next unchecked slice. Do not claim completion from a mockup or a partial generation import.

## Required architecture decisions

- Maintain separate records for species, Pokémon/battle form, cosmetic appearance, move, ability, item, version group, evolution condition, and asset. Model transformations as relationships with prerequisites and resulting form; do not infer a transformation solely from its name.
- Keep version-dependent stats, typings, abilities, learn methods, item effects, and move properties queryable by version. If a source cannot support a field, mark that field unknown or omit it with a visible coverage note.
- Build one canonical slug per record, a redirect/alias policy for name changes, and a search index containing names, IDs, and common aliases. Generate reciprocal links and check for broken references.
- Serve image variants through a manifest keyed by form ID, gender, shiny state, and view. Include source and rights metadata. Reserve dimensions and lazy-load noncritical imagery.
- Use source priority and corrections at the field level. Store overrides separately with evidence and tests so refreshes do not erase them.
- Keep versioned gimmick rules distinct: Mega/Primal, Dynamax/Gigantamax, Z-Moves/Ultra Burst, Terastallization, and other triggered forms. Show eligibility, trigger, effect, limits, and version availability.

## Release gates

- **Data:** deterministic import, schema and referential validation, coverage report, and source manifest.
- **Design:** desktop/mobile prototypes for search, Pokémon detail, and one compact detail page; reusable tokens/components; accessibility review.
- **Content:** every in-scope entity has a reachable page, cross-links work, and missing facts/assets are explicit.
- **Mechanics:** representative examples for each gimmick and version pass tests; estimated calculations are labeled.
- **Ship:** build, test, link and asset audit, browser smoke test, and static-host deep-link check pass. Review source/rights notes before deployment.

## Where to start

The first slices have replaced the root page with a Kelvin-inspired Pokédex and generated `data/dex.js` from pinned PokéAPI CSV. Continue with a fuller versioned schema, trustworthy form-to-art mapping, item and gimmick rules, dedicated URLs or prebuilt pages where warranted, accessibility/performance work, and production checks. Keep the current team builder at `ledger.html` usable.
