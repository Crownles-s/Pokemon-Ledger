/* Linked, branching evolution family chart from the pinned species/form records. */
const EVOLUTION = (() => {
  'use strict';
  const species = Object.values(DEX.species);
  const forms = Object.values(DEX.pokemon);
  const children = new Map();
  const normal = new Map();
  const megas = new Map();
  const orders = new Map(DEX.versionGroups.map(group => [group.id, group.order]));

  for (const entry of species) {
    if (!entry.evolvesFrom) continue;
    if (!children.has(entry.evolvesFrom)) children.set(entry.evolvesFrom, []);
    children.get(entry.evolvesFrom).push(entry);
  }
  for (const form of forms) {
    if (form.default) normal.set(form.species, form);
    if (form.mega) {
      if (!megas.has(form.species)) megas.set(form.species, []);
      megas.get(form.species).push(form);
    }
  }
  for (const branch of children.values()) branch.sort((a, b) => a.id - b.id);

  function root(id) {
    let current = DEX.species[id];
    const visited = new Set();
    while (current?.evolvesFrom && !visited.has(current.id)) {
      visited.add(current.id);
      current = DEX.species[current.evolvesFrom];
    }
    return current;
  }

  function rulesFor(id, game) {
    const rules = DEX.evolutions[id] || [];
    if (!rules.length) return [];
    const selectedOrder = orders.get(game) || 0;
    const eligible = rules.filter(rule => !rule.version || (orders.get(rule.version) || 0) <= selectedOrder);
    const pool = eligible.length ? eligible : rules;
    const latest = Math.max(...pool.map(rule => orders.get(rule.version) || 0));
    return pool.filter(rule => (orders.get(rule.version) || 0) === latest);
  }

  function condition(id, game, url, esc) {
    const descriptions = rulesFor(id, game).map(rule => {
      const parts = [esc(rule.trigger)];
      if (rule.conditions.length) parts.push(esc(rule.conditions.join(' · ')));
      if (rule.item && DEX.items[rule.item]) {
        const item = DEX.items[rule.item];
        parts.push(`<a href="${url('items', item.id)}" data-open="1">${esc(item.name)}</a>`);
      }
      if (rule.move && DEX.moves[rule.move] && !rule.conditions.some(value => /move/i.test(value))) {
        const move = DEX.moves[rule.move];
        parts.push(`<a href="${url('moves', move.id)}" data-open="1">${esc(move.name)}</a>`);
      }
      return parts.join(' · ');
    });
    return [...new Set(descriptions)].join(' / ') || 'Evolution condition not recorded';
  }

  function card(form, activeId, url, esc) {
    const current = form.id === activeId;
    const number = String(form.species).padStart(4, '0');
    return `<a class="evo-card${current ? ' is-current' : ''}${form.mega ? ' is-mega' : ''}" href="${url('pokemon', form.id)}" data-open="1"${current ? ' aria-current="true"' : ''}><span class="evo-card-number">#${number}${form.mega ? ' · MEGA' : ''}</span><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${form.id}.png" alt="" loading="lazy" width="88" height="88" onerror="this.hidden=true"><strong>${esc(form.name)}</strong></a>`;
  }

  function megaCondition(form, base, url, esc) {
    const stone = MEGA.stone(form);
    const parts = ['Mega Evolution'];
    if (base && base.id !== normal.get(form.species)?.id) parts.push(`<a href="${url('pokemon', base.id)}" data-open="1">${esc(base.name)}</a>`);
    if (stone) parts.push(`<a href="${url('items', stone.id)}" data-open="1">${esc(stone.name)}</a>`);
    else parts.push(`<a href="${url('moves', 620)}" data-open="1">Dragon Ascent</a>`);
    return parts.join(' · ');
  }

  function branch(label, target, mega = false) {
    return `<div class="evo-branch${mega ? ' evo-branch--mega' : ''}"><div class="evo-link"><span class="evo-condition">${label}</span><span class="evo-arrow" aria-hidden="true">→</span></div>${target}</div>`;
  }

  function tree(entry, activeId, game, url, esc, visited = new Set()) {
    if (!entry || visited.has(entry.id)) return '';
    const nextVisited = new Set(visited);
    nextVisited.add(entry.id);
    const base = normal.get(entry.id);
    if (!base) return '';
    const family = (children.get(entry.id) || []).map(child =>
      branch(condition(child.id, game, url, esc), tree(child, activeId, game, url, esc, nextVisited))
    );
    const transformations = (megas.get(entry.id) || []).map(form =>
      branch(megaCondition(form, MEGA.base(form), url, esc), card(form, activeId, url, esc), true)
    );
    const branches = family.concat(transformations);
    return `<div class="evo-group">${card(base, activeId, url, esc)}${branches.length ? `<div class="evo-branches">${branches.join('')}</div>` : ''}</div>`;
  }

  function render(pokemon, game, url, esc) {
    const first = root(pokemon.species);
    const chain = tree(first, pokemon.id, game, url, esc);
    const onlyOne = !children.has(first?.id) && !megas.has(first?.id);
    return `<div class="evo-chart-scroll" role="region" aria-label="Evolution chart for ${esc(first?.name || pokemon.name)}" tabindex="0"><div class="evo-chart">${chain}</div></div>${onlyOne ? '<p class="evo-solo">No further evolution recorded for this species.</p>' : ''}`;
  }
  return {render};
})();
