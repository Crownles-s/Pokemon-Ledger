/* Extra reference panels generated from the pinned PokéAPI CSV snapshot. */
const EXTRA = (() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const display = value => value == null || value === '' ? 'Not recorded' : esc(value);
  const groups = new Map(DEX.versionGroups.map(group => [group.id, group]));
  const groupName = id => groups.get(id)?.name || `Group ${id}`;
  const versionName = id => DEX.versions[id]?.name || `Version ${id}`;
  const stat = (name, value) => `<div class="stat"><small>${esc(name)}</small><b>${display(value)}</b></div>`;
  const entries = (records, title) => `<section class="record-section"><h3>${esc(title)}</h3>${records.length ? `<div class="entry-grid">${records.map(entry => `<div class="entry${entry.selected ? ' selected-entry' : ''}"><small>${esc(entry.label)}</small><p>${esc(entry.text)}</p></div>`).join('')}</div>` : '<p class="muted">No English entries in this snapshot.</p>'}</section>`;

  function gender(rate) {
    if (rate === -1) return 'Genderless';
    if (rate == null) return 'Not recorded';
    const digits = rate % 2 ? 1 : 0;
    return `${(100 * (8 - rate) / 8).toFixed(digits)}% male · ${(100 * rate / 8).toFixed(digits)}% female`;
  }

  const typeIcons = {Normal:'◉',Fire:'♨',Water:'◆',Electric:'ϟ',Grass:'❧',Ice:'❄',Fighting:'✦',Poison:'☣',Ground:'⛰',Flying:'➶',Psychic:'✺',Bug:'✣',Rock:'⬟',Ghost:'☾',Dragon:'◇',Dark:'◐',Steel:'⚙',Fairy:'✿'};
  const typeColors = {Normal:'#77745f',Fire:'#bd542f',Water:'#456eb2',Electric:'#8c7414',Grass:'#53863d',Ice:'#388b92',Fighting:'#a33e39',Poison:'#815099',Ground:'#8a6831',Flying:'#6b65a8',Psychic:'#ba4c77',Bug:'#718528',Rock:'#817342',Ghost:'#645084',Dragon:'#5751b6',Dark:'#594c48',Steel:'#606b7c',Fairy:'#a25988'};
  const standardTypes = Object.keys(typeIcons);
  function defenses(pokemon) {
    const values = standardTypes.map(type => ({type, value: pokemon.types.reduce((factor, defender) => factor * (DEX.typeChart[type]?.[defender] ?? 1), 1)}));
    const tiers = [[4,'Extreme weakness'],[2,'Weakness'],[1,'Neutral'],[0.5,'Resistance'],[0.25,'Strong resistance'],[0,'Immunity']];
    return `<section class="record-section"><h3>Type defenses</h3><div class="defense-tiers">${tiers.map(([value,label]) => {
      const members = values.filter(entry => entry.value === value);
      if (!members.length) return '';
      return `<div class="defense-tier tier-${String(value).replace('.','-')}"><div class="tier-heading"><strong>${value}×</strong><span>${label}</span></div><div class="tier-types">${members.map(({type}) => `<span class="type-tile"><span class="type-symbol" style="--icon-color:${typeColors[type]}" aria-hidden="true">${typeIcons[type]}</span><span>${type}</span></span>`).join('')}</div></div>`;
    }).join('')}</div></section>`;
  }

  function gameRows(pokemon, species, selectedGroup) {
    if (pokemon.mega) return '';
    const indexed = [...new Set(pokemon.gameIndices)].map(id => DEX.versions[id]).filter(version => version && !/japan$/i.test(version.name));
    const grouped = new Map();
    for (const version of indexed) {
      if (!grouped.has(version.group)) grouped.set(version.group, []);
      grouped.get(version.group).push(version);
    }
    const gameGroups = [...grouped].sort((a,b) => (groups.get(a[0])?.order || 0) - (groups.get(b[0])?.order || 0));
    const rules = DEX.evolutions[species.id] || [];
    const encounterByVersion = new Map();
    for (const [version, location] of pokemon.encounters || []) {
      if (!encounterByVersion.has(version)) encounterByVersion.set(version, location);
    }
    const evolutionFor = gameGroup => {
      if (!species.evolvesFrom) return 'Base stage';
      const order = groups.get(gameGroup)?.order || 0;
      const candidates = rules.filter(rule => !rule.version || (groups.get(rule.version)?.order || 0) <= order);
      if (!candidates.length) return 'No source rule for this game';
      const latest = Math.max(...candidates.map(rule => groups.get(rule.version)?.order || 0));
      return candidates.filter(rule => (groups.get(rule.version)?.order || 0) === latest).map(rule => {
        const parts = [rule.trigger, ...rule.conditions];
        if (rule.item && DEX.items[rule.item]) parts.push(DEX.items[rule.item].name);
        return parts.join(' · ');
      }).join(' / ');
    };
    return `<section class="record-section"><h3>Games and evolution</h3>${gameGroups.length ? `<div class="table-wrap"><table class="learnset game-table"><thead><tr><th>Games</th><th>Evolution</th><th>Location</th></tr></thead><tbody>${gameGroups.map(([groupId,versions]) => `<tr${groupId === selectedGroup ? ' class="selected-game"' : ''}><td>${esc(versions.map(version => version.name).join(' / '))}</td><td>${esc(evolutionFor(groupId))}</td><td>${esc(versions.map(version => encounterByVersion.get(version.id)).find(Boolean) || '—')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No games recorded for this form.</p>'}</section>`;
  }

  function speciesDetails(pokemon, selectedGroup) {
    const species = DEX.species[pokemon.species];
    const selectedVersions = new Set(Object.values(DEX.versions).filter(v => v.group === selectedGroup).map(v => v.id));
    const selectedEntries = species.entries.filter(entry => selectedVersions.has(entry.version));
    const otherEntries = species.entries.filter(entry => !selectedVersions.has(entry.version));
    const profile = [
      stat('Egg groups', species.eggGroups.join(' / ') || 'Not recorded'), stat('Sex', gender(species.genderRate)),
      stat('Capture rate', species.captureRate), stat('Hatch cycles', species.hatchCycles),
      stat('Growth rate', species.growthRate), stat('Base friendship', species.baseHappiness),
      stat('Base experience', pokemon.baseExperience),
      stat('EV yield', Object.entries(pokemon.effort || {}).map(([name,value]) => `${value} ${name}`).join(' · ') || 'None recorded'),
      stat('Color', species.color), stat('Body shape', species.shape), stat('Habitat', species.habitat)
    ].join('');
    return `${defenses(pokemon)}<section class="record-section"><h3>Species profile</h3><p class="muted">${esc(species.genus || 'Genus not recorded')} · ${species.legendary ? 'Legendary · ' : ''}${species.mythical ? 'Mythical · ' : ''}${species.baby ? 'Baby Pokémon · ' : ''}First recorded in generation ${species.generation}</p><div class="stat-grid">${profile}</div></section>${gameRows(pokemon,species,selectedGroup)}<section class="record-section"><h3>Regional Pokédex numbers</h3><div class="regional-dex-grid">${species.dexNumbers.some(entry => entry.dex.toLowerCase() !== 'national') ? species.dexNumbers.filter(entry => entry.dex.toLowerCase() !== 'national').map(entry => `<div class="regional-dex-item"><small>${esc(entry.dex)}</small><strong>#${entry.number}</strong></div>`).join('') : '<p class="muted">No regional number recorded.</p>'}</div></section>${entries([...selectedEntries.map(entry => ({label:versionName(entry.version),text:entry.text,selected:true})),...otherEntries.map(entry => ({label:versionName(entry.version),text:entry.text}))],'Pokédex entries')}`;
  }

  function moveDetails(move, selectedGroup) {
    const meta = move.meta || {};
    const facts = [['Target',move.target],['Effect chance',move.effectChance == null ? 'Not recorded' : `${move.effectChance}%`],['Effect category',meta.category],['Ailment',meta.ailment],['Hits',meta.minHits == null ? 'Not recorded' : `${meta.minHits}${meta.maxHits && meta.maxHits !== meta.minHits ? '–' + meta.maxHits : ''}`],['Drain',meta.drain == null ? 'Not recorded' : `${meta.drain}%`],['Healing',meta.healing == null ? 'Not recorded' : `${meta.healing}%`],['Critical rate stage',meta.critRate],['Ailment chance',meta.ailmentChance == null ? 'Not recorded' : `${meta.ailmentChance}%`],['Flinch chance',meta.flinchChance == null ? 'Not recorded' : `${meta.flinchChance}%`]];
    return `<section class="record-section"><h3>Move effects and behavior</h3><p>${esc(move.effect || 'No short effect recorded in this snapshot.')}</p><div class="stat-grid">${facts.map(([name,value]) => stat(name,value)).join('')}</div><p class="muted">Flags: ${move.flags.length ? esc(move.flags.join(' · ')) : 'None recorded.'}</p></section>${entries(move.entries.filter(entry => entry.group === selectedGroup).map(entry => ({label:groupName(entry.group),text:entry.text})),`Move descriptions · ${groupName(selectedGroup)}`)}<details class="record-section"><summary>Descriptions in other game groups (${move.entries.filter(entry => entry.group !== selectedGroup).length})</summary>${entries(move.entries.filter(entry => entry.group !== selectedGroup).map(entry => ({label:groupName(entry.group),text:entry.text})),'Other game descriptions')}</details>`;
  }
  function proseDetails(item, selectedGroup, label) {
    const current = item.entries.filter(entry => entry.group === selectedGroup);
    const other = item.entries.filter(entry => entry.group !== selectedGroup);
    return `${entries(current.map(entry => ({label:groupName(entry.group),text:entry.text})),`${label} · ${groupName(selectedGroup)}`)}<details class="record-section"><summary>Descriptions in other game groups (${other.length})</summary>${entries(other.map(entry => ({label:groupName(entry.group),text:entry.text})),'Other game descriptions')}</details>`;
  }
  return {render:(kind,item,game) => kind === 'pokemon' ? speciesDetails(item,game) : kind === 'moves' ? moveDetails(item,game) : proseDetails(item,game,kind === 'abilities' ? 'Ability description' : 'Item description')};
})();
