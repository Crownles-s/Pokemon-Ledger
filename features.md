# Current feature inventory

This records features implemented as of 2026-11-25. `POKEDEX_ROADMAP.md` tracks remaining work toward complete game-by-game coverage.

## Design and interaction

- The former battle ledger is now a dedicated six-slot team builder. It shares `theme.css` fonts and color tokens with the Pokédex and uses editorial type, an offset paper toolbar, dark roster cards, a focused partner editor, and responsive layouts.

- The landing page now uses an oversized cropped thermal wordmark, a CSS-layered collage featuring Mega Rayquaza, Mega Mewtwo Y, and Ultra Necrozma, a thin elliptical line, asymmetric editorial type, a moving index strip, and staggered paper interlude cards inspired by the live Kelvin site. The design observations and their implementation are recorded in `docs/DESIGN.md`.
- Catalog results use sharp poster-style cards with offsets, rotations, and hover lift. Pokémon cards use solid tonal framing; text-only records keep stronger thermal accents and a large serif treatment. Search controls remain simple and readable.
- Intro sections and catalog cards reveal on scroll; the hero collage fans out on load. Reduced-motion preferences stop decorative animations and entrance effects.

- `index.html` opens the Pokédex in dark mode by default. Thermal orange, pink, and violet gradients, layered panels, editorial typography, and composition follow the Kelvin design reference without copying its assets or layout.
- Hubot Sans and Kalnia are hosted locally under `assets/fonts/` with their SIL Open Font License texts. System font fallbacks are included.
- The README, `CREDITS.md`, source documentation, and both site footers explicitly credit the PokéAPI data and sprite projects while distinguishing Pokémon image rights from this project's MIT code license.
- Pokémon, move, ability, and item cards expand into a rounded detail dialog. It grows from the clicked card, dims and blurs the page, supports a close button and Escape, and honors reduced motion. Detail links share their parent surface without nested borders.
- Responsive desktop/mobile layouts, visible keyboard focus, a skip link, arrow-key category navigation, and semantic headings and tables.

## Search and navigation

- Searchable catalogs cover 1,351 Pokémon and battle-form records across 1,025 species, 938 moves, 374 abilities, and 2,223 items. Search accepts names and numeric IDs; Pokémon and moves can be filtered by type. Results are shown in groups of 60.
- Every record has a shareable `?kind=...&id=...&game=...` URL. Back and Forward restore the selected record. Earlier `pokedex.html` links redirect to the root page.
- Pokémon, moves, abilities, evolution items, and related forms link to each other. The team builder remains at `ledger.html` and links each selected Pokémon back to its Pokédex record.

## Pokémon detail bubble

- A form selector sits below the Pokémon name. Mega records link to the matching normal form and Mega Stone in a Mega Evolution condition card; Rayquaza links to Dragon Ascent. Mega Stone item pages link back to the forms they trigger.
- Six base stats now appear as proportional bars with exact values and a total. The selected game's learnset is collapsed by default at the bottom of the Pokémon bubble, and Mega forms share their corresponding normal form's learnset.
- Pokémon records use a paper title plate with type-led accents; ability records use a bold single-color title and compact holder index. Homepage Pokémon art and result cards use solid framing instead of rainbow gradients.
- Pokémon ability entries are full, linked cards with a numbered marker, clear name and description, hidden-ability badge where applicable, and an integrated link cue.
- Evolution now shows the complete linked family as an arrowed chart, including branches, recorded conditions for the selected game group, and Mega form/stone branches. Wide families can scroll horizontally on mobile.

- Name, National number, generation, genus, representative flavor text, types, height, weight, and one header sprite with a small ✨ card at its top right to switch between standard and shiny renders. Its visible label shows the current state (Normal or Shiny), while its accessible name describes the action; the control reports when shiny art is unavailable.
- Six base stats, base experience, EV yield, current type defenses grouped by multiplier with type symbols, and normal and hidden abilities with descriptions.
- Egg groups, sex ratio or genderless status, capture rate, hatch cycles, growth rate, base friendship, color, body shape, habitat, baby/legendary/mythical indicators, and regional Pokédex numbers where sourced.
- Evolution family chart, a table grouping paired game versions with recorded evolution rules and one location where available, a form dropdown (or an explicit single-form message), and a selected game-group learnset with acquisition method and level.
- All English Pokédex entries in the pinned source appear together in one visible section. Entries for the selected game appear first and are highlighted.
- One row per source-indexed game group (for example, Red / Blue), with Japanese-only variants omitted and a representative location only where an encounter is recorded. Detailed source caveats remain in `docs/SOURCES.md` rather than in the detail bubble.

## Move, ability, and item bubbles

- Move type, damage category, power, accuracy, PP, priority, target, effect, effect chance, behavior flags, ailment, hit range, drain, healing, critical-rate stage, and recorded learners for the selected game group where available. English source move descriptions are grouped by game group.
- Ability effect text, holders, and English descriptions by game group.
- Item category, recorded cost, effect/description, evolution relationships, and English descriptions by game group.

## Data and older tools

