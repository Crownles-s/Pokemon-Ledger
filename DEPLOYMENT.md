# Static deployment

Publish the repository root as a static site. `index.html` is the Pokédex home page; `ledger.html` is the team builder. Keep the HTML, JS, and CSS files at the root together, including `theme.css`, `styles.css`, `design.css`, `ledger.css`, and `team-builder.js`, plus `assets/fonts/` and the entire `data/` directory. There is no deploy-time build command or backend requirement. Enable HTTP compression for the generated data file.

To preview locally, run `python -m http.server 8080` in the repository root and open <http://localhost:8080/>. Pokémon data is local; Pokémon HOME-style renders are requested from PokéAPI's sprite repository at runtime. If those images are unavailable, the site hides them.

Before publishing, run:

```bash
python scripts/check_dex.py
node scripts/check_team_stats.js
node scripts/check_team_tools.js
git diff --check
```

Inspect a Pokémon, move, ability, and item record; switch game versions; and test search, type filters, and team building on desktop and mobile. Check the browser console for failed local scripts. Review `docs/SOURCES.md` for data and image rights. Set the static host's publish directory to the repository root and enable HTTPS.
