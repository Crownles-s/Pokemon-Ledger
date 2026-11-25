# Data and image sources

For a short, repository-level acknowledgement of both PokéAPI projects, see [CREDITS.md](../CREDITS.md).

## Structured data

The generated `data/dex.js` uses the [PokéAPI CSV source](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv) at commit `de6760be38b60a3024f1d9054330ff265f0dc619` (fetched 2026-11-25). `scripts/build_dex.py` reads its species, Pokémon/form, type, stat, nature, ability, move, item, evolution, English name/flavor, version-group, and learnset tables. The builder's nature panel uses `natures.csv` and English `nature_names.csv` for the raised and lowered stat. PokéAPI's project license is [BSD 3-Clause](https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md). Pokémon names, facts, and official text may have separate rights; the repository's MIT code license does not assert ownership over them.

The importer chooses the latest English flavor row by source version ID or version-group ID for the short lead description. The expanded panels show all recorded English Pokédex entries and move, ability, and item flavor text, grouped by version where the source provides it. The game selector filters learnsets, move learners, entries, and recorded encounters. Form types, base stats, ability assignments, item effects, and evolution conditions are not yet version-filtered. A `pokemon_game_indices.csv` row means the Pokémon has an internal game index, **not** necessarily that it is obtainable in that game. The game table groups paired versions and shows one representative encounter location per group when the source has one. Japanese-only variants are omitted from that table. Some source version groups have no learnset or encounter rows. Empty results are labeled as missing records, not proof of unavailability.

Rebuild from the pinned source:

```powershell
git -c http.sslBackend=openssl clone --depth 1 --filter=blob:none --sparse https://github.com/PokeAPI/pokeapi.git work/pokeapi-source
cd work/pokeapi-source
git config --local http.sslBackend openssl
git checkout de6760be38b60a3024f1d9054330ff265f0dc619
git sparse-checkout set data/v2/csv
cd ../..
python scripts/build_dex.py work/pokeapi-source/data/v2/csv
```

The `work/` checkout is ignored by Git. The generated JS is committed for static hosting and offline data access.

`data/mega.js` links Mega form records to the corresponding Mega Stone item records in the same pinned source. The mapping is curated by form and item ID, with separate X/Y/Z stones where appropriate. Rayquaza has no stone in this mapping and its record links to Dragon Ascent. Mega forms display the selected game's learnset of their matching normal form, including the separate normal variants for Original Magearna, female Meowstic, and Droopy/Stretchy Tatsugiri. This is a form/stone relationship, not a claim that Mega Evolution is available in every selected game.

## Images

The page displays images from [PokéAPI's sprites collection](https://github.com/PokeAPI/sprites), using its Pokémon HOME-style renders by Pokémon record ID and [item sprites](https://github.com/PokeAPI/sprites/tree/master/sprites/items) by the pinned CSV identifier when available. The images are loaded from `raw.githubusercontent.com`; they are not bundled or covered by this project's MIT license. The sprite repository's [license file](https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt) says its image contents are copyright The Pokémon Company, even though the repository itself is distributed under CC0. These are **2D renders**, not interactive 3D models. Missing image URLs hide the image. An image's availability is not an open license or an authorization to redistribute it.

No Pokémon Database copy, images, or CSS are imported. [Kelvin](https://onepagelove.com/kelvin) informs the broad visual direction (warm neutrals, thermal accents, editorial type and layered composition), not page content or exact layout.

## Typography

The dark visual design uses locally hosted [Hubot Sans](https://github.com/github/hubot-sans) at commit `d4b2f67cd7686f5907296d3f027112bbc4f69f42` and [Kalnia](https://github.com/google/fonts/tree/main/ofl/kalnia) at Google Fonts commit `83c62e30d87daa70216dab6b984d00d20d96d585`, the two type families noted in the Kelvin reference. Both are under the SIL Open Font License 1.1; their license texts are included in `assets/fonts/`. System fallbacks remain available.

## Team format checks

The team builder labels its planning panel **Champions regulation M-C**, following the [official regulation announcement](https://champions-news.pokemon-home.com/en/page/816.html), effective September 9 through December 2, 2026. The announcement says duplicate items are prohibited and Mega Evolution can be used once per battle; its eligible-Pokémon list is hosted in an app web view and is not included in this project's pinned source. The builder's other enforceable general tournament checks come from the [official Pokémon VGC Tournament Handbook](https://mcdn.pokemon.com/pokemon-prod/raw/upload/v1/live/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-vgc-tournament-handbook-en.pdf), sections 2.2.3–2.4.1: one National Dex number per team, unique nicknames, and no Battle Bond. EV and duplicate-move checks are builder sanity checks. Move-reference checks only compare a selected move with local PokéAPI learnset rows, not full Champions legality. The current regulation's eligible roster and special exceptions are therefore shown as unknown.

## Team stat projection

`team-stats.js` computes modern level 50 stats from the pinned base stats and nature table plus the builder's EVs and IVs. It applies a curated set of direct item and ability modifiers whose effects are represented in the pinned PokéAPI records. For example, the source item entry states that Choice Scarf raises Speed by **50%** and restricts the holder to one selected move. The projection shows this as ×1.5 with a move-lock warning. Field conditions, stat stages, move damage, and unsupported or version-specific effects are outside this calculation; the interface labels the result as a projection.

Mega projections use the curated form-to-stone mapping in `data/mega.js` and the pinned base stats and ability records. The selected form's matching stone determines the after-Mega form; Rayquaza uses Dragon Ascent. A missing or mismatched trigger shows the normal-form projection. The stat preview does not independently establish whether a Mega form is legal in the selected game or Champions regulation.
The builder also uses that mapping to lock a selected Mega form to its stone, including when loading older saved, imported, or linked teams. This is a team-planning rule for explicitly selected Mega forms; it does not validate the stone's availability in every game.

The same curated mapping pairs Primal Kyogre (form `10077`) with Blue Orb (item `468`) and Primal Groudon (form `10078`) with Red Orb (item `467`), using pinned form and item IDs. [Official Pokémon tournament team examples](https://www.pokemon.com/us/play-pokemon/nationals-2016/teams/popular-teams) also show Kyogre holding Blue Orb and Groudon holding Red Orb. Primal forms inherit their normal form's learnset and use the matching orb for the builder's item lock and before/after projection. This does not establish Primal Reversion eligibility in every game or regulation.
