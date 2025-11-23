/* ----------------------------------------------------------
   SYNERGY 2K26 — MAIN ENGINE (app.js)
   Works with index.html + style.css you already have
---------------------------------------------------------- */

/* ----------------------------------------------------------
   NBA 2K26 — FULL ATTRIBUTE LIST (MyLEAGUE / MyNBA)
---------------------------------------------------------- */
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

/* ----------------------------------------------------------
   NBA 2K26 — OFFICIAL BADGES
---------------------------------------------------------- */
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

/* ----------------------------------------------------------
   DIFFICULTY MULTIPLIERS
---------------------------------------------------------- */
const DIFFICULTY = {
    rookie: 0.80,
    pro: 1.00,
    allstar: 1.10,
    superstar: 1.25,
    halloffame: 1.50,
    simmamba: 1.35
};

/* ----------------------------------------------------------
   CAREER STORAGE
---------------------------------------------------------- */
function loadCareers() {
    return JSON.parse(localStorage.getItem("synergy_careers") || "[]");
}
function saveCareers(list) {
    localStorage.setItem("synergy_careers", JSON.stringify(list));
}

/* ----------------------------------------------------------
   RENDER CAREERS MENU
---------------------------------------------------------- */
function renderCareerList() {
    const careers = loadCareers();
    const list = document.getElementById("careers-list");
    const select = document.getElementById("career-select");

    list.innerHTML = "";
    select.innerHTML = `<option value="">No career selected</option>`;

    careers.forEach((c, index) => {
        // Select dropdown
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = c.name;
        select.appendChild(opt);

        // List view
        const div = document.createElement("div");
        div.className = "saved-career-entry";
        div.innerHTML = `
            <h4>${c.name}</h4>
            <p>Points: ${c.points}</p>
            <div class="saved-career-btns">
                <button class="btn primary" onclick="selectCareer(${index})">Load</button>
                <button class="btn danger" onclick="deleteCareer(${index})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

/* ----------------------------------------------------------
   CREATE CAREER
---------------------------------------------------------- */
document.getElementById("create-career-btn").onclick = () => {
    const name = prompt("Enter career name:");
    if (!name) return;

    const careers = loadCareers();
    careers.push({
        name,
        points: 0,
        attributes: createDefaultAttributes(),
        badges: {},
        games: []
    });

    saveCareers(careers);
    renderCareerList();
};

/* ----------------------------------------------------------
   DEFAULT ATTRIBUTE STRUCTURE
---------------------------------------------------------- */
function createDefaultAttributes() {
    const obj = {};
    for (const group in ATTRIBUTE_GROUPS) {
        ATTRIBUTE_GROUPS[group].forEach(att => {
            obj[att] = 25; // starting rating
        });
    }
    return obj;
}

/* ----------------------------------------------------------
   SELECT CAREER
---------------------------------------------------------- */
let activeCareerIndex = null;

function selectCareer(i) {
    activeCareerIndex = i;
    const career = loadCareers()[i];

    document.getElementById("selected-career-name").textContent = career.name;
    document.getElementById("available-points").textContent = career.points;

    renderAttributes(career.attributes);
    renderBadges(career.badges);
}

/* ----------------------------------------------------------
   DELETE CAREER
---------------------------------------------------------- */
function deleteCareer(i) {
    const careers = loadCareers();
    careers.splice(i, 1);
    saveCareers(careers);
    activeCareerIndex = null;
    renderCareerList();
}

/* ----------------------------------------------------------
   RENDER ATTRIBUTES UI
---------------------------------------------------------- */
function renderAttributes(current) {
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
                <label>${att}</label>
                <input type="number" min="25" max="99" value="${current[att]}" class="attribute-input" data-att="${att}">
            `;

            groupDiv.appendChild(row);
        });

        container.appendChild(groupDiv);
    }
}

/* ----------------------------------------------------------
   SAVE ATTRIBUTES
---------------------------------------------------------- */
document.getElementById("save-attributes-btn").onclick = () => {
    if (activeCareerIndex === null) return alert("No career selected.");

    const careers = loadCareers();
    const career = careers[activeCareerIndex];

    const inputs = document.querySelectorAll(".attribute-input");
    inputs.forEach(inp => {
        const att = inp.dataset.att;
        career.attributes[att] = Number(inp.value);
    });

    saveCareers(careers);
    alert("Attributes saved!");
};

/* ----------------------------------------------------------
   RENDER BADGES
---------------------------------------------------------- */
function renderBadges(current = {}) {
    const list = document.getElementById("badge-list");
    list.innerHTML = "";

    for (const category in BADGES) {
        BADGES[category].forEach(badge => {
            const card = document.createElement("div");
            card.className = "badge-card";

            const level = current[badge] || "None";

            card.innerHTML = `
                <h4>${badge}</h4>
                <div class="badge-levels">
                    ${["None", "Bronze", "Silver", "Gold", "Hall of Fame", "Legend"].map(lvl => `
                        <div class="badge-level ${lvl === level ? 'active' : ''}"
                             data-badge="${badge}" data-level="${lvl}">
                             ${lvl}
                        </div>
                    `).join("")}
                </div>
            `;

            list.appendChild(card);
        });
    }

    // Badge selecting
    document.querySelectorAll(".badge-level").forEach(el => {
        el.onclick = () => {
            const badge = el.dataset.badge;
            const level = el.dataset.level;

            const careers = loadCareers();
            const career = careers[activeCareerIndex];

            career.badges[badge] = level;
            saveCareers(careers);

            renderBadges(career.badges);
        };
    });
}

/* ----------------------------------------------------------
   GAME ENTRY → POINTS CALCULATION
---------------------------------------------------------- */
document.getElementById("calculate-points-btn").onclick = () => {
    const pts = num("pts"), reb = num("reb"), ast = num("ast");
    const stl = num("stl"), blk = num("blk"), tov = num("tov");
    const win = document.getElementById("win").value === "yes";
    const blown = document.getElementById("blown-lead").value === "yes";
    const pm = num("plus-minus");

    let points = 0;

    points += pts * 1.5;
    points += reb * 1.0;
    points += ast * 1.2;
    points += stl * 2.0;
    points += blk * 2.0;
    points -= tov * 1.0;

    if (win) points += 5;
    if (blown) points -= 10;
    if (pm < 0) points += pm; // negative reduces

    // Difficulty
    const diff = document.querySelector("input[name='difficulty']:checked");
    if (diff) points *= DIFFICULTY[diff.value];

    if (points < 0) points = 0;

    document.getElementById("points-result").innerHTML =
        `<h3>Total Points: ${Math.floor(points)}</h3>`;
};

/* Helper */
function num(id) {
    return Number(document.getElementById(id).value) || 0;
}

/* ----------------------------------------------------------
   APPLY GAME (SAVE POINTS)
---------------------------------------------------------- */
document.getElementById("game-form").onsubmit = e => {
    e.preventDefault();
    if (activeCareerIndex === null) return alert("No career selected.");

    const resultText = document.getElementById("points-result").innerHTML;
    const match = resultText.match(/\d+/);
    if (!match) return alert("Calculate points first.");

    const gained = Number(match[0]);

    const careers = loadCareers();
    const career = careers[activeCareerIndex];

    career.points += gained;
    saveCareers(careers);

    renderCareerList();
    selectCareer(activeCareerIndex);

    alert(`Saved! +${gained} points added.`);
};

/* ----------------------------------------------------------
   INIT
---------------------------------------------------------- */
window.onload = () => {
    renderCareerList();
};