- `scripts/build_dex.py` generates `data/dex.js` deterministically from pinned PokéAPI CSV commit `de6760be38b60a3024f1d9054330ff265f0dc619`. It refuses a checkout at another revision.
- `scripts/check_dex.py` checks entity counts, source relationships, representative forms and learnsets, metadata, static assets, and script/style paths. `docs/SOURCES.md` records provenance and rights boundaries.
- `ledger.html` offers six fixed team slots, a searchable Pokémon/form picker, Singles and Doubles modes, team names, and a selected game group for move suggestions (Champions by default). Each partner can have a nickname, gender, ability, held item, nature, shiny appearance, four moves, EVs, and IVs. The Tera type field appears with Scarlet/Violet selected. Mega forms prefill their known Mega Stone and use their normal form's learnset.
- Team drafts persist in browser storage. Users can save multiple named teams, reload or delete them, and export/import portable JSON files. The earlier matchup calculator, GO mode, and calculator presets were intentionally retired from the UI.

## Team planning additions

- Every Pokémon and form record offers **Add to team**. The builder opens a six-slot chooser, shows occupied slots before replacement, and carries the exact selected form into the chosen slot. Mega forms prefill a known Mega Stone.
- The builder's live battle readout counts shared defensive weaknesses, shared resistances and immunities, damaging-move type coverage, and repeated held items. Status/support moves do not contribute to offensive coverage. It recalculates after partner, item, move, training, or game-reference changes. Type calculations use the current pinned type chart and do not apply abilities, weather, or historical chart changes.
- A **Compare forms** panel lets readers place two forms side by side for types, abilities, transformation trigger, all six base stats, and total stats. It includes Mega Stone names where mapped.
- Collapsed learnsets now have move-name search, a learning-method filter, and a live result count. Mega learnsets continue to inherit from their base form.
- The Champions M-C planning check flags incomplete rosters, repeated National Dex numbers, repeated items, repeated nicknames, Battle Bond, duplicated moves, EV limits, missing known Mega Stones, and moves absent from the selected reference learnset. The official rules are linked in the builder. **Live species eligibility, restricted Pokémon, event exceptions, and full move legality remain unknown** because they are not present in the pinned PokéAPI snapshot; the builder does not present an all-clear as proof of battle legality.
- **Copy team link** creates a portable URL with a versioned, Unicode-safe encoded team. Opening it loads a new unsaved draft; JSON import/export and the saved-team archive remain available. Shared links contain team names and builds in the URL, so anyone with the link can read them.
- `scripts/check_team_tools.js` exercises the share-link round trip, defensive analysis, and duplicate checks.
- The featured Mega Rayquaza, Mega Mewtwo Y, and Ultra Necrozma art now floats over a slightly enlarged silhouette of each same sprite, with a small label instead of a rectangular poster card.
- Item catalog cards and detail bubbles show PokéAPI item sprites when present. Held items also show small sprites on team slots and beside the builder's item field. Sprite paths use the pinned item identifier, with missing remote art hidden cleanly.
- All 25 natures appear in a selectable 5×5 chart in the team builder. Row headings show the boosted stat, column headings show the reduced stat, and the diagonal holds neutral natures. A responsive card updates on selection with the 10% modifiers or a neutral-nature explanation. The mapping is generated from the pinned PokéAPI nature tables.
- The team builder shows trained and projected in-battle stats at level 50. The preview recalculates after form, nature, ability, held item, EV, and IV selections. Supported direct stat modifiers include Choice items, Assault Vest, Eviolite, Iron Ball, Power training items, selected species items, Huge Power, and Pure Power. Choice items prominently warn that the holder becomes locked into its first move; Assault Vest warns about status moves. Choice Scarf correctly multiplies Speed by 1.5, not 2. Conditional field effects, temporary stages, move damage, and unsupported item or ability effects are excluded from the projection.
- New team slots explicitly start with 31 IVs in every stat. EV/IV training opens by default and includes one-click 252/252/4 EV spreads for fast physical and special attackers, physical and special walls, and a bulky physical attacker, plus Clear EVs and Max IVs buttons. Applying a preset keeps training open and refreshes the stat projection.
- The effective-stat preview recognizes a held Mega Stone or Primal Orb on a normal Pokémon or its selected transformed form, resolves the resulting form, and shows before/after level 50 stats with base-stat changes and the new ability and description. A missing or mismatched trigger leaves normal-form stats in place with a warning. Mega Rayquaza uses Dragon Ascent instead of a stone.
- Adding a Mega or Primal form automatically equips its exact Mega Stone, Red Orb, or Blue Orb and locks the held-item field. Choosing a matching stone or orb for a normal Pokémon now changes the team slot to its Mega or Primal form, including its sprite and ability selection. A return control restores the normal form and clears the item. Saved, imported, and shared teams apply the same item-to-form matching when loaded, then normalize transformed forms to their required item. Mega Rayquaza remains free to hold an item because its trigger is Dragon Ascent. Primal forms share their normal form's learnset.

## Remaining limits

- The selected game filters learnsets, move learners, entries, and encounters. Types, base stats, ability assignments, item effects, evolution rules, and type defenses are not yet fully version-specific.
- A game index or missing encounter record does not by itself confirm whether a Pokémon is obtainable. Event, transfer, and detailed availability rules remain to be modeled.
- Full Mega/Primal, Dynamax/Gigantamax, Z-Move/Ultra Burst, and Terastallization mechanics and eligibility are not complete. Some forms and related items appear in the source data, but trigger rules need further work.
- Pokémon HOME images are 2D renders from PokéAPI's sprite host, may be missing for some forms, and are not covered by this project's MIT code license. Interactive 3D models are not included.
- The generated data file is large and should be served with compression. Local HTTP browser checks covered the Pokédex, team builder, Mega/Primal item switching, and representative sprite layouts at desktop and mobile widths; a complete remote-art availability audit remains open.
