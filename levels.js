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
    birds: ['red', 'red', 'red'],
    parScore: 3000,
    pigs: [
      { type: 'small', x: 0.72, y: 0.75 },
      { type: 'helmet', x: 0.82, y: 0.75 },
    ],
    blocks: [
      // Simple wood tower around pig 1
      { type: 'wood', shape: 'rect', x: 0.70, y: 0.88, w: 0.04, h: 0.12 },
      { type: 'wood', shape: 'rect', x: 0.74, y: 0.88, w: 0.04, h: 0.12 },
      { type: 'wood', shape: 'rect', x: 0.70, y: 0.77, w: 0.08, h: 0.025 },
      // Tower 2
      { type: 'wood', shape: 'rect', x: 0.80, y: 0.88, w: 0.04, h: 0.12 },
      { type: 'wood', shape: 'rect', x: 0.84, y: 0.88, w: 0.04, h: 0.12 },
      { type: 'wood', shape: 'rect', x: 0.80, y: 0.77, w: 0.08, h: 0.025 },
    ]
  },

  // ── LEVEL 2: Glass City ─────────────────────
  {
    id: 2,
    name: 'Glass City',
    birds: ['red', 'red', 'yellow', 'yellow'],
    parScore: 5000,
    pigs: [
      { type: 'small',  x: 0.68, y: 0.78 },
      { type: 'small',  x: 0.78, y: 0.78 },
      { type: 'helmet', x: 0.88, y: 0.78 },
    ],
    blocks: [
      // glass enclosures
      { type: 'glass', shape: 'rect', x: 0.65, y: 0.87, w: 0.03, h: 0.13 },
      { type: 'glass', shape: 'rect', x: 0.71, y: 0.87, w: 0.03, h: 0.13 },
      { type: 'glass', shape: 'rect', x: 0.65, y: 0.775, w: 0.09, h: 0.02 },
      { type: 'glass', shape: 'rect', x: 0.75, y: 0.87, w: 0.03, h: 0.13 },
      { type: 'glass', shape: 'rect', x: 0.81, y: 0.87, w: 0.03, h: 0.13 },
      { type: 'glass', shape: 'rect', x: 0.75, y: 0.775, w: 0.09, h: 0.02 },
      // wood top
      { type: 'wood',  shape: 'rect', x: 0.85, y: 0.87, w: 0.04, h: 0.13 },
      { type: 'wood',  shape: 'rect', x: 0.86, y: 0.775, w: 0.06, h: 0.02 },
    ]
  },

  // ── LEVEL 3: Split Practice ─────────────────
  {
    id: 3,
    name: 'Split Practice',
    birds: ['red', 'blue', 'blue', 'red'],
    parScore: 6500,
    pigs: [
      { type: 'small',  x: 0.63, y: 0.78 },
      { type: 'helmet', x: 0.73, y: 0.78 },
      { type: 'small',  x: 0.83, y: 0.78 },
      { type: 'medium', x: 0.78, y: 0.64 },
    ],
    blocks: [
      // three separate glass towers
      { type: 'glass', shape: 'rect', x: 0.61, y: 0.88, w: 0.03, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.64, y: 0.88, w: 0.03, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.61, y: 0.78, w: 0.06, h: 0.02 },
      { type: 'glass', shape: 'rect', x: 0.71, y: 0.88, w: 0.03, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.74, y: 0.88, w: 0.03, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.71, y: 0.78, w: 0.06, h: 0.02 },
      { type: 'glass', shape: 'rect', x: 0.81, y: 0.88, w: 0.03, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.84, y: 0.88, w: 0.03, h: 0.12 },
      { type: 'glass', shape: 'rect', x: 0.81, y: 0.78, w: 0.06, h: 0.02 },
      // elevated platform
      { type: 'wood', shape: 'rect', x: 0.73, y: 0.72, w: 0.12, h: 0.025 },
      { type: 'wood', shape: 'rect', x: 0.73, y: 0.745, w: 0.035, h: 0.06 },
      { type: 'wood', shape: 'rect', x: 0.805, y: 0.745, w: 0.035, h: 0.06 },
    ]
  },

  // ── LEVEL 4: Stone Fortress ─────────────────
  {
    id: 4,
    name: 'Stone Fortress',
    birds: ['yellow', 'yellow', 'black', 'black', 'red'],
    parScore: 9000,
    pigs: [
      { type: 'medium',  x: 0.68, y: 0.78 },
      { type: 'medium',  x: 0.80, y: 0.78 },
      { type: 'helmet',  x: 0.74, y: 0.60 },
      { type: 'helmet',  x: 0.86, y: 0.78 },
    ],
    blocks: [
      // outer stone walls
      { type: 'stone', shape: 'rect', x: 0.64, y: 0.80, w: 0.035, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.90, y: 0.80, w: 0.035, h: 0.20 },
      { type: 'stone', shape: 'rect', x: 0.675, y: 0.77, w: 0.225, h: 0.03 },
      // inner wood
      { type: 'wood', shape: 'rect', x: 0.68, y: 0.83, w: 0.05, h: 0.17 },
      { type: 'wood', shape: 'rect', x: 0.84, y: 0.83, w: 0.05, h: 0.17 },
      // upper platform
      { type: 'stone', shape: 'rect', x: 0.695, y: 0.655, w: 0.09, h: 0.025 },
      { type: 'stone', shape: 'rect', x: 0.695, y: 0.68, w: 0.025, h: 0.10 },
      { type: 'stone', shape: 'rect', x: 0.76,  y: 0.68, w: 0.025, h: 0.10 },
      // cross-beam
      { type: 'wood', shape: 'rect', x: 0.675, y: 0.745, w: 0.14, h: 0.02 },
    ]
  },

  // ── LEVEL 5: King's Castle ──────────────────
  {
    id: 5,
    name: "King's Castle",
    birds: ['black', 'yellow', 'blue', 'black', 'red'],
    parScore: 14000,
    pigs: [
      { type: 'small',   x: 0.62, y: 0.78 },
      { type: 'helmet',  x: 0.72, y: 0.78 },
      { type: 'helmet',  x: 0.85, y: 0.78 },
      { type: 'helmet',  x: 0.79, y: 0.60 },
      { type: 'king',    x: 0.79, y: 0.44 },
    ],
    blocks: [
      // Castle base
      { type: 'stone', shape: 'rect', x: 0.60, y: 0.82, w: 0.04, h: 0.18 },
      { type: 'stone', shape: 'rect', x: 0.88, y: 0.82, w: 0.04, h: 0.18 },
      { type: 'stone', shape: 'rect', x: 0.64, y: 0.76, w: 0.24, h: 0.03 },
      // Mid level
      { type: 'wood',  shape: 'rect', x: 0.66, y: 0.82, w: 0.04, h: 0.12 },
      { type: 'wood',  shape: 'rect', x: 0.84, y: 0.82, w: 0.04, h: 0.12 },
      { type: 'stone', shape: 'rect', x: 0.66, y: 0.585, w: 0.26, h: 0.025 },
      { type: 'stone', shape: 'rect', x: 0.68, y: 0.61, w: 0.03, h: 0.16 },
      { type: 'stone', shape: 'rect', x: 0.83, y: 0.61, w: 0.03, h: 0.16 },
      // Upper tower
      { type: 'stone', shape: 'rect', x: 0.72, y: 0.42, w: 0.14, h: 0.025 },
      { type: 'stone', shape: 'rect', x: 0.72, y: 0.445, w: 0.03, h: 0.14 },
      { type: 'stone', shape: 'rect', x: 0.83, y: 0.445, w: 0.03, h: 0.14 },
      // glass windows
      { type: 'glass', shape: 'rect', x: 0.755, y: 0.62, w: 0.07, h: 0.025 },
      { type: 'glass', shape: 'rect', x: 0.755, y: 0.47, w: 0.07, h: 0.025 },
    ]
  }
];

// Level star boundaries
function calcStars(score, pigsDestroyed, totalPigs, blocksDestroyed, totalBlocks, birdsLeft) {
  if (pigsDestroyed < totalPigs) return 0;
  let stars = 1;
  if (blocksDestroyed >= Math.floor(totalBlocks * 0.5)) stars = 2;
  if (blocksDestroyed >= Math.floor(totalBlocks * 0.8) && birdsLeft > 0) stars = 3;
  return stars;
}
