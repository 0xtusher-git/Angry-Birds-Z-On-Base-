/* ═══════════════════════════════════════════
   MAIN GAME CONTROLLER — game.js
   ═══════════════════════════════════════════ */

// ── STATE ──────────────────────────────────
const G = {
  canvas: null,
  currentLevel: 0,     // index into LEVELS[]
  birdQueue: [],
  birdIdx: 0,
  score: 0,
  paused: false,
  phase: 'idle',       // idle | aiming | flying | waiting | done
  raf: null,
  lastTime: 0,

  // Slingshot drag
  dragging: false,
  dragStart: { x: 0, y: 0 },
  dragCur:   { x: 0, y: 0 },
  MAX_DRAG: 80,
  MAX_POWER: 22,

  // Clouds
  clouds: [
    { x: 60,  y: 0.12, r: 1.0 },
    { x: 200, y: 0.08, r: 0.8 },
    { x: 380, y: 0.15, r: 1.2 },
    { x: 600, y: 0.10, r: 0.9 },
    { x: 800, y: 0.06, r: 1.1 },
  ],

  // Extra birds from blue split
  extraBirds: [],

  // Post-level stats
  lastPigsKilled: 0,
  lastBlocksKilled: 0,
};

// ── INIT ───────────────────────────────────
function initGame() {
  G.canvas = document.getElementById('game-canvas');
  R.init(G.canvas);

  // Resize clouds to current width
  resizeClouds();

  bindInput();
  loadLevel(0);
}

function resizeClouds() {
  const W = R.W;
  const H = R.H;
  // Adjust MAX_DRAG based on width
  G.MAX_DRAG = Math.min(W * 0.22, 100);
  G.MAX_POWER = Math.min(W * 0.05 + 8, 22);
  G.clouds = [
    { x: W*0.05, y: 0.12, r: 1.0 },
    { x: W*0.22, y: 0.07, r: 0.8 },
    { x: W*0.42, y: 0.14, r: 1.2 },
    { x: W*0.62, y: 0.09, r: 0.9 },
    { x: W*0.80, y: 0.06, r: 1.1 },
  ];
}

window.addEventListener('resize', () => {
  if (G.canvas) {
    R.resize();
    resizeClouds();
  }
});

// ── LEVEL LOAD ─────────────────────────────
function loadLevel(idx) {
  G.currentLevel = idx;
  const lvl = LEVELS[idx];
  G.birdQueue = [...lvl.birds];
  G.birdIdx = 0;
  G.score = 0;
  G.phase = 'idle';
  G.dragging = false;
  G.extraBirds = [];
  G.lastPigsKilled = 0;
  G.lastBlocksKilled = 0;
  Particles.clear();

  Engine.destroy();
  Engine.init(R.W, R.H);
  Engine.loadLevel(lvl);

  updateHUD();
  placNextBird();
  hideAllScreens();

  if (G.raf) cancelAnimationFrame(G.raf);
  G.lastTime = performance.now();
  G.raf = requestAnimationFrame(loop);
}

function placNextBird() {
  const allBirds = [
    ...G.birdQueue.slice(G.birdIdx),
    ...G.extraBirds
  ];
  if (allBirds.length === 0) {
    // No birds left — game over
    endLevel(false);
    return;
  }

  const nextType = G.extraBirds.length > 0
    ? G.extraBirds.shift()
    : G.birdQueue[G.birdIdx++];

  Engine.placeBirdOnSlingshot(nextType);
  G.phase = 'idle';
  updateHUD();
}

// ── LOOP ───────────────────────────────────
function loop(now) {
  const dt = Math.min(now - G.lastTime, 50);
  G.lastTime = now;

  if (!G.paused) {
    Engine.step(dt);
    Particles.update();

    // Drift clouds
    for (const c of G.clouds) {
      c.x += 0.12;
      if (c.x > R.W + 100) c.x = -100;
    }

    checkWinCondition();
  }

  render();
  G.raf = requestAnimationFrame(loop);
}

