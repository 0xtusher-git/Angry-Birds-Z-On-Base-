/* ═══════════════════════════════════════════
   PARTICLES — particles.js
   ═══════════════════════════════════════════ */

const Particles = {
  list: [],

  spawn(x, y, type, count) {
    const colors = {
      explosion: ['#ff6b35','#ffd700','#ff4500','#fff176','#ffab40'],
      wood:      ['#a0522d','#795548','#d7ccc8','#8d6e63'],
      stone:     ['#9e9e9e','#757575','#bdbdbd','#616161'],
      glass:     ['#80deea','#e0f7fa','#ffffff','#b2ebf2'],
      pig:       ['#66bb6a','#a5d6a7','#81c784','#388e3c'],
    };
    const cols = colors[type] || colors.explosion;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * (type === 'explosion' ? 6 : 3);
      this.list.push({
        x, y, type: type === 'explosion' ? 'star' : 'rect',
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'explosion' ? 3 : 1),
        size: type === 'explosion' ? 4 + Math.random() * 8 : 2 + Math.random() * 5,
        color: cols[Math.floor(Math.random() * cols.length)],
        life: 1,
        decay: 0.02 + Math.random() * 0.04,
        gravity: type === 'explosion' ? 0.15 : 0.1,
      });
    }
  },

  update() {
    this.list = this.list.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.life -= p.decay;
      p.size *= 0.97;
      return p.life > 0;
    });
  },

  clear() { this.list = []; }
};
