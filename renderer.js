/* ═══════════════════════════════════════════
   RENDERER — renderer.js
   Handles all Canvas 2D drawing
   ═══════════════════════════════════════════ */

const ASSETS = {
  bird_red: new Image(),
  bird_yellow: new Image(),
  bird_blue: new Image(),
  bird_black: new Image(),
  pig_normal: new Image(),
  pig_helmet: new Image(),
  slingshot: new Image()
};
ASSETS.bird_red.src = './assets/angry_birds_PNG49.png';
ASSETS.bird_yellow.src = './assets/angry_birds_PNG28.png';
ASSETS.bird_blue.src = './assets/angry_birds_PNG17.png';
ASSETS.bird_black.src = './assets/angry_birds_PNG51.png';
ASSETS.pig_normal.src = './assets/angry_birds_PNG59.png';
ASSETS.pig_helmet.src = './assets/angry_birds_PNG60.png';
ASSETS.slingshot.src = './assets/slingshot.png';

const R = {
  canvas: null, ctx: null,
  W: 0, H: 0, dpr: 1,

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    this.W = this.canvas.clientWidth;
    this.H = this.canvas.clientHeight;
    this.canvas.width  = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },

  clear() { this.ctx.clearRect(0, 0, this.W, this.H); },

  // ── BACKGROUND ──
  drawBackground(clouds) {
    const { ctx, W, H } = this;
    // Sky gradient
    // Sky gradient — fill the whole height
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1a6eb5');
    sky.addColorStop(0.6, '#7ed6f7');
    sky.addColorStop(1, '#a3e4ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Clouds — smaller, fixed pixel radius
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    for (const c of clouds) {
      this.drawCloud(c.x, c.y * H, c.r * 30); // use 30px base radius
    }

    // Ground gradient
    const ground = ctx.createLinearGradient(0, H * 0.88, 0, H);
    ground.addColorStop(0, '#4caf50');
    ground.addColorStop(1, '#2e7d32');
    ctx.fillStyle = ground;
    ctx.fillRect(0, H * 0.88, W, H * 0.12);

    // Hills
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.9);
    ctx.bezierCurveTo(W * 0.1, H * 0.78, W * 0.2, H * 0.82, W * 0.3, H * 0.88);
    ctx.bezierCurveTo(W * 0.4, H * 0.94, W * 0.5, H * 0.80, W * 0.6, H * 0.86);
    ctx.bezierCurveTo(W * 0.7, H * 0.92, W * 0.85, H * 0.79, W, H * 0.87);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fill();

    // Ground line
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H * 0.88); ctx.lineTo(W, H * 0.88); ctx.stroke();
  },

  drawCloud(x, y, r) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,       y,        r,        0, Math.PI * 2);
    ctx.arc(x + r*0.8, y - r*0.3, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x + r*1.6, y,        r * 0.85, 0, Math.PI * 2);
    ctx.arc(x + r*0.8, y + r*0.2, r * 0.6,  0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // ── SLINGSHOT ──
  drawSlingshot(sx, sy, birdPos, isLoaded) {
    const { ctx } = this;
    const x = sx, y = sy;
    const img = ASSETS.slingshot;

    if (img.complete && img.naturalWidth > 0) {
      // Draw slingshot image
      // Center the fork around sx, sy
      const w = 60, h = 130;
      ctx.drawImage(img, x - w/2, y - 40, w, h);
    } else {
      // Fallback procedural slingshot
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x - 12, y - 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x + 12, y - 30); ctx.stroke();
      ctx.lineWidth = 14; ctx.strokeStyle = '#6d4c41';
      ctx.beginPath(); ctx.moveTo(x, y + 60); ctx.lineTo(x, y + 20); ctx.stroke();
    }

    // Dynamic Rubber bands when loaded
    if (isLoaded && birdPos) {
      ctx.strokeStyle = '#3e2723'; // Darker brown for rubber band
      ctx.lineWidth = 4;
      
      // Draw back band
      ctx.beginPath();
      ctx.moveTo(x + 15, y - 10);
      ctx.lineTo(birdPos.x, birdPos.y);
      ctx.stroke();

      // Draw front band
      ctx.beginPath();
      ctx.moveTo(x - 15, y - 10);
      ctx.lineTo(birdPos.x, birdPos.y);
      ctx.stroke();
    }
  },

  // ── TRAJECTORY ──
  drawTrajectory(points) {
    const { ctx } = this;
    ctx.save();
    for (let i = 0; i < points.length; i++) {
      const alpha = 1 - i / points.length;
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 3 - i * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  // ── BIRD ──
  drawBird(b) {
    const { ctx } = this;
    const { x, y, r, type, angle } = b;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);

    const img = ASSETS['bird_' + type] || ASSETS.bird_red;
    if (img.complete && img.naturalWidth > 0) {
      // Scale slightly larger than hitbox for a nice visual overlap
      const size = r * 2.5;
      ctx.drawImage(img, -size/2, -size/2, size, size);
    } else {
      // Fallback
      ctx.fillStyle = type === 'yellow' ? '#f9a825' : type === 'black' ? '#1a1a1a' : type === 'blue' ? '#0277bd' : '#c0392b';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  },

  // ── PIG ──
  drawPig(p) {
    const { ctx } = this;
    const { x, y, r, type, health, maxHealth, state } = p;
    const ratio = health / maxHealth;
    ctx.save();
    ctx.translate(x, y);

    const isHelmet = type === 'helmet' || type === 'king';
    const img = isHelmet ? ASSETS.pig_helmet : ASSETS.pig_normal;

    // If image is loaded, draw it
    if (img.complete && img.naturalWidth > 0) {
      // The image includes the helmet, scale it to fit roughly within the physics radius
      // We use r * 2.4 to make it slightly larger than the physics hitbox for better visuals
      const size = r * 2.4; 
      ctx.drawImage(img, -size/2, -size/2, size, size);
      
      // Damage overlay
      if (ratio < 0.6) {
        ctx.fillStyle = ratio < 0.3 ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 0, 0, 0.2)';
        ctx.beginPath(); 
        ctx.arc(0, 0, r, 0, Math.PI*2); 
        ctx.fill();
      }
    } else {
      // Fallback green circle while loading
      ctx.fillStyle = '#66bb6a';
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#388e3c'; ctx.lineWidth = 2; ctx.stroke();
    }

    ctx.restore();
  },



  // ── BLOCK ──
  drawBlock(b) {
    const { ctx } = this;
    const { x, y, w, h, type, angle, health, maxHealth } = b;
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate(angle || 0);

    const ratio = health / maxHealth;
    let fill, stroke, crack;
    switch(type) {
      case 'wood':
        fill = ratio>0.5 ? '#a0522d' : '#6d3b1e';
        stroke = '#5d4037'; crack = '#4e342e'; break;
      case 'stone':
        fill = ratio>0.5 ? '#9e9e9e' : '#616161';
        stroke = '#757575'; crack = '#424242'; break;
      case 'glass':
        fill = ratio>0.5 ? 'rgba(178,235,242,0.7)' : 'rgba(239,83,80,0.5)';
        stroke = 'rgba(0,188,212,0.8)'; crack = 'rgba(0,0,0,0.4)'; break;
    }

    const hw = w/2, hh = h/2;
    const gr = ctx.createLinearGradient(-hw,-hh,hw,hh);
    gr.addColorStop(0, 'rgba(255,255,255,0.15)');
    gr.addColorStop(1, 'rgba(0,0,0,0.15)');

    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-hw, -hh, w, h);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = gr;
    ctx.fill();

    // Wood grain
    if (type === 'wood') {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
      for (let i=-hh+6; i<hh; i+=8) {
        ctx.beginPath(); ctx.moveTo(-hw, i); ctx.lineTo(hw, i+2); ctx.stroke();
      }
    }
    // Stone texture
    if (type === 'stone') {
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0,-hh); ctx.lineTo(0,hh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-hw,0); ctx.lineTo(hw,0); ctx.stroke();
    }
    // Damage cracks
    if (ratio < 0.6) {
      ctx.strokeStyle = crack; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-hw*0.5,-hh*0.8); ctx.lineTo(hw*0.3,hh*0.6); ctx.stroke();
    }
    if (ratio < 0.3) {
      ctx.beginPath(); ctx.moveTo(hw*0.5,-hh*0.5); ctx.lineTo(-hw*0.2,hh*0.4); ctx.stroke();
    }
    ctx.restore();
  },

  // ── PARTICLES ──
  drawParticles(particles) {
    const { ctx } = this;
    ctx.save();
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.type === 'explosion' ? 12 : 0;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      if (p.type === 'star') {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      } else {
        ctx.rect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
      }
      ctx.fill();
    }
    ctx.restore();
  },

  // ── QUEUED BIRDS ──
  drawQueuedBirds(queue, currentIdx, slingshotX, slingshotY) {
    const startX = slingshotX + 60;
    for (let i = currentIdx + 1; i < queue.length; i++) {
      const pos = i - currentIdx - 1;
      const bx = startX + pos * 42;
      const by = slingshotY + 30;
      const r = 14 - pos * 2;
      if (r < 6) continue;
      this.drawBird({ x: bx, y: by, r, type: queue[i], angle: 0 });
    }
  }
};
