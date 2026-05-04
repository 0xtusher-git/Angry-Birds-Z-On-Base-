/* ═══════════════════════════════════════════
   LEVEL DEFINITIONS — levels.js
   ═══════════════════════════════════════════ */

// Block types: 'wood' | 'stone' | 'glass'
// Bird types:  'red' | 'yellow' | 'blue' | 'black'
// Pig types:   'small' | 'medium' | 'helmet' | 'king'

const LEVELS = [
  // ── LEVEL 1: Tutorial ──────────────────────
  {
    id: 1,
    name: 'Piggy Paradise',
    birds: ['red', 'red', 'red', 'red'],
    parScore: 3000,
    pigs: [{ type: 'small', x: 0.75, y: 0.75 }],
    blocks: [
      { type: 'glass', shape: 'rect', x: 0.72, y: 0.88, w: 0.06, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.72, y: 0.77, w: 0.06, h: 0.025 },
    ]
  },

  // ── LEVEL 2: Glass City ─────────────────────
  {
    id: 2,
    name: 'Glass City',
    birds: ['red', 'red', 'yellow', 'yellow'],
    parScore: 5000,
    pigs: [
      { type: 'small',  x: 0.70, y: 0.78 },
      { type: 'small',  x: 0.82, y: 0.78 },
    ],
    blocks: [
      { type: 'glass', shape: 'rect', x: 0.67, y: 0.87, w: 0.04, h: 0.13 },
      { type: 'glass', shape: 'rect', x: 0.73, y: 0.87, w: 0.04, h: 0.13 },
      { type: 'glass', shape: 'rect', x: 0.67, y: 0.775, w: 0.10, h: 0.02 },
      { type: 'glass', shape: 'rect', x: 0.79, y: 0.87, w: 0.04, h: 0.13 },
      { type: 'glass', shape: 'rect', x: 0.85, y: 0.87, w: 0.04, h: 0.13 },
      { type: 'glass', shape: 'rect', x: 0.79, y: 0.775, w: 0.10, h: 0.02 },
    ]
  },

  // ── LEVEL 3: Wood Stack ─────────────────────
  {
    id: 3,
    name: 'Wood Stack',
    birds: ['red', 'blue', 'blue', 'red'],
    parScore: 6500,
    pigs: [
      { type: 'small',  x: 0.65, y: 0.78 },
      { type: 'medium', x: 0.75, y: 0.78 },
    ],
    blocks: [
      { type: 'wood', shape: 'rect', x: 0.62, y: 0.88, w: 0.04, h: 0.12 },
      { type: 'wood', shape: 'rect', x: 0.68, y: 0.88, w: 0.04, h: 0.12 },
      { type: 'wood', shape: 'rect', x: 0.62, y: 0.78, w: 0.10, h: 0.025 },
      { type: 'wood', shape: 'rect', x: 0.72, y: 0.88, w: 0.04, h: 0.12 },
      { type: 'wood', shape: 'rect', x: 0.78, y: 0.88, w: 0.04, h: 0.12 },
      { type: 'wood', shape: 'rect', x: 0.72, y: 0.78, w: 0.10, h: 0.025 },
    ]
  },

  // ── LEVEL 4: Simple Fortress ────────────────
  {
    id: 4,
    name: 'Simple Fortress',
    birds: ['yellow', 'yellow', 'red', 'red'],
    parScore: 8000,
    pigs: [
      { type: 'small',  x: 0.70, y: 0.78 },
      { type: 'helmet', x: 0.80, y: 0.78 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.80, w: 0.04, h: 0.18 },
      { type: 'wood',  shape: 'rect', x: 0.75, y: 0.80, w: 0.04, h: 0.18 },
      { type: 'glass', shape: 'rect', x: 0.65, y: 0.77, w: 0.14, h: 0.03 },
    ]
  },

  // ── LEVEL 5: Glass Tower ────────────────────
  {
    id: 5,
    name: 'Glass Tower',
    birds: ['blue', 'blue', 'yellow', 'red'],
    parScore: 10000,
    pigs: [
      { type: 'small',  x: 0.75, y: 0.78 },
      { type: 'small',  x: 0.75, y: 0.65 },
    ],
    blocks: [
      { type: 'glass', shape: 'rect', x: 0.70, y: 0.88, w: 0.10, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.70, y: 0.78, w: 0.10, h: 0.03 },
      { type: 'glass', shape: 'rect', x: 0.72, y: 0.73, w: 0.06, h: 0.08 },
      { type: 'glass', shape: 'rect', x: 0.72, y: 0.63, w: 0.06, h: 0.02 },
    ]
  },

  // ── LEVEL 6-10: Medium Difficulty ───────────
  {
    id: 6,
    name: 'Stone Wall',
    birds: ['red', 'yellow', 'black'],
    parScore: 12000,
    pigs: [
      { type: 'medium', x: 0.70, y: 0.78 },
      { type: 'helmet', x: 0.85, y: 0.78 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.82, w: 0.04, h: 0.18 },
      { type: 'stone', shape: 'rect', x: 0.75, y: 0.82, w: 0.04, h: 0.18 },
      { type: 'stone', shape: 'rect', x: 0.85, y: 0.82, w: 0.04, h: 0.18 },
      { type: 'wood',  shape: 'rect', x: 0.65, y: 0.76, w: 0.24, h: 0.03 },
    ]
  },
  {
    id: 7,
    name: 'Wood Castle',
    birds: ['yellow', 'yellow', 'blue', 'red'],
    parScore: 15000,
    pigs: [
      { type: 'small',  x: 0.65, y: 0.78 },
      { type: 'medium', x: 0.75, y: 0.78 },
      { type: 'small',  x: 0.85, y: 0.78 },
    ],
    blocks: [
      { type: 'wood', shape: 'rect', x: 0.60, y: 0.80, w: 0.04, h: 0.20 },
      { type: 'wood', shape: 'rect', x: 0.70, y: 0.80, w: 0.04, h: 0.20 },
      { type: 'wood', shape: 'rect', x: 0.80, y: 0.80, w: 0.04, h: 0.20 },
      { type: 'wood', shape: 'rect', x: 0.90, y: 0.80, w: 0.04, h: 0.20 },
      { type: 'wood', shape: 'rect', x: 0.60, y: 0.75, w: 0.34, h: 0.04 },
    ]
  },
  {
    id: 8,
    name: 'The Triplets',
    birds: ['blue', 'blue', 'black'],
    parScore: 18000,
    pigs: [
      { type: 'helmet', x: 0.65, y: 0.78 },
      { type: 'helmet', x: 0.75, y: 0.78 },
      { type: 'helmet', x: 0.85, y: 0.78 },
    ],
    blocks: [
      { type: 'glass', shape: 'rect', x: 0.62, y: 0.88, w: 0.06, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.72, y: 0.88, w: 0.06, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.82, y: 0.88, w: 0.06, h: 0.12 },
      { type: 'stone', shape: 'rect', x: 0.62, y: 0.78, w: 0.26, h: 0.03 },
    ]
  },
  {
    id: 9,
    name: 'Stone Guard',
    birds: ['black', 'yellow', 'red', 'red'],
    parScore: 20000,
    pigs: [
      { type: 'medium', x: 0.70, y: 0.70 },
      { type: 'king',   x: 0.85, y: 0.78 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.85, w: 0.05, h: 0.15 },
      { type: 'stone', shape: 'rect', x: 0.80, y: 0.85, w: 0.05, h: 0.15 },
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.75, w: 0.20, h: 0.04 },
      { type: 'wood',  shape: 'rect', x: 0.68, y: 0.65, w: 0.04, h: 0.10 },
    ]
  },
  {
    id: 10,
    name: 'Hardened Post',
    birds: ['yellow', 'black', 'blue', 'red'],
    parScore: 22000,
    pigs: [
      { type: 'helmet', x: 0.70, y: 0.78 },
      { type: 'helmet', x: 0.80, y: 0.78 },
      { type: 'small',  x: 0.75, y: 0.60 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.80, w: 0.04, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.85, y: 0.80, w: 0.04, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.75, w: 0.24, h: 0.03 },
      { type: 'wood',  shape: 'rect', x: 0.70, y: 0.65, w: 0.14, h: 0.03 },
    ]
  },

  // ── LEVEL 11-15: Hard Difficulty ────────────
  {
    id: 11,
    name: 'The King\'s Den',
    birds: ['red', 'yellow', 'black'],
    parScore: 25000,
    pigs: [
      { type: 'king',   x: 0.80, y: 0.75 },
      { type: 'helmet', x: 0.70, y: 0.75 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.80, w: 0.06, h: 0.25 },
      { type: 'stone', shape: 'rect', x: 0.85, y: 0.80, w: 0.06, h: 0.25 },
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.70, w: 0.26, h: 0.04 },
      { type: 'stone', shape: 'rect', x: 0.72, y: 0.55, w: 0.12, h: 0.04 },
    ]
  },
  {
    id: 12,
    name: 'Fortress Prime',
    birds: ['black', 'blue', 'red'],
    parScore: 30000,
    pigs: [
      { type: 'helmet', x: 0.65, y: 0.78 },
      { type: 'helmet', x: 0.85, y: 0.78 },
      { type: 'king',   x: 0.75, y: 0.55 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.60, y: 0.85, w: 0.04, h: 0.15 },
      { type: 'stone', shape: 'rect', x: 0.70, y: 0.85, w: 0.04, h: 0.15 },
      { type: 'stone', shape: 'rect', x: 0.80, y: 0.85, w: 0.04, h: 0.15 },
      { type: 'stone', shape: 'rect', x: 0.90, y: 0.85, w: 0.04, h: 0.15 },
      { type: 'stone', shape: 'rect', x: 0.60, y: 0.78, w: 0.34, h: 0.04 },
      { type: 'stone', shape: 'rect', x: 0.70, y: 0.65, w: 0.14, h: 0.04 },
    ]
  },
  {
    id: 13,
    name: 'Glass & Stone Trap',
    birds: ['yellow', 'yellow', 'black'],
    parScore: 35000,
    pigs: [
      { type: 'king',   x: 0.75, y: 0.75 },
      { type: 'medium', x: 0.65, y: 0.60 },
      { type: 'medium', x: 0.85, y: 0.60 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.60, y: 0.90, w: 0.30, h: 0.05 },
      { type: 'stone', shape: 'rect', x: 0.72, y: 0.80, w: 0.06, h: 0.10 },
      { type: 'glass', shape: 'rect', x: 0.60, y: 0.70, w: 0.04, h: 0.20 },
      { type: 'glass', shape: 'rect', x: 0.90, y: 0.70, w: 0.04, h: 0.20 },
      { type: 'wood',  shape: 'rect', x: 0.60, y: 0.65, w: 0.34, h: 0.03 },
    ]
  },
  {
    id: 14,
    name: 'The Gauntlet',
    birds: ['red', 'blue', 'black'],
    parScore: 40000,
    pigs: [
      { type: 'king',   x: 0.85, y: 0.78 },
      { type: 'helmet', x: 0.75, y: 0.78 },
      { type: 'helmet', x: 0.65, y: 0.78 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.60, y: 0.80, w: 0.05, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.70, y: 0.80, w: 0.05, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.80, y: 0.80, w: 0.05, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.90, y: 0.80, w: 0.05, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.60, y: 0.75, w: 0.35, h: 0.03 },
    ]
  },
  {
    id: 15,
    name: 'Final Siege',
    birds: ['black', 'black', 'yellow'],
    parScore: 50000,
    pigs: [
      { type: 'king',   x: 0.75, y: 0.70 },
      { type: 'king',   x: 0.75, y: 0.50 },
    ],
    blocks: [
      { type: 'stone', shape: 'rect', x: 0.60, y: 0.85, w: 0.30, h: 0.06 },
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.65, w: 0.04, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.85, y: 0.65, w: 0.04, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.65, y: 0.60, w: 0.24, h: 0.04 },
      { type: 'stone', shape: 'rect', x: 0.70, y: 0.45, w: 0.14, h: 0.04 },
    ]
  }
];

// Level star boundaries
function calcStars(score, pigsDestroyed, totalPigs, blocksDestroyed, totalBlocks, birdsLeft) {
  if (pigsDestroyed < totalPigs) return 0;
  let stars = 1;
  if (blocksDestroyed >= Math.floor(totalBlocks * 0.4)) stars = 2; // Made easier to get stars
  if (blocksDestroyed >= Math.floor(totalBlocks * 0.7) && birdsLeft > 0) stars = 3;
  return stars;
}

