/* ============================================================
   Synergy2K Next-Gen - Main Engine
   Hybrid Slimmamba x Synergy2K • NBA 2K26 Edition
============================================================ */

/* ------------------------------------------------------------
   FULL NBA 2K26 ATTRIBUTE SYSTEM (MyLEAGUE / MyNBA)
------------------------------------------------------------ */

const ATTRIBUTE_GROUPS = {
    "Inside Scoring": [
        "Close Shot",
        "Driving Layup",
        "Driving Dunk",
        "Standing Dunk",
        "Post Control",
        "Post Hook",
        "Post Fade"
    ],
    "Outside Scoring": [
        "Mid-Range Shot",
        "Three-Point Shot",
        "Free Throw",
        "Shot IQ",
        "Offensive Consistency"
    ],
    "Playmaking": [
        "Ball Handle",
        "Speed With Ball",
        "Pass Accuracy",
        "Pass Vision",
        "Pass IQ"
    ],
    "Defense": [
        "Interior Defense",
        "Perimeter Defense",
        "Steal",
        "Block",
        "Lateral Quickness",
        "Help Defense IQ",
        "Defensive Consistency"
    ],
    "Rebounding": [
        "Offensive Rebound",
        "Defensive Rebound"
    ],
    "Physicals": [
        "Speed",
        "Acceleration",
        "Strength",
        "Vertical",
        "Stamina",
        "Hustle"
    ],
    "Mental": [
        "Offensive Awareness",
        "Defensive Awareness",
        "Hands",
        "Pass Perception"
    ]
};

/* ------------------------------------------------------------
   NBA 2K26 BADGE SYSTEM w/ LEGEND TIER
------------------------------------------------------------ */

const BADGES = {
    finishing: [
        "Aerial Wizard",
        "Float Game",
        "Hook Specialist",
        "Posterizer",
        "Rise Up",
        "Acrobat",
        "Slithery",
        "Fearless Finisher",
        "Giant Slayer",
        "Fast Twitch"
    ],
    shooting: [
        "Deadeye",
        "Limitless Range",
        "Mini Marksman",
        "Agent 3",
        "Space Creator"
    ],
    playmaking: [
        "Ankle Assassin",
        "Dimer",
        "Handles For Days",
        "Quick First Step",
        "Unpluckable",
        "Bail Out",
        "Needle Threader",
        "Floor General"
    ],
    defense: [
        "Challenger",
        "Glove",
        "Anchor",
        "Clamps",
        "Chase Down Artist",
        "Menace",
        "Workhorse",
        "Boxout Beast",
        "Rebound Chaser",
        "Post Lockdown"
    ],
    rebounding: [
        "Boxout Beast",
        "Rebound Chaser"
    ],
    allaround: [
        "On-Court Coach",
        "Leader Badge",
        "Stabilizer"
    ],
    custom: [
        "Blown Lead",
        "Bad Plus/Minus"
    ]
};

const BADGE_TIERS = ["None", "Bronze", "Silver", "Gold", "Hall of Fame", "Legend"];

/* ------------------------------------------------------------
   ARCHETYPES (2K26-Style Templates)
------------------------------------------------------------ */

const ARCHETYPES = [
    {
        name: "Slasher",
        boosts: {
            "Driving Layup": 80,
            "Driving Dunk": 85,
            "Speed": 80,
            "Acceleration": 78
        },
        recommendedBadges: ["Slithery", "Posterizer", "Aerial Wizard"]
    },
    {
        name: "Sharpshooter",
        boosts: {
            "Three-Point Shot": 90,
            "Mid-Range Shot": 85,
            "Free Throw": 80
        },
        recommendedBadges: ["Limitless Range", "Deadeye", "Mini Marksman"]
    },
    {
        name: "Lockdown Defender",
        boosts: {
            "Perimeter Defense": 90,
            "Steal": 85,
            "Lateral Quickness": 90
        },
        recommendedBadges: ["Clamps", "Glove", "Challenger"]
    },
    {
        name: "Playmaker",
        boosts: {
            "Ball Handle": 90,
            "Pass Accuracy": 88,
            "Speed With Ball": 86
        },
        recommendedBadges: ["Handles For Days", "Dimer", "Quick First Step"]
    },
    {
        name: "Stretch Big",
        boosts: {
            "Three-Point Shot": 85,
            "Post Fade": 75,
            "Defensive Rebound": 85
        },
        recommendedBadges: ["Limitless Range", "Boxout Beast"]
    }
];

