/* ═══════════════════════════════════════════
   PHYSICS ENGINE — engine.js
   Matter.js world management
   ═══════════════════════════════════════════ */

const Engine = {
  engine: null,
  world: null,
  runner: null,

  // Live entity arrays
  birds: [],       // physics bodies with metadata
  pigs: [],
  blocks: [],
  ground: null,
  groundY: 0,
  walls: [],
  launchedBird: null,
  slingshotConstraint: null,

  // Config (set by game on init)
  W: 0, H: 0,
  slingshotX: 0, slingshotY: 0,

  BIRD_PROPS: {
    red:    { r: 18, density: 0.004, restitution: 0.3, friction: 0.5, health: 1, label:'red'    },
    yellow: { r: 16, density: 0.003, restitution: 0.25,friction: 0.4, health: 1, label:'yellow' },
    blue:   { r: 12, density: 0.002, restitution: 0.35,friction: 0.4, health: 1, label:'blue'   },
    black:  { r: 22, density: 0.006, restitution: 0.15,friction: 0.6, health: 1, label:'black'  },
  },

  PIG_PROPS: {
    small:  { r: 20, health: 60,  density: 0.003 },
    medium: { r: 26, health: 120, density: 0.004 },
    helmet: { r: 26, health: 220, density: 0.005 },
    king:   { r: 34, health: 400, density: 0.006 },
  },

  BLOCK_PROPS: {
    wood:  { density: 0.002, restitution: 0.2, friction: 0.6, health: 80  },
    stone: { density: 0.006, restitution: 0.1, friction: 0.7, health: 200 },
    glass: { density: 0.001, restitution: 0.4, friction: 0.3, health: 30  },
  },

  init(W, H) {
    const { Engine: Eng, World, Bodies, Events } = Matter;
    this.W = W; this.H = H;
    const isPortrait = H > W;
    this.slingshotX = W * 0.25;
    this.slingshotY = isPortrait ? H * 0.75 : H * 0.82;

    this.engine = Eng.create({ gravity: { y: 1.2 } });
    this.world  = this.engine.world;
    this.birds = []; this.pigs = []; this.blocks = [];

    // Ground + walls
    this.groundY = isPortrait ? H * 0.80 : H * 0.88;
    const ground = Bodies.rectangle(W/2, this.groundY + 20, W*3, 40, { isStatic:true, friction:0.8, label:'ground' });
    const wallL  = Bodies.rectangle(-20, H/2, 40, H*2, { isStatic:true, label:'wall' });
    const wallR  = Bodies.rectangle(W+20, H/2, 40, H*2, { isStatic:true, label:'wall' });
    World.add(this.world, [ground, wallL, wallR]);
    this.ground = ground;

    Events.on(this.engine, 'collisionStart', (e) => this._onCollision(e));
  },

  loadLevel(levelDef) {
    const { World, Bodies, Body } = Matter;
    const { W, H } = this;

    // Clear existing — remove the physics bodies, not the wrapper objects
    const toRemove = [
      ...this.pigs.map(p => p.body),
      ...this.blocks.map(b => b.body),
      ...(this.launchedBird ? [this.launchedBird.body] : []),
    ].filter(Boolean);
    if (toRemove.length) World.remove(this.world, toRemove);
    this.birds = []; this.pigs = []; this.blocks = []; this.launchedBird = null;

    const isPortrait = H > W;
    const structureScale = isPortrait ? Math.min(W / 450, 1.0) : 1.0;
    // Normalized ground in level data is 0.88. Map it to current groundY.
    const groundOffset = this.groundY - (0.88 * H);

    // Spawn blocks
    for (const bd of levelDef.blocks) {
      const bw = bd.w * W * structureScale;
      const bh = bd.h * H * (isPortrait ? 0.8 : 1.0);
      const bx = bd.x * W;
      const by = bd.y * H + groundOffset;
      const props = this.BLOCK_PROPS[bd.type];
      const body = Bodies.rectangle(bx + bw/2, by + bh/2, bw, bh, {
        density: props.density,
        restitution: props.restitution,
        friction: props.friction,
        frictionStatic: 0.5,
        label: 'block_' + bd.type,
        collisionFilter: { category: 0x0002, mask: 0xFFFF }
      });
      const blockObj = {
        body, type: bd.type,
        health: props.health, maxHealth: props.health,
        dead: false
      };
      this.blocks.push(blockObj);
      World.add(this.world, body);
    }

    // Spawn pigs
    for (const pd of levelDef.pigs) {
      const props = this.PIG_PROPS[pd.type];
      const r = props.r * structureScale;
      const px = pd.x * W;
      const py = pd.y * H + groundOffset;
      const body = Matter.Bodies.circle(px, py, r, {
        density: props.density,
        restitution: 0.2,
        friction: 0.5,
        frictionStatic: 0.3,
        label: 'pig_' + pd.type,
        collisionFilter: { category: 0x0004, mask: 0xFFFF }
      });
      const pigObj = {
        body, type: pd.type,
        health: props.health, maxHealth: props.health,
        r, state: 'happy', dead: false
      };
      this.pigs.push(pigObj);
      World.add(this.world, body);
    }
  },

  placeBirdOnSlingshot(type) {
    const { World, Bodies, Body } = Matter;
    const props = this.BIRD_PROPS[type];
    const bx = this.slingshotX;
    const by = this.slingshotY - props.r;
    const body = Bodies.circle(bx, by, props.r, {
      density: props.density,
      restitution: props.restitution,
      friction: props.friction,
      isStatic: true,
      label: 'bird_' + type,
      collisionFilter: { category: 0x0001, mask: 0xFFFF }
    });
    const birdObj = {
      body, type,
      r: props.r, health: props.health,
      launched: false, dead: false,
      abilityUsed: false,
      splitChildren: []
    };
    this.launchedBird = birdObj;
    World.add(this.world, body);
    return birdObj;
  },

  launchBird(birdObj, power) {
    const { Body } = Matter;
    Body.setStatic(birdObj.body, false);
    Body.setVelocity(birdObj.body, power);
    birdObj.launched = true;
  },

  // Yellow bird: speed boost
  activateYellow(birdObj) {
    if (birdObj.abilityUsed || !birdObj.launched) return;
    birdObj.abilityUsed = true;
    const { Body } = Matter;
    const v = birdObj.body.velocity;
    const boost = 1.6;
    Body.setVelocity(birdObj.body, { x: v.x * boost, y: v.y * boost });
    Particles.spawn(birdObj.body.position.x, birdObj.body.position.y, 'explosion', 12);
  },

  // Blue bird: split into 3
  activateBlue(birdObj, W, H) {
    if (birdObj.abilityUsed || !birdObj.launched) return false;
    birdObj.abilityUsed = true;
    const { World, Bodies, Body } = Matter;
    const pos = birdObj.body.position;
    const vel = birdObj.body.velocity;
    const offsets = [{ x:0, y:-3 }, { x:2, y:1 }, { x:-2, y:1 }];
    const children = [];
    for (const off of offsets) {
      const props = this.BIRD_PROPS.blue;
      const nb = Bodies.circle(pos.x, pos.y, props.r * 0.8, {
        density: props.density, restitution: props.restitution,
        friction: props.friction, label: 'bird_blue',
        collisionFilter: { category: 0x0001, mask: 0xFFFF }
      });
      Body.setVelocity(nb, { x: vel.x + off.x, y: vel.y + off.y });
      const child = {
        body: nb, type: 'blue', r: props.r * 0.8,
        launched: true, dead: false, abilityUsed: true, splitChildren: []
      };
      children.push(child);
      World.add(this.world, nb);
    }
    // Remove original
    World.remove(this.world, birdObj.body);
    birdObj.dead = true;
    Particles.spawn(pos.x, pos.y, 'explosion', 8);
    return children;
  },

  // Black bird: explode
  activateBlack(birdObj) {
    if (birdObj.abilityUsed) return;
    birdObj.abilityUsed = true;
    this._explode(birdObj.body.position, birdObj.r * 3.5);
    Particles.spawn(birdObj.body.position.x, birdObj.body.position.y, 'explosion', 30);
    Matter.World.remove(this.world, birdObj.body);
    birdObj.dead = true;
  },

  _explode(pos, radius) {
    const { Body } = Matter;
    const force = 0.08;
    for (const p of this.pigs) {
      if (p.dead) continue;
      const dx = p.body.position.x - pos.x;
      const dy = p.body.position.y - pos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < radius) {
        const dmg = Math.floor((1 - dist/radius) * 150);
        this._damagePig(p, dmg);
        const f = force * (1 - dist/radius);
        Body.applyForce(p.body, p.body.position, { x: dx/dist*f, y: dy/dist*f });
      }
    }
    for (const bl of this.blocks) {
      if (bl.dead) continue;
      const dx = bl.body.position.x - pos.x;
      const dy = bl.body.position.y - pos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < radius) {
        const dmg = Math.floor((1 - dist/radius) * 120);
        this._damageBlock(bl, dmg);
        const f = force * (1 - dist/radius) * 2;
        Body.applyForce(bl.body, bl.body.position, { x: dx/dist*f, y: dy/dist*f });
      }
    }
  },

  _onCollision(event) {
    const pairs = event.pairs;
    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;
      // Use relative speed for damage calculation
      const dvx = bodyA.velocity.x - bodyB.velocity.x;
      const dvy = bodyA.velocity.y - bodyB.velocity.y;
      const speed = Math.sqrt(dvx*dvx + dvy*dvy);
      if (speed < 1.5) continue;

      const isBird  = l => l.startsWith('bird_');
      const isPig   = l => l.startsWith('pig_');
      const isBlock = l => l.startsWith('block_');

      const birdBody  = isBird(bodyA.label)  ? bodyA : isBird(bodyB.label)  ? bodyB : null;
      const pigBody   = isPig(bodyA.label)   ? bodyA : isPig(bodyB.label)   ? bodyB : null;
      const blockBody = isBlock(bodyA.label) ? bodyA : isBlock(bodyB.label) ? bodyB : null;

      // All tracked bird objs (launched + split children)
      const allBirdObjs = [
        this.launchedBird,
        ...(this.launchedBird?.splitChildren || [])
      ].filter(Boolean);

      if (birdBody && pigBody) {
        const pig = this.pigs.find(p => p.body === pigBody);
        if (pig) {
          this._damagePig(pig, 30 + speed * 4);
          Particles.spawn(pigBody.position.x, pigBody.position.y, 'pig', 10);
        }
        if (birdBody.label === 'bird_black') {
          const bObj = allBirdObjs.find(b => b.body === birdBody);
          if (bObj && !bObj.abilityUsed) this.activateBlack(bObj);
        }
      }
      if (birdBody && blockBody) {
        const bl = this.blocks.find(b => b.body === blockBody);
        if (bl) {
          this._damageBlock(bl, 15 + speed * 3);
          Particles.spawn(blockBody.position.x, blockBody.position.y, bl.type, 6);
        }
        if (birdBody.label === 'bird_black') {
          const bObj = allBirdObjs.find(b => b.body === birdBody);
          if (bObj && !bObj.abilityUsed) this.activateBlack(bObj);
        }
      }
      if (blockBody && pigBody) {
        const pig   = this.pigs.find(p => p.body === pigBody);
        const block = this.blocks.find(b => b.body === blockBody);
        if (pig   && speed > 2) this._damagePig(pig, speed * 2.5);
        if (block && speed > 2) this._damageBlock(block, speed * 2);
      }
    }
  },

  _damagePig(pig, dmg) {
    if (pig.dead) return;
    pig.health -= dmg;
    pig.state = 'hurt';
    setTimeout(() => { if (!pig.dead) pig.state = 'happy'; }, 500);
    if (pig.health <= 0) {
      pig.health = 0; pig.dead = true; pig.state = 'dead';
      Particles.spawn(pig.body.position.x, pig.body.position.y, 'pig', 20);
      setTimeout(() => { Matter.World.remove(this.world, pig.body); }, 200);
    }
  },

  _damageBlock(block, dmg) {
    if (block.dead) return;
    block.health -= dmg;
    if (block.health <= 0) {
      block.health = 0; block.dead = true;
      Particles.spawn(block.body.position.x, block.body.position.y, block.type, 12);
      Matter.World.remove(this.world, block.body);
    }
  },

  step(delta) {
    Matter.Engine.update(this.engine, delta || 16.67);
  },

  getBirdScreenPos(birdObj) {
    if (!birdObj || !birdObj.body) return null;
    return { x: birdObj.body.position.x, y: birdObj.body.position.y };
  },

  getBlockScreenData(block) {
    const b = block.body;
    const bounds = b.bounds;
    return {
      x: bounds.min.x, y: bounds.min.y,
      w: bounds.max.x - bounds.min.x,
      h: bounds.max.y - bounds.min.y,
      angle: b.angle,
      type: block.type,
      health: block.health,
      maxHealth: block.BLOCK_PROPS ? block.maxHealth : (
        block.type === 'wood' ? 80 : block.type === 'stone' ? 200 : 30
      ),
    };
  },

  allPigsDead() { return this.pigs.length > 0 && this.pigs.every(p => p.dead); },
  anyPigsAlive() { return this.pigs.some(p => !p.dead); },
  pigsKilled()   { return this.pigs.filter(p => p.dead).length; },
  blocksKilled() { return this.blocks.filter(b => b.dead).length; },

  destroy() {
    if (this.engine) Matter.Engine.clear(this.engine);
    this.birds = []; this.pigs = []; this.blocks = [];
    this.launchedBird = null;
  }
};
