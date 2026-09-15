# Royal Type Ledger

Royal Type Ledger is a static, client-side Pokémon matchup workspace. It
combines a type-effectiveness ledger, Pokémon dossier, move calculator, team
builder, presets, shareable state, and Pokémon GO mode in one responsive page.

The application has no backend, account system, build step, runtime API calls,
or required environment variables. It can be opened directly or deployed to
any static host.

## Features

- All 18 Pokémon types with single- and dual-type matchup calculations.
- Attack and Defense modes with live weaknesses, resistances, immunities, and
  ranked best counters.
- Ability modifiers, weather boosts, defensive Terastallization, and STAB
  indication.
- Pokémon and form search covering the local generations I-IX registry,
  including evolutions, regional forms, Mega forms, legendaries, and other
  recorded forms.
- Pokémon dossier with types, abilities, hidden-ability labels, descriptions,
  related forms, and STAB/non-STAB movepool groups.
- Type-colored move details with hover and keyboard-focus popups.
- Move calculator with recorded move power, custom power, stats, level,
  effectiveness, STAB, and mainline or Pokémon GO output.
- Six-seat team builder with species-specific abilities and four moves per
  seat, plus combined coverage.
- Light and dark themes, responsive mobile layout, sticky live results,
  keyboard focus states, semantic labels, reduced-motion support, and print
  styling.
- Browser-local named presets and URL-encoded shareable ledger state.

## Quick start

### Open directly

Open [`index.html`](./index.html) in a modern browser.

### Serve locally

For deployment-like testing, serve the repository root with any static server:

```bash
python -m http.server 8080
```

Then visit <http://localhost:8080/>.

Keep the entire [`data/`](./data/) directory beside `index.html`; the page
loads its browser-ready data files with relative script paths.

## Repository layout

```text
.
├── index.html                 # Application markup, styles, and logic
├── data/
│   ├── pokemon-data.js        # Pokémon/forms, types, abilities, movepools
│   ├── abilities.js           # Ability names and descriptions
│   ├── moves.js               # Move metadata and descriptions
│   └── README.md              # Dataset maintenance notes
├── DEPLOYMENT.md              # Static hosting and release procedures
├── .gitignore                 # Local secrets, environments, and artifacts
├── LICENSE
└── README.md
```

## Data

The datasets are stored locally so the application makes no runtime request to
PokeAPI or another application service. The current browser-ready data was
generated from PokeAPI CSV tables. See [`data/README.md`](./data/README.md) for
the data-file maintenance notes.

## Deployment

This is a static site: there is no install command, build command, backend
process, database, or environment configuration. See
[`DEPLOYMENT.md`](./DEPLOYMENT.md) for:

- GitHub Pages, Netlify, Vercel, Cloudflare Pages, and conventional web-server
  procedures.
- Pre-deployment validation.
- Cache and HTTPS guidance.
- Security and secret-handling hygiene.
- Data refresh and release checks.

## Scope

Royal Type Ledger is a planning and reference tool, not a complete battle
simulator. Damage output is an estimate and does not model every item,
critical-hit rule, stat stage, move-specific exception, battlefield effect, or
game-version rule. Verify exact competitive legality against the target game's
current rules.

## Technology

- HTML5
- CSS custom properties, responsive rules, transitions, and print styles
- Vanilla JavaScript
- Local browser-ready JavaScript datasets
- Google Fonts CDN for typography

No framework, package manager, bundler, runtime library, backend, or database
is required.

## License and attribution

Pokémon and related names, characters, and trademarks belong to Nintendo,
Game Freak, and The Pokémon Company. This is an independent educational and
personal-use reference tool. See [`LICENSE`](./LICENSE).
