(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const pokemon = Object.values(DEX.pokemon);
  const items = Object.values(DEX.items).filter(item => item.name && !/ball|key items|mail/i.test(item.category || ''));
  const itemByName = new Map(items.map(item => [item.name.toLowerCase(), item]));
  const types = Object.keys(DEX.typeChart).sort();
  const natures = ['Hardy','Lonely','Brave','Adamant','Naughty','Bold','Docile','Relaxed','Impish','Lax','Timid','Hasty','Serious','Jolly','Naive','Modest','Mild','Quiet','Bashful','Rash','Calm','Gentle','Sassy','Careful','Quirky'];
  const natureByName = new Map(Object.values(DEX.natures).map(nature => [nature.name,nature]));
  const statNames = {hp:'HP',attack:'Attack',defense:'Defense','special-attack':'Sp. Atk','special-defense':'Sp. Def',speed:'Speed'};
  const natureAxes = ['attack','defense','special-attack','special-defense','speed'];
  const natureByPair = new Map(Object.values(DEX.natures).map(nature => [`${nature.increased}/${nature.decreased}`,nature]));
  const maxIvs = () => Object.fromEntries(Object.keys(statNames).map(key => [key,31]));
  const evPresets = [
    {id:'fast-physical',name:'Fast physical',summary:'252 Atk / 252 Spe / 4 HP',evs:{attack:252,speed:252,hp:4}},
    {id:'fast-special',name:'Fast special',summary:'252 SpA / 252 Spe / 4 HP',evs:{'special-attack':252,speed:252,hp:4}},
    {id:'physical-wall',name:'Physical wall',summary:'252 HP / 252 Def / 4 SpD',evs:{hp:252,defense:252,'special-defense':4}},
    {id:'special-wall',name:'Special wall',summary:'252 HP / 252 SpD / 4 Def',evs:{hp:252,'special-defense':252,defense:4}},
    {id:'bulky-physical',name:'Bulky physical',summary:'252 HP / 252 Atk / 4 SpD',evs:{hp:252,attack:252,'special-defense':4}},
    {id:'clear',name:'Clear EVs',summary:'0 in every stat',evs:{}}
  ];
  const spriteRoot = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const emptySlot = () => ({pokemonId:null,nickname:'',gender:'',shiny:false,abilityId:null,itemId:null,moves:[null,null,null,null],nature:'Serious',teraType:'',evs:{},ivs:maxIvs()});
  const emptyTeam = () => ({id:null,name:'New Team',format:'Singles',game:32,slots:Array.from({length:6}, emptySlot)});
  const storage = {
    read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { status('Browser storage is unavailable. Export a JSON copy to keep this team.'); } }
  };
  let team = normalizeTeam(storage.read('pokemon-ledger-draft-v2', emptyTeam()));
  let saved = storage.read('pokemon-ledger-teams-v2', []);
  if (!Array.isArray(saved)) saved = [];
  let active = 0;
  let searchText = '';

  function normalizeTeam(value) {
    const source = value && typeof value === 'object' ? value : {};
    const slots = Array.from({length:6}, (_, i) => {
      const raw = source.slots?.[i] || {};
      const original = DEX.pokemon[raw.pokemonId];
      const base = emptySlot();
      if (!original) return base;
      const p = MEGA.formForItem(original, raw.itemId) || original;
      const requiredItem = MEGA.requiredItem(p);
      return {
        ...base, pokemonId:p.id, nickname:String(raw.nickname || '').slice(0,30),
        gender:['Male','Female','Genderless'].includes(raw.gender) ? raw.gender : '',
        shiny:!!raw.shiny, abilityId:p.abilities.some(a => a.id === +raw.abilityId) ? +raw.abilityId : p.abilities[0]?.id || null,
        itemId:requiredItem?.id || (DEX.items[raw.itemId] ? +raw.itemId : null),
        moves:Array.from({length:4}, (_, j) => DEX.moves[raw.moves?.[j]] ? +raw.moves[j] : null),
        nature:natures.includes(raw.nature) ? raw.nature : 'Serious',
        teraType:types.includes(raw.teraType) ? raw.teraType : '',
        evs:Object.fromEntries(Object.keys(statNames).map(k => [k, Math.min(252,Math.max(0,+raw.evs?.[k] || 0))])),
        ivs:Object.fromEntries(Object.keys(statNames).map(k => [k, Math.min(31,Math.max(0,raw.ivs?.[k] == null ? 31 : (+raw.ivs[k] || 0)))]))
      };
    });
    return {id:typeof source.id === 'string' ? source.id : null,name:String(source.name || 'New Team').slice(0,50),format:source.format === 'Doubles' ? 'Doubles' : 'Singles',game:DEX.versionGroups.some(g => g.id === +source.game) ? +source.game : 32,slots};
  }
  function status(message) { $('status').textContent = message; }
  function persist() { storage.write('pokemon-ledger-draft-v2', team); }
  function species(p) { return DEX.species[p?.species]; }
  function sprite(p, shiny=false) { return p ? `${spriteRoot}/${shiny ? 'shiny/' : ''}${p.id}.png` : ''; }
  function itemSprite(item, className) { return item ? `<img class="${className}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${encodeURIComponent(item.sprite)}.png" alt="" width="40" height="40" loading="lazy" onerror="this.hidden=true">` : ''; }
  function natureEffect(name) {
    const nature=natureByName.get(name),up=statNames[nature?.increased],down=statNames[nature?.decreased];
    if (!nature || nature.increased===nature.decreased) return {neutral:true,label:'No stat change',description:`${name} is a neutral nature. It does not raise or lower a stat.`};
    return {neutral:false,up,down,label:`↑ ${up} · ↓ ${down}`,description:`Boosts ${up} by 10% and lowers ${down} by 10%.`};
  }
  function natureNote(name) {
    const effect=natureEffect(name);
    return `<aside id="natureNote" class="nature-note${effect.neutral?' nature-note--neutral':''}" aria-live="polite"><div class="nature-note-heading"><small>NATURE EFFECT</small><strong>${escapeHtml(name)}</strong></div><div class="nature-effect">${effect.neutral?'<span class="nature-even">↔ Balanced stats</span>':`<span class="nature-up">↑ ${escapeHtml(effect.up)} <b>+10%</b></span><span class="nature-down">↓ ${escapeHtml(effect.down)} <b>−10%</b></span>`}</div><p>${escapeHtml(effect.description)}</p></aside>`;
  }
  function natureGrid(selected) {
    return `<section class="nature-selector" aria-label="Choose a nature"><div class="nature-selector-heading"><strong>Nature chart</strong><span>↑ Rows boost · ↓ columns lower</span></div><div class="nature-matrix-scroll"><table class="nature-matrix"><thead><tr><th scope="col">↑ / ↓</th>${natureAxes.map(key=>`<th scope="col"><span>↓</span> ${escapeHtml(statNames[key])}</th>`).join('')}</tr></thead><tbody>${natureAxes.map(up=>`<tr><th scope="row"><span>↑</span> ${escapeHtml(statNames[up])}</th>${natureAxes.map(down=>{const nature=natureByPair.get(`${up}/${down}`);return `<td><button type="button" data-nature="${escapeHtml(nature.name)}" aria-pressed="${nature.name===selected}" aria-label="${escapeHtml(nature.name)}: ${up===down?'neutral stats':`raises ${statNames[up]} and lowers ${statNames[down]}`}">${escapeHtml(nature.name)}</button></td>`}).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  }
  function effectiveStats(p,slot) {
    const result=TEAM_STATS.project(p,slot,DEX,MEGA);
    const beforeAbilities=(p.mega||MEGA.primalOrb(p))?result.source.abilities.map(a=>DEX.abilities[a.id]?.name).filter(Boolean).join(' / '):DEX.abilities[result.beforeAbilityId]?.name||'Not recorded';
    const megaPanel=result.target?`<div class="mega-stat-preview"><small>${result.kind} · ${escapeHtml(result.trigger)}</small><strong>${escapeHtml(result.source.name)} <span aria-hidden="true">→</span> ${escapeHtml(result.target.name)}</strong><div class="mega-ability-shift"><div><span>${p.mega||MEGA.primalOrb(p)?'NORMAL ABILITY OPTIONS':'CURRENT ABILITY'}</span><b>${escapeHtml(beforeAbilities)}</b></div><div><span>AFTER ${result.kind}</span>${result.target.abilities.map(a=>{const ability=DEX.abilities[a.id];return `<b>${escapeHtml(ability?.name||'Unknown')}</b><p>${escapeHtml(ability?.description||'Description unavailable.')}</p>`}).join('')}</div></div></div>`:'';
    return `<section id="effectiveStats" class="effective-stats" aria-label="Calculated level 50 stats"><div class="mini-heading"><span>LEVEL 50 / EFFECTIVE STATS</span><small>Nature · EVs · IVs · supported item and ability effects</small></div>${megaPanel}<div class="effective-table"><div class="effective-table-head"><span>STAT</span><span>BEFORE</span><span>IN BATTLE</span></div>${Object.entries(statNames).map(([key,label])=>{
      const trained=result.before.trained[key],battle=result.after.effective[key],effects=result.after.modifiers.filter(m=>m.key===key),baseDelta=result.target?(result.target.stats[key]||0)-(result.source.stats[key]||0):0;
      const notes=[baseDelta?`${result.kind==='PRIMAL REVERSION'?'Primal':'Mega'} base ${baseDelta>0?'+':''}${baseDelta}`:'',...effects.map(m=>`${escapeHtml(m.label)} ×${m.multiplier}`)].filter(Boolean);
      return `<div class="effective-row${battle>trained?' is-boosted':battle<trained?' is-reduced':''}"><span>${label}</span><b>${trained}</b><strong>${battle}</strong>${notes.length?`<small>${notes.join(' · ')}</small>`:''}</div>`;
    }).join('')}</div>${result.warnings.length?`<div class="effective-warnings">${result.warnings.map(w=>`<p><span aria-hidden="true">⚠</span> ${escapeHtml(w)}</p>`).join('')}</div>`:''}<p class="effective-note">Modern level 50 projection. Mega and Primal results require their matching item or Dragon Ascent. Field effects, temporary stat stages, unsupported ability or item effects, and move damage are not included.</p></section>`;
  }
  function selectOptions(values, selected, blank='Choose') {
    return `<option value="">${escapeHtml(blank)}</option>` + values.map(([value,label]) => `<option value="${escapeHtml(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
  }
  function renderGrid() {
    $('teamCount').textContent = `${team.slots.filter(s => s.pokemonId).length} / 6`;
    $('teamGrid').innerHTML = team.slots.map((slot,i) => {
      const p = DEX.pokemon[slot.pokemonId];
      const name = slot.nickname || p?.name || 'Choose a Pokémon';
      return `<button class="slot-card ${p ? 'filled' : 'empty'} ${i===active ? 'active' : ''}" type="button" data-slot="${i}" aria-label="Edit slot ${i+1}${p ? ', '+escapeHtml(name) : ', empty'}" aria-pressed="${i===active}">
        <span class="slot-number">${String(i+1).padStart(2,'0')} / 06</span>
        ${p ? `<img src="${sprite(p,slot.shiny)}" alt="" width="160" height="160" loading="lazy" onerror="this.hidden=true"><span class="slot-types">${p.types.map(t => `<i style="--type:${typeColor(t)}">${escapeHtml(t)}</i>`).join('')}</span>` : '<span class="slot-plus" aria-hidden="true">＋</span>'}
        <span class="slot-name">${escapeHtml(name)}</span><span class="slot-sub">${itemSprite(DEX.items[slot.itemId],'slot-item-sprite')}${p ? escapeHtml(DEX.items[slot.itemId]?.name || 'No held item') : 'Tap to add partner'}</span>
      </button>`;
    }).join('');
    $('teamGrid').querySelectorAll('[data-slot]').forEach(button => button.addEventListener('click', () => { active=+button.dataset.slot; searchText=''; renderGrid(); renderEditor(); }));
  }
  function typeColor(type) {
    return {Fire:'#f06440',Water:'#4a8dd9',Grass:'#68b768',Electric:'#e2be3c',Ice:'#5cbec8',Fighting:'#c95e52',Poison:'#a16eb8',Ground:'#c39a5c',Flying:'#9ba8e7',Psychic:'#de6e9c',Bug:'#93aa42',Rock:'#a99468',Ghost:'#8276b9',Dragon:'#6b79cb',Dark:'#66606b',Steel:'#8aadb3',Fairy:'#d994bc',Normal:'#aaa39b'}[type] || '#f3f0e7';
  }
  function availableMoves(p) {
    const ids = MEGA.learnset(p, team.game).rows.map(row => row[0]);
    return [...new Set(ids)].map(id => DEX.moves[id]).filter(Boolean).sort((a,b) => a.name.localeCompare(b.name));
  }
  function addPokemon(p,i) {
    const slot=emptySlot(); slot.pokemonId=p.id; slot.abilityId=p.abilities[0]?.id || null;
    slot.itemId=MEGA.requiredItem(p)?.id || null;
    team.slots[i]=slot; active=i; searchText=''; persist(); render(); status(`${p.name} added to slot ${i+1}.`);
  }
  function renderAnalysis() {
    const {analysis:a,findings}=TEAM_TOOLS.check(team,DEX);
    const badge=(type)=>`<span class="type-badge" style="--type:${typeColor(type)}">${escapeHtml(type)}</span>`;
    const shared=a.defenses.filter(x=>x.weak.length>=2).sort((x,y)=>y.weak.length-x.weak.length);
    const sturdy=a.defenses.filter(x=>x.resist.length+x.immune.length>=2).sort((x,y)=>(y.resist.length+y.immune.length)-(x.resist.length+x.immune.length));
    $('teamAnalysis').innerHTML=`<div class="analysis-stat"><strong>${a.members.length}/6</strong><span>Partners</span><strong>${a.coverage.length}/18</strong><span>Super-effective type coverage</span></div>
      <div class="analysis-block"><h3>Shared weaknesses</h3>${shared.length?shared.map(x=>`<span class="analysis-type">${badge(x.type)}<b>${x.weak.length} weak</b></span>`).join(''):'<p>Add partners to reveal shared weaknesses.</p>'}</div>
      <div class="analysis-block"><h3>Shared resistances & immunities</h3>${sturdy.length?sturdy.map(x=>`<span class="analysis-type">${badge(x.type)}<b>${x.resist.length+x.immune.length} answers${x.immune.length?` · ${x.immune.length} immune`:''}</b></span>`).join(''):'<p>Add partners to reveal defensive overlap.</p>'}</div>
      <div class="analysis-block"><h3>Damaging move coverage</h3><p>${a.moveTypes.length?a.moveTypes.map(badge).join(''):'Choose damaging moves to see type coverage.'}</p><small>${a.coverage.length?`Hits ${a.coverage.map(escapeHtml).join(', ')} super effectively.`:'No selected damaging move types hit a type super effectively yet.'} Status moves do not count.</small></div>
      <div class="analysis-block"><h3>Repeated held items</h3><p>${a.repeatedItems.length?a.repeatedItems.map(([id,slots])=>`${escapeHtml(DEX.items[id]?.name||'Item')} · slots ${slots.map(i=>i+1).join(', ')}`).join('<br>'):'None'}</p></div>`;
    $('regulationCheck').innerHTML=`<p class="regulation-source">Champions M-C · Sep 9–Dec 2, 2026 · one Mega Evolution per battle. <a href="https://champions-news.pokemon-home.com/en/page/816.html" target="_blank" rel="noopener">Official regulation ↗</a> · <a href="https://mcdn.pokemon.com/pokemon-prod/raw/upload/v1/live/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-vgc-tournament-handbook-en.pdf" target="_blank" rel="noopener">Tournament rules ↗</a></p>
      ${findings.length?`<ul>${findings.map(f=>`<li class="${f.level}">${escapeHtml(f.text)}</li>`).join('')}</ul>`:'<p class="check-pass">No issues found in the checks available here.</p>'}
      <p class="check-unknown"><strong>Eligibility unknown:</strong> this Pokédex snapshot does not contain the live Champions roster, restricted list, or regulation-specific move legality. Verify the team in Pokémon Champions before battle.</p>`;
  }
  function renderEditor() {
    const slot = team.slots[active], p = DEX.pokemon[slot.pokemonId];
    $('slotIndex').textContent = `SLOT ${String(active+1).padStart(2,'0')} / 06`;
    if (!p) {
      $('editor').innerHTML = `<div class="editor-empty"><span class="empty-symbol">✳</span><h2 id="editorHeading">Choose a partner.</h2><p>Start with a name. Every form in the Pokédex is here.</p>${searchBox()}</div>`;
      wireSearch(); return;
    }
    const abilities = p.abilities.map(a => [a.id,`${DEX.abilities[a.id]?.name || 'Unknown'}${a.hidden ? ' · Hidden' : ''}`]);
    const moveChoices = availableMoves(p).map(m => [m.id,`${m.name} · ${m.type}${m.power ? ' · '+m.power : ''}`]);
    const evTotal = Object.values(slot.evs).reduce((sum,value) => sum + (+value || 0),0);
    const requiredItem = MEGA.requiredItem(p);
    const formLabel = MEGA.primalOrb(p) ? 'PRIMAL REVERSION' : p.mega ? 'MEGA EVOLUTION' : '';
    $('editor').innerHTML = `
      <div class="partner-hero"><div><span class="eyebrow">#${String(species(p)?.id || p.species).padStart(4,'0')} / ${escapeHtml(p.types.join(' + '))}</span><h2 id="editorHeading">${escapeHtml(p.name)}</h2>${formLabel ? `<span class="mega-mark">${formLabel} ${requiredItem ? '· '+escapeHtml(requiredItem.name) : ''}</span>` : ''}</div><img src="${sprite(p,slot.shiny)}" width="180" height="180" alt="${escapeHtml(p.name)} render" onerror="this.hidden=true"></div>
      <div class="partner-search"><label>CHANGE POKÉMON</label>${searchBox()}</div>
      <div class="editor-fields">
        <label>Nickname<input data-field="nickname" maxlength="30" value="${escapeHtml(slot.nickname)}" placeholder="${escapeHtml(p.name)}"></label>
        <label>Gender<select data-field="gender">${selectOptions([['Male','Male'],['Female','Female'],['Genderless','Genderless']],slot.gender,'Unspecified')}</select></label>
        <label>Ability<select data-field="abilityId">${selectOptions(abilities,slot.abilityId,'No ability')}</select></label>
        <div class="editor-field"><span>Held item</span>${requiredItem?`<span class="held-item-field held-item-locked">${itemSprite(requiredItem,'held-item-sprite')}<input value="${escapeHtml(requiredItem.name)}" readonly aria-label="Held item locked to ${escapeHtml(requiredItem.name)}"><span class="item-lock" aria-hidden="true">LOCKED</span></span><small class="locked-item-note">Required for ${escapeHtml(p.name)}</small><button class="normal-form-button" id="normalForm" type="button">Return to normal form</button>`:`<span class="held-item-field">${itemSprite(DEX.items[slot.itemId],'held-item-sprite')}<input data-field="itemName" aria-label="Held item" list="itemList" value="${escapeHtml(DEX.items[slot.itemId]?.name || '')}" placeholder="Search items"></span><datalist id="itemList">${items.map(item => `<option value="${escapeHtml(item.name)}"></option>`).join('')}</datalist>`}</div>
        ${team.game === 25 ? `<label>Tera type<select data-field="teraType">${selectOptions(types.map(t=>[t,t]),slot.teraType,'None')}</select></label>` : ''}
      </div>
      ${natureGrid(slot.nature)}
      ${natureNote(slot.nature)}
      <label class="shiny-check"><input type="checkbox" data-field="shiny" ${slot.shiny ? 'checked' : ''}> ✨ Shiny appearance</label>
      ${effectiveStats(p,slot)}
      <div class="editor-section"><div class="mini-heading"><span>01 / MOVES</span><small>${moveChoices.length} in ${escapeHtml(DEX.versionGroups.find(g=>g.id===team.game)?.name || 'reference game')}</small></div><div class="move-fields">${slot.moves.map((id,i) => `<label><span>${String(i+1).padStart(2,'0')}</span><select data-move="${i}">${selectOptions(moveChoices.some(([moveId]) => moveId===id) || !id ? moveChoices : [[id,`${DEX.moves[id]?.name} · Other game`],...moveChoices],id,'Choose a move')}</select></label>`).join('')}</div></div>
      <details class="training" open><summary>02 / TRAINING <span>${evTotal} / 510 EVs · IVs</span></summary>
        <p>Pick a common spread or tune each stat. Individual EVs cap at 252.</p>
        <div class="training-quick"><div class="training-quick-head"><span>QUICK EV SPREADS</span><button id="maxIvs" type="button">Max IVs · 31 each</button></div><div class="ev-preset-grid">${evPresets.map(preset=>`<button type="button" data-ev-preset="${preset.id}" aria-pressed="${Object.keys(statNames).every(key=>(slot.evs[key]||0)===(preset.evs[key]||0))}"><strong>${preset.name}</strong><small>${preset.summary}</small></button>`).join('')}</div></div>
        <div class="stat-table"><div class="stat-labels"><span>STAT</span><span>BASE</span><span>EV</span><span>IV</span></div>${Object.entries(statNames).map(([key,label]) => `<label><span>${label}</span><b>${p.stats[key] ?? '—'}</b><input data-ev="${key}" type="number" min="0" max="252" step="4" value="${slot.evs[key] || 0}" aria-label="${label} EV"><input data-iv="${key}" type="number" min="0" max="31" value="${slot.ivs[key] ?? 31}" aria-label="${label} IV"></label>`).join('')}</div></details>
      <div class="editor-foot"><a href="index.html?kind=pokemon&id=${p.id}&game=${team.game}">Open Pokédex entry ↗</a><button id="clearSlot" type="button">Clear slot</button></div>`;
    wireSearch();
    $('normalForm')?.addEventListener('click', () => {
      const normal=MEGA.base(p);
      if (!normal) return;
      slot.pokemonId=normal.id;
      slot.itemId=null;
      if (!normal.abilities.some(a=>a.id===slot.abilityId)) slot.abilityId=normal.abilities[0]?.id || null;
      persist(); renderGrid(); renderEditor(); renderAnalysis(); status(`${normal.name} returned to its normal form.`);
    });
    $('editor').querySelectorAll('[data-nature]').forEach(button => button.addEventListener('click', () => {
      slot.nature=button.dataset.nature;
      $('editor').querySelectorAll('[data-nature]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));
      $('natureNote').outerHTML=natureNote(slot.nature);
      $('effectiveStats').outerHTML=effectiveStats(p,slot);
      persist(); status(`${slot.nature} nature selected.`);
    }));
    const refreshTraining = message => { persist(); renderEditor(); $('editor').querySelector('details.training').open=true; renderAnalysis(); status(message); };
    $('maxIvs').addEventListener('click', () => { slot.ivs=maxIvs(); refreshTraining('All IVs set to 31.'); });
    $('editor').querySelectorAll('[data-ev-preset]').forEach(button => button.addEventListener('click', () => {
      const preset=evPresets.find(entry=>entry.id===button.dataset.evPreset);
      slot.evs=Object.fromEntries(Object.keys(statNames).map(key=>[key,preset.evs[key]||0]));
      refreshTraining(`${preset.name} EV spread applied.`);
    }));
    $('editor').querySelectorAll('[data-field]').forEach(input => input.addEventListener('change', () => {
      const field=input.dataset.field;
      if (field==='itemName') {
        const item=itemByName.get(input.value.trim().toLowerCase());
        const transformed=MEGA.formForItem(p,item?.id);
        slot.itemId=item?.id || null;
        if (transformed) {
          slot.pokemonId=transformed.id;
          if (!transformed.abilities.some(a=>a.id===slot.abilityId)) slot.abilityId=transformed.abilities[0]?.id || null;
        }
        input.value=item?.name || '';
      }
      else if (field==='shiny') slot.shiny=input.checked;
      else slot[field]=input.value;
      persist(); renderGrid(); renderAnalysis(); if (field==='nature') $('natureNote').outerHTML=natureNote(slot.nature); if (field==='shiny'||field==='itemName') renderEditor(); else $('effectiveStats').outerHTML=effectiveStats(p,slot);
    }));
    $('editor').querySelectorAll('[data-move]').forEach(input => input.addEventListener('change', () => { slot.moves[+input.dataset.move]=input.value ? +input.value : null; persist(); renderGrid(); renderAnalysis(); $('effectiveStats').outerHTML=effectiveStats(p,slot); }));
    $('editor').querySelectorAll('[data-ev]').forEach(input => input.addEventListener('change', () => {
      const key=input.dataset.ev, current=+slot.evs[key]||0, other=Object.values(slot.evs).reduce((a,b)=>a+(+b||0),0)-current;
      slot.evs[key]=Math.min(252,510-other,Math.max(0,Math.floor(+input.value||0)));
      input.value=slot.evs[key]; persist(); renderEditor(); renderAnalysis(); $('editor').querySelector('details.training').open=true;
    }));
    $('editor').querySelectorAll('[data-iv]').forEach(input => input.addEventListener('change', () => { slot.ivs[input.dataset.iv]=Math.min(31,Math.max(0,Math.floor(+input.value||0))); input.value=slot.ivs[input.dataset.iv]; persist(); $('effectiveStats').outerHTML=effectiveStats(p,slot); }));
    $('clearSlot').addEventListener('click', () => { team.slots[active]=emptySlot(); persist(); renderGrid(); renderEditor(); renderAnalysis(); status(`Slot ${active+1} cleared.`); });
  }
  function searchBox() { return `<div class="species-search"><input id="speciesSearch" type="search" autocomplete="off" placeholder="Search Pokémon or form" value="${escapeHtml(searchText)}" aria-label="Search Pokémon"><div id="speciesResults" class="species-results"></div></div>`; }
  function wireSearch() {
    const input=$('speciesSearch'), results=$('speciesResults');
    const draw = () => {
      searchText=input.value;
      const q=searchText.trim().toLocaleLowerCase();
      if (!q) { results.innerHTML=''; return; }
      const matches=pokemon.filter(p => p.name.toLocaleLowerCase().includes(q)).sort((a,b) => a.name.localeCompare(b.name)).slice(0,16);
      results.innerHTML=matches.length ? matches.map(p => `<button type="button" data-pokemon="${p.id}"><img src="${sprite(p)}" alt="" width="44" height="44" loading="lazy" onerror="this.hidden=true"><span>${escapeHtml(p.name)}</span><small>${escapeHtml(p.types.join(' / '))}</small></button>`).join('') : '<p>No matching Pokémon.</p>';
      results.querySelectorAll('[data-pokemon]').forEach(button => button.addEventListener('click', () => {
        addPokemon(DEX.pokemon[button.dataset.pokemon],active);
      }));
    };
    input.addEventListener('input', draw); draw();
  }
  function renderSaved() {
    $('savedTeams').innerHTML=saved.length ? saved.map(entry => `<div class="saved-row"><div><strong>${escapeHtml(entry.name || 'Untitled team')}</strong><span>${escapeHtml(entry.format || 'Singles')} · ${(entry.slots || []).filter(s=>s.pokemonId).length}/6 Pokémon</span></div><button type="button" data-load="${escapeHtml(entry.id)}">Load</button><button type="button" data-delete="${escapeHtml(entry.id)}" aria-label="Delete ${escapeHtml(entry.name)}">×</button></div>`).join('') : '<p class="saved-empty">Your saved teams will appear here.</p>';
    $('savedTeams').querySelectorAll('[data-load]').forEach(button => button.addEventListener('click', () => { team=normalizeTeam(saved.find(s=>s.id===button.dataset.load)); active=0; searchText=''; persist(); render(); status('Team loaded.'); }));
    $('savedTeams').querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => { saved=saved.filter(s=>s.id!==button.dataset.delete); storage.write('pokemon-ledger-teams-v2',saved); renderSaved(); status('Saved team deleted.'); }));
  }
  function renderToolbar() {
    $('teamName').value=team.name;
    $('gameSelect').innerHTML=DEX.versionGroups.filter(g=>g.id>=1).map(g=>`<option value="${g.id}" ${g.id===team.game?'selected':''}>${escapeHtml(g.name)}</option>`).join('');
    document.querySelectorAll('[data-format]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.format===team.format)));
  }
  function render() { renderToolbar(); renderGrid(); renderEditor(); renderAnalysis(); renderSaved(); }
  $('teamName').addEventListener('input', event => { team.name=event.target.value.slice(0,50); persist(); });
  $('gameSelect').addEventListener('change', event => { team.game=+event.target.value; persist(); renderEditor(); renderAnalysis(); });
  document.querySelectorAll('[data-format]').forEach(button => button.addEventListener('click', () => { team.format=button.dataset.format; persist(); renderToolbar(); }));
  $('newTeam').addEventListener('click', () => { team=emptyTeam(); active=0; searchText=''; persist(); render(); status('New team started.'); });
  $('saveTeam').addEventListener('click', () => { team.name=team.name.trim() || 'Untitled team'; team.id=team.id || (globalThis.crypto?.randomUUID?.() || String(Date.now())); saved=saved.filter(s=>s.id!==team.id); saved.unshift(JSON.parse(JSON.stringify(team))); storage.write('pokemon-ledger-teams-v2',saved); persist(); renderSaved(); renderToolbar(); status('Team saved in this browser.'); });
  $('exportTeam').addEventListener('click', () => { const blob=new Blob([JSON.stringify(team,null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), link=document.createElement('a'); link.href=url; link.download=`${team.name.toLowerCase().replace(/[^a-z0-9]+/g,'-') || 'pokemon-team'}.json`; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); status('Team JSON exported.'); });
  $('importTeam').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async event => { const file=event.target.files?.[0]; if (!file) return; try { const parsed=JSON.parse(await file.text()); if (!Array.isArray(parsed.slots)) throw Error('Missing team slots'); team=normalizeTeam(parsed); team.id=null; active=0; searchText=''; persist(); render(); status('Team imported. Save it to add it to your archive.'); } catch { status('This file is not a valid team JSON.'); } event.target.value=''; });
  $('shareTeam').addEventListener('click', async () => {
    const url=new URL('ledger.html',location.href); url.searchParams.set('team',TEAM_TOOLS.share(team));
    try { await navigator.clipboard.writeText(url.href); status('Team link copied.'); }
    catch { window.prompt('Copy your team link',url.href); status('Team link ready to copy.'); }
  });
  function incomingLink() {
    const url=new URL(location.href),encoded=url.searchParams.get('team'),add=url.searchParams.get('add');
    if(encoded){try{team=normalizeTeam(TEAM_TOOLS.unshare(encoded));team.id=null;active=0;persist();render();status('Shared team loaded. Save it to keep it in your archive.');}catch{status('This team link is invalid. Your draft is unchanged.');}}
    if(add && DEX.pokemon[add]){
      const p=DEX.pokemon[add],dialog=$('addDialog');
      $('addDescription').textContent=`Add ${p.name} to your team. Choose a slot to use.`;
      $('addSlots').innerHTML=team.slots.map((slot,i)=>`<button type="button" data-add-slot="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${escapeHtml(DEX.pokemon[slot.pokemonId]?.name||'Empty slot')}</span></button>`).join('');
      $('addSlots').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{addPokemon(p,+button.dataset.addSlot);dialog.close();}));
      dialog.showModal();
    }
    if(encoded||add){url.searchParams.delete('team');url.searchParams.delete('add');history.replaceState({},'',url.pathname+url.search);}
  }
  $('cancelAdd').addEventListener('click',()=> $('addDialog').close());
  render();
  incomingLink();
})();
