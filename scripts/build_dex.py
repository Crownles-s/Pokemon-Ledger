"""Build browser-ready Pokédex data from a pinned PokéAPI CSV checkout.

Usage: python scripts/build_dex.py work/pokeapi-source/data/v2/csv
"""
import csv
import json
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

SOURCE_REVISION = "de6760be38b60a3024f1d9054330ff265f0dc619"
ROOT = Path(__file__).resolve().parents[1]
CSV = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "work/pokeapi-source/data/v2/csv"
EN = "9"

actual_revision = subprocess.check_output(
    ["git", "-C", str(CSV.resolve().parents[2]), "rev-parse", "HEAD"], text=True
).strip()
if actual_revision != SOURCE_REVISION:
    raise SystemExit(f"Expected PokéAPI {SOURCE_REVISION}, found {actual_revision}")


def rows(name):
    with (CSV / f"{name}.csv").open(encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


def num(value):
    return int(value) if value not in (None, "") else None


def latest_text(table, entity_key, text_key, group_key="version_group_id"):
    result = {}
    for row in rows(table):
        if row.get("language_id", row.get("local_language_id")) != EN:
            continue
        key = num(row[entity_key])
        group = num(row[group_key]) or 0
        if key not in result or group >= result[key][0]:
            result[key] = (group, " ".join(row[text_key].split()))
    return {key: value for key, (_, value) in result.items()}


def en_names(table, key):
    return {num(r[key]): r["name"] for r in rows(table) if r["local_language_id"] == EN}


types = {num(r["id"]): r["identifier"].title() for r in rows("types")}
type_chart = {types[num(r["damage_type_id"])]: {} for r in rows("type_efficacy")}
for r in rows("type_efficacy"):
    type_chart[types[num(r["damage_type_id"])]][types[num(r["target_type_id"])]] = num(r["damage_factor"]) / 100
vg = {num(r["id"]): {"id": num(r["id"]), "name": r["identifier"].replace("-", " ").title(), "generation": num(r["generation_id"]), "order": num(r["order"])} for r in rows("version_groups")}
methods = {num(r["id"]): r["identifier"].replace("-", " ").title() for r in rows("pokemon_move_methods")}
stats = {num(r["id"]): r["identifier"] for r in rows("stats")}
nature_names = en_names("nature_names", "nature_id")
natures = {num(r["id"]): {"id": num(r["id"]), "name": nature_names[num(r["id"])], "increased": stats[num(r["increased_stat_id"])], "decreased": stats[num(r["decreased_stat_id"])]} for r in rows("natures")}
categories = {num(r["id"]): r["identifier"].replace("-", " ").title() for r in rows("item_categories")}
category_names = en_names("item_category_prose", "item_category_id")
species_names = en_names("pokemon_species_names", "pokemon_species_id")
species_genera = {num(r["pokemon_species_id"]): r["genus"] for r in rows("pokemon_species_names") if r["local_language_id"] == EN}
egg_names = en_names("egg_group_prose", "egg_group_id")
growth_rates = {num(r["id"]): r["identifier"].replace("-", " ").title() for r in rows("growth_rates")}
colors = {num(r["id"]): r["identifier"].title() for r in rows("pokemon_colors")}
shapes = {num(r["id"]): r["identifier"].replace("-", " ").title() for r in rows("pokemon_shapes")}
habitats = {num(r["id"]): r["identifier"].replace("-", " ").title() for r in rows("pokemon_habitats")}
versions = {num(r["id"]): {"id": num(r["id"]), "name": r["identifier"].replace("-", " ").title(), "group": num(r["version_group_id"])} for r in rows("versions")}
pokemon_names = {num(r["pokemon_form_id"]): r["pokemon_name"] for r in rows("pokemon_form_names") if r["local_language_id"] == EN and r["pokemon_name"]}
form_rows = rows("pokemon_forms")
form_by_pokemon = defaultdict(list)
for r in form_rows:
    form_by_pokemon[num(r["pokemon_id"])].append(r)

species = {}
for r in rows("pokemon_species"):
    sid = num(r["id"])
    species[sid] = {"id": sid, "name": species_names.get(sid, r["identifier"].replace("-", " ").title()), "genus": species_genera.get(sid, ""), "generation": num(r["generation_id"]), "evolvesFrom": num(r["evolves_from_species_id"]), "legendary": r["is_legendary"] == "1", "mythical": r["is_mythical"] == "1", "baby": r["is_baby"] == "1", "genderRate": num(r["gender_rate"]), "captureRate": num(r["capture_rate"]), "baseHappiness": num(r["base_happiness"]), "hatchCycles": num(r["hatch_counter"]), "growthRate": growth_rates.get(num(r["growth_rate_id"])), "color": colors.get(num(r["color_id"])), "shape": shapes.get(num(r["shape_id"])), "habitat": habitats.get(num(r["habitat_id"])), "eggGroups": [], "dexNumbers": [], "entries": []}

for r in rows("pokemon_egg_groups"):
    species[num(r["species_id"])]["eggGroups"].append(egg_names.get(num(r["egg_group_id"]), "Unknown"))
pokedex_names = en_names("pokedex_prose", "pokedex_id")
for r in rows("pokemon_dex_numbers"):
    species[num(r["species_id"])]["dexNumbers"].append({"dex": pokedex_names.get(num(r["pokedex_id"]), "Regional Pokédex"), "number": num(r["pokedex_number"])})

for r in rows("pokemon_species_flavor_text"):
    if r["language_id"] == EN and num(r["version_id"]) in versions:
        species[num(r["species_id"])]["entries"].append({"version": num(r["version_id"]), "text": " ".join(r["flavor_text"].split())})

flavors = latest_text("pokemon_species_flavor_text", "species_id", "flavor_text", "version_id")
for sid, text in flavors.items():
    if sid in species:
        species[sid]["flavor"] = text

pokemon = {}
for r in rows("pokemon"):
    pid, sid = num(r["id"]), num(r["species_id"])
    base = species[sid]["name"]
    fs = form_by_pokemon[pid]
    primary = next((f for f in fs if f["is_default"] == "1"), fs[0] if fs else None)
    suffix = (primary or {}).get("form_identifier", "").replace("-", " ").title()
    name = pokemon_names.get(num(primary["id"])) if primary else None
    name = name or (base if r["is_default"] == "1" else f"{base} {suffix or r['identifier'].replace('-', ' ').title()}")
    pokemon[pid] = {"id": pid, "species": sid, "name": name, "default": r["is_default"] == "1", "height": num(r["height"]), "weight": num(r["weight"]), "baseExperience": num(r["base_experience"]), "types": [], "stats": {}, "effort": {}, "abilities": [], "form": suffix, "mega": bool(primary and primary["is_mega"] == "1"), "battleOnly": bool(primary and primary["is_battle_only"] == "1"), "introducedIn": num(primary["introduced_in_version_group_id"]) if primary else None, "gameIndices": []}
for r in rows("pokemon_game_indices"):
    if num(r["pokemon_id"]) in pokemon:
        pokemon[num(r["pokemon_id"])]["gameIndices"].append(num(r["version_id"]))
for r in rows("pokemon_types"):
    pokemon[num(r["pokemon_id"])]["types"].append((num(r["slot"]), types[num(r["type_id"])]))
for r in rows("pokemon_stats"):
    pokemon[num(r["pokemon_id"])]["stats"][stats[num(r["stat_id"])]] = num(r["base_stat"])
    if num(r["effort"]):
        pokemon[num(r["pokemon_id"])]["effort"][stats[num(r["stat_id"])]] = num(r["effort"])
for r in rows("pokemon_abilities"):
    pokemon[num(r["pokemon_id"])]["abilities"].append({"id": num(r["ability_id"]), "hidden": r["is_hidden"] == "1"})
for p in pokemon.values():
    p["types"] = [t for _, t in sorted(p["types"])]

area_names = en_names("location_area_prose", "location_area_id")
location_names = en_names("location_names", "location_id")
areas = {num(r["id"]): (area_names.get(num(r["id"])) or location_names.get(num(r["location_id"])) or r["identifier"].replace("-", " ").title()) for r in rows("location_areas")}
encounters = defaultdict(dict)
for r in rows("encounters"):
    pid = num(r["pokemon_id"])
    if pid not in pokemon:
        continue
    version, area = num(r["version_id"]), num(r["location_area_id"])
    key = (version, area)
    low, high = num(r["min_level"]), num(r["max_level"])
    if key in encounters[pid]:
        old_low, old_high = encounters[pid][key]
        encounters[pid][key] = (min(old_low, low), max(old_high, high))
    else:
        encounters[pid][key] = (low, high)
for pid, records in encounters.items():
    pokemon[pid]["encounters"] = [[version, areas.get(area, "Unknown location"), low, high] for (version, area), (low, high) in sorted(records.items())]

move_names = en_names("move_names", "move_id")
move_flavor = latest_text("move_flavor_text", "move_id", "flavor_text")
damage_classes = {num(r["id"]): r["identifier"].title() for r in rows("move_damage_classes")}
target_names = en_names("move_target_prose", "move_target_id")
flag_names = en_names("move_flag_prose", "move_flag_id")
meta_rows = {num(r["move_id"]): r for r in rows("move_meta")}
meta_categories = {num(r["id"]): r["identifier"].replace("-", " ").title() for r in rows("move_meta_categories")}
meta_ailments = {num(r["id"]): r["identifier"].replace("-", " ").title() for r in rows("move_meta_ailments")}
move_effects = {num(r["move_effect_id"]): " ".join(r["short_effect"].split()) for r in rows("move_effect_prose") if r["local_language_id"] == EN}
moves = {}
for r in rows("moves"):
    mid = num(r["id"])
    meta = meta_rows.get(mid, {})
    moves[mid] = {"id": mid, "name": move_names.get(mid, r["identifier"].replace("-", " ").title()), "type": types[num(r["type_id"])], "category": damage_classes[num(r["damage_class_id"])], "power": num(r["power"]), "accuracy": num(r["accuracy"]), "pp": num(r["pp"]), "priority": num(r["priority"]), "generation": num(r["generation_id"]), "description": move_flavor.get(mid, ""), "effect": move_effects.get(num(r["effect_id"]), ""), "effectChance": num(r["effect_chance"]), "target": target_names.get(num(r["target_id"]), ""), "flags": [], "meta": {"category": meta_categories.get(num(meta.get("meta_category_id")), ""), "ailment": meta_ailments.get(num(meta.get("meta_ailment_id")), ""), "minHits": num(meta.get("min_hits")), "maxHits": num(meta.get("max_hits")), "drain": num(meta.get("drain")), "healing": num(meta.get("healing")), "critRate": num(meta.get("crit_rate")), "ailmentChance": num(meta.get("ailment_chance")), "flinchChance": num(meta.get("flinch_chance")), "statChance": num(meta.get("stat_chance"))}, "entries": []}
for r in rows("move_flag_map"):
    if num(r["move_id"]) in moves:
        moves[num(r["move_id"])]["flags"].append(flag_names.get(num(r["move_flag_id"]), "Other"))
for r in rows("move_flavor_text"):
    if r["language_id"] == EN and num(r["move_id"]) in moves:
        moves[num(r["move_id"])]["entries"].append({"group": num(r["version_group_id"]), "text": " ".join(r["flavor_text"].split())})

ability_names = en_names("ability_names", "ability_id")
ability_flavor = latest_text("ability_flavor_text", "ability_id", "flavor_text")
ability_prose = {num(r["ability_id"]): " ".join(r["short_effect"].split()) for r in rows("ability_prose") if r["local_language_id"] == EN}
abilities = {}
for r in rows("abilities"):
    aid = num(r["id"])
    abilities[aid] = {"id": aid, "name": ability_names.get(aid, r["identifier"].replace("-", " ").title()), "generation": num(r["generation_id"]), "description": ability_prose.get(aid) or ability_flavor.get(aid, ""), "entries": []}
for r in rows("ability_flavor_text"):
    if r["language_id"] == EN and num(r["ability_id"]) in abilities:
        abilities[num(r["ability_id"])]["entries"].append({"group": num(r["version_group_id"]), "text": " ".join(r["flavor_text"].split())})

item_names = en_names("item_names", "item_id")
item_flavor = latest_text("item_flavor_text", "item_id", "flavor_text")
item_prose = {num(r["item_id"]): " ".join((r["short_effect"] or r["effect"]).split()) for r in rows("item_prose") if r["local_language_id"] == EN}
items = {}
for r in rows("items"):
    iid, cid = num(r["id"]), num(r["category_id"])
    items[iid] = {"id": iid, "name": item_names.get(iid, r["identifier"].replace("-", " ").title()), "sprite": r["identifier"], "category": category_names.get(cid, categories.get(cid, "Other")), "cost": num(r["cost"]), "description": item_prose.get(iid) or item_flavor.get(iid, ""), "entries": []}
for r in rows("item_flavor_text"):
    if r["language_id"] == EN and num(r["item_id"]) in items:
        items[num(r["item_id"])]["entries"].append({"group": num(r["version_group_id"]), "text": " ".join(r["flavor_text"].split())})

# Compact learnsets, grouped by version and Pokémon. Each entry is
# [move ID, method ID, level]. Duplicate identical rows are collapsed.
learnsets = defaultdict(lambda: defaultdict(set))
for r in rows("pokemon_moves"):
    version, pid = num(r["version_group_id"]), num(r["pokemon_id"])
    if version in vg and pid in pokemon:
        learnsets[version][pid].add((num(r["move_id"]), num(r["pokemon_move_method_id"]), num(r["level"]) or 0))

evolutions = {}
trigger_names = {num(r["id"]): r["identifier"].replace("-", " ").title() for r in rows("evolution_triggers")}
for r in rows("pokemon_evolution"):
    sid = num(r["evolved_species_id"])
    if sid not in species:
        continue
    conditions = []
    if r["minimum_level"]: conditions.append(f"Level {r['minimum_level']}")
    if r["gender_id"]: conditions.append("Female" if r["gender_id"] == "1" else "Male")
    if r["location_id"]: conditions.append(f"At {location_names.get(num(r['location_id']), 'a special location')}")
    if r["time_of_day"]: conditions.append(f"During {r['time_of_day']}")
    if r["known_move_id"]: conditions.append(f"Knows {moves[num(r['known_move_id'])]['name']}")
    if r["known_move_type_id"]: conditions.append(f"Knows a {types[num(r['known_move_type_id'])]}-type move")
    if r["minimum_happiness"]: conditions.append(f"Friendship at least {r['minimum_happiness']}")
    if r["minimum_beauty"]: conditions.append(f"Beauty at least {r['minimum_beauty']}")
    if r["minimum_affection"]: conditions.append(f"Affection at least {r['minimum_affection']}")
    if r["relative_physical_stats"]: conditions.append(f"Attack/Defense comparison {r['relative_physical_stats']}")
    if r["party_species_id"]: conditions.append(f"With {species[num(r['party_species_id'])]['name']} in party")
    if r["party_type_id"]: conditions.append(f"With {types[num(r['party_type_id'])]} type in party")
    if r["trade_species_id"]: conditions.append(f"Trade for {species[num(r['trade_species_id'])]['name']}")
    if r["needs_overworld_rain"] == "1": conditions.append("Overworld rain")
    if r["turn_upside_down"] == "1": conditions.append("Turn device upside down")
    if r["needs_multiplayer"] == "1": conditions.append("Multiplayer required")
    if r["minimum_steps"]: conditions.append(f"Walk at least {r['minimum_steps']} steps")
    if r["minimum_damage_taken"]: conditions.append(f"Take at least {r['minimum_damage_taken']} damage")
    if r["percentage_chance"]: conditions.append(f"{r['percentage_chance']}% chance")
    entry = {"trigger": trigger_names.get(num(r["evolution_trigger_id"]), "Other"), "level": num(r["minimum_level"]), "item": num(r["trigger_item_id"]) or num(r["held_item_id"]), "move": num(r["known_move_id"]), "time": r["time_of_day"] or None, "version": num(r["version_group_id"]), "conditions": conditions}
    evolutions.setdefault(sid, []).append(entry)

payload = {"source": SOURCE_REVISION, "versionGroups": sorted(vg.values(), key=lambda x: x["order"]), "versions": versions, "typeChart": type_chart, "methods": methods, "natures": natures, "species": species, "pokemon": pokemon, "moves": moves, "abilities": abilities, "items": items, "evolutions": evolutions, "learnsets": {v: {p: sorted(entries) for p, entries in group.items()} for v, group in learnsets.items()}}
assert len(species) == 1025 and len(pokemon) == 1351
assert all(p["species"] in species and all(a["id"] in abilities for a in p["abilities"]) for p in pokemon.values())
assert all(m in moves for group in learnsets.values() for entries in group.values() for m, _, _ in entries)
out = ROOT / "data/dex.js"
out.write_text("/* Generated by scripts/build_dex.py; source revision " + SOURCE_REVISION + " */\nconst DEX=" + json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + ";\n", encoding="utf-8")
print(f"Wrote {out}: {len(species)} species, {len(pokemon)} forms, {len(moves)} moves, {len(abilities)} abilities, {len(items)} items, {len(learnsets)} version groups")
