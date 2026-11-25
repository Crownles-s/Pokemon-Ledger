/* Mega Stone links curated against the pinned PokéAPI item and form records.
 * Rayquaza is the one stone-free Mega Evolution in this snapshot. */
const MEGA = (() => {
  'use strict';
  const stoneBySpecies = {
    3:698,9:700,15:811,18:803,36:2233,65:718,71:2234,80:801,94:695,
    115:714,121:2235,127:710,130:715,142:711,149:2236,154:2237,
    160:2238,181:697,208:802,212:709,214:719,227:2239,229:705,
    248:708,254:794,257:703,260:793,282:696,302:795,303:720,
    306:706,308:704,310:721,319:800,323:808,334:796,354:707,
    358:2264,359:716,362:804,373:810,376:799,380:760,381:761,
    398:2266,428:809,445:722,448:712,460:713,475:797,478:2240,
    485:2241,491:2242,500:2243,530:2244,531:798,545:2245,560:2246,
    604:2247,609:2248,623:2269,652:2249,655:2250,658:2251,
    668:2252,670:2253,678:2270,687:2254,689:2255,691:2256,
    701:2257,718:2258,719:805,740:2271,768:2272,780:2259,
    801:2273,807:2260,870:2261,952:2274,970:2277,978:2276,998:2275
  };
  const stoneByForm = {
    10034:699,10035:717,10043:701,10044:702,
    10304:2262,10305:2263,10307:2265,10309:2267,10310:2268
  };
  const baseByForm = {
    10318:10147,10323:10258,10324:10259,10326:10025
  };
  const primalOrbByForm = {10077:468,10078:467};
  function base(pokemon) {
    return DEX.pokemon[baseByForm[pokemon.id]] ||
      Object.values(DEX.pokemon).find(form => form.species === pokemon.species && form.default);
  }
  function stone(pokemon) {
    return DEX.items[stoneByForm[pokemon.id] || stoneBySpecies[pokemon.species]] || null;
  }
  function primalOrb(pokemon) {
    return DEX.items[primalOrbByForm[pokemon.id]] || null;
  }
  function requiredItem(pokemon) {
    return pokemon.mega ? stone(pokemon) : primalOrb(pokemon);
  }
  function formForItem(pokemon, itemId) {
    if (!pokemon || !itemId) return null;
    const normal = requiredItem(pokemon) ? base(pokemon) : pokemon;
    return Object.values(DEX.pokemon).find(form =>
      base(form)?.id === normal?.id && requiredItem(form)?.id === +itemId
    ) || null;
  }
  function learnset(pokemon, game) {
    const rows = DEX.learnsets[game] || {};
    if (!pokemon.mega && !primalOrb(pokemon)) return {rows: rows[pokemon.id] || [], base: null};
    const normal = base(pokemon);
    return {rows: rows[normal?.id] || [], base: normal};
  }
  return {base, stone, primalOrb, requiredItem, formForItem, learnset};
})();
