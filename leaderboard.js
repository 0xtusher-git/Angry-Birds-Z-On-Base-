/* ═══════════════════════════════════════════
   LEADERBOARD SYSTEM — leaderboard.js
   ═══════════════════════════════════════════ */

const Leaderboard = {
  storageKey: 'abz_leaderboard',
  
  // Mock global data for the "Global" feel
  mockData: [
    { name: 'Vitalik.eth', score: 125400, level: 15 },
    { name: 'BaseGod', score: 98200, level: 14 },
    { name: 'JessePollak', score: 87500, level: 12 },
    { name: 'AngryDev', score: 76400, level: 11 },
    { name: 'Satoshi', score: 65000, level: 10 },
    { name: 'BlueBird', score: 43200, level: 8 },
    { name: 'PigSmash', score: 21000, level: 5 },
    { name: 'OnBase', score: 15400, level: 3 },
    { name: 'Builder', score: 8200, level: 2 },
  ],

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.mockData));
    }
  },

  getScores() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  },

  submitScore(name, score, level) {
    let scores = this.getScores();
    scores.push({ name, score, level, ts: Date.now(), isUser: true });
    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    // Keep top 100
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
        ${scores.map((s, i) => `
          <div class="lb-row ${s.isUser ? 'user-row' : ''}">
            <span class="lb-rank">${i + 1}</span>
            <span class="lb-name">${s.name}</span>
            <span class="lb-level">Lvl ${s.level}</span>
            <span class="lb-score">${s.score.toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
};

// Initialize on load
Leaderboard.init();
