# Deployment and Release Guide

Royal Type Ledger is a build-free static site. The publish directory is the
repository root, and the complete `data/` directory must be deployed beside
`index.html`.

## Pre-deployment checklist

1. Confirm these files are included:
   - `index.html`
   - `data/pokemon-data.js`
   - `data/abilities.js`
   - `data/moves.js`
2. Confirm local environments, `.env` files, credentials, private keys,
   certificates, logs, and editor folders are not being uploaded.
3. Serve the site over HTTP locally and verify there are no failed data-script
   requests in the browser console.
4. Test:
   - Pokémon and ability search.
   - A single- and dual-type matchup.
   - Attack and Defense modes.
   - Mainline and Pokémon GO modes.
   - Ability, weather, Terastallization, and STAB behavior.
   - Move damage output.
   - Team builder selectors.
   - Saved presets, share links, and print output.
5. Check a desktop viewport and a narrow mobile viewport.
6. Run:

```bash
git status --short
git diff --check
```

## Local production-like preview

Opening `index.html` directly works for normal use. A local static server is
recommended when checking relative asset paths:

```bash
python -m http.server 8080
```

Open <http://localhost:8080/> and keep the terminal process running while
testing. No package installation is required.

## GitHub Pages

1. Push the repository to GitHub.
2. Open **Settings > Pages**.
3. Choose **Deploy from a branch**.
4. Select the production branch and the `/ (root)` folder.
5. Save and wait for the Pages deployment.
6. Open the generated URL and complete the pre-deployment checklist.

No GitHub Actions workflow or build command is required.

## Netlify

### Repository deployment

1. Select **Add new site > Import an existing project**.
2. Select the repository.
3. Leave the build command empty.
4. Set the publish directory to the repository root.
5. Deploy and test the generated URL.

### Manual deployment

Drag the repository root into Netlify's deploy dropzone. Upload the complete
folder, not only `index.html`.

## Vercel

1. Import the repository.
2. Select the static or **Other** framework preset.
3. Leave the build command empty.
4. Use `.` or the repository root as the output directory.
5. Deploy and verify the generated URL.

## Cloudflare Pages

1. Create a Pages project from the repository.
2. Select the production branch.
3. Leave the build command empty.
4. Set the build output directory to `.`.
5. Deploy and complete the validation checklist.

## Conventional web server

Copy the repository root to the server's public directory. The server only
needs to return `index.html` and the JavaScript files under `data/`. Configure
`index.html` as the directory index if the server requires it.

No PHP, Node process, database, proxy, rewrite rule, or server-side API is
required. Enable HTTPS on any public domain.

If supported by the host:

- Enable compression for HTML and JavaScript.
- Cache the local data files and HTML according to the release strategy.
- Avoid immutable caching unless filenames are versioned or cache invalidation
  is configured.
- Return a normal 404 response for missing files.

## Security and repository hygiene

The application does not read credentials or environment variables and does
not require secrets. Do not commit API tokens, private keys, credentials,
`.env` files, virtual environments, personal exports, or local logs.

The included [`.gitignore`](./.gitignore) excludes common environments,
secrets, dependency folders, build output, logs, and editor files. Review the
complete diff before publishing.

The Google Fonts stylesheet is the only external runtime resource. For a
fully offline deployment, replace it with locally hosted font files and update
the font declarations in `index.html`.

## Data refresh and release procedure

The editable browser-ready datasets are:

- [`data/pokemon-data.js`](./data/pokemon-data.js): species/forms, types,
  abilities, and recorded movepools.
- [`data/abilities.js`](./data/abilities.js): ability names and descriptions.
- [`data/moves.js`](./data/moves.js): move names, types, categories, power,
  accuracy, PP, and descriptions.

Refresh all related files together so identifiers, names, ability assignments,
and move pools remain aligned. After refreshing:

1. Start a local static server.
2. Search a base species, evolution, regional form, and Mega/form record.
3. Open a dossier and verify ability descriptions.
4. Verify both STAB and non-STAB move groups.
5. Hover or focus move chips and check their metadata.
6. Check mainline and GO damage output.
7. Check the browser console for data-loading errors.
8. Re-run the pre-deployment checklist.

The effectiveness chart and application logic remain in `index.html` to
preserve the build-free deployment model.

## Calculation scope

Mainline effectiveness uses `4x`, `2x`, `1x`, `0.5x`, `0.25x`, and `0x`.
Pokémon GO mode uses the application's documented scale:

- Super-effective: `1.6x`
- Resisted: `0.625x`
- Immunity representation: `0.390625x`
- Weather boost: `1.2x`

Damage output is an estimate. It does not model every held item, critical hit,
random battlefield effect, stat stage, move-specific exception, or
game-version rule. Verify exact competitive legality and mechanics against the
target game's current rules.
