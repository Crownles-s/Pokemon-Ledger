# Pokédex visual direction

The live [Kelvin site](https://kelvin.8b.com/?ref=onepagelove) was inspected by scrolling from its hero through the story, lineup, schedule, archive, and ticket sections on 2026-11-25. This is a record of the choices applied to the Pokédex, rather than a copy of Kelvin's layout or content.

## Observed design language

- **Type:** Hubot Sans carries compact navigation, body copy, condensed display lettering, numbers, and small uppercase labels. Kalnia is used at light weights for oversized, tightly spaced editorial headlines. Tiny tracked labels sit beside very large type.
- **Scale and rhythm:** The hero word is larger than the viewport and cropped. Story headlines take several lines. Small metadata and generous empty space make the oversized text feel intentional.
- **Color:** Near-black and warm paper alternate by section. Yellow, orange, hot pink, purple, cyan, and electric blue form a thermal spectrum. Bright color is concentrated in lettering and art, while body copy stays readable.
- **Composition:** Photography is sliced into horizontal thermal and natural-light bands. Cards overlap and rotate slightly. A thin oval crosses the hero. Text and imagery do not line up on one rigid grid. Schedule panels are staggered, sharp-edged, and intensely colored.
- **Graphic details:** Hairline rules, uppercase labels, hard rectangular frames, small inset caption strips, strong drop shadows, outlined calls to action, and occasional circular marks provide a printed-poster feel.
- **Motion:** The lineup images spread from a stacked composition as the page scrolls. Large horizontal archive imagery moves through a pinned section. Entrance motion, hover movement, and the heat/light image split give the page energy without animating every line of copy.

## Applied here

- The Pokédex stays dark by default. Warm paper appears as an interlude and final section, with a thermal hero word and scrolling yellow index strip.
- Mega Rayquaza, Mega Mewtwo Y, and Ultra Necrozma HOME-style renders form an uneven, layered collage in solid paper-colored frames. A thin oval crosses the composition.
- The search catalog uses rectangular poster cards with alternating solid tones and subtle rotations. The selected category is a bright tab, and text-only records receive larger Kalnia titles and stronger thermal accents.
- Scroll entrances reveal the intro, headings, and catalog cards. The hero art fans out on load; the index strip moves slowly. Hovered cards lift and straighten. All nonessential motion stops when reduced motion is requested.
- Search, filters, tables, and the expanded record remain straightforward and legible. Source artwork, words, branding, and the exact Kelvin layout were not reused.
- The Pokémon art and catalog cards now use solid, restrained colors. The detail bubble uses a paper identity plate, type-led stat bars, and a lineage chart; ability details use a single yellow title surface and an open holder index.
- Lineage is a horizontally scrollable family chart. Its paper species cards and darker condition labels are connected by arrows, with Mega transformations visually distinguished from species evolutions.
- The standard and shiny art share the record header sprite. A small sparkle button switches between them; there is no separate art section.
- The team builder uses the same Hubot Sans and Kalnia files and shared color tokens as the Pokédex. Its roster sits in sharp paper and ink panels, with the same label scale, thermal headline accent, and rectangular controls.

The existing font files and licenses are under `assets/fonts/`. Pokémon imagery is linked from PokéAPI's sprite collection; its rights are separate from the repository's code license. See `SOURCES.md`.
