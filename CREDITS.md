# Credits and third-party notices

Pokémon Ledger is an independent fan project. Thanks to the **PokéAPI team and contributors** for making structured Pokémon information and sprite references available to developers.

| Project | How Pokémon Ledger uses it | Source and terms |
| --- | --- | --- |
| [PokéAPI](https://github.com/PokeAPI/pokeapi) | `scripts/build_dex.py` generates the local `data/dex.js` snapshot from its CSV tables. The imported revision is `de6760be38b60a3024f1d9054330ff265f0dc619`. The website does not call the live API at runtime. | [Source CSV](https://github.com/PokeAPI/pokeapi/tree/de6760be38b60a3024f1d9054330ff265f0dc619/data/v2/csv) · [Project license](https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md) |
| [PokéAPI Sprites](https://github.com/PokeAPI/sprites) | The site links to Pokémon HOME-style standard and shiny renders hosted by this repository, including the three featured homepage forms. Sprite files are requested from `raw.githubusercontent.com` and are not bundled here. | [Sprite README and contributor credits](https://github.com/PokeAPI/sprites/blob/master/README.md) · [Sprite repository license and image-rights notice](https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt) |

PokéAPI's software repository carries its own license. The sprite repository's license states that its **image contents are copyright The Pokémon Company**. Pokémon names, game text, characters, and artwork are not covered by Pokémon Ledger's MIT license. For detailed data provenance, regeneration instructions, font credits, and rights boundaries, see [docs/SOURCES.md](docs/SOURCES.md).

Pokémon Ledger is not affiliated with or endorsed by PokéAPI or The Pokémon Company.
