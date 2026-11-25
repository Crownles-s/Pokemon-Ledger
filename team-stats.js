/* Level 50 planning stats. Conditional field effects and stat stages are excluded. */
const TEAM_STATS = (() => {
  const statKeys=['hp','attack','defense','special-attack','special-defense','speed'];
  const natureOf=(name,dex)=>Object.values(dex.natures).find(n=>n.name===name);
  function calculate(pokemon,slot,dex,level=50){
    const nature=natureOf(slot.nature,dex);
    const trained={},effective={},modifiers=[],warnings=[];
    for(const key of statKeys){
      const base=pokemon.stats[key]||0;
      const iv=Math.min(31,Math.max(0,Number(slot.ivs?.[key]??31)||0));
      const ev=Math.min(252,Math.max(0,Number(slot.evs?.[key])||0));
      const core=Math.floor((2*base+iv+Math.floor(ev/4))*level/100);
      let value=key==='hp'?core+level+10:core+5;
      if(key==='hp'&&pokemon.species===292)value=1; // Shedinja
      if(key!=='hp'&&nature?.increased!==nature?.decreased){
        if(nature?.increased===key)value=Math.floor(value*110/100);
        if(nature?.decreased===key)value=Math.floor(value*90/100);
      }
      trained[key]=value;effective[key]=value;
    }
    const apply=(key,multiplier,label)=>{effective[key]=Math.floor(effective[key]*multiplier);modifiers.push({key,multiplier,label});};
    const item=dex.items[slot.itemId];
    if(item){
      switch(item.id){
        case 264: apply('speed',1.5,'Choice Scarf'); break;
        case 197: apply('attack',1.5,'Choice Band'); break;
        case 274: apply('special-attack',1.5,'Choice Specs'); break;
        case 683: apply('special-defense',1.5,'Assault Vest'); break;
        case 255: apply('speed',0.5,'Iron Ball'); break;
        case 266: case 267: case 268: case 269: case 270: case 271:
          apply('speed',0.5,item.name); break;
        case 581: {
          const canEvolve=!pokemon.mega&&Object.values(dex.species).some(s=>s.evolvesFrom===pokemon.species);
          if(canEvolve){apply('defense',1.5,'Eviolite');apply('special-defense',1.5,'Eviolite');}
          else warnings.push('Eviolite only boosts Pokémon that can still evolve.');
          break;
        }
        case 213: if(pokemon.species===25){apply('attack',2,'Light Ball');apply('special-attack',2,'Light Ball');} break;
        case 235: if([104,105].includes(pokemon.species))apply('attack',2,'Thick Club'); break;
        case 203: if(pokemon.species===366)apply('special-attack',2,'Deep Sea Tooth'); break;
        case 204: if(pokemon.species===366)apply('special-defense',2,'Deep Sea Scale'); break;
        case 234: if(pokemon.species===132){apply('defense',1.5,'Metal Powder');apply('special-defense',1.5,'Metal Powder');warnings.push('Metal Powder loses its boost after Ditto transforms.');} break;
        case 251: if(pokemon.species===132){apply('speed',2,'Quick Powder');warnings.push('Quick Powder loses its boost after Ditto transforms.');} break;
      }
      if([197,264,274].includes(item.id))warnings.push(`${item.name} locks the holder into its first selected move until it switches out.`);
      if(item.id===683){
        warnings.push('Assault Vest prevents the holder from selecting status moves.');
        if(slot.moves.some(id=>dex.moves[id]?.category==='Status'))warnings.push('A selected move is a status move and cannot be used with Assault Vest.');
      }
      if(item.id===255)warnings.push('Iron Ball also removes Ground immunity and makes the holder vulnerable to grounded hazards.');
    }
    const ability=dex.abilities[slot.abilityId];
    if(['Huge Power','Pure Power'].includes(ability?.name))apply('attack',2,ability.name);
    return {level,trained,effective,modifiers,warnings};
  }
  function project(pokemon,slot,dex,mega,level=50){
    const selectedTransformation=pokemon.mega||!!mega.primalOrb(pokemon);
    const source=selectedTransformation?(mega.base(pokemon)||pokemon):pokemon;
    const beforeAbilityId=source.abilities.some(a=>a.id===+slot.abilityId)?+slot.abilityId:source.abilities[0]?.id||null;
    const before=calculate(source,{...slot,abilityId:beforeAbilityId},dex,level);
    const isRayquaza=source.species===384;
    const transformations=Object.values(dex.pokemon).filter(form=>form.species===source.species&&(form.mega||mega.primalOrb(form)));
    const matches=form=>isRayquaza&&form.mega?slot.moves.includes(620):mega.requiredItem(form)?.id===+slot.itemId;
    const target=selectedTransformation?(matches(pokemon)?pokemon:null):transformations.find(matches)||null;
    const trigger=target?(isRayquaza&&target.mega?'Dragon Ascent':mega.requiredItem(target)?.name):null;
    const kind=target?(mega.primalOrb(target)?'PRIMAL REVERSION':'MEGA EVOLUTION'):null;
    const afterAbilityId=target?.abilities[0]?.id||beforeAbilityId;
    const after=target?calculate(target,{...slot,abilityId:afterAbilityId},dex,level):before;
    const warnings=[...after.warnings];
    if(selectedTransformation&&!target)warnings.push(`${pokemon.name} requires ${isRayquaza&&pokemon.mega?'Dragon Ascent':mega.requiredItem(pokemon)?.name||'its transformation item'}; normal-form stats are shown until then.`);
    else if(!target&&(dex.items[slot.itemId]?.category==='Mega Stones'||['Red Orb','Blue Orb'].includes(dex.items[slot.itemId]?.name)))warnings.push('This item does not transform the selected Pokémon.');
    return {source,target,trigger,kind,before,after,beforeAbilityId,afterAbilityId,warnings};
  }
  return {calculate,project,statKeys};
})();
if(typeof module!=='undefined')module.exports=TEAM_STATS;
