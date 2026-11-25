(()=>{'use strict';
const $=id=>document.getElementById(id), kinds=['pokemon','moves','abilities','items'];
const colors={Normal:'#77745f',Fire:'#bd542f',Water:'#456eb2',Electric:'#8c7414',Grass:'#53863d',Ice:'#388b92',Fighting:'#a33e39',Poison:'#815099',Ground:'#8a6831',Flying:'#6b65a8',Psychic:'#ba4c77',Bug:'#718528',Rock:'#817342',Ghost:'#645084',Dragon:'#5751b6',Dark:'#594c48',Steel:'#606b7c',Fairy:'#a25988'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
const key=(kind,id)=>`index.html?kind=${kind}&id=${id}&game=${getGame()}`;
const a=(kind,id,label)=>`<a href="${key(kind,id)}" data-open="1">${esc(label)}</a>`;
const val=(object,id)=>object[id];
const chip=t=>`<span class="chip" style="--type:${colors[t]||'#705762'}">${esc(t)}</span>`;
const list=(items,render,empty='No recorded entries in this source snapshot.')=>items.length?`<div class="list">${items.map(render).join('')}</div>`:`<p class="muted">${empty}</p>`;
const getGame=()=>Number($('gameFilter').value);
let kind='pokemon',shown=60,filtered=[];
const collections={pokemon:DEX.pokemon,moves:DEX.moves,abilities:DEX.abilities,items:DEX.items};
const names={pokemon:'Pokémon and forms',moves:'moves',abilities:'abilities',items:'items'};
const typeFilter=$('typeFilter'),gameFilter=$('gameFilter');
for(const t of Object.keys(colors)){const option=document.createElement('option');option.value=t;option.textContent=t;typeFilter.append(option)}
for(const v of DEX.versionGroups){const option=document.createElement('option');option.value=v.id;option.textContent=`Gen ${v.generation} · ${v.name}`;gameFilter.append(option)}
gameFilter.value=DEX.versionGroups.some(v=>v.id===25)?'25':String(DEX.versionGroups.at(-1).id);
$('sourceNote').textContent=`${Object.keys(DEX.species).length} species · ${Object.keys(DEX.pokemon).length} forms · ${Object.keys(DEX.moves).length} moves · ${Object.keys(DEX.abilities).length} abilities · ${Object.keys(DEX.items).length} items`;
function setKind(next,updateUrl=true){if(!kinds.includes(next))next='pokemon';kind=next;document.body.dataset.kind=kind;shown=60;$('search').value='';typeFilter.value='';$('typeWrap').hidden=!['pokemon','moves'].includes(kind);$('gameWrap').hidden=!['pokemon','moves'].includes(kind);document.querySelectorAll('.tabs [data-kind]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.kind===kind));b.tabIndex=b.dataset.kind===kind?0:-1});if(updateUrl)history.pushState({},'',`index.html?kind=${kind}`);closeDialog(false);render()}
function image(id,large=false){const url=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;return `<img ${large?'class="record-art"':''} src="${url}" alt="Pokémon HOME-style render" loading="lazy" onerror="this.hidden=true">`}
function itemSprite(i,className='item-sprite'){return `<img class="${className}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${encodeURIComponent(i.sprite)}.png" alt="" width="96" height="96" loading="lazy" onerror="this.hidden=true">`}
function recordImage(p){const root='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home';return `<div class="record-art-wrap"><img class="record-art" id="recordSprite" src="${root}/${p.id}.png" data-standard="${root}/${p.id}.png" data-shiny="${root}/shiny/${p.id}.png" data-mode="standard" alt="${esc(p.name)} standard HOME-style render" width="320" height="320"><button class="shiny-toggle" id="shinyToggle" type="button" aria-label="Show shiny ${esc(p.name)}" aria-pressed="false" title="Show shiny"><span aria-hidden="true">✨</span><span class="shiny-toggle-label">Normal</span></button><span id="spriteStatus" class="sr-only" role="status"></span></div>`}
function wireShinyToggle(box,p){
  const sprite=box.querySelector('#recordSprite'),toggle=box.querySelector('#shinyToggle'),status=box.querySelector('#spriteStatus');
  if(!sprite||!toggle)return;
  const label=toggle.querySelector('.shiny-toggle-label');
  sprite.onload=()=>{sprite.hidden=false};
  sprite.onerror=()=>{
    if(sprite.dataset.mode==='shiny'){
      sprite.dataset.mode='standard';
      sprite.src=sprite.dataset.standard;
      toggle.disabled=true;
      toggle.setAttribute('aria-pressed','false');
      toggle.setAttribute('aria-label',`Shiny render unavailable for ${p.name}`);
      toggle.title='Shiny render unavailable';
      label.textContent='Normal';
      status.textContent='Shiny render unavailable for this form.';
    }else{sprite.hidden=true;toggle.disabled=true;status.textContent='Artwork unavailable for this form.'}
  };
  toggle.onclick=()=>{
    const shiny=sprite.dataset.mode!=='shiny';
    sprite.dataset.mode=shiny?'shiny':'standard';
    sprite.src=shiny?sprite.dataset.shiny:sprite.dataset.standard;
    sprite.alt=`${p.name} ${shiny?'shiny':'standard'} HOME-style render`;
    toggle.setAttribute('aria-pressed',String(shiny));
    toggle.setAttribute('aria-label',`${shiny?'Show standard':'Show shiny'} ${p.name}`);
    toggle.title=shiny?'Show standard':'Show shiny';
    label.textContent=shiny?'Shiny':'Normal';
    status.textContent=shiny?'Shiny render selected.':'Standard render selected.';
  };
}
function render(){const q=norm($('search').value),type=typeFilter.value;filtered=Object.values(collections[kind]).filter(x=>{if(q&&!norm(x.name).includes(q)&&!String(x.id).includes(q))return false;if(type){if(kind==='pokemon'&&!x.types.includes(type))return false;if(kind==='moves'&&x.type!==type)return false}return true}).sort((x,y)=>x.id-y.id);$('resultCount').textContent=`${filtered.length} ${names[kind]} ${q||type?'match':'in the source snapshot'}`;$('results').innerHTML=filtered.slice(0,shown).map(x=>{let extra='';if(kind==='pokemon'){extra=`${x.default?image(x.id):''}<div class="chips">${x.types.map(chip).join('')}</div><small>National No. ${String(x.species).padStart(4,'0')}${x.default?'':' · Form'}</small>`}else if(kind==='moves')extra=`<div class="chips">${chip(x.type)}</div><small>${esc(x.category)} · ${x.power??'Variable'} power</small>`;else if(kind==='abilities')extra=`<small>Introduced in Gen ${x.generation||'?'}</small>`;else extra=`${itemSprite(x)}<small>${esc(x.category)}</small>`;return `<a class="result-card" href="${key(kind,x.id)}" data-open="1"><small>#${String(x.id).padStart(4,'0')}</small><strong>${esc(x.name)}</strong>${extra}</a>`}).join('')||'<p class="notice">No matches. Try another name, number, or type.</p>';$('more').hidden=shown>=filtered.length}
function pokemonPage(p){
  const s=val(DEX.species,p.species);
  const forms=Object.values(DEX.pokemon).filter(x=>x.species===p.species);
  const game=getGame();
  const learned=MEGA.learnset(p,game);
  const learn=learned.rows;
  const abilities=p.abilities.map(x=>({...val(DEX.abilities,x.id),hidden:x.hidden}));
  const order=[['hp','HP'],['attack','Attack'],['defense','Defense'],['special-attack','Sp. Attack'],['special-defense','Sp. Defense'],['speed','Speed']];
  const stats=order.map(([key,label])=>{
    const value=p.stats[key]||0;
    return `<div class="base-stat"><div class="base-stat-top"><span>${label}</span><b>${value}</b></div><div class="base-stat-track" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="255" aria-valuenow="${value}"><span style="width:${Math.min(100,value/255*100)}%"></span></div></div>`;
  }).join('');
  const formPicker=forms.length>1?`<label class="form-picker">Form <select id="formSelect" aria-label="Choose a Pok\u00e9mon form">${forms.map(form=>`<option value="${form.id}"${form.id===p.id?' selected':''}>${esc(form.name)}</option>`).join('')}</select></label>`:'<p class="form-single">Only one form recorded.</p>';
  return `<div class="record-head pokemon-head"><div class="record-identity"><p class="eyebrow">National Pok\u00e9dex \u00b7 #${String(s.id).padStart(4,'0')} \u00b7 Generation ${s.generation}</p><h2>${esc(p.name)}</h2>${formPicker}<div class="chips">${p.types.map(chip).join('')}</div><p class="record-flavor">${esc(s.flavor||'No English Pok\u00e9dex entry recorded.')}</p><p class="record-measure">${p.mega?'Mega form \u00b7 ':''}${p.battleOnly?'Battle form \u00b7 ':''}Height ${p.height!=null?(p.height/10).toFixed(1)+' m':'unknown'} \u00b7 Weight ${p.weight!=null?(p.weight/10).toFixed(1)+' kg':'unknown'}</p></div>${recordImage(p)}</div><div class="record-contents"><section class="base-stats-section"><div class="record-section-heading"><span class="eyebrow">01 / POTENTIAL</span><h3>Base stats</h3></div><div class="base-stats">${stats}</div><p class="stat-total">Total <strong>${Object.values(p.stats).reduce((sum,value)=>sum+value,0)}</strong></p></section><section class="ability-section"><div class="record-section-heading"><span class="eyebrow">02 / TRAITS</span><h3>Abilities</h3></div><div class="ability-card-grid">${abilities.map((ability,index)=>`<a class="ability-card${ability.hidden?' is-hidden':''}" href="${key('abilities',ability.id)}" data-open="1" aria-label="Open ${esc(ability.name)} ability"><span class="ability-card-kicker"><span class="ability-card-symbol" aria-hidden="true">✦</span><span>ABILITY ${String(index+1).padStart(2,'0')}</span>${ability.hidden?'<span class="ability-hidden">HIDDEN</span>':''}</span><strong>${esc(ability.name)}</strong><span class="ability-card-description">${esc(ability.description||'Description unavailable.')}</span><span class="ability-card-foot">Explore ability <span aria-hidden="true">↗</span></span></a>`).join('')}</div></section><section class="evolution-section"><div class="record-section-heading"><span class="eyebrow">03 / LINEAGE</span><h3>Evolution</h3></div>${EVOLUTION.render(p,game,key,esc)}</section><details class="learnset-panel"><summary><span><small>04 / MOVES</small><strong>Learnset \u00b7 ${esc(gameName(game))}</strong></span><span class="learnset-count">${learn.length} moves <b aria-hidden="true">+</b></span></summary><div class="learnset-body">${learned.base?`<p class="learnset-source">Shared with ${a('pokemon',learned.base.id,learned.base.name)}</p>`:''}${learn.length?`<div class="table-wrap"><table class="learnset"><thead><tr><th>Move</th><th>Method</th><th>Level</th></tr></thead><tbody>${learn.map(([mid,method,level])=>`<tr><td>${a('moves',mid,DEX.moves[mid]?.name||'Unknown')}</td><td>${esc(DEX.methods[method]||'Other')}</td><td>${level||'\u2014'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No recorded learnset for this game.</p>'}</div></details></div>`;
}
function defaultForm(sid){return Object.values(DEX.pokemon).find(x=>x.species===sid&&x.default)}
function gameName(id){return DEX.versionGroups.find(v=>v.id===id)?.name||'Selected game'}
function movePage(m){const game=getGame(),learn=DEX.learnsets[game]||{},learners=Object.entries(learn).filter(([,entries])=>entries.some(e=>e[0]===m.id)).map(([pid])=>DEX.pokemon[pid]).filter(Boolean);return `<p class="eyebrow">Move · Generation ${m.generation||'?'}</p><h2>${esc(m.name)}</h2><div class="chips">${chip(m.type)} ${esc(m.category)}</div><p>${esc(m.description||'Description unavailable in this snapshot.')}</p><div class="stat-grid">${[['Power',m.power??'Variable'],['Accuracy',m.accuracy??'—'],['PP',m.pp??'—'],['Priority',m.priority??0]].map(([n,v])=>`<div class="stat"><small>${n}</small><b>${v}</b></div>`).join('')}</div><h3>Recorded learners · ${esc(gameName(game))}</h3>${list(learners,p=>a('pokemon',p.id,p.name),'No learners recorded for this game group.')}`}
function abilityPage(ability){
  const holders=Object.values(DEX.pokemon).filter(p=>p.abilities.some(x=>x.id===ability.id));
  return `<section class="ability-hero"><div class="ability-hero-copy"><p class="eyebrow">Ability / #${String(ability.id).padStart(4,'0')} / Generation ${ability.generation||'?'}</p><h2>${esc(ability.name)}</h2><p>${esc(ability.description||'Description unavailable.')}</p></div><div class="ability-emblem" aria-hidden="true">${esc(ability.name.slice(0,1))}</div></section><section class="ability-holders"><div class="record-section-heading"><span class="eyebrow">THE HOLDERS</span><h3>Pok\u00e9mon with this ability <small>(${holders.length})</small></h3></div><div class="holder-grid">${holders.map(p=>`<div class="holder-card"><small>#${String(p.species).padStart(4,'0')}</small>${a('pokemon',p.id,p.name)}</div>`).join('')}</div></section>`;
}
function itemPage(i){const evolutions=Object.entries(DEX.evolutions).filter(([,rules])=>rules.some(r=>r.item===i.id)).map(([sid])=>DEX.species[sid]).filter(Boolean);const megaForms=i.category==='Mega Stones'?Object.values(DEX.pokemon).filter(p=>p.mega&&MEGA.stone(p)?.id===i.id):[];return `<div class="item-record-head"><div><p class="eyebrow">Item · #${i.id}</p><h2>${esc(i.name)}</h2><p class="muted">${esc(i.category)} · Recorded cost ${i.cost??'unknown'}</p></div>${itemSprite(i,'item-record-sprite')}</div><p>${esc(i.description||'Description unavailable in this source snapshot.')}</p>${megaForms.length?`<h3>Mega Evolutions</h3>${list(megaForms,p=>a('pokemon',p.id,p.name))}`:`<h3>Related evolutions</h3>${list(evolutions,s=>{const p=defaultForm(s.id);return p?a('pokemon',p.id,s.name):esc(s.name)},'No evolution link recorded for this item.')}`}`}
let lastTrigger=null,closeTimer=null;
function wirePokemonTools(box,p){
  const identity=box.querySelector('.record-identity');
  if(!identity)return;
  const add=document.createElement('a');add.className='add-team-link';add.href=`ledger.html?add=${p.id}`;add.textContent='Add to team ↗';identity.append(add);
  const forms=Object.values(DEX.pokemon).filter(x=>x.species===p.species);
  if(forms.length>1){
    const section=document.createElement('section');section.className='form-comparison';
    section.innerHTML=`<div class="record-section-heading"><span class="eyebrow">FORM STUDY</span><h3>Compare forms</h3></div><div class="compare-pickers"><label>First form<select id="compareFirst"></select></label><label>Second form<select id="compareSecond"></select></label></div><div id="compareResults" class="compare-results"></div>`;
    box.querySelector('.record-contents').prepend(section);
    const selectors=[section.querySelector('#compareFirst'),section.querySelector('#compareSecond')];
    selectors.forEach((select,i)=>{select.innerHTML=forms.map(form=>`<option value="${form.id}">${esc(form.name)}</option>`).join('');select.value=String(i===0?p.id:(forms.find(x=>x.id!==p.id)?.id||p.id));});
    const draw=()=>{
      const pair=selectors.map(select=>DEX.pokemon[select.value]);
      const statOrder=[['hp','HP'],['attack','Attack'],['defense','Defense'],['special-attack','Sp. Atk'],['special-defense','Sp. Def'],['speed','Speed']];
      const transform=x=>x.mega?`Mega Evolution · ${MEGA.stone(x)?.name||'Dragon Ascent'}`:x.battleOnly?'Battle form':'Standard / alternate form';
      const ability=x=>x.abilities.map(a=>DEX.abilities[a.id]?.name).filter(Boolean).join(', ');
      const row=(label,values)=>`<div class="compare-row"><span>${label}</span>${values.map(v=>`<b>${esc(v)}</b>`).join('')}</div>`;
      section.querySelector('#compareResults').innerHTML=row('Form',pair.map(x=>x.name))+row('Types',pair.map(x=>x.types.join(' / ')))+row('Abilities',pair.map(ability))+row('Transformation',pair.map(transform))+statOrder.map(([id,label])=>row(label,pair.map(x=>x.stats[id]??'—'))).join('')+row('Total',pair.map(x=>Object.values(x.stats).reduce((n,v)=>n+v,0)));
    };
    selectors.forEach(select=>select.addEventListener('change',draw));draw();
  }
  const learnset=box.querySelector('.learnset-body .learnset');
  if(learnset){
    const body=box.querySelector('.learnset-body'),rows=[...learnset.tBodies[0].rows];
    const controls=document.createElement('div');controls.className='learnset-filters';
    const methods=[...new Set(rows.map(row=>row.cells[1].textContent.trim()))].sort();
    controls.innerHTML=`<label>Find a move<input type="search" id="learnSearch" placeholder="Search moves"></label><label>Learning method<select id="learnMethod"><option value="">All methods</option>${methods.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('')}</select></label><span id="learnVisible" aria-live="polite"></span>`;
    body.insertBefore(controls,learnset.parentElement);
    const search=controls.querySelector('#learnSearch'),method=controls.querySelector('#learnMethod');
    const filter=()=>{let visible=0;for(const row of rows){const match=row.cells[0].textContent.toLowerCase().includes(search.value.trim().toLowerCase())&&(!method.value||row.cells[1].textContent.trim()===method.value);row.hidden=!match;if(match)visible++;}controls.querySelector('#learnVisible').textContent=`${visible} / ${rows.length} moves`;};
    search.addEventListener('input',filter);method.addEventListener('change',filter);filter();
  }
}
function closeDialog(animated=true){const box=$('record');if(!box.open)return;clearTimeout(closeTimer);const finish=()=>{if(box.open)box.close();box.classList.remove('closing');document.body.classList.remove('bubble-open');lastTrigger?.focus()};if(animated&&!matchMedia('(prefers-reduced-motion: reduce)').matches){box.classList.add('closing');closeTimer=setTimeout(finish,250)}else finish()}
function openRecord(next,id,scroll=true,trigger=null){const item=collections[next]?.[id];if(!item){closeDialog(false);return false}if(kind!==next)setKind(next,false);const box=$('record');clearTimeout(closeTimer);box.classList.remove('closing');box.dataset.recordKind=next;box.style.setProperty('--record-accent',next==='pokemon'?(colors[item.types[0]]||'#6e687d'):'#ffe500');const body=next==='pokemon'?pokemonPage(item):next==='moves'?movePage(item):next==='abilities'?abilityPage(item):itemPage(item);box.innerHTML=`<div class="record-tools"><button type="button" id="closeRecord" aria-label="Close record">Close &times;</button></div>${body}${EXTRA.render(next,item,getGame())}`;if(next==='pokemon'){const panel=box.querySelector('.learnset-panel');box.append(panel);panel.querySelector('summary small').textContent='MOVES / LEARNSET';}wireShinyToggle(box,item);if(next==='pokemon')wirePokemonTools(box,item);const picker=box.querySelector('#formSelect');if(picker)picker.onchange=()=>{const formId=Number(picker.value);history.pushState({},'',key('pokemon',formId));openRecord('pokemon',formId,false)};if(trigger&&!box.contains(trigger))lastTrigger=trigger;if(!box.open){box.showModal();document.body.classList.add('bubble-open');const r=box.getBoundingClientRect(),t=trigger?.getBoundingClientRect();box.style.setProperty('--origin-x',t?`${t.left+t.width/2-r.left}px`:'50%');box.style.setProperty('--origin-y',t?`${t.top+t.height/2-r.top}px`:'50%')}else box.scrollTop=0;$('closeRecord').onclick=()=>{history.pushState({},'',`index.html?kind=${kind}&game=${getGame()}`);closeDialog()};document.title=`${item.name} \u00b7 Pok\u00e9dex`;return true}
function route(){const q=new URLSearchParams(location.search),next=kinds.includes(q.get('kind'))?q.get('kind'):'pokemon';if(kind!==next)setKind(next,false);if(q.has('game')&&DEX.versionGroups.some(v=>String(v.id)===q.get('game')))gameFilter.value=q.get('game');if(q.has('id'))openRecord(next,q.get('id'),false);else closeDialog(false)}
$('record').addEventListener('cancel',e=>{e.preventDefault();history.pushState({},'',`index.html?kind=${kind}&game=${getGame()}`);closeDialog()});
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-kind]');if(b)setKind(b.dataset.kind)});document.querySelector('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;const i=kinds.indexOf(kind),next=kinds[(i+(e.key==='ArrowRight'?1:3))%4];e.preventDefault();setKind(next);document.querySelector(`[data-kind="${next}"]`).focus()});$('search').addEventListener('input',()=>{shown=60;render()});typeFilter.addEventListener('change',()=>{shown=60;render()});gameFilter.addEventListener('change',()=>{const q=new URLSearchParams(location.search);q.set('game',gameFilter.value);history.replaceState({},'',`index.html?${q}`);if(q.has('id'))openRecord(kind,q.get('id'),false);render()});$('more').onclick=()=>{shown+=60;render()};document.addEventListener('click',e=>{const link=e.target.closest('a[data-open]');if(!link)return;e.preventDefault();const u=new URL(link.href);history.pushState({},'',u.pathname+u.search);const q=u.searchParams;openRecord(q.get('kind'),q.get('id'),true,link)});window.addEventListener('popstate',route);render();route();
})();