function render() {
  R.clear();
  R.drawBackground(G.clouds);

  const sx = Engine.slingshotX;
  const sy = Engine.slingshotY;
  const bird = Engine.launchedBird;
  const bPos = (bird && !bird.dead) ? Engine.getBirdScreenPos(bird) : null;
  const isLoaded = G.phase === 'idle' || G.phase === 'aiming';

  // Draw slingshot
  let slingshotBirdPos = null;
  if (isLoaded && bird && bPos) {
    slingshotBirdPos = G.dragging ? G.dragCur : bPos;
  }
  R.drawSlingshot(sx, sy, slingshotBirdPos, isLoaded && bird);

  // Trajectory dots when aiming
  if (G.phase === 'aiming' && G.dragging) {
    const pts = calcTrajectory();
    R.drawTrajectory(pts);
  }

  // Draw blocks
  for (const bl of Engine.blocks) {
    if (bl.dead) continue;
    const bd = bl.body;
    const bnd = bd.bounds;
    R.drawBlock({
      x: bnd.min.x, y: bnd.min.y,
      w: bnd.max.x - bnd.min.x,
      h: bnd.max.y - bnd.min.y,
      angle: bd.angle,
      type: bl.type,
      health: bl.health,
      maxHealth: bl.type === 'wood' ? 80 : bl.type === 'stone' ? 200 : 30,
    });
  }

  // Draw pigs
  for (const pg of Engine.pigs) {
    if (pg.dead) continue;
    const p = pg.body.position;
    R.drawPig({ x: p.x, y: p.y, r: pg.r, type: pg.type, health: pg.health, maxHealth: pg.maxHealth, state: pg.state });
  }

  // Draw launched bird (when flying)
  if (bird && !bird.dead && bPos && G.phase === 'flying') {
    const vel = bird.body.velocity;
    const angle = Math.atan2(vel.y, vel.x);
    R.drawBird({ x: bPos.x, y: bPos.y, r: bird.r, type: bird.type, angle });
  }

  // Draw split children
  for (const cb of Engine.launchedBird?.splitChildren || []) {
    if (cb.dead) continue;
    const cp = Engine.getBirdScreenPos(cb);
    if (cp) {
      const vel = cb.body.velocity;
      R.drawBird({ x: cp.x, y: cp.y, r: cb.r, type: cb.type, angle: Math.atan2(vel.y, vel.x) });
    }
  }

  // Draw bird on slingshot when idle/aiming
  if ((G.phase === 'idle' || G.phase === 'aiming') && bird && !bird.dead) {
    const drawPos = G.dragging ? G.dragCur : { x: sx, y: sy - bird.r };
    R.drawBird({ x: drawPos.x, y: drawPos.y, r: bird.r, type: bird.type, angle: 0 });
  }

  // Queued birds
  R.drawQueuedBirds(G.birdQueue, G.birdIdx - 1, sx, sy + 50);

  // Particles
  R.drawParticles(Particles.list);
}

// ── TRAJECTORY CALC ────────────────────────
function calcTrajectory() {
  const power = getLaunchPower();
  const pts = [];
  
  let vx = power.x;
  let vy = power.y;
  let px = G.dragCur.x;
  let py = G.dragCur.y;
  
  const frictionAir = 0.01; // Matter.js default air friction
  // Matter.js velocity change per tick = gravity.y * gravity.scale * timeStep^2
  // 1.2 * 0.001 * (16.666)^2 ≈ 0.3333
  const a = 1.2 * 0.001 * 16.666 * 16.666; 
  
  for (let i = 0; i < 120; i++) {
    px += vx;
    py += vy;
    vx *= (1 - frictionAir);
    vy *= (1 - frictionAir);
    vy += a;
    
    // Space out dots for the dotted line visual
    if (i % 6 === 0 && i > 0) {
      pts.push({ x: px, y: py });
    }
    if (py > R.H) break;
  }
  return pts;
}

function getLaunchPower() {
  const sx = Engine.slingshotX;
  const sy = Engine.slingshotY - (Engine.launchedBird?.r || 18);
  const dx = sx - G.dragCur.x;
  const dy = sy - G.dragCur.y;
  const scale = 0.26;
  return { x: dx * scale, y: dy * scale };
}

// ── WIN / LOSE ──────────────────────────────
function checkWinCondition() {
  if (G.phase === 'done') return;
  if (Engine.allPigsDead()) { endLevel(true); return; }

  if (G.phase === 'flying') {
    const bird = Engine.launchedBird;
    const children = bird?.splitChildren || [];
    const allDead = (!bird || bird.dead) && children.every(c => c.dead);
    const allSettled = children.length > 0 && children.every(c => {
      if (c.dead) return true;
      const vel = c.body.velocity;
      const speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y);
      return speed < 0.4;
    });

    if (allDead) { scheduleNextBird(); return; }

    if (bird && !bird.dead) {
      const vel = bird.body.velocity;
      const speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y);
      const pos = bird.body.position;
      if ((speed < 0.4 && pos.y > R.H * 0.6) || pos.x > R.W + 50 || pos.y > R.H + 50) {
        scheduleNextBird();
      }
    } else if (allSettled) {
      scheduleNextBird();
    }
  }
}

