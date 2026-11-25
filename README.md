# Pokémon Ledger v3

Version 3 turns the original battle ledger into a linked **Pokédex and team builder**. Use it to look up Pokémon across forms and games, follow connections between moves, abilities, items, and evolutions, then plan a six-Pokémon team. The site is static, open source, and dark by default. It runs without an account, backend, or live data API.

## What you can do

- **Explore the Pokédex:** search 1,025 species and 1,351 Pokémon/form records, plus 938 moves, 374 abilities, and 2,223 items. Filter Pokémon and moves by type, choose a game reference, and share a direct link to a record.
- **Read connected details:** open a Pokémon's species profile, base stats, type defenses, abilities, evolution chart, forms, game records, Pokédex entries, and learnset. Move, ability, and item records include their sourced descriptions and links back to related Pokémon. Compare forms side by side and toggle standard or shiny art where available.
- **Build a team:** fill six slots for Singles or Doubles, choose moves and held items, set a nature in a stat increase/decrease grid, and assign EVs and IVs. New partners start with maximum IVs; common EV spreads are one click away.
- **Preview battle stats:** see level 50 trained and projected stats, supported item and ability effects, and warnings for Choice items. Mega Stones and Primal Orbs select their matching forms, lock the required item, and show the changed stats and abilities.
- **Review and keep teams:** inspect shared weaknesses, resistances, damaging-move coverage, repeated items, and locally checkable format rules. Save teams in this browser, export or import JSON, or copy a shareable team link.

The Pokédex is at [`index.html`](index.html); the team builder is at [`ledger.html`](ledger.html). Older `pokedex.html` links redirect to the home page. The visual design uses locally hosted Hubot Sans and Kalnia with an editorial layout inspired by Kelvin; it does not reuse Kelvin's assets.

## Run locally

Open `index.html` directly, or serve the repository root:

```bash
python -m http.server 8080
```

Visit <http://localhost:8080/>. All reference data and site logic are local. Pokémon HOME-style renders and item sprites load from [PokéAPI Sprites](https://github.com/PokeAPI/sprites) when online; missing remote art is hidden.

## Check before committing or deploying

```bash
python scripts/check_dex.py
node scripts/check_team_stats.js
node scripts/check_team_tools.js
git diff --check
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for static hosting and browser checks. `data/dex.js` is generated from a pinned [PokéAPI](https://github.com/PokeAPI/pokeapi) CSV revision by `scripts/build_dex.py`; do not edit it by hand. [docs/SOURCES.md](docs/SOURCES.md) records the revision, rebuild steps, field coverage, font licenses, and image rights. [features.md](features.md) is the detailed feature inventory, and [POKEDEX_ROADMAP.md](POKEDEX_ROADMAP.md) tracks remaining work.

## Current limits

The selected game filters learnsets, move learners, descriptions, Pokédex entries, and recorded encounters. Other facts are not yet fully version-specific. A game index or missing encounter row does not prove whether a Pokémon can be obtained in that game. The team builder's Champions checks cannot establish the complete live eligible roster or full move legality. Some form art is unavailable, and the linked HOME-style images are 2D renders, not interactive 3D models.

This is an independent fan reference. Thanks to the PokéAPI data and sprite contributors; see [CREDITS.md](CREDITS.md). The MIT license covers original project code, not Pokémon names, game text, or artwork.
