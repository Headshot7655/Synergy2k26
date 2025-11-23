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
