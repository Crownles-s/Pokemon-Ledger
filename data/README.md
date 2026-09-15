# Pokemon data

These browser-ready files are intentionally separate from `index.html` so the
data can be inspected and updated without editing the application logic:

- `pokemon-data.js` contains species/forms, each species' types, registered
  abilities, and the full move pool available in the source tables.
- `abilities.js` contains ability names and English effect descriptions,
  including hidden and signature abilities.
- `moves.js` contains move type, category, base power, accuracy, PP, and a
  source description.

The files are generated from the PokeAPI CSV tables for the current mainline
dataset. They are loaded locally by script tags; the app makes no runtime API
requests. If the source tables are refreshed, regenerate these files together
so their numeric IDs and names remain aligned.
