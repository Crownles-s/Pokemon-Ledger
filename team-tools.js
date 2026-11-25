/* Shared, data-only calculations for the local team builder. */
const TEAM_TOOLS = (() => {
  const share = team => {
    const bytes = new TextEncoder().encode(JSON.stringify({v:1,team:{name:team.name,format:team.format,game:team.game,slots:team.slots}}));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  };
  const unshare = value => {
    if (!/^[A-Za-z0-9_-]{1,16000}$/.test(value || '')) throw Error('Invalid team link');
    const binary = atob(value.replace(/-/g,'+').replace(/_/g,'/'));
    const data = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0))));
    if (data.v !== 1 || !Array.isArray(data.team?.slots) || data.team.slots.length !== 6) throw Error('Unsupported team link');
    return data.team;
  };
  const analyze = (team,dex) => {
    const members = team.slots.map((slot,i)=>({slot,p:dex.pokemon[slot.pokemonId],i})).filter(x=>x.p);
    const defenses = Object.keys(dex.typeChart).map(type => {
      const values = members.map(({p,i})=>({i,value:p.types.reduce((n,t)=>n*(dex.typeChart[type]?.[t] ?? 1),1)}));
      return {type,weak:values.filter(x=>x.value>1).map(x=>x.i),resist:values.filter(x=>x.value<1&&x.value>0).map(x=>x.i),immune:values.filter(x=>x.value===0).map(x=>x.i)};
    });
    const moveTypes = [...new Set(members.flatMap(({slot})=>slot.moves.map(id=>dex.moves[id]).filter(move=>move&&['Physical','Special'].includes(move.category)).map(move=>move.type)))];
    const coverage = Object.keys(dex.typeChart).filter(defender=>moveTypes.some(attacker=>(dex.typeChart[attacker]?.[defender] ?? 1)>1));
    const items = new Map();
    const species = new Map();
    members.forEach(({slot,p,i})=>{
      if(slot.itemId) items.set(slot.itemId,[...(items.get(slot.itemId)||[]),i]);
      species.set(p.species,[...(species.get(p.species)||[]),i]);
    });
    return {members,defenses,moveTypes,coverage,repeatedItems:[...items].filter(([,slots])=>slots.length>1),repeatedSpecies:[...species].filter(([,slots])=>slots.length>1)};
  };
  const check = (team,dex) => {
    const a=analyze(team,dex),findings=[];
    if(a.members.length<6) findings.push({level:'fix',text:`${6-a.members.length} team slot${6-a.members.length===1?'':'s'} empty`});
    a.repeatedSpecies.forEach(([id,slots])=>findings.push({level:'fix',text:`${dex.species[id]?.name||'Species'} repeated in slots ${slots.map(i=>i+1).join(', ')}`}));
    a.repeatedItems.forEach(([id,slots])=>findings.push({level:'fix',text:`${dex.items[id]?.name||'Item'} repeated in slots ${slots.map(i=>i+1).join(', ')}`}));
    const nicknames=new Map();
    for(const {slot,p,i} of a.members){
      if(slot.nickname){const name=slot.nickname.trim().toLowerCase();if(nicknames.has(name))findings.push({level:'fix',text:`Nickname ${slot.nickname} repeated in slots ${nicknames.get(name)+1} and ${i+1}`});else nicknames.set(name,i);}
      if(dex.abilities[slot.abilityId]?.name==='Battle Bond') findings.push({level:'fix',text:`Slot ${i+1}: Battle Bond is not permitted by the tournament rules`});
      const total=Object.values(slot.evs).reduce((n,v)=>n+(+v||0),0);
      if(total>510||Object.values(slot.evs).some(v=>+v>252)) findings.push({level:'fix',text:`Slot ${i+1}: EV limit exceeded`});
      const requiredItem=typeof MEGA!=='undefined'?MEGA.requiredItem(p):null;
      if(requiredItem&&slot.itemId!==requiredItem.id) findings.push({level:'check',text:`Slot ${i+1}: ${requiredItem.name} is required for ${p.name}`});
      const learned=new Set((typeof MEGA!=='undefined'?MEGA.learnset(p,team.game).rows:[]).map(row=>row[0]));
      for(const id of slot.moves.filter(Boolean)) if(!learned.has(id)) findings.push({level:'check',text:`Slot ${i+1}: ${dex.moves[id]?.name||'Move'} is outside the selected move reference`});
      const chosen=slot.moves.filter(Boolean);if(new Set(chosen).size<chosen.length)findings.push({level:'fix',text:`Slot ${i+1}: a move is selected twice`});
    }
    return {analysis:a,findings};
  };
  return {share,unshare,analyze,check};
})();
if(typeof module!=='undefined') module.exports=TEAM_TOOLS;
