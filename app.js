/* ============================================================
   Synergy2K Next-Gen - Main Engine
   Hybrid Slimmamba x Synergy2K • NBA 2K26 Edition
============================================================ */

/* ------------------------------------------------------------
   FULL NBA 2K26 ATTRIBUTE SYSTEM (MyLEAGUE / MyNBA)
------------------------------------------------------------ */
const ATTRIBUTE_GROUPS = {
    "Inside Scoring": [
        "Close Shot","Driving Layup","Driving Dunk","Standing Dunk",
        "Post Control","Post Hook","Post Fade"
    ],
    "Outside Scoring": [
        "Mid-Range Shot","Three-Point Shot","Free Throw",
        "Shot IQ","Offensive Consistency"
    ],
    "Playmaking": [
        "Ball Handle","Speed With Ball","Pass Accuracy","Pass Vision","Pass IQ"
    ],
    "Defense": [
        "Interior Defense","Perimeter Defense","Steal","Block",
        "Lateral Quickness","Help Defense IQ","Defensive Consistency"
    ],
    "Rebounding": [
        "Offensive Rebound","Defensive Rebound"
    ],
    "Physicals": [
        "Speed","Acceleration","Strength","Vertical","Stamina","Hustle"
    ],
    "Mental": [
        "Offensive Awareness","Defensive Awareness","Hands","Pass Perception"
    ]
};

/* ------------------------------------------------------------
   BADGES (NBA 2K26 + Legend Tier)
------------------------------------------------------------ */
const BADGES = {
    finishing: [
        "Aerial Wizard","Float Game","Hook Specialist","Posterizer","Rise Up",
        "Acrobat","Slithery","Fearless Finisher","Giant Slayer","Fast Twitch"
    ],
    shooting: [
        "Deadeye","Limitless Range","Mini Marksman","Agent 3","Space Creator"
    ],
    playmaking: [
        "Ankle Assassin","Dimer","Handles For Days","Quick First Step",
        "Unpluckable","Bail Out","Needle Threader","Floor General"
    ],
    defense: [
        "Challenger","Glove","Anchor","Clamps","Chase Down Artist","Menace",
        "Workhorse","Boxout Beast","Rebound Chaser","Post Lockdown"
    ],
    rebounding: ["Boxout Beast","Rebound Chaser"],
    allaround: ["On-Court Coach","Leader Badge","Stabilizer"],
    custom: ["Blown Lead","Bad Plus/Minus"]
};
const BADGE_TIERS = ["None","Bronze","Silver","Gold","Hall of Fame","Legend"];

/* ------------------------------------------------------------
   ARCHETYPES (Templates)
------------------------------------------------------------ */
const ARCHETYPES = [
    {
        name: "Slasher",
        boosts: {"Driving Layup":80,"Driving Dunk":85,"Speed":80,"Acceleration":78},
        recommendedBadges: ["Slithery","Posterizer","Aerial Wizard"]
    },
    {
        name: "Sharpshooter",
        boosts: {"Three-Point Shot":90,"Mid-Range Shot":85,"Free Throw":80},
        recommendedBadges: ["Limitless Range","Deadeye","Mini Marksman"]
    },
    {
        name: "Lockdown Defender",
        boosts: {"Perimeter Defense":90,"Steal":85,"Lateral Quickness":90},
        recommendedBadges: ["Clamps","Glove","Challenger"]
    },
    {
        name: "Playmaker",
        boosts: {"Ball Handle":90,"Pass Accuracy":88,"Speed With Ball":86},
        recommendedBadges: ["Handles For Days","Dimer","Quick First Step"]
    },
    {
        name: "Stretch Big",
        boosts: {"Three-Point Shot":85,"Post Fade":75,"Defensive Rebound":85},
        recommendedBadges: ["Limitless Range","Boxout Beast"]
    }
];

/* ------------------------------------------------------------
   DIFFICULTY (Slimmamba Style)
------------------------------------------------------------ */
const DIFFICULTY = {
    rookie:0.80, pro:1.00, allstar:1.10,
    superstar:1.25, halloffame:1.50, simmamba:1.35
};

/* Helpers */
function num(id){ return Number(document.getElementById(id).value) || 0; }
function qs(s){ return document.querySelector(s); }
function qsa(s){ return document.querySelectorAll(s); }

/* ------------------------------------------------------------
   CAREER STORAGE
------------------------------------------------------------ */
function loadCareers(){ return JSON.parse(localStorage.getItem("s2k_careers") || "[]"); }
function saveCareers(list){ localStorage.setItem("s2k_careers", JSON.stringify(list)); }

/* ============================================================
   CAREER MANAGER
============================================================ */
function createDefaultAttributes(){
    const a={}; 
    for(const g in ATTRIBUTE_GROUPS){
        ATTRIBUTE_GROUPS[g].forEach(att=>a[att]=25);
    }
    return a;
}