/* ------------------------------------------------------------
   DIFFICULTY MULTIPLIERS (Slimmamba Style)
------------------------------------------------------------ */

const DIFFICULTY = {
    rookie: 0.80,
    pro: 1.00,
    allstar: 1.10,
    superstar: 1.25,
    halloffame: 1.50,
    simmamba: 1.35
};

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------ */

function num(id) {
    return Number(document.getElementById(id).value) || 0;
}

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

/* ------------------------------------------------------------
   CAREER STORAGE
------------------------------------------------------------ */

function loadCareers() {
    return JSON.parse(localStorage.getItem("s2k_careers") || "[]");
}

function saveCareers(list) {
    localStorage.setItem("s2k_careers", JSON.stringify(list));
}
/* ============================================================
   PART 2 — CAREER MANAGER + UI RENDERING
============================================================ */

/* ------------------------------------------------------------
   CREATE NEW CAREER
------------------------------------------------------------ */
function createDefaultAttributes() {
    const attrs = {};
    for (const group in ATTRIBUTE_GROUPS) {
        ATTRIBUTE_GROUPS[group].forEach(att => {
            attrs[att] = 25; // Default floor
        });
    }
    return attrs;
}

document.getElementById("create-career-btn").onclick = () => {
    const name = prompt("Enter career name:");
    if (!name) return;

    const careers = loadCareers();
    careers.push({
        name,
        xp: 0,
        attributes: createDefaultAttributes(),
        badges: {},
        games: []
    });

    saveCareers(careers);
    renderCareerList();
};


/* ------------------------------------------------------------
   RENDER SAVED CAREERS
------------------------------------------------------------ */
function renderCareerList() {
    const careers = loadCareers();
    const select = document.getElementById("career-select");
    const list = document.getElementById("career-list");

    select.innerHTML = "";
    list.innerHTML = "";

    careers.forEach((c, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = c.name;
        select.appendChild(opt);

        const div = document.createElement("div");
        div.className = "career-entry";
        div.innerHTML = `
            <strong>${c.name}</strong>
            <br>XP: ${c.xp}
            <br><button class="btn green" onclick="loadCareer(${i})">Load</button>
            <button class="btn danger" onclick="deleteCareer(${i})">Delete</button>
        `;
        list.appendChild(div);
    });
}

let activeCareerIndex = null;

function loadCareer(i) {
    activeCareerIndex = i;
    const careers = loadCareers();
    const career = careers[i];

    document.getElementById("active-career-name").textContent = career.name;
    document.getElementById("active-career-xp").textContent = career.xp;

    renderAttributes(career.attributes);
    renderBadges(career.badges);
}


/* ------------------------------------------------------------
   DELETE CAREER
------------------------------------------------------------ */
function deleteCareer(i) {
    if (!confirm("Delete this career?")) return;

    const careers = loadCareers();
    careers.splice(i, 1);

    saveCareers(careers);
    activeCareerIndex = null;

    document.getElementById("active-career-name").textContent = "None";
    document.getElementById("active-career-xp").textContent = "0";

    renderCareerList();
}


/* ============================================================
   ATTRIBUTE PANEL RENDERING
============================================================ */
function renderAttributes(attrObj) {
    const container = document.getElementById("attributes-container");
    container.innerHTML = "";

    for (const group in ATTRIBUTE_GROUPS) {
        const groupDiv = document.createElement("div");
        groupDiv.className = "attribute-group";

        groupDiv.innerHTML = `<h3>${group}</h3>`;

        ATTRIBUTE_GROUPS[group].forEach(att => {
            const row = document.createElement("div");
            row.className = "attribute-row";

            row.innerHTML = `
                <span class="attribute-label">${att}</span>
                <input type="number" class="attribute-input" 
                    min="25" max="99" 
                    value="${attrObj[att]}" 
                    data-att="${att}">
            `;

            groupDiv.appendChild(row);
        });

        container.appendChild(groupDiv);
    }
}


/* SAVE ATTRIBUTES */
document.getElementById("save-attributes-btn").onclick = () => {
    if (activeCareerIndex === null) return alert("No career selected!");

    const careers = loadCareers();
    const career = careers[activeCareerIndex];

    document.querySelectorAll(".attribute-input").forEach(input => {
        const att = input.dataset.att;
        let val = Number(input.value);

        if (val < 25) val = 25;
        if (val > 99) val = 99;

        career.attributes[att] = val;
    });

    saveCareers(careers);
    alert("Attributes saved!");
};