let _nextBirdTimer = null;
function scheduleNextBird() {
  if (G.phase === 'done' || G.phase === 'waiting') return;
  G.phase = 'waiting';
  if (_nextBirdTimer) clearTimeout(_nextBirdTimer);
  _nextBirdTimer = setTimeout(() => {
    if (Engine.allPigsDead()) { endLevel(true); return; }
    const birdsLeft = G.birdQueue.length - G.birdIdx + G.extraBirds.length;
    if (birdsLeft <= 0) { endLevel(false); return; }
    placNextBird();
  }, 1500);
}

function endLevel(won) {
  if (G.phase === 'done') return;
  G.phase = 'done';
  G.lastPigsKilled  = Engine.pigsKilled();
  G.lastBlocksKilled = Engine.blocksKilled();

  if (won) {
    const totalPigs   = LEVELS[G.currentLevel].pigs.length;
    const totalBlocks = LEVELS[G.currentLevel].blocks.length;
    const birdsLeft   = Math.max(0, G.birdQueue.length - G.birdIdx);
    // Bonus score
    G.score += G.lastPigsKilled * 500 + G.lastBlocksKilled * 100 + birdsLeft * 1000;
    const stars = calcStars(G.score, G.lastPigsKilled, totalPigs, G.lastBlocksKilled, totalBlocks, birdsLeft);

    // Save progress
    const key = 'abz_lvl_' + (G.currentLevel + 1);
    const prev = JSON.parse(localStorage.getItem(key) || '{"stars":0,"score":0}');
    if (stars > prev.stars || G.score > prev.score) {
      localStorage.setItem(key, JSON.stringify({ stars, score: G.score }));
    }

    setTimeout(() => showLevelComplete(stars, birdsLeft), 800);
  } else {
    setTimeout(() => showGameOver(), 800);
  }
}

// ── SCORE ──────────────────────────────────
function addScore(pts) {
  G.score += pts;
  updateHUD();
}

// ── INPUT ──────────────────────────────────
function bindInput() {
  const c = G.canvas;

  // Mouse
  c.addEventListener('mousedown',  onDown);
  c.addEventListener('mousemove',  onMove);
  c.addEventListener('mouseup',    onUp);

  // Touch
  c.addEventListener('touchstart', e => { e.preventDefault(); onDown(e.touches[0]); }, { passive: false });
  c.addEventListener('touchmove',  e => { e.preventDefault(); onMove(e.touches[0]); }, { passive: false });
  c.addEventListener('touchend',   e => { e.preventDefault(); onUp(e.changedTouches[0]); }, { passive: false });
}

function getCanvasPos(e) {
  const rect = G.canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (R.W / rect.width),
    y: (e.clientY - rect.top)  * (R.H / rect.height),
  };
}

function onDown(e) {
  if (G.paused) return;
  if (G.phase === 'flying') {
    onMidAirAbility(e);
    return;
  }
  if (G.phase !== 'idle') return;
  const pos = getCanvasPos(e);
  const bird = Engine.launchedBird;
  if (!bird) return;
  const bx = Engine.slingshotX, by = Engine.slingshotY - bird.r;
  const dx = pos.x - bx, dy = pos.y - by;
  if (Math.sqrt(dx*dx + dy*dy) < bird.r * 3) {
    G.dragging = true;
    G.phase = 'aiming';
    G.dragCur = { x: bx, y: by };
  }
}

function onMove(e) {
  if (!G.dragging || G.paused) return;
  if (e.preventDefault) e.preventDefault(); // prevent scroll/pull-to-refresh
  const pos = getCanvasPos(e);
  const sx = Engine.slingshotX, sy = Engine.slingshotY - (Engine.launchedBird?.r || 18);
  const dx = pos.x - sx, dy = pos.y - sy;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const maxDrag = G.MAX_DRAG;
  if (dist > maxDrag) {
    G.dragCur = { x: sx + dx/dist*maxDrag, y: sy + dy/dist*maxDrag };
  } else {
    G.dragCur = { x: pos.x, y: pos.y };
  }
}

