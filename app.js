/* Synergy 2K26 — Browser MyCareer (Option C, Slimmamba rules + extras)
   - Offline (localStorage)
   - Base stat points, efficiency bonuses, penalties
   - Hybrid badges (attribute unlock + XP)
   - Option C attributes (category sliders + individual attributes)
   - Multiple careers, export/import
*/

/* ---------- Utilities ---------- */
const qs=(s)=>document.querySelector(s);
const qsa=(s)=>Array.from(document.querySelectorAll(s));
const STORAGE_KEY='synergy2k_careers_v1';

/* ---------- Default data models ---------- */
const BADGES = {
  "Finishing":["Posterizer","Fearless Finisher","Acrobat","Lob City Finisher","Relentless Finisher"],
  "Shooting":["Deadeye","Limitless Range","Corner Specialist","Catch & Shoot","Hot Zone Hunter"],
  "Playmaking":["Dimer","Ankle Breaker","Floor General","Handles for Days","Quick First Step"],
  "Defense":["Clamps","Intimidator","Rim Protector","Pick Pocket","Chase Down Artist"],
  "Physical":["Box","Bulldozer","Fast Twitch","Durable","Run & Gun"],
  // you can add more 2K26-specific badges here
};

const ATTRIBUTES = {
  "Finishing":["Close Shot","Driving Layup","Driving Dunk","Standing Dunk","Post Hook"],
  "Shooting":["Mid Range","Three Pointer","Shot IQ","Free Throw","Contested Shot"],
  "Playmaking":["Ball Handle","Passing Accuracy","Speed With Ball","Post Control"],
  "Defense":["Perimeter Defense","Interior Defense","Steal","Block"],
  "Physical":["Speed","Acceleration","Strength","Stamina","Vertical"]
};