document.getElementById("create-career-btn").onclick = () => {
    const name = prompt("Career Name:");
    if(!name) return;

    const careers = loadCareers();
    careers.push({
        name, xp:0,
        attributes:createDefaultAttributes(),
        badges:{}, games:[]
    });

    saveCareers(careers);
    renderCareerList();
};

function renderCareerList(){
    const careers = loadCareers();
    const sel = qs("#career-select"), list = qs("#career-list");

    sel.innerHTML=""; list.innerHTML="";

    careers.forEach((c,i)=>{
        sel.innerHTML += `<option value="${i}">${c.name}</option>`;
        list.innerHTML += `
            <div class="career-entry">
                <strong>${c.name}</strong><br>
                XP: ${c.xp}<br>
                <button class="btn green" onclick="loadCareer(${i})">Load</button>
                <button class="btn danger" onclick="deleteCareer(${i})">Delete</button>
            </div>`;
    });
}

let activeCareerIndex = null;

function loadCareer(i){
    activeCareerIndex = i;
    const c = loadCareers()[i];

    qs("#active-career-name").textContent = c.name;
    qs("#active-career-xp").textContent   = c.xp;

    renderAttributes(c.attributes);
    renderBadges(c.badges);
}

function deleteCareer(i){
    if(!confirm("Delete this career?")) return;

    const cs = loadCareers(); cs.splice(i,1);
    saveCareers(cs);

    activeCareerIndex=null;
    qs("#active-career-name").textContent="None";
    qs("#active-career-xp").textContent="0";

    renderCareerList();
}

/* ============================================================
   ATTRIBUTE RENDERING
============================================================ */
function renderAttributes(obj){
    const container = qs("#attributes-container");
    container.innerHTML="";

    for(const group in ATTRIBUTE_GROUPS){
        let html = `<div class="attribute-group"><h3>${group}</h3>`;
        ATTRIBUTE_GROUPS[group].forEach(att=>{
            html += `
            <div class="attribute-row">
                <span>${att}</span>
                <input type="number" class="attribute-input" 
                       data-att="${att}" min="25" max="99" value="${obj[att]}">
            </div>`;
        });
        html += `</div>`;
        container.innerHTML += html;
    }
}

qs("#save-attributes-btn").onclick = () => {
    if(activeCareerIndex===null) return alert("No career selected!");
    const cs = loadCareers(), c = cs[activeCareerIndex];

    qsa(".attribute-input").forEach(inp=>{
        let v = Number(inp.value);
        if(v<25) v=25; if(v>99) v=99;
        c.attributes[inp.dataset.att] = v;
    });

    saveCareers(cs);
    alert("Attributes saved!");
};

qs("#reset-attributes-btn").onclick = () => {
    if(activeCareerIndex===null) return alert("No career selected!");
    if(!confirm("Reset attributes?")) return;

    const cs = loadCareers();
    cs[activeCareerIndex].attributes = createDefaultAttributes();
    saveCareers(cs);
    loadCareer(activeCareerIndex);
};

/* ============================================================
   BADGE LAB
============================================================ */
function renderBadges(obj){
    const container = qs("#badge-container");
    container.innerHTML = "";

    for(const sec in BADGES){
        BADGES[sec].forEach(badge=>{
            let current = obj[badge] || "None";

            let tiers = BADGE_TIERS.map(t=>{
                let cls="badge-level"; 
                if(t===current) cls+=" active";
                if(t==="Legend") cls+=" legend";

                return `<div class="${cls}" data-badge="${badge}" data-tier="${t}">${t}</div>`;
            }).join("");

            container.innerHTML += `
            <div class="badge-card">
                <h4>${badge}</h4>
                <div class="badge-levels">${tiers}</div>
            </div>`;
        });
    }

    qsa(".badge-level").forEach(btn=>{
        btn.onclick = ()=>{
            if(activeCareerIndex===null) return;

            const cs = loadCareers(), c = cs[activeCareerIndex];
            c.badges[btn.dataset.badge] = btn.dataset.tier;
            saveCareers(cs);

            renderBadges(c.badges);
        };
    });
}

qs("#clear-badges-btn").onclick = ()=>{
    if(activeCareerIndex===null) return alert("No career selected!");
    if(!confirm("Clear all badges?")) return;

    const cs = loadCareers();
    cs[activeCareerIndex].badges = {};
    saveCareers(cs);

    renderBadges({});
};

/* ============================================================
   ARCHETYPES
============================================================ */
function renderArchetypes(){
    const box = qs("#archetype-container");
    box.innerHTML="";

    ARCHETYPES.forEach((a,i)=>{
        box.innerHTML += `
        <div class="archetype-card" onclick="applyArchetype(${i})">
            <strong>${a.name}</strong>
            <p>${Object.keys(a.boosts).length} boosted stats</p>
        </div>`;
    });
}