/* RESET ATTRIBUTES */
document.getElementById("reset-attributes-btn").onclick = () => {
    if (activeCareerIndex === null) return alert("No career selected!");

    if (!confirm("Reset attributes to 25?")) return;

    const careers = loadCareers();
    careers[activeCareerIndex].attributes = createDefaultAttributes();

    saveCareers(careers);
    loadCareer(activeCareerIndex);
};


/* ============================================================
   BADGE LAB RENDERING (2K26 + LEGEND)
============================================================ */
function renderBadges(badgeObj) {
    const container = document.getElementById("badge-container");
    container.innerHTML = "";

    for (const section in BADGES) {
        BADGES[section].forEach(badge => {

            const card = document.createElement("div");
            card.className = "badge-card";

            let current = badgeObj[badge] || "None";

            let tierButtons = BADGE_TIERS.map(tier => {
                let cls = "badge-level";
                if (tier === current) cls += " active";
                if (tier === "Legend") cls += " legend";

                return `
                    <div class="${cls}" 
                        data-badge="${badge}" 
                        data-tier="${tier}">
                        ${tier}
                    </div>
                `;
            }).join("");

            card.innerHTML = `
                <h4>${badge}</h4>
                <div class="badge-levels">${tierButtons}</div>
            `;
            container.appendChild(card);
        });
    }

    /* BADGE LEVEL CLICK HANDLER */
    document.querySelectorAll(".badge-level").forEach(btn => {
        btn.onclick = () => {
            if (activeCareerIndex === null) return alert("No career selected!");

            const careers = loadCareers();
            const career = careers[activeCareerIndex];

            const badge = btn.dataset.badge;
            const tier = btn.dataset.tier;

            career.badges[badge] = tier;

            saveCareers(careers);
            renderBadges(career.badges);
        };
    });
}


/* CLEAR BADGES */
document.getElementById("clear-badges-btn").onclick = () => {
    if (activeCareerIndex === null) return alert("No career selected!");

    if (!confirm("Clear all badges?")) return;

    const careers = loadCareers();
    careers[activeCareerIndex].badges = {};

    saveCareers(careers);
    renderBadges({});
};


/* ============================================================
   ARCHETYPE PANEL RENDERING
============================================================ */
function renderArchetypes() {
    const container = document.getElementById("archetype-container");
    container.innerHTML = "";

    ARCHETYPES.forEach((arch, index) => {
        const div = document.createElement("div");
        div.className = "archetype-card";

        div.innerHTML = `
            <strong>${arch.name}</strong>
            <p>${Object.keys(arch.boosts).length} boosted attributes</p>
        `;

        div.onclick = () => applyArchetype(index);
        container.appendChild(div);
    });
}

function applyArchetype(i) {
    if (activeCareerIndex === null) return alert("No career selected!");

    const arch = ARCHETYPES[i];
    const careers = loadCareers();
    const career = careers[activeCareerIndex];

    for (const att in arch.boosts) {
        career.attributes[att] = arch.boosts[att];
    }

    saveCareers(careers);
    loadCareer(activeCareerIndex);

    alert(`${arch.name} archetype applied!`);
}


/* ============================================================
   INIT UI ON PAGE LOAD
============================================================ */
window.onload = () => {
    renderCareerList();
    renderArchetypes();
};
/* ============================================================
   PART 3 — XP ENGINE + SAVE GAME + IMPORT/EXPORT
============================================================ */

/* ------------------------------------------------------------
   SLIMMAMBA XP ENGINE (NBA 2K26 Version)
------------------------------------------------------------ */

function calculateXP() {
    const pts = num("pts");
    const reb = num("reb");
    const ast = num("ast");
    const stl = num("stl");
    const blk = num("blk");
    const tov = num("tov");

    const fgm = num("fgm");
    const fga = num("fga");
    const tpm = num("tpm");
    const tpa = num("tpa");
    const ftm = num("ftm");
    const fta = num("fta");

    const win = qs("#win").value === "yes";
    const blown = qs("#blown-lead").value === "yes";
    const pm = num("plus-minus");

    let xp = 0;

    // Base XP — Slimmamba style
    xp += pts * 1.5;
    xp += reb * 1.0;
    xp += ast * 1.2;
    xp += stl * 2.0;
    xp += blk * 2.0;
    xp -= tov * 1.0;

    // Efficiency Bonuses
    if (fga > 0) {
        const fgPct = fgm / fga;
        xp += fgPct * 5;
    }
    if (tpa > 0) {
        const tpPct = tpm / tpa;
        xp += tpPct * 4;
    }
    if (fta > 0) {
        const ftPct = ftm / fta;
        xp += ftPct * 3;
    }

    // Game result
    if (win) xp += 5;

    // Custom penalties
    if (blown) xp -= 10;
    if (pm < 0) xp += pm; // negative reduces XP

    // Difficulty
    const diff = document.querySelector('input[name="difficulty"]:checked');
    if (diff) {
        xp *= DIFFICULTY[diff.value];
    }

    if (xp < 0) xp = 0;

    return Math.floor(xp);
}

