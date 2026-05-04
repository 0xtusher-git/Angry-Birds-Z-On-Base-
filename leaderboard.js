/* ═══════════════════════════════════════════
   LEADERBOARD SYSTEM — leaderboard.js
   ═══════════════════════════════════════════ */

const DREAMLO_PUBLIC_KEY = '663673f88ad4d123d4fa0192'; // REPLACE WITH YOUR DREAMLO PUBLIC KEY
const DREAMLO_PRIVATE_KEY = ''; // OPTIONAL: REPLACE WITH YOUR DREAMLO PRIVATE KEY FOR WRITING

const Leaderboard = {
  storageKey: 'abz_leaderboard',
  
  mockData: [],

  init() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing || existing.includes('Vitalik.eth')) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
    this.refresh(); // Initial fetch
  },

  async refresh() {
    if (DREAMLO_PUBLIC_KEY) {
      await this.fetchGlobalScores();
    }
  },

  async fetchGlobalScores() {
    try {
      const resp = await fetch(`https://www.dreamlo.com/lb/${DREAMLO_PUBLIC_KEY}/json`);
      const data = await resp.json();
      if (data && data.dreamlo && data.dreamlo.leaderboard) {
        let entries = data.dreamlo.leaderboard.entry;
        if (!entries) entries = [];
        if (!Array.isArray(entries)) entries = [entries];
        
        const scores = entries.map(e => ({
          name: e.name,
          score: parseInt(e.score),
          level: parseInt(e.seconds), // We use 'seconds' field for level
          ts: e.date,
          isUser: e.name === localStorage.getItem('abz_username')
        }));
        
        localStorage.setItem(this.storageKey, JSON.stringify(scores));
      }
    } catch (e) { console.warn('Global fetch failed', e); }
  },

  async submitGlobalScore(name, score, level) {
    if (!DREAMLO_PRIVATE_KEY) return;
    try {
      // dreamlo format: /add/PIPE-NAME/SCORE/SECONDS/TEXT
      // We use 'seconds' for level and 'text' for timestamp
      await fetch(`https://www.dreamlo.com/lb/${DREAMLO_PRIVATE_KEY}/add/${encodeURIComponent(name)}/${score}/${level}`);
      await this.fetchGlobalScores();
    } catch (e) { console.warn('Global submit failed', e); }
  },

  getScores() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  },

  submitScore(name, score, level) {
    let scores = this.getScores();
    const existingIdx = scores.findIndex(s => s.name === name);
    
    if (existingIdx !== -1) {
      if (score > scores[existingIdx].score) {
        scores[existingIdx].score = score;
        scores[existingIdx].level = level;
        scores[existingIdx].ts = Date.now();
        this.submitGlobalScore(name, score, level);
      }
    } else {
      scores.push({ name, score, level, ts: Date.now(), isUser: true });
      this.submitGlobalScore(name, score, level);
    }
    
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 100);
    localStorage.setItem(this.storageKey, JSON.stringify(scores));
  },

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scores = this.getScores();
    container.innerHTML = `
      <div class="lb-header">
        <span>Rank</span>
        <span>Player</span>
        <span>Level</span>
        <span>Score</span>
      </div>
      <div class="lb-list">
        ${scores.length === 0 ? '<div class="lb-empty">Waiting for the first Champion...</div>' : 
          scores.map((s, i) => `
            <div class="lb-row ${s.isUser ? 'user-row' : ''}">
              <span class="lb-rank">${i + 1}</span>
              <span class="lb-name">${s.name}</span>
              <span class="lb-level">Lvl ${s.level}</span>
              <span class="lb-score">${s.score.toLocaleString()}</span>
            </div>
          `).join('')
        }
      </div>
    `;
  }
};

Leaderboard.init();