function applyArchetype(i){
    if(activeCareerIndex===null) return alert("No career selected!");

    const arch = ARCHETYPES[i];
    const cs = loadCareers(), c = cs[activeCareerIndex];

    for(const att in arch.boosts){
        c.attributes[att] = arch.boosts[att];
    }

    saveCareers(cs);
    loadCareer(activeCareerIndex);

    alert(`${arch.name} applied!`);
}

/* ============================================================
   XP ENGINE (Slimmamba Style)
============================================================ */
function calculateXP(){
    const pts=num("pts"), reb=num("reb"), ast=num("ast"),
          stl=num("stl"), blk=num("blk"), tov=num("tov"),
          fgm=num("fgm"), fga=num("fga"),
          tpm=num("tpm"), tpa=num("tpa"),
          ftm=num("ftm"), fta=num("fta");

    const win = qs("#win").value==="yes";
    const blown = qs("#blown-lead").value==="yes";
    const pm=num("plus-minus");

    let xp=0;

    xp += pts*1.5;
    xp += reb*1.0;
    xp += ast*1.2;
    xp += stl*2.0;
    xp += blk*2.0;
    xp -= tov*1.0;

    if(fga>0) xp += (fgm/fga)*5;
    if(tpa>0) xp += (tpm/tpa)*4;
    if(fta>0) xp += (ftm/fta)*3;

    if(win) xp+=5;
    if(blown) xp-=10;
    if(pm<0) xp+=pm;

    const diff = document.querySelector('input[name="difficulty"]:checked');
    if(diff) xp *= DIFFICULTY[diff.value];

    if(xp<0) xp=0;
    return Math.floor(xp);
}

qs("#calc-xp-btn").onclick = ()=>{
    qs("#xp-result").innerHTML = `<strong>XP Earned: ${calculateXP()}</strong>`;
};

/* SAVE GAME */
qs("#game-form").onsubmit = e=>{
    e.preventDefault();
    if(activeCareerIndex===null) return;

    const xp = calculateXP();
    const cs = loadCareers(), c = cs[activeCareerIndex];

    c.xp += xp;

    c.games.push({
        pts:num("pts"),reb:num("reb"),ast:num("ast"),stl:num("stl"),
        blk:num("blk"),tov:num("tov"),
        plusMinus:num("plus-minus"),
        win:qs("#win").value,
        difficulty:document.querySelector('input[name="difficulty"]:checked')
                   ?.value || "pro",
        xpEarned:xp,
        date:new Date().toLocaleString()
    });

    saveCareers(cs);
    loadCareer(activeCareerIndex);
    alert(`Saved! +${xp} XP`);
};

/* ============================================================
   BADGE FILTERS
============================================================ */
qsa(".filter-btn").forEach(btn=>{
    btn.onclick=()=>{
        qsa(".filter-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        const f=btn.dataset.filter;

        qsa(".badge-card").forEach(card=>{
            const name=card.querySelector("h4").textContent;
            let show=false;

            if(f==="all") show=true;
            else {
                for(const sec in BADGES){
                    if(sec===f && BADGES[sec].includes(name)) show=true;
                }
            }
            card.style.display = show?"block":"none";
        });
    };
});

/* LEGEND BADGE TOGGLE */
qs("#legend-toggle").onchange = ()=>{
    const on = qs("#legend-toggle").checked;
    qsa(".badge-level").forEach(b=>{
        if(b.dataset.tier==="Legend"){
            b.style.display = on?"inline-block":"none";
        }
    });
};

/* ============================================================
   EXPORT / IMPORT
============================================================ */
qs("#export-career-btn").onclick = ()=>{
    if(activeCareerIndex===null) return;

    const c = loadCareers()[activeCareerIndex];
    const json = JSON.stringify(c,null,2);

    const blob = new Blob([json],{type:"application/json"});
    const url = URL.createObjectURL(blob);

    const a=document.createElement("a");
    a.href=url; a.download=`${c.name}_Synergy2KNextGen.json`;
    a.click();

    URL.revokeObjectURL(url);
};

qs("#export-all-btn").onclick = ()=>{
    const cs = loadCareers();
    const json = JSON.stringify(cs,null,2);

    const blob = new Blob([json],{type:"application/json"});
    const url = URL.createObjectURL(blob);

    const a=document.createElement("a");
    a.href=url; a.download=`Synergy2KNextGen_ALL_Careers.json`;
    a.click();

    URL.revokeObjectURL(url);
};

qs("#import-career-btn").onclick = ()=>{
    const file = qs("#import-file").files[0];
    if(!file) return alert("Select a file!");

    const r = new FileReader();
    r.onload = ()=>{
        try {
            const career = JSON.parse(r.result);
            const cs = loadCareers();
            cs.push(career);
            saveCareers(cs);
            renderCareerList();
            alert("Imported!");
        } catch(e){
            alert("Invalid file.");
        }
    };
    r.readAsText(file);
};

/* ============================================================
   INIT
============================================================ */
window.onload = ()=>{
    renderCareerList();
    renderArchetypes();
    console.log("Synergy2K Next-Gen Engine Loaded (NBA 2K26 Edition)");
};