/* ---------- Persistence ---------- */
function loadAllCareers(){ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); }
function saveAllCareers(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

/* ---------- Career helpers ---------- */
function createEmptyCareer(name){
  const attrs = {};
  for(const cat in ATTRIBUTES){
    attrs[cat] = {category_level:50};
    ATTRIBUTES[cat].forEach(a=> attrs[a]=50);
  }
  const badges = {};
  for(const cat in BADGES) BADGES[cat].forEach(b=> badges[b]={xp:0, unlocked:false, tier:'Locked'});
  return {
    id: 'c-'+Date.now(),
    name,
    playerName: '',
    points_total:0,
    points_available:0,
    games:[],
    attributes: attrs,
    badges: badges,
    created_at: new Date().toISOString()
  };
}

/* ---------- App state ---------- */
let CAREERS = loadAllCareers();
let CURRENT = null;

/* ---------- Render: Careers list ---------- */
function renderCareers(){
  const el = qs('#careers-list');
  el.innerHTML = '';
  CAREERS.forEach((c,i)=>{
    const btn = document.createElement('button');
    btn.textContent = `${c.name} — Points: ${c.points_total} (Avail: ${c.points_available})`;
    btn.onclick = ()=> { CURRENT = c; renderAll(); };
    el.appendChild(btn);
  });
}

/* ---------- Render: main UI ---------- */
function renderAll(){
  renderCareers();
  renderHeader();
  renderProgress();
  renderAttributesUI();
  renderBadgesUI();
}

function renderHeader(){
  qs('#career-selected').textContent = CURRENT ? `${CURRENT.name} — Points Avail: ${CURRENT.points_available}` : 'No career selected';
  if(CURRENT) qs('#player-name').value = CURRENT.playerName || '';
}

/* ---------- Calculation rules (as agreed) ---------- */
const BASE = { pts:1, reb:2, ast:1, stl:3, blk:3, to:-2 };
const WIN_BONUS = 10;

function efficiencyBonuses(stats){
  let bonus=0; const details=[];
  const fgPct = stats.fga ? (stats.fgm/stats.fga)*100 : 0;
  const tpPct = stats.tpa ? (stats.tpm/stats.tpa)*100 : 0;
  const ftPct = stats.fta ? (stats.ftm/stats.fta)*100 : 0;
  if(fgPct>=70){ bonus+=15; details.push('FG%>=70 +15'); }
  else if(fgPct>=60){ bonus+=10; details.push('FG%>=60 +10'); }
  else if(fgPct>=50){ bonus+=5; details.push('FG%>=50 +5'); }
  if(tpPct>=60){ bonus+=15; details.push('3PT%>=60 +15'); }
  else if(tpPct>=50){ bonus+=10; details.push('3PT%>=50 +10'); }
  else if(tpPct>=40){ bonus+=5; details.push('3PT%>=40 +5'); }
  if(ftPct>=85){ bonus+=5; details.push('FT%>=85 +5'); }
  return {bonus,details,fgPct,tpPct,ftPct};
}

function penalties(stats){
  let pen=0; const details=[];
  const fgPct = stats.fga ? (stats.fgm/stats.fga)*100 : 0;
  const tpPct = stats.tpa ? (stats.tpm/stats.tpa)*100 : 0;
  if(fgPct<=35){ pen+=5; details.push('FG%<=35 -5'); }
  if(tpPct<=25){ pen+=5; details.push('3PT%<=25 -5'); }
  if(stats.to>=6){ pen+=5; details.push('6+ TOs -5'); }
  if(stats.foul_out){ pen+=10; details.push('Foul out -10'); }
  if(stats.blown_lead){ pen+=10; details.push('Blown lead -10'); }
  if(stats.plusminus <= -10){ const amt = Math.min(20, Math.abs(stats.plusminus)); pen += Math.round(amt/2); details.push('Bad +/- penalty'); }
  return {pen,details,fgPct,tpPct};
}

function dd_td_bonus(stats){
  const cnt = [stats.pts>=10, stats.reb>=10, stats.ast>=10, stats.stl>=10, stats.blk>=10].filter(Boolean).length;
  if(cnt>=3) return {bonus:15,desc:'Triple-double +15'};
  if(cnt>=2) return {bonus:5,desc:'Double-double +5'};
  return {bonus:0,desc:''};
}

function calculateGamePoints(stats){
  let total=0;
  total += (stats.pts||0)*BASE.pts;
  total += (stats.reb||0)*BASE.reb;
  total += (stats.ast||0)*BASE.ast;
  total += (stats.stl||0)*BASE.stl;
  total += (stats.blk||0)*BASE.blk;
  total += (stats.to||0)*BASE.to;
  if(stats.win) total += WIN_BONUS;
  const ddtd = dd_td_bonus(stats);
  total += ddtd.bonus;
  const eff = efficiencyBonuses(stats);
  total += eff.bonus;
  const pen = penalties(stats);
  total -= pen.pen;
  const beforeMult = total;
  const multiplied = Math.round(total * (stats.difficulty||1));
  return { base: beforeMult, multiplied, details:{eff,pen,ddtd} };
}

/* ---------- Badge XP mapping (simplified, tweakable) ---------- */
function badgeXpGain(stats){
  const gains = {};
  // shooting-related
  gains['Catch & Shoot'] = (stats.tpm||0)*2;
  gains['Limitless Range'] = (stats.tpm||0)*1;
  gains['Deadeye'] = (stats.tpm||0)*1 + ((stats.fgm||0)>0 && (stats.fgm/(stats.fga||1))*100>=50?2:0);
  // finishing
  gains['Posterizer'] = (stats.dunks||0)*5 || 0;
  gains['Fearless Finisher'] = (stats.pts>=20?5:0);
  // playmaking
  gains['Dimer'] = (stats.ast||0)*2;
  gains['Ankle Breaker'] = (stats.assistsForStyle||0)*1; // placeholder
  // defense
  gains['Pick Pocket'] = (stats.stl||0)*3;
  gains['Chase Down Artist'] = (stats.blk||0)*3;
  // default small xp for minutes
  gains['Durable'] = Math.floor((stats.minutes||0)/5);
  return gains;
}

/* ---------- DOM: Calculate & apply game ---------- */
qs('#btn-calc').onclick = ()=>{
  if(!CURRENT) return alert('Select a career first');
  const stats = readForm();
  const res = calculateGamePoints(stats);
  const eff = res.details.eff;
  const pen = res.details.pen;
  const dd = res.details.ddtd;
  qs('#calc-output').textContent = `Base ${res.base} · After difficulty ${res.multiplied} · Eff [+${eff.bonus}] Pen [-${pen.pen}] ${dd.desc}`;
};

function readForm(){
  return {
    minutes: Number(qs('#minutes').value||0),
    pts: Number(qs('#pts').value||0),
    reb: Number(qs('#reb').value||0),
    ast: Number(qs('#ast').value||0),
    stl: Number(qs('#stl').value||0),
    blk: Number(qs('#blk').value||0),
    to: Number(qs('#to').value||0),
    fgm: Number(qs('#fgm').value||0),
    fga: Number(qs('#fga').value||0),
    tpm: Number(qs('#tpm').value||0),
    tpa: Number(qs('#tpa').value||0),
    ftm: Number(qs('#ftm').value||0),
    fta: Number(qs('#fta').value||0),
    win: qs('#win').checked,
    difficulty: Number(qs('#difficulty').value||1),
    blown_lead: qs('#blown').checked,
    foul_out: false,
    plusminus: Number(qs('#plusminus').value||0),
    // optional extras
    dunks: 0
  };
}

qs('#btn-apply').onclick = ()=>{
  if(!CURRENT) return alert('Select a career first');
  // update player name
  CURRENT.playerName = qs('#player-name').value || CURRENT.playerName || 'Player';
  const stats = readForm();
  const res = calculateGamePoints(stats);
  CURRENT.games.push({stats,calc:res,ts:new Date().toISOString()});
  CURRENT.points_total = (CURRENT.points_total||0) + res.base;
  CURRENT.points_available = (CURRENT.points_available||0) + res.multiplied;
  // badge xp
  const gains = badgeXpGain(stats);
  for(const b in gains){
    if(CURRENT.badges[b] !== undefined) CURRENT.badges[b].xp += gains[b];
  }
  saveCurrent();
  renderAll();
  alert(`Game saved. Points awarded: ${res.multiplied}`);
};

/* ---------- Save / Load current ---------- */
function saveCurrent(){
  CAREERS = CAREERS.map(c => c.id===CURRENT.id ? CURRENT : c);
  saveAllCareers(CAREERS);
}

/* ---------- Create career / import / export ---------- */
qs('#btn-new-career').onclick = ()=>{
  const name = qs('#new-career-name').value.trim();
  if(!name) return alert('Enter a career name');
  const c = createEmptyCareer(name);
  CAREERS.unshift(c);
  CURRENT = c;
  saveAllCareers(CAREERS);
  renderAll();
  qs('#new-career-name').value='';
};

qs('#btn-export-all').onclick = ()=>{
  const blob = new Blob([JSON.stringify(CAREERS,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='synergy2k_careers_export.json'; a.click();
  URL.revokeObjectURL(url);
};

qs('#import-file').onchange = (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ()=> {
    try {
      const imported = JSON.parse(r.result);
      // simple merge
      imported.forEach(ic=> CAREERS.push(ic));
      saveAllCareers(CAREERS);
      renderAll();
      alert('Imported careers');
    } catch(err){ alert('Invalid file'); }
  };
  r.readAsText(f);
};

/* ---------- Progress render ---------- */
function renderProgress(){
  if(!CURRENT){ qs('#progress-summary').textContent='No career selected'; qs('#games-list').innerHTML=''; return; }
  qs('#progress-summary').innerHTML = `<strong>${CURRENT.name}</strong> — Player: ${CURRENT.playerName||'N/A'} · Total: ${CURRENT.points_total||0} · Available: ${CURRENT.points_available||0}`;
  const gl = qs('#games-list'); gl.innerHTML='';
  (CURRENT.games||[]).slice().reverse().forEach((g,i)=>{
    const d = document.createElement('div'); d.className='game';
    d.innerHTML = `<div><strong>Game ${CURRENT.games.length - i}</strong> • ${new Date(g.ts).toLocaleString()}</div>
                   <div class="muted">PTS ${g.stats.pts} AST ${g.stats.ast} REB ${g.stats.reb} • Points: ${g.calc.multiplied}</div>`;
    gl.appendChild(d);
  });
}

/* ---------- Attributes UI (Option C) ---------- */
function renderAttributesUI(){
  if(!CURRENT){ qs('#attr-categories').textContent='No career selected'; qs('#attr-individual').innerHTML=''; return; }
  const catsEl = qs('#attr-categories'); catsEl.innerHTML='';
  for(const cat in ATTRIBUTES){
    const wrapper = document.createElement('div'); wrapper.className='row';
    const slider = document.createElement('input'); slider.type='range'; slider.min=1; slider.max=99;
    slider.value = CURRENT.attributes[cat].category_level || 50;
    const label = document.createElement('label'); label.textContent = `${cat} (Category) `;
    const val = document.createElement('span'); val.textContent = slider.value;
    slider.oninput = ()=>{
      val.textContent = slider.value;
      CURRENT.attributes[cat].category_level = Number(slider.value);
      // soft-apply to related individual attributes
      ATTRIBUTES[cat].forEach(attr=>{
        const prev = CURRENT.attributes[attr]||50;
        CURRENT.attributes[attr] = Math.max(1, Math.min(99, Math.round((prev + Number(slider.value))/2)));
      });
    };
    wrapper.appendChild(label); wrapper.appendChild(slider); wrapper.appendChild(val);
    catsEl.appendChild(wrapper);
  }
  // individual attributes
  const indEl = qs('#attr-individual'); indEl.innerHTML='';
  for(const cat in ATTRIBUTES){
    ATTRIBUTES[cat].forEach(attr=>{
      const row = document.createElement('div'); row.className='row';
      const lbl = document.createElement('label'); lbl.textContent = attr;
      const input = document.createElement('input'); input.type='number'; input.min=1; input.max=99;
      input.value = CURRENT.attributes[attr] || 50;
      input.onchange = ()=> { CURRENT.attributes[attr] = Number(input.value); };
      row.appendChild(lbl); row.appendChild(input);
      indEl.appendChild(row);
    });
  }
  qs('#btn-save-attrs').onclick = ()=> { saveCurrent(); alert('Attributes saved'); renderBadgesUI(); };
}

/* ---------- Badges UI ---------- */
function renderBadgesUI(){
  const container = qs('#badges-list');
  if(!CURRENT){ container.textContent='No career selected'; return; }
  container.innerHTML = '';
  for(const cat in BADGES){
    const box = document.createElement('div'); box.className='card';
    box.innerHTML = `<h4>${cat}</h4>`;
    BADGES[cat].forEach(b=>{
      const info = CURRENT.badges[b] || {xp:0,tier:'Locked'};
      const xp = info.xp || 0;
      let tier = 'Locked';
      if(xp>=1500) tier='Legend';
      else if(xp>=700) tier='HoF';
      else if(xp>=350) tier='Gold';
      else if(xp>=150) tier='Silver';
      else if(xp>=0) tier='Bronze';
      // attribute-based unlock: simple rule: if any related attribute >=60 then unlocked
      const relatedUnlock = ATTRIBUTES[cat] && ATTRIBUTES[cat].some(a => (CURRENT.attributes[a]||0) >= 60);
      const unlockedText = relatedUnlock ? '' : ' (locked — raise attributes)';
      const pill = `<span class="badge-pill">${b} — ${tier}${unlockedText} — XP ${xp}</span>`;
      box.innerHTML += pill;
    });
    container.appendChild(box);
  }
}

/* ---------- Spending UI (simple) ---------- */
qs('#btn-spend').onclick = ()=>{
  if(!CURRENT) return alert('Select a career first');
  const avail = CURRENT.points_available || 0;
  if(avail<=0) return alert('No points available');
  const choice = prompt(`You have ${avail} points available.\nType attribute name to raise (exact), or category name to raise category. Example: "Three Pointer" or "Shooting".`);
  if(!choice) return;
  // try attribute exact match
  if(CURRENT.attributes[choice] !== undefined){
    const amt = Number(prompt('How many points to spend?', '5')) || 0;
    CURRENT.attributes[choice] = Math.min(99, (CURRENT.attributes[choice]||50) + amt);
    CURRENT.points_available = Math.max(0, avail - amt);
    saveCurrent(); renderAll();
    return alert(`Spent ${amt} on ${choice}`);
  }
  // try category
  if(CURRENT.attributes[choice] && typeof CURRENT.attributes[choice].category_level !== 'undefined'){
    const amt = Number(prompt('How many points to spend?', '5')) || 0;
    CURRENT.attributes[choice].category_level = Math.min(99, (CURRENT.attributes[choice].category_level||50) + amt);
    // soft-apply to members
    ATTRIBUTES[choice].forEach(a=> CURRENT.attributes[a] = Math.min(99, (CURRENT.attributes[a]||50) + Math.round(amt/2)));
    CURRENT.points_available = Math.max(0, avail - amt);
    saveCurrent(); renderAll();
    return alert(`Spent ${amt} on category ${choice}`);
  }
  alert('Attribute or category not found. Make sure the spelling is exact (case-sensitive).');
};

/* ---------- Reset career ---------- */
qs('#btn-reset').onclick = ()=>{
  if(!CURRENT) return alert('Select a career first');
  if(!confirm('Reset this career (erase games, points, badges)?')) return;
  const idx = CAREERS.findIndex(c=>c.id===CURRENT.id);
  if(idx>=0){ CAREERS[idx] = createEmptyCareer(CURRENT.name); CURRENT = CAREERS[idx]; saveAllCareers(CAREERS); renderAll(); }
};

/* ---------- Boot ---------- */
function boot(){
  // load or create sample if empty
  if(!CAREERS.length){
    CAREERS.push(createEmptyCareer('MyCareer'));
    saveAllCareers(CAREERS);
  }
  CURRENT = CAREERS[0];
  renderAll();
  // wire simple form field updates
  qs('#career-list').addEventListener('change', (e)=>{
    const id = e.target.value;
    const c = CAREERS.find(cc=>cc.id===id);
    if(c){ CURRENT = c; renderAll(); }
  });
  // populate career select (also clickable buttons exist)
  const select = qs('#career-list');
  select.innerHTML = CAREERS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}
boot();