/* Display XP */
document.getElementById("calc-xp-btn").onclick = () => {
    const xp = calculateXP();
    qs("#xp-result").innerHTML = `<strong>XP Earned: ${xp}</strong>`;
};


/* ------------------------------------------------------------
   SAVE GAME (adds XP + stores game stats)
------------------------------------------------------------ */
document.getElementById("game-form").onsubmit = e => {
    e.preventDefault();
    if (activeCareerIndex === null) return alert("No career selected!");

    const xp = calculateXP();
    const careers = loadCareers();
    const career = careers[activeCareerIndex];

    // Add XP
    career.xp += xp;

    // Save box score
    career.games.push({
        pts: num("pts"),
        reb: num("reb"),
        ast: num("ast"),
        stl: num("stl"),
        blk: num("blk"),
        tov: num("tov"),
        plusMinus: num("plus-minus"),
        win: qs("#win").value,
        difficulty: document.querySelector('input[name="difficulty"]:checked')?.value || "pro",
        xpEarned: xp,
        date: new Date().toLocaleString()
    });

    saveCareers(careers);
    loadCareer(activeCareerIndex);

    alert(`Saved! +${xp} XP added.`);
};


/* ------------------------------------------------------------
   BADGE FILTERING
------------------------------------------------------------ */
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        document.querySelectorAll(".badge-card").forEach(card => {
            const name = card.querySelector("h4").textContent;

            let match = false;

            for (const section in BADGES) {
                if (filter === "all") { match = true; break; }
                if (section === filter && BADGES[section].includes(name)) {
                    match = true;
                    break;
                }
            }

            card.style.display = match ? "block" : "none";
        });
    };
});


/* ------------------------------------------------------------
   LEGEND BADGE TOGGLE
------------------------------------------------------------ */
document.getElementById("legend-toggle").onchange = () => {
    const enabled = document.getElementById("legend-toggle").checked;

    document.querySelectorAll(".badge-level").forEach(el => {
        if (el.dataset.tier === "Legend") {
            el.style.display = enabled ? " inline-block" : "none";
        }
    });
};


/* ------------------------------------------------------------
   EXPORT ACTIVE CAREER
------------------------------------------------------------ */
document.getElementById("export-career-btn").onclick = () => {
    if (activeCareerIndex === null) return alert("No career selected!");

    const careers = loadCareers();
    const career = careers[activeCareerIndex];

    const json = JSON.stringify(career, null, 2);

    qs("#export-output").textContent = json;

    // Download file
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${career.name}_Synergy2KNextGen.json`;
    a.click();

    URL.revokeObjectURL(url);
};


/* ------------------------------------------------------------
   IMPORT CAREER
------------------------------------------------------------ */
document.getElementById("import-career-btn").onclick = () => {
    const fileInput = document.getElementById("import-file");
    if (!fileInput.files.length) return alert("Select a JSON file first!");

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        try {
            const imported = JSON.parse(reader.result);
            const careers = loadCareers();
            careers.push(imported);
            saveCareers(careers);
            renderCareerList();
            alert("Career imported successfully!");
        } catch (e) {
            alert("Invalid file!");
        }
    };

    reader.readAsText(file);
};


/* ------------------------------------------------------------
   IMPORT ALL CAREERS EXPORT
------------------------------------------------------------ */
document.getElementById("export-all-btn").onclick = () => {
    const careers = loadCareers();
    const json = JSON.stringify(careers, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Synergy2KNextGen_ALL_Careers.json`;
    a.click();

    URL.revokeObjectURL(url);
};


/* ------------------------------------------------------------
   DONE — FULL ENGINE COMPLETE
------------------------------------------------------------ */
console.log("Synergy2K Next-Gen Engine Loaded (NBA 2K26 Edition)");