function onUp(e) {
  if (!G.dragging || G.paused) return;
  G.dragging = false;
  const sx = Engine.slingshotX, sy = Engine.slingshotY - (Engine.launchedBird?.r || 18);
  const dx = sx - G.dragCur.x, dy = sy - G.dragCur.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist < 10) { G.phase = 'idle'; return; } // snap back — no launch

  const power = getLaunchPower();
  const bird = Engine.launchedBird;
  // Move bird body to drag position before launch
  Matter.Body.setPosition(bird.body, { x: G.dragCur.x, y: G.dragCur.y });
  Engine.launchBird(bird, power);
  G.phase = 'flying';
}

function onMidAirAbility(e) {
  if (G.phase !== 'flying') return;
  const bird = Engine.launchedBird;
  if (!bird || bird.dead || bird.abilityUsed) return;

  if (bird.type === 'yellow') {
    Engine.activateYellow(bird);
  } else if (bird.type === 'blue') {
    const children = Engine.activateBlue(bird, R.W, R.H);
    if (children) {
      bird.splitChildren = children;
      G.phase = 'flying';
    }
  } else if (bird.type === 'black') {
    Engine.activateBlack(bird);
    scheduleNextBird();
  }
}

// ── HUD ────────────────────────────────────
function updateHUD() {
  document.getElementById('hud-level').textContent = G.currentLevel + 1;
  document.getElementById('hud-score').textContent = G.score.toLocaleString();

  const queueEl = document.getElementById('bird-queue');
  const allBirds = G.birdQueue.slice(G.birdIdx);
  const icons = { red:'🐦', yellow:'🐤', blue:'🫐', black:'💣' };
  queueEl.innerHTML = allBirds.map((t, i) =>
    `<div class="bird-icon${i===0?' next':''}">${icons[t]||'🐦'}</div>`
  ).join('');
}

// ── SCREENS ────────────────────────────────
function hideAllScreens() {
  ['screen-levelselect','screen-complete','screen-gameover'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function showLevelSelect() {
  hideAllScreens();
  const el = document.getElementById('screen-levelselect');
  el.style.display = 'flex';
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';
  LEVELS.forEach((lvl, i) => {
    const saved = JSON.parse(localStorage.getItem('abz_lvl_' + (i+1)) || '{"stars":0}');
    const unlocked = i === 0 || !!localStorage.getItem('abz_lvl_' + i);
    const stars = '★'.repeat(saved.stars) + '☆'.repeat(3 - saved.stars);
    const card = document.createElement('div');
    card.className = 'level-card' + (unlocked ? '' : ' locked');
    card.innerHTML = `<div class="level-num">${i+1}</div><div class="level-stars">${stars}</div>`;
    card.onclick = () => { hideAllScreens(); loadLevel(i); };
    grid.appendChild(card);
  });
}

function showLevelComplete(stars, birdsLeft) {
  hideAllScreens();
  const el = document.getElementById('screen-complete');
  el.style.display = 'flex';

  // Stars
  const starsEl = document.getElementById('stars-display');
  starsEl.innerHTML = [1,2,3].map(n =>
    `<div class="star${n<=stars?' earned':''}" style="animation-delay:${(n-1)*0.2}s">⭐</div>`
  ).join('');

  document.getElementById('sc-pigs').textContent   = Engine.pigsKilled() * 500;
  document.getElementById('sc-blocks').textContent = Engine.blocksKilled() * 100;
  document.getElementById('sc-birds').textContent  = birdsLeft * 1000;
  document.getElementById('sc-total').textContent  = G.score.toLocaleString();

  const btnNext = document.getElementById('btn-next-level');
  if (G.currentLevel >= LEVELS.length - 1) {
    btnNext.textContent = '🏆 All Levels Done!';
    btnNext.onclick = showLevelSelect;
  } else {
    btnNext.textContent = 'Next Level →';
    btnNext.onclick = nextLevel;
  }
}

function showGameOver() {
  hideAllScreens();
  document.getElementById('screen-gameover').style.display = 'flex';
}

function nextLevel() {
  if (G.currentLevel < LEVELS.length - 1) {
    loadLevel(G.currentLevel + 1);
  } else {
    showLevelSelect();
  }
}

function restartLevel() {
  loadLevel(G.currentLevel);
}

function togglePause() {
  G.paused = !G.paused;
  document.getElementById('btn-pause').textContent = G.paused ? '▶' : '⏸';
}
